import { userModel } from "../model/userModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { meetingModel } from "../model/meeting.js";
import { TaskModel } from "../model/taskModel.js";
import { EmailModel } from "../model/emailModel.js";



//user login
export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: 'user' }, 
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log(" Generated Token:", token); 

    res.json({ message: "Login successful", token });

  } catch (error) {
    console.error(" Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


//fetching user detail


export const getUserDetail = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}



//meeting created by admin

export const getAllMeetings = async (req, res) => {
  try {
    const allMeetings = await meetingModel.find();
    res.status(200).json(allMeetings);
  } catch (err) {
    res.status(400).send(err);
  }
};



//task controllers start from here

export const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    console.log(title, description)
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;
    console.log("Creating task for user:", userId);

    const newTask = new TaskModel({ title, description, user: userId });
    await newTask.save();

    res.status(201).json(newTask);
  } catch (error) {
    console.error("Task creation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// fetching tasks
export const getTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await TaskModel.find({ user: userId });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Updating task
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const userId = req.user.id;

    const task = await TaskModel.findOneAndUpdate(
      { _id: id, user: userId },
      { title, description },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error'});
  }
};

// Deleting a task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const task = await TaskModel.findOneAndDelete({ _id: id, user: userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


//fetching user emails

export const getUserEmails = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("Fetching emails for user ID:", userId); 

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    
    const emails = await EmailModel.find({ user: userId });

    console.log("Emails Found:", emails);

    if (!emails || emails.length === 0) {
      return res.status(404).json({ message: "No emails found" });
    }

    res.status(200).json(emails);
  } catch (error) {
    console.error("Error fetching emails:", error);
    res.status(500).json({ message: "Server error" });
  }
};



//replying to admin only

export const replyAdmin = async (req, res) => {
  try {
    const { replyMessage, userEmail } = req.body;
    console.log(replyMessage, userEmail)

    if (!replyMessage) {
      return res.status(400).json({ message: "Reply message is required." });
    }

    const adminId = "67a32f5de5a557be5a70568d"; 

    const newReply = new EmailModel({
      email : userEmail,
      adminId, 
      message: replyMessage,
    });

    await newReply.save();
    res.json({ message: "Reply sent to admin successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error sending reply." });
  }
}