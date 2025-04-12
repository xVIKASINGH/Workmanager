import { Dbconnect } from "@/helper/dbConnect"
import { User } from "lucide-react";
import { NextResponse } from "next/server"
Dbconnect();
export  async function GET(request,{params}){
    await Dbconnect();
    const {id}=await params;
    try {
        const user=await User.findByid(id);
        if(!user){
            return NextResponse.json({message:"user not found"},{status:201});
        }

        return NextResponse.json({user},{status:201})
    } catch (error) {
        console.error("Error while fetching");
        return NextResponse.json({message:"Internal server error "},{status:500})
    }
  
}
