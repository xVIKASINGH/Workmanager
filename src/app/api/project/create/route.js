import { Dbconnect } from "@/helper/dbConnect";
import { authOptions } from "@/lib/authOptions";
import Project from "@/models/GroupProjectSchema";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { Readable } from "stream";
import cloudinary from "@/utils/cloudinary"

export async function POST(request,{params}) {
    const server=await getServerSession(authOptions);
      const formData=await request.formData();
    
      const title=formData.get("title");
      const description=formData.get('description');
      const deadline=formData.get("deadline")
      const rawteamMembers = formData.getAll("teamMembers");
      const teamMembers=JSON.parse(rawteamMembers);
      const files=formData?.get('attachments')
     
      if (!title || !description || !deadline || !teamMembers) {
        return Response.json({ error: "Missing fields" }, { status: 403 });
      }
    
      try {
        await Dbconnect();
        if (!files || typeof files.arrayBuffer !== "function") {
          return NextResponse.json(
            { error: "File is missing or invalid" },
            { status: 400 }
          );
        }
        
        const buffer = Buffer.from(await files.arrayBuffer());
        const fileurl=await new Promise((resolve,reject)=>{
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "workmanager",
              
             },
            (error, result) => {
              if (error) {
            
                reject(error)}
              else{
                  resolve(result.secure_url);
              }
             
            }
           
          );
         
          Readable.from(buffer).pipe(uploadStream);
        })
     
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
        attachments:{ 
          filename:files.name,
          fileUrl:fileurl,
          uploadAt:Date.now
        }
      })  
    
    await newproject.save();
    return NextResponse.json({message:"project created"},{status:201})

      } catch (error) {
        console.error("Error occurred",error)
        return NextResponse.json({message:error.message},{status:500,statusText:"rukja bhai"})
      }
}