import { Dbconnect } from "@/helper/dbConnect";
import Project from "@/models/GroupProjectSchema";
import { NextResponse } from "next/server";


export async function GET({params}){
    console.log("APi hit")
  const {id}=params;
  try {
    await  Dbconnect();
    const project=await Project.findById(id);
    if(!project){
        return NextResponse.json({message:"No project found !"},{status:401})
    }
    return NextResponse.json({project},{status:201,statusText:"all Ok"})
  } catch (error) {
    console.log("Erro",error);
    return NextResponse.json({message:"Internal Server error"},{status:500})
  }
}
