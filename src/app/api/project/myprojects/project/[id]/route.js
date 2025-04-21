import { Dbconnect } from "@/helper/dbConnect";
import Project from "@/models/GroupProjectSchema";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { id } =await params;


  try {
    await Dbconnect();
    const project = await Project.findById(id).populate([
        {
          path: 'creator',
          select: 'username email',
        },
        {
          path: 'teammates.userId',
          select: 'username email',
        }
      ]);
    if (!project) {
      return NextResponse.json({ message: "No project found!" }, { status: 404 });
    }

    return NextResponse.json({ project }, { status: 200 });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
