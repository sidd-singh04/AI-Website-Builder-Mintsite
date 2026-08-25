import express from "express";

import {
  list,
  create,
  get,
  update,
  remove,
  generate
} from "../controllers/projectsController.js";

import { requireAuth } from "../middleware/auth.js";

import {
  githubRoute,
  verselRoute
} from "./projectDeploy.js";

const projectRouter = express.Router();

// 1. Get List of Projects
projectRouter.get("/", requireAuth, list);

// 2. Create a New Project
projectRouter.post("/", requireAuth, create);

// 3. Fetch Single Project details
projectRouter.get("/:id", requireAuth, get);

// 4. Update Project
projectRouter.patch("/:id", requireAuth, update);

// 5. Delete Project
projectRouter.delete("/:id", requireAuth, remove);

// 6. Generate/Refine Website Code using AI
projectRouter.post("/:id/generate", requireAuth, generate);

// 7. GitHub Upload Integration
projectRouter.post("/:id/github", requireAuth, githubRoute);

// 8. Vercel Live Deployment
projectRouter.post("/:id/deploy", requireAuth, verselRoute);


export default projectRouter;