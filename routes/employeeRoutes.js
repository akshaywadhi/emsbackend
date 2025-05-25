import express from "express";
import auth from "../middleware/auth.js";
import Employee from "../models/Employee.js";
import Department from "../models/Department.js";
import Payslip from "../models/Payslip.js";
import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";

const router = express.Router();

// Get all employees
router.get("/", auth, async (req, res) => {
  try {
    const employees = await Employee.find().select("-password");
    res.json({
      success: true,
      employees,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get employee profile
router.get("/profile", auth, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.error("No user ID in request:", req.user);
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const employee = await Employee.findById(req.user.id)
      .select("-password")
      .populate("department", "name");

    if (!employee) {
      console.error("Employee not found for ID:", req.user.id);
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
    console.error("Profile route error:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get employee attendance
router.get("/attendance", auth, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.error("No user ID in request:", req.user);
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const attendance = await Attendance.find({ employee: req.user.id }).sort({
      date: -1,
    });

    res.json({
      success: true,
      attendance,
    });
  } catch (err) {
    console.error("Attendance route error:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get employee leaves
router.get("/leaves", auth, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.error("No user ID in request:", req.user);
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const leaves = await Leave.find({ employee: req.user.id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      leaves,
    });
  } catch (err) {
    console.error("Leaves route error:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get employee payslips
router.get("/payslips", auth, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.error("No user ID in request:", req.user);
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const payslips = await Payslip.find({ employee: req.user.id }).sort({
      month: -1,
      year: -1,
    });

    res.json({
      success: true,
      payslips,
    });
  } catch (err) {
    console.error("Payslips route error:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get employee department
router.get("/department", auth, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.error("No user ID in request:", req.user);
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const employee = await Employee.findById(req.user.id)
      .select("department")
      .populate("department", "name");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.json({
      success: true,
      department: employee.department,
    });
  } catch (err) {
    console.error("Department route error:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get all attendance records (admin only)
router.get("/attendance/all", auth, async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .populate("employee", "firstName lastName email")
      .sort({ date: -1 });
    res.json({
      success: true,
      attendance,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get all leave requests (admin only)
router.get("/leaves/all", auth, async (req, res) => {
  try {
    const { status } = req.query;
    const query = status && status !== "all" ? { status } : {};

    const leaves = await Leave.find(query)
      .populate("employee", "firstName lastName email department")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      leaves,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Update leave request status
router.put("/leaves/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    leave.status = status;
    await leave.save();

    res.json({
      success: true,
      leave,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Generate attendance report
router.get("/reports/attendance", auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendance = await Attendance.find({
      date: { $gte: startDate, $lte: endDate },
    }).populate("employee", "firstName lastName email department");

    const report = attendance.reduce((acc, record) => {
      const employeeId = record.employee._id.toString();
      if (!acc[employeeId]) {
        acc[employeeId] = {
          employee: record.employee,
          present: 0,
          absent: 0,
          late: 0,
          total: 0,
        };
      }

      acc[employeeId].total++;
      if (record.status === "present") acc[employeeId].present++;
      if (record.status === "absent") acc[employeeId].absent++;
      if (record.status === "late") acc[employeeId].late++;

      return acc;
    }, {});

    res.json({
      success: true,
      report: Object.values(report),
      period: { month, year },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Generate leave report
router.get("/reports/leave", auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const leaves = await Leave.find({
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
    }).populate("employee", "firstName lastName email department");

    const report = leaves.reduce((acc, record) => {
      const employeeId = record.employee._id.toString();
      if (!acc[employeeId]) {
        acc[employeeId] = {
          employee: record.employee,
          approved: 0,
          pending: 0,
          rejected: 0,
          total: 0,
        };
      }

      acc[employeeId].total++;
      if (record.status === "approved") acc[employeeId].approved++;
      if (record.status === "pending") acc[employeeId].pending++;
      if (record.status === "rejected") acc[employeeId].rejected++;

      return acc;
    }, {});

    res.json({
      success: true,
      report: Object.values(report),
      period: { month, year },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Generate department report
router.get("/reports/department", auth, async (req, res) => {
  try {
    const departments = await Department.find();
    const employees = await Employee.find().populate("department");

    const report = departments.map((dept) => {
      const deptEmployees = employees.filter(
        (emp) => emp.department?._id.toString() === dept._id.toString()
      );

      const positions = deptEmployees.reduce((acc, emp) => {
        acc[emp.role] = (acc[emp.role] || 0) + 1;
        return acc;
      }, {});

      return {
        department: dept.name,
        total: deptEmployees.length,
        positions,
      };
    });

    res.json({
      success: true,
      report,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get employee by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select("-password");
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

// Update employee
router.put("/:id", auth, async (req, res) => {
  try {
    const { firstName, lastName, email, department, role } = req.body;
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Update fields
    if (firstName) employee.firstName = firstName;
    if (lastName) employee.lastName = lastName;
    if (email) employee.email = email;
    if (department) employee.department = department;
    if (role) employee.role = role;

    await employee.save();
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

// Delete employee
router.delete("/:id", auth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    await employee.deleteOne();
    res.json({
      success: true,
      message: "Employee removed",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get employee payslips by ID (admin only)
router.get("/:id/payslips", auth, async (req, res) => {
  try {
    const payslips = await Payslip.find({ employee: req.params.id });
    res.json({
      success: true,
      payslips,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Create payslip (admin only)
router.post("/:id/payslips", auth, async (req, res) => {
  try {
    const { month, year, basicSalary, allowances, deductions } = req.body;
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const payslip = new Payslip({
      employee: req.params.id,
      month,
      year,
      basicSalary,
      allowances,
      deductions,
    });

    await payslip.save();
    res.json({
      success: true,
      payslip,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Mark attendance
router.post("/attendance/mark", auth, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.error("No user ID in request:", req.user);
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if attendance already marked for today
    const existingAttendance = await Attendance.findOne({
      employee: req.user.id,
      date: today,
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: "Attendance already marked for today",
      });
    }

    // Create new attendance record
    const attendance = new Attendance({
      employee: req.user.id,
      date: today,
      status: "present",
      time: new Date(),
    });

    await attendance.save();

    res.json({
      success: true,
      message: "Attendance marked successfully",
      attendance,
    });
  } catch (err) {
    console.error("Mark attendance error:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Create leave request
router.post("/leaves", auth, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.error("No user ID in request:", req.user);
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { startDate, endDate, type, reason } = req.body;

    // Validate required fields
    if (!startDate || !endDate || !type || !reason) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Create new leave request
    const leave = new Leave({
      employee: req.user.id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      type,
      reason,
      status: "pending",
    });

    await leave.save();

    res.json({
      success: true,
      message: "Leave request submitted successfully",
      leave,
    });
  } catch (err) {
    console.error("Create leave request error:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
