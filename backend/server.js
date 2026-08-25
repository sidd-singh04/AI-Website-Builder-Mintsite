import express from "express";
import cors from "cors";
import "dotenv/config";

import { connectDB } from "./config/db.js";

import authRouter from "./routes/authRoutes.js";
import projectRouter from "./routes/projectRoutes.js";
import communityRouter from "./routes/communityRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";

const PORT = process.env.PORT || 4000;

const app = express();

app.use(cors());

app.use(
  express.json({
    limit: "1mb"
  })
);

// Routes
app.use("/api/auth", authRouter);
app.use("/api/projects", projectRouter);
app.use("/api/community", communityRouter);
app.use("/api/payments", paymentRouter);

// Home route
app.get("/", (req, res) => {
  res.send("API Working");
});

// Start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server started on PORT ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();