import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Task from "@/models/TaskSchema";
import { Dbconnect } from "@/helper/dbConnect";


export async function POST(request) {
  const body=await request.json();
  const { title, description, deadline } = body;
await Dbconnect();

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "You must be logged in" }, { status: 401 });
  }



  if (!title || !description || !deadline) {
    return NextResponse.json({ message: "All fields are required" }, { status: 400 });
  }
 

  try {
    const newTask = await Task.create({
      title,
      description,
      deadline,
      user: session.user.id,
    });

    return NextResponse.json({ message: "Task added successfully", task: newTask }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong", error: error.message }, { status: 500 });
  }
}


