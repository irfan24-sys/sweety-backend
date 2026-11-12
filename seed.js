
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import User from "./models/User.js";
import Reading from "./models/Reading.js";

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");

    // Hash demo password
    const hashedPassword = await bcrypt.hash("Demo@123", 10);

    // Create or update demo user
    const demoUser = await User.findOneAndUpdate(
      { email: "demo@sweety.com" },
      {
        $set: {
          name: "Demo Patient",
          email: "demo@sweety.com",
          password: hashedPassword,
          phone: "9876543210",
          dob: new Date("1995-05-15"),
          sex: "Male",
          diabetesType: "Type 2",
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    console.log("Demo user created/updated");

    // Remove previous demo readings
    await Reading.deleteMany({ userId: demoUser._id });

    // Generate dates in YYYY-MM-DD format using local time
    const getDate = (daysAgo) => {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    };

    // Sample readings for the last 7 days
    const sampleReadings = [
      {
        time: "07:00",
        slot: "Morning (Fasting)",
        value: 110,
        notes: "Before breakfast",
      },
      {
        time: "10:00",
        slot: "After Breakfast",
        value: 145,
        notes: "After breakfast",
      },
      {
        time: "14:00",
        slot: "After Lunch",
        value: 158,
        notes: "After lunch",
      },
      {
        time: "20:00",
        slot: "After Dinner",
        value: 165,
        notes: "After dinner",
      },
    ];

    const readings = [];

    for (let day = 0; day < 7; day++) {
      sampleReadings.forEach((reading) => {
        readings.push({
          userId: demoUser._id,
          date: getDate(day),
          time: reading.time,
          slot: reading.slot,
          value: reading.value + (day % 3) * 5,
          notes: reading.notes,
        });
      });
    }

    await Reading.insertMany(readings);

    console.log("--------------------------------");
    console.log("Sweety seed completed!");
    console.log("Demo Email: demo@sweety.com");
    console.log("Demo Password: Demo@123");
    console.log("Total readings:", readings.length);
    console.log("--------------------------------");

  } catch (error) {
    console.error("Seed error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
};

seedData();
