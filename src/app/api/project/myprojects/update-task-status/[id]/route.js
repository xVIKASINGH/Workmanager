import { Dbconnect } from "@/helper/dbConnect";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import Project from "@/models/GroupProjectSchema";
import { CalculateStats } from "@/helper/Calculatestats";


export async function POST(request,{params}){
    const {id}=await params;
    const session=await getServerSession(authOptions)
    
    const {taskId,newStatus}=await request.json()
    try {

        if (!session || !session.user) {
            return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            });
          }
         
          if(mongoose.connection.readyState!==1){
            Dbconnect();
          }
          const project=await Project.findById(id);

          if (!project) {
            return new Response(JSON.stringify({ error: "Project not found" }), {
              status: 404,
              headers: { "Content-Type": "application/json" },
            });
          }
          
        
      let taskfound=false;
      for(let teammate of project.teammates){
        const task=teammate?.assigntask.find((task)=>task._id.toString()===taskId)

        if(task){
            taskfound=true
            task.status=newStatus
         
            break;

        }
      }
      if(!taskfound){
        return NextResponse.json({message:"error occurred"},{status:501})
      }
      project.teammates = project.teammates.map(teammate => {
        const stats = CalculateStats(teammate);
        return {
          ...teammate.toObject(),
          taskCompletionStats: stats
        };
      });
      await project.save();

      return NextResponse.json({ message: "Task updated successfully" }, { status: 200 });
    } catch (error) {
        console.log("here is the rror",error)
        return NextResponse.json({message:"internal server error"})
    }
}