import express from "express";
import {
  getUserDetail,
  userLogin,
  getAllMeetings,
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getUserEmails,
  replyAdmin,
} from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import emailMiddleware from "../middleware/emailMiddleware.js";

export const userRouter = express.Router();

userRouter
  .post("/user_login", userLogin)
  .get("/getUserDetail", getUserDetail)
  .get("/getAllMeetings", getAllMeetings)
  .post("/tasks", authMiddleware, createTask)
  .get("/tasks", authMiddleware, getTasks)
  .put("/tasks/:id", authMiddleware, updateTask)
  .delete("/tasks/:id", authMiddleware, deleteTask)
  .get("/getEmails", emailMiddleware, getUserEmails)
  .post("/replyAdmin", authMiddleware, replyAdmin);
