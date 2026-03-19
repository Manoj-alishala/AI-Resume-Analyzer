import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("Error: MONGO_URI is not defined in .env");
  process.exit(1);
}

console.log("Attempting to connect to MongoDB...");
console.log("URI:", MONGO_URI.replace(/\/\/.*:.*@/, "//<credentials>@")); // Hide credentials

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s
})
  .then(() => {
    console.log("Successfully connected to MongoDB!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Connection failed!");
    console.error("Error Name:", err.name);
    console.error("Error Message:", err.message);
    if (err.reason) {
      console.error("Reason:", JSON.stringify(err.reason, null, 2));
    }
    process.exit(1);
  });
