import express from "express";
import { User } from "../models/User.js";

import {
  generateOtp,
  saveOtp,
  sendOtpEmail,
  verifyOtp,
  peekOtp
} from "../utils/services.js";

const router = express.Router();

// Step 1: Request Password Reset OTP
router.post("/request", async (req, res, next) => {
  try {
    const email = (req.body.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({
        error: "Email is required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: "No account found with this email"
      });
    }

    const code = generateOtp();

    saveOtp(email, code);

    await sendOtpEmail({
      to: user.email,
      name: user.name,
      code,
      purpose: "forgot"
    });

    return res.status(200).json({
      ok: true,
      email: user.email
    });

  } catch (err) {
    next(err);
  }
});


// Step 2: Verify Reset Code
// OTP is checked but not deleted yet
router.post("/verify-code", async (req, res, next) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        error: "Email and code are required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: "No account found with this email"
      });
    }

    // Validate OTP without consuming it
    const result = peekOtp(email, code);

    if (!result.ok) {
      return res.status(400).json({
        error: result.reason
      });
    }

    return res.status(200).json({
      ok: true
    });

  } catch (err) {
    next(err);
  }
});


// Step 3: Reset Password
// OTP is verified and consumed here
router.post("/reset", async (req, res, next) => {
  try {
    const {
      email,
      code,
      newPassword
    } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        error: "All fields are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "New password must be at least 6 characters"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: "No account found with this email"
      });
    }

    // Verify and consume OTP
    const result = verifyOtp(email, code);

    if (!result.ok) {
      return res.status(400).json({
        error: result.reason
      });
    }

    user.passwordHash =
      await User.hashPassword(newPassword);

    // If the user successfully verifies the reset OTP,
    // consider their email verified.
    if (!user.emailVerified) {
      user.emailVerified = true;
    }

    await user.save();

    return res.status(200).json({
      ok: true
    });

  } catch (err) {
    next(err);
  }
});


export default router;