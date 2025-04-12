const { Dbconnect } = require("@/helper/dbConnect")

import Collab from "@/models/ConnnectionSchema"
import User from "@/models/Userschema"
import { NextResponse } from "next/server"


export async function POST(request,{params}) {
    
 
    const {reqId}=await request.json();
 console.log("connecton id",reqId)
    try {
      await Dbconnect();
      const collabobject=await Collab.findById(reqId);
      if(!collabobject){
        return NextResponse.json({message:"request not found"},{status:401})
      }
      console.log(collabobject)
      collabobject.status="rejected";
       await collabobject.save();
      
      return NextResponse.json({message:"req deleted hehe"},{status:201})
    } catch (error) {
        console.error("Error while fetcinf collab req",error);
        return NextResponse.json({message:"Error aa gyi"},{status:500})
    }
    

}