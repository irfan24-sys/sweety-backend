
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// ==========================================
// GENERATE JWT TOKEN
// ==========================================
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    { userId: userId.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// ==========================================
// USER SIGNUP
// ==========================================
export const signup = async (req, res) => {
  try {
    const { name, email, password, diabetesType } = req.body;

    // Validate required fields
    if (
      !name?.trim() ||
      !email?.trim() ||
      !password ||
      !diabetesType
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Validate password
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters",
      });
    }

    // Validate diabetes type against User schema
    const allowedDiabetesTypes = [
      "Type 1",
      "Type 2",
      "Gestational / Pre",
      "Type 1 Diabetes",
      "Type 2 Diabetes",
      "Gestational Diabetes",
      "Pre-diabetes",
      "Other",
    ];

    if (!allowedDiabetesTypes.includes(diabetesType)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid diabetes classification",
      });
    }

    // Check whether email already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      diabetesType,
    });

    // Generate authentication token
    const token = generateToken(user._id);

    // Send success response
    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        diabetesType: user.diabetesType,
        phone: user.phone,
        dob: user.dob,
        sex: user.sex,
        profileImage: user.profileImage,
        doctorName: user.doctorName,
        doctorPhone: user.doctorPhone,
        emergencyName: user.emergencyName,
        emergencyPhone: user.emergencyPhone,
        specialists: user.specialists,
        glucoseSettings: user.glucoseSettings,
        preferences: user.preferences,
      },
    });

  } catch (error) {
    console.error("Signup Error:", error);

    // Duplicate email handling
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Mongoose validation handling
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Signup failed. Please try again.",
    });
  }
};

// ==========================================
// USER LOGIN
// ==========================================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate authentication token
    const token = generateToken(user._id);

    // Send success response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        diabetesType: user.diabetesType,
        phone: user.phone,
        dob: user.dob,
        sex: user.sex,
        profileImage: user.profileImage,
        doctorName: user.doctorName,
        doctorPhone: user.doctorPhone,
        emergencyName: user.emergencyName,
        emergencyPhone: user.emergencyPhone,
        specialists: user.specialists,
        glucoseSettings: user.glucoseSettings,
        preferences: user.preferences,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
};
