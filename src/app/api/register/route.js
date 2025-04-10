import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/Userschema";
import { Dbconnect } from "@/helper/dbConnect";

export async function POST(req) {
  await Dbconnect();
 
  try {
    const { username, email, password } = await req.json();

  
    const existingUser = await User.findOne({ email });
    if (existingUser) return NextResponse.json({ error: "User already exists" }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return NextResponse.json({ message: "User registered" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
