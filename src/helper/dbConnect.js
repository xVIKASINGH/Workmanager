import mongoose from "mongoose";
export async function Dbconnect() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Db connected successfully")
    } catch (error) {
        console.error("Error while connecting to DB",error)
    }
}