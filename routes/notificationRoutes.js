
import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

// Get all notifications
router.get("/", authMiddleware, getNotifications);

// Mark all notifications as read
router.patch("/read-all", authMiddleware, markAllNotificationsRead);

// Mark a single notification as read
router.patch("/:id/read", authMiddleware, markNotificationRead);

export default router;

