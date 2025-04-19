import { Dbconnect } from "@/helper/dbConnect";
import Project from "@/models/GroupProjectSchema";
import { NextResponse } from "next/server";


export async function POST(request,{params}) {
    console.log("api hit huiii hai")
    const {feedback,projectId,username}=await request.json()
    const {id}=await params;
try {
    await Dbconnect();

    const project=await Project.findById(id).populate("teammates.userId");
 if(!project){
    return NextResponse.json({messageL:"proejct not found"},{status:403})
 }
 const feedbacks=[];
 for(let teammate of project.teammates){
    if(teammate.userId.username===username){
        teammate.feedback=feedback
    }
 }

 
 await project.save();
 return NextResponse.json({project},{message:"Feedback send successfully"},{statusText:"okayyyyy"})

} catch (error) {
    console.log("error Occurred",error);
    return NextResponse.json({message:"Interval server error"},{status:500})
}
}
