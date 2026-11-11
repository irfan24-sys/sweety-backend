
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Generate JWT token
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

// Return safe patient details
const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || "",
  dob: user.dob || null,
  sex: user.sex || "Not specified",
  diabetesType: user.diabetesType,
  profileImage: user.profileImage || "",
});

// USER SIGNUP
export const signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      dob,
      sex,
      diabetesType,
    } = req.body;

    // Required fields
    if (!name?.trim() || !email?.trim() || !password || !diabetesType) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 8 characters, uppercase, lowercase, number and special character",
      });
    }

    // Diabetes type validation
    const allowedDiabetesTypes = [
      "Type 1",
      "Type 2",
      "Gestational / Pre",
    ];

    if (!allowedDiabetesTypes.includes(diabetesType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid diabetes classification",
      });
    }

    // Validate phone if provided
    if (
      phone &&
      !/^[+]?[0-9\s()-]{7,15}$/.test(phone.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid phone number",
      });
    }

    // Validate DOB if provided
    let parsedDob = null;

    if (dob) {
      parsedDob = new Date(dob);

      if (
        Number.isNaN(parsedDob.getTime()) ||
        parsedDob > new Date()
      ) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid date of birth",
        });
      }
    }

    // Check existing email
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

    // Save complete patient information
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone?.trim() || "",
      dob: parsedDob,
      sex: sex?.trim() || "Not specified",
      diabetesType,
    });

    // Generate token
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: formatUser(user),
    });

  } catch (error) {
    console.error("Signup Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

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

// USER LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

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

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: formatUser(user),
    });

  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
};
