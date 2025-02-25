import express from "express";
import {
  adminLogin,
  deleteUser,
  getUsers,
  meetings,
  updateUser,
  userCreate,
  sendEmail,
fetchEmails,
repliedEmails,
changePass
} from "../controllers/adminController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import emailMiddleware from "../middleware/emailMiddleware.js";

export const router = express.Router();

router
  .post("/admin_login", adminLogin)
  .post("/addUser", userCreate)
  .get("/users", getUsers)
  .delete("/deleteUser/:id", deleteUser)
  .put("/updateUser/:id", updateUser)
  .post("/meeting", meetings)
  .post("/sendEmail", emailMiddleware, sendEmail)
  .get('/sentEmails', fetchEmails)
  .get('/repliedEmails', repliedEmails)
  .put('/changePass', changePass);
