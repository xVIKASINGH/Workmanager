export function CalculateStats(teammate) {
    const tasks = teammate.assigntask || [];
    const now = new Date();
  
    let totalAssigned = tasks.length;
    let pending = 0, completed = 0, inProgress = 0, deadlinesMet = 0;
    let totalCompletionTime = 0;
    let completedTaskCount = 0; 
  
    tasks.forEach(task => {
      if (task.status === 'completed') {
        completed++;
        if (task.dueDate && task.completedAt && task.createdAt) {
          const diff = (new Date(task.completedAt) - new Date(task.createdAt)) / 3600000; 
          totalCompletionTime += diff;
          completedTaskCount++;
  
          if (new Date(task.completedAt) <= new Date(task.dueDate)) {
            deadlinesMet++;
          }
        }
      } else if (task.status === 'pending') {
        pending++;
      } else if (task.status === 'in-progress') {
        inProgress++;
      }
    });
  
    const averageCompletionTime = completedTaskCount > 0
      ? totalCompletionTime / completedTaskCount
      : 0;
  
    return {
      totalAssigned,
      completed,
      pending,
      inProgress,
      averageCompletionTime,
      deadlinesMet,
      totalCompletionTime
    };
  }
  
