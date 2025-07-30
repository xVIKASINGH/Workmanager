import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Task from "@/models/TaskSchema";
import { Dbconnect } from "@/helper/dbConnect";



export async function GET(request){
    
    await Dbconnect();
  
    const session=await getServerSession(authOptions);
    if(!session.user || !session.user.id){
      return NextResponse.json({message:"Unauthorized"},{status:401})
   }
    
    const alltask=await Task.find({
     user:session.user.id
    })
  
    return NextResponse.json(alltask,{status:201});
  
  
  }