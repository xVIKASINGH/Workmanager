import { Dbconnect } from "@/helper/dbConnect";
import { NextResponse } from "next/server";
import Project from "@/models/GroupProjectSchema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import mongoose from "mongoose";
export async function POST(req,{params}) {
  const {id}=await params
    try {
  
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
          return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }
    
     
        const body = await req.json();
        const { content, attachments = [] } = body;
        
 
        if (!content) {
          return new NextResponse(JSON.stringify({ error: "Project ID and comment content are required" }), {
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
    
     
        const newComment = {
          content,
          timestamp: new Date(),
          attachments: attachments.map(attachment => ({
            filename: attachment.filename,
            fileUrl: attachment.fileUrl,
            uploadedAt: new Date()
          }))
        };
    
    
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