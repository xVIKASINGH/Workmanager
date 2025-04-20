import { Dbconnect } from "@/helper/dbConnect";
import Project from "@/models/GroupProjectSchema";
import { NextResponse } from "next/server";
import { CalculateStats } from "@/helper/Calculatestats";
export async function POST(request, { params }) {
  const { id } =await params; 


  const data = await request.json();

  const {teammateId,task,dueDate}=data;


  try {
  
    await Dbconnect();    
    
    if(!teammateId || !task || !dueDate){
      return NextResponse.json({message:"Please fill al details"});
    }
    const updatedProject = await Project.findOneAndUpdate(
        { _id: id, "teammates.userId": teammateId },
        {
          $push: {
            "teammates.$.assigntask": {
              task,
              dueDate,
              createdAt:new Date
            },
          },
        },
        { new: true }
      );
      
      if (!updatedProject) {
        return NextResponse.json(
          { message: "Project or teammate not found" },
          { status: 404 }
        );
      }
       updatedProject.teammates = updatedProject.teammates.map(teammate => {
              const stats = CalculateStats(teammate);
              return {
                ...teammate.toObject(),
                taskCompletionStats: stats
              };
            });
            
      
            
            let completetask = updatedProject.teammates.reduce((acc, tm) => acc + tm.taskCompletionStats.completed, 0);
      
      let totalAssigned=0
        for(let teammate of updatedProject.teammates){
           teammate.assigntask.forEach(element => {
            totalAssigned++;
           });
        }
        const progress = totalAssigned > 0 ? (completetask / totalAssigned) * 100 : 0;
      
       updatedProject.progress=progress;
       await updatedProject.save();
      return NextResponse.json(
        { message: "Task assigned successfully", project: updatedProject },
        { status: 200 }
      );
  
  } catch (error) {
    console.error("Error in assigning task:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
