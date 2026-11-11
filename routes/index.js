
import express from "express";

import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import readingRoutes from "./readingRoutes.js";
import notificationRoutes from "./notificationRoutes.js";

const router = express.Router();

// Authentication routes
router.use("/auth", authRoutes);

// User profile routes
router.use("/user", userRoutes);

// Glucose reading routes
router.use("/readings", readingRoutes);

// Notification routes
router.use("/notifications", notificationRoutes);

// Test route
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Sweety Backend API is working!",
  });
});

export default router;
