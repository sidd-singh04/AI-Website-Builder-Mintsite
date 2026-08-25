import express from "express";
import { list, get, toggleLike } from "../controllers/communityController.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";

const communityRouter = express.Router();

// 1. Get List of Published Projects (Optional Auth to customize "isOwn" & "likedByMe")
communityRouter.get("/", optionalAuth, list);

// 2. Fetch Single Published Project Details & Track Views (Optional Auth for security/view checks)
communityRouter.get("/:id", optionalAuth, get);

// 3. Toggle Like on Project (Strict Session required)
communityRouter.post("/:id/like", requireAuth, toggleLike);

export default communityRouter;
