import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  date: String,
  purpose: String,
});
export const meetingModel = mongoose.model("Meeting", TaskSchema);