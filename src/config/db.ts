import mongoose from "mongoose";

export async function connectDB(connectionString: string) {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(connectionString);
    console.log("DB connected!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}
