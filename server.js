import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";


import authRoutes from "./routes/auth.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import departmentRoutes from "./routes/department.js";

dotenv.config();

console.log("Environment variables loaded:");
console.log("PORT:", process.env.PORT);
console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);
console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "default_jwt_secret_for_development";
  console.log("Using default JWT_SECRET for development");
}

const app = express();


app.use(cors());
app.use(express.json());





const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/ems";
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    console.log("Please make sure MongoDB is running or provide a valid MONGODB_URI");
    process.exit(1);
  }
};


connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/department", departmentRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
