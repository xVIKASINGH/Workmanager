import mongoose from "mongoose";

const UserSchema=new mongoose.Schema({
 
  username:{
    type:String,
    required:true,
    unique:true
  },
  email:{
    type:String,
    required:true
  },
  password:{
    type:String,
    
  },
  collaborators: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  

})

const User= mongoose.models?.User || mongoose.model("User",UserSchema)

export default User