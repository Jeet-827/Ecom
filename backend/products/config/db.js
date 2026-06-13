import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected (Products): ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error (Products): ${error.message}`);
    process.exit(1);
  }
};
