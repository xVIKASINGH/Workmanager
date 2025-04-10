import mongoose from "mongoose";
import { Schema } from "mongoose";
const TaskSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        require:true
    },
    deadline:{
        type:Date,
      
    },
    user:{
        type: Schema.Types.ObjectId,
        ref:"User"
    },
    completion:{
        type:Boolean,
        default:false
    }
})

const Task=mongoose.models.Task || mongoose.model("Task",TaskSchema)

export default Task