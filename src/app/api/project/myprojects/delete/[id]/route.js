import { Dbconnect } from "@/helper/dbConnect";
import Project from "@/models/GroupProjectSchema";
import { NextResponse } from "next/server";


export async function DELETE(request,{params}) {

    const {id}=await params
        console.log("api hit here i sthe id to delte project",id)
    try {
        await Dbconnect();
        const project=await Project.findByIdAndDelete(id);
      
        return NextResponse.json({message:"project deleted"},{status:201})
    } catch (error) {
        console.error("Error while deleting request")
        return NextResponse.json({message:"Internal server error"},{status:500})
    }
}