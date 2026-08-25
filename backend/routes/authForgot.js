import express from "express";
import { User } from "../models/user.js";
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
    const email = (req.body.email || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        error: "The email is required so that we can forgot the password over here"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        error: "The no account found with that particular email over here"
      });
    }

    const code = generateOTP();
    await saveOTP(email, code);
    await sendOTPEmail({
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

// Step 2: Verify Reset Code (Peek - Do not delete yet)
router.post("/verify-code", async (req, res, next) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        error: "The email and the code are required over here"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        error: "The no account found with that particular email over here"
      });
    }

    // peekOTP validates the code and ensures it hasn't expired without deleting it from DB
    const result = await peekOTP(email, code);
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

// Step 3: Reset Password (Verify OTP & Update Password)
router.post("/reset", async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        error: "All fields are required to reset the password over here"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "The new password must be at least of six characters over here"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        error: "The no account found with that particular email over here"
      });
    }

    // verifyOTP validates and immediately deletes/burns the OTP record from DB
    const result = await verifyOTP(email, code);
    if (!result.ok) {
      return res.status(400).json({
        error: result.reason
      });
    }

    user.passwordHash = await User.hashPassword(newPassword);
    
    // Automatically flag as verified if reset OTP was entered successfully
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
