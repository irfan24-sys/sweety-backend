
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  addReading,
  getReadings,
  getReading,
  updateReading,
  deleteReading,
} from "../controllers/readingController.js";

const router = express.Router();

router.post("/", authMiddleware, addReading);
router.get("/", authMiddleware, getReadings);
router.get("/:id", authMiddleware, getReading);
router.put("/:id", authMiddleware, updateReading);
router.delete("/:id", authMiddleware, deleteReading);

export default router;
