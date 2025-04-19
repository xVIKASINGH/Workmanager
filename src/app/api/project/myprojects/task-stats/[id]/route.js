
import Project from "@/models/GroupProjectSchema";
import { Dbconnect } from "@/helper/dbConnect";
import { NextResponse } from "next/server";

export  async function GET(request,{params}) {
  try {
    await Dbconnect();
    const {id}=await params
    const project = await Project.findById(id).populate("teammates.userId");
   
   const deadline=project.deadline;
   const progress=project.progress;
    const labels = project.teammates.map((tm) => tm.userId.username);
    const completed = project.teammates.map((tm) => tm.taskCompletionStats.completed);
    const pending = project.teammates.map((tm) => tm.taskCompletionStats.pending);
    const inProgress = project.teammates.map((tm) => tm.taskCompletionStats.inProgress);
    const averagetime=project.teammates.map((tm)=>tm.taskCompletionStats.averageCompletionTime)

    let feedbacks=[];
    for(let teammate of project.teammates){
  feedbacks.push({feedback:teammate.feedback,username:teammate.userId.username})
    }
    
    const alltaskinfo=[]
    for (let teammate of project.teammates) {
      teammate.assigntask.forEach(task => {
        alltaskinfo.push({
          username: teammate.userId.username,
          taskName: task.task,
          status: task.status,
          completedAt: task.completedAt,
          createdAt:task.createdAt,
          duedate:task.dueDate, 
          rating: task?.qualityScore?.rating || null,
          reviewNotes: task?.qualityScore?.reviewNotes || null,
        });
      });
    }
    
 
   return  NextResponse.json({ labels, completed, pending, inProgress,deadline,progress,averagetime,alltaskinfo,feedbacks});
  } catch (error) {
    console.log("error occurred :",error)
  }

}
