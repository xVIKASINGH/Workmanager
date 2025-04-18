"use client";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function TaskCompletionChart({ chartData }) {

  const calculateTotals = () => {
    const completedTotal = chartData.completed.reduce((sum, val) => sum + val, 0);
    const pendingTotal = chartData.pending.reduce((sum, val) => sum + val, 0);
    const inProgressTotal = chartData.inProgress.reduce((sum, val) => sum + val, 0);
    
    return [completedTotal, pendingTotal, inProgressTotal];
  };

  const data = {
    labels: ["Completed", "Pending", "In Progress"],
    datasets: [
      {
        data: calculateTotals(),
        backgroundColor: [
          "#4ade80", // green-400 for Completed
          "#facc15", // yellow-400 for Pending
          "#60a5fa", // blue-400 for In Progress
        ],
        borderColor: [
          "#ffffff",
          "#ffffff",
          "#ffffff",
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
            const value = context.raw;
            const percentage = Math.round((value / total) * 100);
            return `${context.label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%', // This creates the doughnut hole
  };

  return <Doughnut data={data} options={options} />;
}