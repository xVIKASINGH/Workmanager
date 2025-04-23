import CredentialsProvider from "next-auth/providers/credentials";
import { Dbconnect } from "@/helper/dbConnect";
import User from "@/models/Userschema";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
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
          
            if(!user){
            throw new Error("User not found")
            }
            const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
            if (!isPasswordValid) throw new Error("Invalid password");
            return { id: user._id.toString(), email: user.email ,username:user.username};
          }
        })
        ,
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET
        })
      ],
      pages: {
        signIn: "/login",
      },
      session: {
        strategy: "jwt",
      },
      callbacks: {
        async jwt({ token, user, account }) {
          if (user) {
       
            const existingUser = await User.findOne({ email: user.email });
      
            if (existingUser) {
              token.id = existingUser._id.toString(); 
              token.username = existingUser.username;
            } else {
           
              const newUser = await User.create({
                email: user.email,
                username: user.name.replace(/\s/g, "").toLowerCase(),
              });
              token.id = newUser._id.toString();
              token.username = newUser.username;
            }
          }
          return token;
        },
        
        async session({ session, token }) {
          if (token?.id) {
            
            session.user.id = token.id;
            session.user.username=token.username
            session.user.email=token.email
          }
          return session;
        },
      },
      secret: process.env.NEXTAUTH_SECRET,

  }


  const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };