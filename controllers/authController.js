import User from '../models/User.js';
import bcrypt from 'bcrypt'; // Correct import
import jwt from 'jsonwebtoken'; // JWT for token generation

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User Not Found' });
    }

    // Compare the input password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(404).json({ success: false, error: 'Wrong Password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_KEY, // Ensure the key is available in .env
      { expiresIn: '10d' } // Token expiration time
    );

    // Return the token and user details
    res.status(200).json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, role: user.role },
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

const verify = (req, res) => {
  return res.status(200).json({ success: true, user: req.user });
};

export { login, verify };
