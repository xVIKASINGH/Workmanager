import { Dbconnect } from "@/helper/dbConnect";
import { NextResponse } from "next/server";
import Project from "@/models/GroupProjectSchema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import mongoose from "mongoose";
import { Readable } from "stream";
import cloudinary from "@/utils/cloudinary"
export async function POST(request,{params}) {
  const {id}=await params
  const formData=await request.formData();
  const file=formData?.get('attachments');
  const content=formData.get("content");
    try {
  
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
          return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }
    
     
        console.log("here is attachments fetch from page",formData.attachments)
 
        if (!content) {
          return new NextResponse(JSON.stringify({ error: "comment content are required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
    
      
        if (mongoose.connection.readyState !== 1) {
        await  Dbconnect();
        }
        
        const userId = session.user.id;
    

        const project = await Project.findById(id);
        
        if (!project) {
          return new Response(JSON.stringify({ error: "Project not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }
    

        const teammateIndex = project.teammates.findIndex(
          teammate => teammate.userId.toString() === userId
        );
    
        if (teammateIndex === -1) {
          return new NextResponse(JSON.stringify({ error: "User is not a teammate in this project" }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
          });
        }
        const buffer = Buffer.from(await file.arrayBuffer());
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
    
     
        const newComment = {
          content,
          timestamp: new Date(),
          attachments:{
          filename: file.name,
          fileUrl:fileurl,
          uploadAt:Date.now
          }
          }
        
    
    
        project.teammates[teammateIndex].comments.push(newComment);
        
        
        await project.save();
    
        return new Response(JSON.stringify({ 
          success: true, 
          message: "Comment added successfully",
          comment: newComment
        }), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
        
      } catch (error) {
        console.error("Error adding comment:", error);
        return new Response(JSON.stringify({ error: "Failed to add comment" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
}