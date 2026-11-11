import mongoose from "mongoose";

const specialistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  specialty: {
    type: String,
    default: "",
    trim: true,
  },
  phone: {
    type: String,
    default: "",
    trim: true,
  },
});

const careNetworkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    specialists: [specialistSchema],

    emergencyContact: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

const CareNetwork = mongoose.model("CareNetwork", careNetworkSchema);

export default CareNetwork;