import mongoose from "mongoose";

export const Dbconnect = async () => {
  try {
    if (mongoose.connections[0].readyState) return;
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.log("❌ Error while connecting to DB", error);
  }
};
