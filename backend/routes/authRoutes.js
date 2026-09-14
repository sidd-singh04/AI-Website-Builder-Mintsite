import express from "express";

import {
  register,
  login,
  me,
  updateProfile,
  changePassword,
  deleteAccount
} from "../controllers/authController.js";

import { requireAuth } from "../middleware/auth.js";

const authRouter = express.Router();

// 1. User Registration
authRouter.post("/register", register);

// 2. User Authentication (Login)
authRouter.post("/login", login);

// 3. Current User Profile (Protected)
authRouter.get("/me", requireAuth, me);

// 4. Profile Management (Protected)
authRouter.patch("/me", requireAuth, updateProfile);

authRouter.patch("/me/password", requireAuth, changePassword);

authRouter.delete("/me", requireAuth, deleteAccount);

export default authRouter;