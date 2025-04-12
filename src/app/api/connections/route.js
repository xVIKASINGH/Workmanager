import User from "@/models/Userschema";
import { Dbconnect } from "@/helper/dbConnect";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";


export async function GET(params) {
    const session=await getServerSession(authOptions);
try {
    const user=await User.findById(session.user.id).populate('collaborators');

    const connections=user.collaborators
    return NextResponse.json({message:"collaboratos finds successfully",connections})
} catch (error) {
    console.error("error occurredd",error);
    return NextResponse.json({message:"Got the error"},{status:500})
}

}