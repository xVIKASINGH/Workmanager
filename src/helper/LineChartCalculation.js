"use client";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export default function TaskCompletionLineChart({ tasksData }) {
  console.log("compoentns hit..")
  console.log(tasksData)
  // Process the data for the chart
  const processData = () => {
    // Sort tasks by completion date
    const sortedTasks = [...tasksData].sort((a, b) => 
      new Date(a.completedAt) - new Date(b.completedAt)
    );

    // Group tasks by username
    const userTasksMap = {};
    
    sortedTasks.forEach(task => {
      if (!userTasksMap[task.username]) {
        userTasksMap[task.username] = [];
      }
      userTasksMap[task.username].push(task);
    });

    // Create datasets for each user
    const datasets = [];
    const colors = [
      '#3b82f6', // blue-500
      '#ef4444', // red-500
      '#10b981', // emerald-500
      '#f59e0b', // amber-500
      '#8b5cf6', // violet-500
      '#ec4899', // pink-500
    ];

    let colorIndex = 0;
    for (const username in userTasksMap) {
      const userData = userTasksMap[username];
      
      datasets.push({
        label: username,
        data: userData.map(task => task.timeTaken),
        borderColor: colors[colorIndex % colors.length],
        backgroundColor: `${colors[colorIndex % colors.length]}22`,
        tension: 0.4,
        fill: true
      });
      
      colorIndex++;
    }

    return {
      labels: sortedTasks.map(task => task.taskName),
      datasets
    };
  };

  const data = processData();

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          title: function(context) {
            const index = context[0].dataIndex;
            const datasetIndex = context[0].datasetIndex;
            const username = data.datasets[datasetIndex].label;
            const taskName = data.labels[index];
            return `${taskName} (${username})`;
          },
          label: function(context) {
            return `Time taken: ${context.raw} ${context.raw === 1 ? 'day' : 'days'}`;
          },
          afterLabel: function(context) {
            const datasetIndex = context.datasetIndex;
            const index = context.dataIndex;
            const username = data.datasets[datasetIndex].label;
            
            // Find the task with this username and task name
            const task = tasksData.find(t => 
              t.username === username && 
              t.taskName === data.labels[index]
            );
            
            if (task && task.completedAt) {
              return `Completed: ${new Date(task.completedAt).toLocaleDateString()}`;
            }
            return '';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Time Taken (days)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Tasks'
        }
      }
    },
  };

  return <Line data={data} options={options} />;
}