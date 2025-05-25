// Import required modules
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./models/User.js"; // Adjust the path if necessary

// Connect to your MongoDB database
const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://mern:mern@cluster3.um6nc.mongodb.net/myDatabase?retryWrites=true&w=majority&appName=Cluster3", // Update 'myDatabase' with your actual database name
      {
        // Removed deprecated options
      }
    );
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

// Function to check password
const checkPassword = async (email, inputPassword) => {
  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found");
      return;
    }

    // Compare the input password with the stored hashed password
    const isMatch = await bcrypt.compare(inputPassword, user.password);
    console.log(`Password match for user ${email}: ${isMatch}`);
  } catch (error) {
    console.error("Error checking password:", error.message);
  }
};

// Run the script
const runTest = async () => {
  await connectDB(); // Connect to MongoDB
  await checkPassword("admin@gmail.com", "123456"); // Test the password
  mongoose.connection.close(); // Close the connection
};

runTest();
