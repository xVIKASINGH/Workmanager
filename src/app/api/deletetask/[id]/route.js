import Task from "@/models/TaskSchema";
import { Dbconnect } from "@/helper/dbConnect";
import { NextResponse } from "next/server";

export async function DELETE(request,{params}) {
    const {id}=params;
    try {
        await Dbconnect();
        await Task.findOneAndDelete(id);
        return NextResponse.json({message:"Task deleted successfully"},{status:201});
    } catch (error) {
        console.error("Error while delting the messsage");
    }
}