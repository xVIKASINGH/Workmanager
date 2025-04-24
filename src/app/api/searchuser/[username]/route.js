
import User from "@/models/Userschema";
import { Dbconnect } from "@/helper/dbConnect";
import { NextResponse } from "next/server";
import Collab from "@/models/ConnnectionSchema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(request,{params}) {
    const {username}=await params;
   
  const session=await getServerSession(authOptions);
    await Dbconnect();
    try {
        const users = await User.find({
            username: { $regex: `^${username}`, $options: "i" },
          })
            .select("username email collaborators") 
            .limit(10);

      
            if (users.length === 0) {
                return NextResponse.json(
                  { message: "No user found for this username" },
                  { status: 404 }
                );
              }
        const result = users.map((user) => {
            const isConnected = user.collaborators?.some(
              (u) => u?.toString() === session.user.id
            );
            return {
              _id: user._id,
              username: user.username,
              email: user.email,
              isConnected,
            };
          });
          
       
        return NextResponse.json({result},{status:201})
    } catch (error) {
        console.error("Error while fetching user details",error);
        return NextResponse.json({message:"Error while saerhing req"})
    }
}

export async function POST(request,{params}){
    
  const {targetUserId,currentUserId}=await request.json()

    try {
        await Dbconnect();
        const user=await User.findById(targetUserId)
        if(!user){
            return NextResponse.json({message:"No user found for this username"},{status:401})
        }
         const newconnection=new Collab({
            sender:currentUserId,
            reciever:user._id,
            
         })
         await newconnection.save()
         return NextResponse.json(
            { message: "Connection request sent",user },
            { status: 201 }
          );
    } catch (error) {
        console.error("Request send error:", error);
       return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
    }
}