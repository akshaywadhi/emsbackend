import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Employee from "./models/Employee.js";
import Department from "./models/Department.js";
dotenv.config();

const userRegister = async () => {
  try {
    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Employee.deleteMany({});
    await Department.deleteMany({});
    console.log("Cleared existing data");

    // Create departments
    const departments = [
      { name: "IT", description: "Information Technology Department" },
      { name: "HR", description: "Human Resources Department" },
      { name: "Finance", description: "Finance Department" },
      { name: "Marketing", description: "Marketing Department" },
    ];

    const createdDepartments = await Department.insertMany(departments);
    console.log("Departments created successfully");

    // Create a map of department names to their IDs
    const departmentMap = createdDepartments.reduce((map, dept) => {
      map[dept.name] = dept._id;
      return map;
    }, {});

    // Array of users to create
    const users = [
      {
        firstName: "System",
        lastName: "Admin",
        email: "admin@ems.com",
        password: "Admin@123",
        role: "admin",
        phone: "1234567890",
        address: "Admin Address",
        department: departmentMap["IT"],
        position: "System Administrator",
        joiningDate: new Date(),
      },
      {
        firstName: "John",
        lastName: "Employee",
        email: "john@ems.com",
        password: "John@123",
        role: "employee",
        phone: "1234567891",
        address: "John's Address",
        department: departmentMap["HR"],
        position: "HR Executive",
        joiningDate: new Date(),
      },
      {
        firstName: "Sarah",
        lastName: "Employee",
        email: "sarah@ems.com",
        password: "Sarah@123",
        role: "employee",
        phone: "1234567892",
        address: "Sarah's Address",
        department: departmentMap["Finance"],
        position: "Accountant",
        joiningDate: new Date(),
      },
      {
        firstName: "Mike",
        lastName: "Employee",
        email: "mike@ems.com",
        password: "Mike@123",
        role: "employee",
        phone: "1234567893",
        address: "Mike's Address",
        department: departmentMap["IT"],
        position: "Developer",
        joiningDate: new Date(),
      },
      {
        firstName: "Lisa",
        lastName: "Employee",
        email: "lisa@ems.com",
        password: "Lisa@123",
        role: "employee",
        phone: "1234567894",
        address: "Lisa's Address",
        department: departmentMap["Marketing"],
        position: "Marketing Executive",
        joiningDate: new Date(),
      },
    ];

    // Create users
    for (const user of users) {
      const hashPassword = await bcrypt.hash(user.password, 10);

      const newUser = new Employee({
        ...user,
        password: hashPassword,
      });

      await newUser.save();
      console.log(
        `${user.role} user ${user.firstName} ${user.lastName} registered successfully`
      );
    }

    console.log("All users registered successfully");
  } catch (error) {
    console.error("Error during user registration:", error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

// Run the seed function
userRegister();
