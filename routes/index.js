
import express from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import readingRoutes from "./readingRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/readings", readingRoutes);

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Sweety Backend API is working!",
  });
});

export default router;
