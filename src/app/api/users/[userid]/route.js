import { NextResponse } from "next/server";

export async function DELETE(request,{params}){
  console.log(params)
    if(params.userid==='123'){
        return NextResponse.json({message:"please verify yourseld"})
    }else{
        return NextResponse.json({message:"Got the request"},{status:201,statusText:"done hai !"})
    }
  
}