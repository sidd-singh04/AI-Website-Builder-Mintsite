import express from "express";

import {
  listPackages,
  createOrder,
  verifyPayment,
  listHistory
} from "../controllers/paymentsController.js";

import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Get available packages
router.get("/packages", listPackages);

// Create Razorpay order
router.post("/create-order", requireAuth, createOrder);

// Verify Razorpay payment
router.post("/verify-payment", requireAuth, verifyPayment);

// Payment history
router.get("/history", requireAuth, listHistory);


export default router;