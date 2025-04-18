"use client";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
);

export default function TaskCompletionTimelineChart({ tasksData }) {
  // Process data to better visualize completion trends
  const processTimelineData = () => {
    if (!tasksData || tasksData.length === 0) {
      // Return empty placeholder data if no tasks available
      return {
        labels: ['No Data'],
        datasets: []
      };
    }

    // Sort tasks by completion date
    const sortedTasks = [...tasksData].sort((a, b) => 
      new Date(a.completedAt) - new Date(b.completedAt)
    );

    // Get unique usernames from tasks
    const allUsernames = [...new Set(sortedTasks.map(task => task.username))];
    
    // Create a mapping of all completion dates
    const allDates = sortedTasks.map(task => {
      const date = new Date(task.completedAt);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    const uniqueDates = [...new Set(allDates)].sort();
    
    // Create datasets - one per user
    const colors = [
      '#3b82f6', // blue-500
      '#ef4444', // red-500
      '#10b981', // emerald-500
      '#f59e0b', // amber-500
      '#8b5cf6', // violet-500
      '#ec4899', // pink-500
    ];
    
    const datasets = [];
    
    allUsernames.forEach((username, userIndex) => {
      // Filter tasks for this user and compute cumulative counts per date
      const userTasks = sortedTasks.filter(task => task.username === username);
      const userDatesMap = {};
      
      // Initialize with zero for all dates
      uniqueDates.forEach(date => {
        userDatesMap[date] = 0;
      });
      
      // Count tasks per date
      userTasks.forEach(task => {
        const date = new Date(task.completedAt);
        const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
        userDatesMap[formattedDate] += 1;
      });
      
      // Calculate cumulative sum
      let cumulativeSum = 0;
      const cumulativeData = uniqueDates.map(date => {
        cumulativeSum += userDatesMap[date];
        return cumulativeSum;
      });
      
      // Create the dataset
      datasets.push({
        label: username,
        data: cumulativeData,
        borderColor: colors[userIndex % colors.length],
        backgroundColor: `${colors[userIndex % colors.length]}20`,
        borderWidth: 3,
        pointBackgroundColor: colors[userIndex % colors.length],
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.3,
        fill: true
      });
    });

    return {
      labels: uniqueDates,
      datasets
    };
  };

  const data = processTimelineData();
  
  // If no data, show a message instead
  if (data.datasets.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No completion data available to display</p>
      </div>
    );
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          title: function(context) {
            return `Date: ${context[0].label}`;
          },
          label: function(context) {
            return `${context.dataset.label}: ${context.raw} tasks completed`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Tasks Completed',
          padding: {top: 0, bottom: 10}
        },
        ticks: {
          precision: 0, // Show only whole numbers
          stepSize: 1
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date (Month/Day)',
          padding: {top: 10, bottom: 0}
        },
        grid: {
          display: false
        }
      }
    },
    elements: {
      point: {
        radius: 6, // Make points more visible
        hoverRadius: 8
      },
      line: {
        tension: 0.3 // Smoother curves
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };

  return (
    <div className="h-full w-full min-h-64">
      <Line data={data} options={options} />
    </div>
  );
}