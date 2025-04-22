import { Dbconnect } from "@/helper/dbConnect";
import Project from "@/models/GroupProjectSchema";
import { NextResponse } from "next/server";


export async function POST(request,{params}) {

    const {content,projectId,username}=await request.json()
    console.log(content,projectId,username)
    const {id}=await params;
try {
    await Dbconnect();

    const project=await Project.findById(id).populate("teammates.userId");
 if(!project){
    return NextResponse.json({messageL:"proejct not found"},{status:403})
 }
 let feedbacksend=false;
 for(let teammate of project.teammates){
    if(teammate.userId.username===username){
        teammate.feedback={
            content:content,
            createdAt:Date.now()
        }
        feedbacksend=true
    }
 }
 if (!feedbacksend) {
    return NextResponse.json(
      { message: "Teammate not found" },
      { status: 404 }
    );
  }
 
 await project.save();
 return NextResponse.json({project},{message:"Feedback send successfully"},{statusText:"okayyyyy"})

} catch (error) {
    console.log("error Occurred",error);
    return NextResponse.json({message:"Interval server error"},{status:500})
}
}
