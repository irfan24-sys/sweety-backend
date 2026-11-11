
import express from "express";

import {
  getCareNetwork,
  addSpecialist,
  deleteSpecialist,
  updateEmergencyContact,
} from "../controllers/careNetworkController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// GET: Fetch logged-in user's care network
router.get("/", authMiddleware, getCareNetwork);

// POST: Add a healthcare specialist
router.post("/specialists", authMiddleware, addSpecialist);

// DELETE: Remove a healthcare specialist
router.delete(
  "/specialists/:specialistId",
  authMiddleware,
  deleteSpecialist
);

// PUT: Update emergency contact
router.put(
  "/emergency-contact",
  authMiddleware,
  updateEmergencyContact
);

export default router;
