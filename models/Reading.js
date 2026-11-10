
import mongoose from "mongoose";

const readingSchema = new mongoose.Schema(
  {
    // Logged-in user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Reading date
    date: {
      type: String,
      required: true,
    },

    // Reading time (24-hour format: HH:mm)
    time: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):[0-5]\d$/,
    },

    // Reading time slot
    slot: {
      type: String,
      required: true,
      enum: [
        "Morning (Fasting)",
        "After Breakfast",
        "After Lunch",
        "After Dinner",
      ],
    },

    // Blood glucose value in mg/dL
    value: {
      type: Number,
      required: true,
      min: 40,
      max: 600,
      validate: {
        validator: Number.isInteger,
        message: "Glucose value must be a whole number",
      },
    },

    // Optional notes or food intake
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate readings for the same user,
// date and time slot
readingSchema.index(
  {
    userId: 1,
    date: 1,
    slot: 1,
  },
  {
    unique: true,
  }
);

const Reading = mongoose.model("Reading", readingSchema);

export default Reading;
