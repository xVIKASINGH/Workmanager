import { Dbconnect } from "@/helper/dbConnect";
import { authOptions } from "@/lib/authOptions";
import User from "@/models/Userschema";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";


export async function GET(params) {
    const session=await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
try {
    Dbconnect();
    const user=await User.findById(session.user.id).populate("collaborators");
   
    if (!user || !user.collaborators || user.collaborators.length === 0) {
        return NextResponse.json({ message: "No collaborators found" }, { status: 404 });
      }
  
      console.log("Collaborators found:", user.collaborators);
    return NextResponse.json({collaborators:user.collaborators},{status:201})
} catch (error) {
    console.log("error while fetching error",error);
    return NextResponse.json({message:"erorr aa rhi h bhai"})
}

}