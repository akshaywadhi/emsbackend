import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Employee from "../models/Employee.js";

// Load environment variables
dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const adminExists = await Employee.findOne({ email: "admin@ems.com" });
    if (adminExists) {
      console.log("Admin employee already exists");
      process.exit(0);
    }

    // Create admin employee
    const admin = new Employee({
      firstName: "Admin",
      lastName: "User",
      email: "admin@ems.com",
      password: "admin123", // This will be hashed
      role: "admin",
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(admin.password, salt);

    // Save admin employee
    await admin.save();
    console.log("Admin employee created successfully");
    console.log("Email: admin@ems.com");
    console.log("Password: admin123");

    process.exit(0);
  } catch (err) {
    console.error("Error creating admin employee:", err);
    process.exit(1);
  }
};

createAdmin();
