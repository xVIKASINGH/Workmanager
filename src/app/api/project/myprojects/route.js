import { Dbconnect } from "@/helper/dbConnect";
import { authOptions } from "@/lib/authOptions"
import Project from "@/models/GroupProjectSchema";
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server";

export async function GET(){
   const session=await getServerSession(authOptions);
   const userId=session.user.id
  try {
    await Dbconnect();
    const projects = await Project.find({
        $or: [
          { creator: userId },
          { teammates: { $elemMatch: { userId } } }
        ]
      });
    if(!projects){
     return NextResponse.json({message:"No project founds"})
    }
   
    return NextResponse.json({message:"Prjects fetch successfully",projects},{status:201});
  } catch (error) {
    console.log("Intervnal server error",error);
    return NextResponse.json({message:"Errror aa gyi"},{status:500})
  }
}