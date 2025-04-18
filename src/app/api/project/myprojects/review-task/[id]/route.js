import { Dbconnect } from "@/helper/dbConnect";
import Project from "@/models/GroupProjectSchema";
import { NextResponse } from "next/server";


export async function POST(request,{params}) {
    const {id}=await params;
    const {taskId,rating,reviewNotes}=await request.json();
    console.log(taskId,rating,reviewNotes)
    try {
        const project=await Project.findById(id)
        if(!project){
            return NextResponse.json({message:"project not found"},{status:403})
        }
 let taskfound=false
       for(let team of project.teammates){
        const task=team.assigntask.id(taskId) // mongoose query :)
        if(task){
            task.qualityScore={
                rating:rating,
                reviewNotes:reviewNotes
            }
            console.log(task)
            taskfound=true
            break;
        }
       }
       if(!taskfound){
        return NextResponse.json({message:"Task nnot found"},{status:403})
       }
      
       
     
       await project.save();
       return NextResponse.json({message:"Review send succeessfullt"},{status:201})
    } catch (error) {
        console.log("errro r occurred ",error);
        return NextResponse.json({message:"internal server error"},{status:500})
    }
}