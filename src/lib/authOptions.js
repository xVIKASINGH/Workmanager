import CredentialsProvider from "next-auth/providers/credentials";
import { Dbconnect } from "@/helper/dbConnect";
import User from "@/models/Userschema";
import bcrypt from "bcryptjs";
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
            console.log("user found",user)
            if(!user){
            throw new Error("User not found")
            }
            const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
            if (!isPasswordValid) throw new Error("Invalid password");
            return { id: user._id.toString(), email: user.email ,name:user.name};
          }
        })
      ],
      pages: {
        signIn: "/login",
      },
      session: {
        strategy: "jwt",
      },
      callbacks: {
        async jwt({ token, user }) {
          if (user) {
            token.id = user.id;
          }
          return token;
        },
        async session({ session, token }) {
          if (token?.id) {
            console.log(token.id)
            session.user.id = token.id;
          }
          return session;
        },
      },
      secret: process.env.NEXTAUTH_SECRET,

  }
