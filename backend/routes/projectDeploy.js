import mongoose from "mongoose";
import { Project } from "../models/project.js";


// Helper to find project and verify user ownership locally
async function loadOwnProject(id, req, res) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: "Invalid project ID over here" });
    return null;
  }
  
  const project = await Project.findById(id);
  if (!project) {
    res.status(404).json({ error: "Project not found over here" });
    return null;
  }
  
  if (project.user.toString() !== req.user._id.toString()) {
    res.status(403).json({ error: "Forbidden: You do not own this project over here" });
    return null;
  }
  
  return project;
}

