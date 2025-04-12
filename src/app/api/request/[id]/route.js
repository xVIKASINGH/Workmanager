const { Dbconnect } = require("@/helper/dbConnect")
import User from "@/models/Userschema"

import { NextResponse } from "next/server";
import Collab from "@/models/ConnnectionSchema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(request,{params}){
  const session= await getServerSession(authOptions);
  console.log("api hit",session?.user?.id)
  const id=session.user.id;
  console.log("here is id",id)
  try {
    await Dbconnect();
    const connectionrequest = await Collab.find({
      $or: [
        { reciever: id, status: "pending" },
        { sender: id, status: "pending" },
      ],
    }).populate("sender", "username name").populate("reciever", "username name");
    
  console.log("all requests",connectionrequest)
    if(!connectionrequest){
      return NextResponse.json({message:"No request found"},{status:201})

  }
    return NextResponse.json({ requests: connectionrequest }, { status: 200 });
  

 
  } catch (error) {
    console.error("Error while fetching request",error);
    return NextResponse.json({message:"error aa gyi"},{status:201})
  }
}