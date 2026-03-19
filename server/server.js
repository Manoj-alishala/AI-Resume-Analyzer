import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import User from "./models/User.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

// MongoDB Connection and Server Start
const startServer = async () => {
  try {
    mongoose.connection.on("connected", () => console.log("Mongoose connected to db"));
    mongoose.connection.on("error", (err) => console.error("Mongoose connection error:", err.message));
    mongoose.connection.on("disconnected", () => console.log("Mongoose disconnected"));
    
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB initial connection successful");

    // Routes
    app.use("/auth", authRoutes);
    app.use("/resume", resumeRoutes);

    app.get("/", (req, res) => res.send("API Running"));

    app.get("/health", (req, res) => {
      res.json({
        globalState: mongoose.connection.readyState,
        userDbState: User.db.readyState,
        isSameDb: mongoose.connection === User.db
      });
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1); // Exit process with failure
  }
};

startServer();