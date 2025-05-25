import Department from "../models/Department.js";

const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    return res.status(200).json({ success: true, departments });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return res.status(500).json({
      success: false,
      error: "Server error while fetching departments",
    });
  }
};

const addDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, error: "Department name is required" });
    }

    const newDep = new Department({
      name,
      description,
    });

    await newDep.save();
    return res.status(201).json({ success: true, department: newDep });
  } catch (error) {
    console.error("Error adding department:", error);
    return res
      .status(500)
      .json({ success: false, error: "Server error while adding department" });
  }
};

const getDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching department with id:", id);
    const department = await Department.findById(id);
    console.log("Department found:", department);
    if (!department) {
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    }
    return res.status(200).json({ success: true, department });
  } catch (error) {
    console.error("Error in getDepartment:", error);
    return res
      .status(500)
      .json({ success: false, error: "get department server error" });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const updateDep = await Department.findByIdAndUpdate(
      { _id: id },
      {
        name,
        description,
      },
      { new: true }
    );
    return res.status(200).json({ success: true, department: updateDep });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "edit department sever error" });
  }
};

export { addDepartment, getDepartments, getDepartment, updateDepartment };
