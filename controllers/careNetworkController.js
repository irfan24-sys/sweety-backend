import mongoose from "mongoose";
import CareNetwork from "../models/CareNetwork.js";

const getOrCreateCareNetwork = async (userId) => {
  let network = await CareNetwork.findOne({ userId });

  if (!network) {
    network = await CareNetwork.create({ userId });
  }

  return network;
};

// GET: Fetch care network
export const getCareNetwork = async (req, res) => {
  try {
    const network = await getOrCreateCareNetwork(req.userId);

    res.status(200).json({
      success: true,
      careNetwork: network,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// POST: Add specialist
export const addSpecialist = async (req, res) => {
  try {
    const { name, specialty, phone } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Specialist name is required.",
      });
    }

    const network = await getOrCreateCareNetwork(req.userId);

    network.specialists.push({
      name: name.trim(),
      specialty: specialty?.trim() || "",
      phone: phone?.trim() || "",
    });

    await network.save();

    res.status(201).json({
      success: true,
      message: "Specialist added successfully.",
      careNetwork: network,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE: Remove specialist
export const deleteSpecialist = async (req, res) => {
  try {
    const { specialistId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(specialistId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid specialist ID.",
      });
    }

    const network = await CareNetwork.findOne({ userId: req.userId });

    if (!network) {
      return res.status(404).json({
        success: false,
        message: "Care network not found.",
      });
    }

    const specialist = network.specialists.id(specialistId);

    if (!specialist) {
      return res.status(404).json({
        success: false,
        message: "Specialist not found.",
      });
    }

    specialist.deleteOne();
    await network.save();

    res.status(200).json({
      success: true,
      message: "Specialist removed successfully.",
      careNetwork: network,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PUT: Update emergency contact
export const updateEmergencyContact = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name?.trim() || !phone?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Emergency contact name and phone are required.",
      });
    }

    const network = await getOrCreateCareNetwork(req.userId);

    network.emergencyContact = {
      name: name.trim(),
      phone: phone.trim(),
    };

    await network.save();

    return res.status(200).json({
      success: true,
      message: "Emergency contact saved successfully.",
      careNetwork: network,
    });
  } catch (error) {
    console.error("Emergency Contact Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};