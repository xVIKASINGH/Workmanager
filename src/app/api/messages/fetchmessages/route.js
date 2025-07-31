import MessageSchema from "@/models/MessageSchema";
import { Dbconnect } from "@/helper/dbConnect";
import { NextResponse } from "next/server";

export async function GET(req) {
  await Dbconnect();
  const { searchParams } = new URL(req.url);
  const userA = searchParams.get("userA");
  const userB = searchParams.get("userB");

  if (!userA || !userB) {
    return NextResponse.json({ message: "Missing user ids" }, { status: 400 });
  }


  const messages = await MessageSchema.find({
    $or: [
      { from: userA, to: userB },
      { from: userB, to: userA }
    ]
  }).sort({ timestamp: 1 }); // oldest first

  return NextResponse.json({ messages });
}