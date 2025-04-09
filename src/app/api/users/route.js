import { Dbconnect } from "@/helper/dbConnect"
import { NextResponse } from "next/server"
Dbconnect();
export  function GET(request){
    const user=[
        {
            author:"vikas singh",
            content:"manali picks",
            date:new Date(),
        },
        {
            author:"rudra yadav",
            content:"payment screenshot  pay? kab krega",
            date:new Date(),
        }
    ]
   return NextResponse.json(user)
}
export function DELETE(request){
    console.log("user requested for delete ")
    return NextResponse.json({message:"aa bhai kr rha delete"},{status:"201",statusText:"statustext"})
}