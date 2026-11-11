import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/index.js";
import connectDB from "./config/db.js";
import careNetworkRoutes from "./routes/careNetworkRoutes.js";



dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", routes);
app.use("/api/care-network", careNetworkRoutes);
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Sweety Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();