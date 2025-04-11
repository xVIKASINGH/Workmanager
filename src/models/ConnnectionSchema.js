import mongoose from "mongoose";

const ConnectionSchema=new mongoose.Schema({
    sender:{
       type: Schema.Types.ObjectId,
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

const Request= mongoose.model("Request",ConnectionSchema);

export default Request;