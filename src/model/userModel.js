import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  domain: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  resumeUrl: { type: String, required: true, unique: true },
});

export const userModel = mongoose.model('User', userSchema);
