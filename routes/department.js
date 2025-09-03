import express from "express";
import auth from "../middleware/auth.js";
import Department from "../models/Department.js";

const router = express.Router();


router.get("/", auth, async (req, res) => {
  try {
    const departments = await Department.find();
    res.json({
      success: true,
      departments,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


router.get("/:id", auth, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }
    res.json({
      success: true,
      department,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


router.post("/", auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    const department = new Department({
      name,
      description,
    });
    await department.save();
    res.json({
      success: true,
      department,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


router.put("/:id", auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    if (name) department.name = name;
    if (description) department.description = description;

    await department.save();
    res.json({
      success: true,
      department,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


router.delete("/:id", auth, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    await Department.deleteOne({ _id: req.params.id });
    res.json({
      success: true,
      message: "Department removed",
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
