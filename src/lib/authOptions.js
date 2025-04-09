import CredentialsProvider from "next-auth/providers/credentials";
import { Dbconnect } from "@/helper/dbConnect";
import User from "@/models/Userschema";
import { NextResponse } from "next/server";
export const authOptions={
    providers: [
        CredentialsProvider({
         
          name: "Credentials",
        
          credentials: {
            username: { label: "Username", type: "text", placeholder: "Enter your username" },
            password: { label: "Password", type: "password" }
          },
          async authorize(credentials, req) {
              await Dbconnect();
           
        
            const user=await User.findOne({username: credentials.username});
            if(user){
         return NextResponse.json({message:"user already registered"})
            }
            const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
            if (!isPasswordValid) throw new Error("Invalid password");
            return { id: user._id, email: user.email };
          }
        })
      ],
      pages: {
        signIn: "/login",
      },
      session: {
        strategy: "jwt",
      },
      secret: process.env.NEXTAUTH_SECRET,
    
}
