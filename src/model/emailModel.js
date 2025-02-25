import mongoose from "mongoose";

const emailSchema = new mongoose.Schema({
  email: { type: String},
  subject: { type: String },
  message: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User"}, 
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User"}, 
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
});

export const EmailModel = mongoose.model("Email", emailSchema);
