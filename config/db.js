import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("Checking MongoDB URI...");
    console.log("URI available:", Boolean(process.env.MONGO_URI));

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected Successfully!");
  } catch (error) {
    console.error("MongoDB Connection Failed!");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Full error:", error.stack);

    process.exit(1);
  }
};

export default connectDB;