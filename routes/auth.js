import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Employee from "../models/Employee.js";
import auth from "../middleware/auth.js";

const router = express.Router();


router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password,position, role } = req.body;

  
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    let employee = await Employee.findOne({ email });
    if (employee) {
      return res.status(400).json({
        success: false,
        message: "Employee already exists",
      });
    }

   
    employee = new Employee({
      firstName,
      lastName,
      email,
      password,
      position,
      role: role || "employee",
    });


    const salt = await bcrypt.genSalt(10);
    employee.password = await bcrypt.hash(password, salt);

  
    await employee.save();

    const payload = {
      id: employee.id,
      role: employee.role,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          token,
          employee: {
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            position: employee.position,
            role: employee.role,
          },
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

   
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const payload = {
      id: employee.id,
      role: employee.role,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          token,
          employee: {
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            role: employee.role,
          },
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


router.get("/me", auth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.id).select("-password");
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }
    res.json({
      success: true,
      employee,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


router.get("/verify", auth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.id).select("-password");
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }
    res.json({
      success: true,
      employee: {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        role: employee.role,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
