import mongoose from "mongoose";

import User from "@/models/Userschema";
import { Dbconnect } from "@/helper/dbConnect";
import { NextResponse } from "next/server";
import Collab from "@/models/ConnnectionSchema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(request,{params}) {
    const {username}=await params;
  const session=await getServerSession(authOptions);
    await Dbconnect();
    try {
        const user=await User.findOne({
           username:username
        })

      
        if(!user){
            return NextResponse.json({message:"No user found for this username"},{status:403})
        }
        const connected = user.collaborators.filter(
            (u) => u._id?.toString?.() === session.user.id
          );
          
        if(connected.length>0){
            return NextResponse.json({message:"already connected",user},{status:203})
        }
        return NextResponse.json({user},{status:201})
    } catch (error) {
        console.error("Error while fetching user details",error);
        return NextResponse.json({message:"Error while saerhing req"})
    }
}

export async function POST(request,{params}){
    console.log("api hit")
  
 const {currentUserId}=await request.json()
 console.log(currentUserId)  
  
    const {username}=await params;
    try {
        await Dbconnect();
        const user=await User.findOne({
            username
        })
        if(!user){
            return NextResponse.json({message:"No user found for this username"},{status:401})
        }
         const newconnection=new Collab({
            sender:currentUserId,
            reciever:user._id,
            
         })
         await newconnection.save()
         return NextResponse.json(
            { message: "Connection request sent",user },
            { status: 201 }
          );
    } catch (error) {
        console.error("Request send error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
    }
}