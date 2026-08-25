import mongoose from "mongoose";
import { Project } from "../models/project.js";
import { publishToGitHub, deployToVercel } from "../utils/services.js";

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

// 1. Publish/Upload Project to GitHub
export async function githubRoute(req, res, next) {
  try {
    const project = await loadOwnProject(req.params.id, req, res);
    if (!project) return;
    
    // Check if the project actually has code to push
    if (!project.html || project.html.length < 100) {
      return res.status(400).json({
        error: "The project has no generated HTML yet over here"
      });
    }
    
    const token = (req.body.token || "").trim();
    const repoName = (req.body.repoName || "").trim();
    
    // Validate Token length
    if (token.length < 20) {
      return res.status(400).json({
        error: "The token looks too short over here"
      });
    }
    
    // Validate repository name
    if (!repoName) {
      return res.status(400).json({
        error: "The repository name is required over here"
      });
    }
    
    const repoRegex = /^[a-zA-Z0-9-_]+$/;
    if (!repoRegex.test(repoName)) {
      return res.status(400).json({
        error: "Please use letters and numbers for this repository name over here"
      });
    }
    
    // Publish using services.js function
    const result = await publishToGitHub({
      token,
      repoName,
      html: project.html,
      projectName: project.name,
      prompt: project.prompt,
      isPrivate: false, // Repository defaults to public
      enablePages: true // Automatic GitHub Pages deployment
    });
    
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

// 2. Deploy Project Live via Vercel
export async function verselRoute(req, res, next) {
  try {
    const project = await loadOwnProject(req.params.id, req, res);
    if (!project) return;
    
    // Check if there is valid content to deploy
    if (!project.html || project.html.length < 100) {
      return res.status(400).json({
        error: "The project has no generated HTML yet over here"
      });
    }
    
    // Retrieve the backend-configured Vercel Token
    const token = process.env.VERCEL_TOKEN;
    if (!token) {
      return res.status(400).json({
        error: "No Vercel token has been provided inside the environment configuration"
      });
    }
    
    // Deploy using services.js function
    const result = await deployToVercel({
      token,
      projectName: project.name,
      html: project.html,
      prompt: project.prompt
    });
    
    // Save live credentials back to Project model
    project.deployURL = result.url;
    project.deployedAt = new Date();
    await project.save();
    
    return res.status(200).json({
      url: result.url,
      deploymentId: result.id,
      readyState: result.readyState
    });
  } catch (err) {
    next(err);
  }
}
