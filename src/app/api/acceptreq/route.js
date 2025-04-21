const { Dbconnect } = require("@/helper/dbConnect")

import Collab from "@/models/ConnnectionSchema"
import User from "@/models/Userschema"
import { NextResponse } from "next/server"


export async function POST(request,{params}) {
    
 
    const {reqId}=await request.json();

    try {
      await Dbconnect();
      const collabobject=await Collab.findById(reqId);
      if(!collabobject){
        return NextResponse.json({message:"request not found"},{status:401})
      }
      
      collabobject.status="accepted";
      const senderid=collabobject.sender
      const reciverid=collabobject.reciever
      const sender=await User.findById(
        senderid
    )
      const reciver=await User.findById(
        reciverid      )


       sender.collaborators.push(reciverid);
       reciver.collaborators.push(senderid);

       await collabobject.save();
       await sender.save();
       await reciver.save();
      return NextResponse.json({message:"req accepted hehe"},{status:201})
    } catch (error) {
        console.error("Error while fetcinf collab req",error);
        return NextResponse.json({message:"Error aa gyi"},{status:500})
    }
    

}