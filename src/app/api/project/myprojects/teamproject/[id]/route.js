import { Dbconnect } from "@/helper/dbConnect";
import { authOptions } from "@/lib/authOptions";
import Project from "@/models/GroupProjectSchema";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request,{params}) {
 
    const session=await getServerSession(authOptions)
    const {id}=await params
    
    try {
        await Dbconnect();
        const project=await Project.findById(id).populate([
          {  path:"teammates.userId",
            select:"username email"
        },{
            path:"creator",
            select:"username email"
    }])
        if(!project){
            return NextResponse.json({message:"no project find check your qery"},{status:403})
        }
 
        return NextResponse.json({message:"project finded successfully",project},{status:201})
    } catch (error) {
        console.log("error aa gyi",error);
        return NextResponse.josn({message:"Internal server error"},{status:500})
    }
}