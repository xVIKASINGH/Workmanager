import Task from "@/models/TaskSchema";
import { NextResponse } from "next/server";
import { Dbconnect } from "@/helper/dbConnect";

export async function PUT(request,{params}) {
    console.log("API HIT")
    const {id}=await params;
try {
    await Dbconnect();
    const task=await Task.findById(id);
    if(!task){
        return NextResponse.json({message:"Task not found:("},{status:201})
    }
  task.completion=!task.completion
  await task.save();
return NextResponse.json({message:"Task updated succesfully"},{status:201})
} catch (error) {
    console.error("error while updating response")
    return NextResponse.json(
        { message: "Error updating task", error: error.message },
        { status: 500 }
      );
}

}