import { adminModel } from "../model/adminModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { userModel } from "../model/userModel.js";
import { meetingModel } from "../model/meeting.js";
import { EmailModel } from "../model/emailModel.js";

//admin login

export const adminLogin = async (req, res) => {
  try {
    const { name, password } = req.body;
    const admin = await adminModel.findOne({ name });
    const pass = await adminModel.findOne({ password });

    if (!admin || !pass) {
      return res.status(400).send({ message: "Invalid admin credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.send({
      admin: admin.name,
      token,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

//create user only admin can create it

export const userCreate = async (req, res) => {
  try {
    const { name, contact, email, password, domain, employeeId, resumeUrl } = req.body;
    console.log(req.body);

    //checking user exist or not
    const existingUser = await userModel.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // hashing password
    const hashedPassword = await bcrypt.hash(password, 10);

    // creating new user
    const newUser = new userModel({
      name,
      contact,
      email,
      password: hashedPassword,
      domain,
      employeeId,
      resumeUrl
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//fetching all users

export const getUsers = async (req, res) => {
  try {
    const users = await userModel.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Fetch Users Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//deleting user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await userModel.findByIdAndDelete(id);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

//updating user

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, contact, email, domain, employeeId, resumeUrl } = req.body;

  try {
    const updatedUser = await userModel.findByIdAndUpdate(
      id,
      { name, contact, email, domain, employeeId, resumeUrl },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//creating meetings
export const meetings = async (req, res) => {
  try {
    const task = new meetingModel(req.body);
    await task.save();
    res.status(201).send(task);
  } catch (err) {
    res.status(400).send(err);
  }
};

//sending emails

export const sendEmail = async (req, res) => {
  try {
    const { email, subject, message } = req.body;

    //find user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const newEmail = new EmailModel({
      user: user._id,
      email,
      subject,
      message,
    });

    await newEmail.save();
    res.status(201).json({ message: "Email Sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//fetching emails excluding the adminId Emails

export const fetchEmails = async (req, res) => {
  try {
    const emails = await EmailModel.find({ adminId: { $exists: false } });
    res.json(emails);
  } catch (error) {
    res.status(500).json({ message: "Error fetching emails" });
  }
};


//fetching replied emails

export const repliedEmails = async (req, res) => {
  

  try {
    // fetching emails specific which has adminId
    const replies = await EmailModel.find({ adminId : "67a32f5de5a557be5a70568d" }); 
    res.status(200).json(replies);
  } catch (error) {
    console.error('Error fetching replies:', error);
    res.status(500).json({ error: 'Failed to fetch replies' });
  }
}


export const changePass = async (req,res) => {

  const {oldPass, newPass} = req.body

  try {

    const user = await adminModel.findOne({_id : '67a32f5de5a557be5a70568d'})
    
    if(oldPass !== user.password){
     return res.status(401).json({message : 'Invalid Old Password'})
    }

    user.password = newPass

    await user.save()
    return res.status(201).send({message : 'Password Changed Successfully'})
    
  } catch (error) {
    return res.status(500).json({error})
  }
}