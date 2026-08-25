import express from "express";
import {
  register,
  verifyRegister,
  resendRegister,
  login,
  me,
  contributions,
  updateProfile,
  changePassword,
  deleteAccount
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import forgotRoutes from "./authForgot.js";

const authRouter = express.Router();

// 1. User Registration & OTP verification
authRouter.post("/register", register);
authRouter.post("/register/verify", verifyRegister);
authRouter.post("/register/resend", resendRegister);

// 2. User Authentication (Login)
authRouter.post("/login", login);

// 3. Current User Profile & Contribution History (Protected)
authRouter.get("/me", requireAuth, me);
authRouter.get("/me/contributions", requireAuth, contributions);

// 4. Profile Management (Protected)
authRouter.patch("/me", requireAuth, updateProfile);
authRouter.patch("/me/password", requireAuth, changePassword);
authRouter.delete("/me", requireAuth, deleteAccount);

// 5. Password Reset Flow (Sub-Router)
authRouter.use("/forgot", forgotRoutes);

export default authRouter;