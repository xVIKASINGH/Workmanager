import mongoose from "mongoose";
import { Schema } from "mongoose";
const ConnectionSchema=new mongoose.Schema({
    sender:{
       type:Schema.Types.ObjectId,
        ref:"User"
    },
    reciever:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    status:{
        type:String,
        enum:['pending','accepted','rejected'],default:"pending"
    },
    createdAt: { type: Date, default: Date.now },
})

const Collab= mongoose.models.Collab || mongoose.model("Collab",ConnectionSchema);

export default Collab