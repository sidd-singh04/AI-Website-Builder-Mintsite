import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

// 1. Sign JWT Token valid for 30 days
export function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error("JWT secret is not set in the env file over here");
  }
  
  const expiresIn = process.env.JWT_EXPIRES_IN || "30d";
  
  return jwt.sign({ sub: userId }, secret, {
    expiresIn
  });
}

// 2. Middleware to require authentication (Protected Routes)
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    
    if (!token) {
      return res.status(401).json({
        error: "Missing token over here"
      });
    }
    
    const secret = process.env.JWT_SECRET;
    const payload = jwt.verify(token, secret);
    
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({
        error: "User not found by this user id over here"
      });
    }
    
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      error: "Invalid or expired token over here"
    });
  }
}

// 3. Optional Authentication Middleware (e.g., Community Showcase Page)
export async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    
    if (token) {
      const secret = process.env.JWT_SECRET;
      const payload = jwt.verify(token, secret);
      
      const user = await User.findById(payload.sub);
      if (user) {
        req.user = user;
      }
    }
  } catch (err) {
    // Invalid token, ignore error and proceed as anonymous
  }
  next();
}
