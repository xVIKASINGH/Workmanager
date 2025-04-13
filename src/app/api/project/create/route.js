import { Dbconnect } from "@/helper/dbConnect";
import { authOptions } from "@/lib/authOptions";
import Project from "@/models/GroupProjectSchema";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function POST(request,{params}) {
    const server=await getServerSession(authOptions);
      const formData=await request.formData();
      const title=formData.get("title");
      const description=formData.get('description');
      const deadline=formData.get("deadline")
      const teamMembers=formData.get("teamMembers");
      const files=formData?.get('files')
      try {
        await Dbconnect();
      const newproject=new Project({
        creator:server.user.id,
        title,
        description,
        deadline,
        teamMembers,
        files
      })
    console.log(formData)
    await newproject.save();
    return NextResponse.json({message:"project created"},{status:201})

      } catch (error) {
        console.error("Error occurred",error)
        return NextResponse.json({message:"eror aa gyti"},{status:500,statusText:"rukja bhai"})
      }
}