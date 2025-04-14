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
      const rawteamMembers = formData.getAll("teamMembers");
      const teamMembers=JSON.parse(rawteamMembers);
      const files=formData?.get('files')
      if (!title || !description || !deadline || !teamMembers) {
        return Response.json({ error: "Missing fields" }, { status: 400 });
      }
    
      try {
        await Dbconnect();
        const teammates = teamMembers.map((user) => ({
          userId:user._id,                 
          assigntask: [],
          comments: [],
        }));
      const newproject=new Project({
        creator:server.user.id,
        title,
        description,
        deadline,
        teammates,
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