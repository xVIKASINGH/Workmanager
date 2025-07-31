import Message from "@/models/MessageSchema";
import { Dbconnect } from "@/helper/dbConnect";
import { NextResponse } from "next/server";


export async function POST(req){
    await Dbconnect();
    console.log("api hitttt");
    const {from,to,text,timestamp}=await req.json();
    const message=await Message.create({from,to,text,timestamp});
    message.save();
    return NextResponse.json({message:"Message saved",data:message});
}