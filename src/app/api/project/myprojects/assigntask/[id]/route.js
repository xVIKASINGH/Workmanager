import { Dbconnect } from "@/helper/dbConnect";
import Project from "@/models/GroupProjectSchema";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  const { id } =await params; 
  console.log("API hit for assign-task, project ID:", id);

  const data = await request.json();
  console.log("Received Data:", data);
  const {teammateId,task,dueDate}=data;

  try {
    await Dbconnect();    const updatedProject = await Project.findOneAndUpdate(
        { _id: id, "teammates.userId": teammateId },
        {
          $push: {
            "teammates.$.assigntask": {
              task,
              dueDate,
            },
          },
        },
        { new: true }
      );
      if (!updatedProject) {
        return NextResponse.json(
          { message: "Project or teammate not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { message: "Task assigned successfully", project: updatedProject },
        { status: 200 }
      );
  
  } catch (error) {
    console.error("Error in assigning task:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
