import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Task from "@/models/TaskSchema";
import { Dbconnect } from "@/helper/dbConnect";



export async function GET(request){
    
    await Dbconnect();
  
    const session=await getServerSession(authOptions);
    console.log("Sessio info",session)
    const alltask=await Task.find({
     user:session.user.id
    })
  

     if(!session.user || !session.user.id){
        return NextResponse.json({message:"Unauthorized"},{status:401})
     }
      // send resposne
    console.log(alltask)
    return NextResponse.json(alltask,{status:201});
  
   
 
  
  }