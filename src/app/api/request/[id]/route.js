const { Dbconnect } = require("@/helper/dbConnect")
import User from "@/models/Userschema"

import { NextResponse } from "next/server";
import Collab from "@/models/ConnnectionSchema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(request,{params}){
  const session= await getServerSession(authOptions);
  
  const id=session.user.id;
 
  try {
    await Dbconnect();
    const connectionrequest = await Collab.find({
      $or: [
        { reciever: id, status: "pending" },
        { sender: id, status: "pending" },
      ],
    }).populate("sender", "username name").populate("reciever", "username name");
    

    if(!connectionrequest){
      return NextResponse.json({message:"No request found"},{status:201})

  }
    return NextResponse.json({ requests: connectionrequest }, { status: 200 });
  

 
  } catch (error) {
    console.error("Error while fetching request",error);
    return NextResponse.json({message:"error aa gyi"},{status:201})
  }
}