
import Reading from "../models/Reading.js";
import mongoose from "mongoose";

// Get today's date in Indian timezone
const getToday = () => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
};

// Validate date format
const isValidDate = (date) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;

  const parsed = new Date(`${date}T00:00:00.000Z`);

  return !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date;
};

// Validate reading data
const validateReading = ({ date, time, slot, value, notes }) => {
  const validSlots = [
    "Morning (Fasting)",
    "After Breakfast",
    "After Lunch",
    "After Dinner",
  ];

  if (!date || !time || !slot || value === undefined || value === null) {
    return "Date, time, slot and glucose value are required";
  }

  if (!isValidDate(date)) {
    return "Invalid date. Use YYYY-MM-DD";
  }

  if (date > getToday()) {
    return "Future dates are not allowed";
  }

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    return "Invalid time. Use HH:mm format";
  }

  if (!validSlots.includes(slot)) {
    return "Invalid time slot";
  }

  if (!Number.isInteger(value) || value < 40 || value > 600) {
    return "Glucose value must be a whole number between 40 and 600";
  }

  if (notes !== undefined &&
      (typeof notes !== "string" || notes.length > 500)) {
    return "Notes must be text with a maximum of 500 characters";
  }

  return null;
};

// ADD READING
export const addReading = async (req, res) => {
  try {
    const { date, time, slot, value, notes = "" } = req.body;

    const validationError = validateReading({
      date, time, slot, value, notes,
    });

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const dailyCount = await Reading.countDocuments({
      userId: req.userId,
      date,
    });

    if (dailyCount >= 4) {
      return res.status(400).json({
        success: false,
        message: "Maximum four readings allowed per day",
      });
    }

    const reading = await Reading.create({
      userId: req.userId,
      date,
      time,
      slot,
      value,
      notes,
    });

    return res.status(201).json({
      success: true,
      message: "Reading added successfully",
      reading,
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Reading already exists for this date and slot",
      });
    }

    console.error("Add Reading Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add reading",
    });
  }
};

// GET ALL READINGS
export const getReadings = async (req, res) => {
  try {
    const readings = await Reading.find({
      userId: req.userId,
    }).sort({ date: -1, time: -1 });

    return res.status(200).json({
      success: true,
      count: readings.length,
      readings,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch readings",
    });
  }
};

// GET SINGLE READING
export const getReading = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reading ID",
      });
    }

    const reading = await Reading.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: "Reading not found",
      });
    }

    return res.status(200).json({
      success: true,
      reading,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reading",
    });
  }
};

// UPDATE READING
export const updateReading = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reading ID",
      });
    }

    const reading = await Reading.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: "Reading not found",
      });
    }

    const updatedData = {
      date: req.body.date ?? reading.date,
      time: req.body.time ?? reading.time,
      slot: req.body.slot ?? reading.slot,
      value: req.body.value ?? reading.value,
      notes: req.body.notes ?? reading.notes,
    };

    const validationError = validateReading(updatedData);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const dailyCount = await Reading.countDocuments({
      userId: req.userId,
      date: updatedData.date,
      _id: { $ne: id },
    });

    if (dailyCount >= 4) {
      return res.status(400).json({
        success: false,
        message: "Maximum four readings allowed per day",
      });
    }

    Object.assign(reading, updatedData);

    await reading.save();

    return res.status(200).json({
      success: true,
      message: "Reading updated successfully",
      reading,
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Reading already exists for this date and slot",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update reading",
    });
  }
};

// DELETE READING
export const deleteReading = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reading ID",
      });
    }

    const reading = await Reading.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: "Reading not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Reading deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete reading",
    });
  }
};
