import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();
const MONGO_URI = process.env.MONGO_URI;

mongoose.connection.on("connected", () => console.log("Event: Mongoose connected"));
mongoose.connection.on("error", (err) => console.error("Event: Mongoose error", err.message));
mongoose.connection.on("disconnected", () => console.log("Event: Mongoose disconnected"));

const runTest = async () => {
  try {
    console.log("Connecting...");
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("Connection successful!");

    console.log("Testing findOne...");
    // Force a 5-second buffer timeout instead of 10s for faster testing
    mongoose.set("bufferTimeoutMS", 5000); 

    const start = Date.now();
    const user = await User.findOne({ email: "test@example.com" });
    console.log(`Query completed in ${Date.now() - start}ms:`, user);

    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err.message);
    process.exit(1);
  }
};

runTest();
