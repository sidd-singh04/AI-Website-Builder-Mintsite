import mongoose from "mongoose";
import { Project } from "../models/Project.js";
import { enhancePrompt, generateSite } from "../utils/services.js";

// Helper to validate MongoDB ObjectId [1]
function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// Helper to find project and verify user ownership [1, 2]
export async function loadOwnProject(id, req, res) {
  if (!isValidId(id)) {
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

// 1. Get List of User's Projects [3, 17]
export async function list(req, res, next) {
  try {
    const list = await Project.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(100);
    
    return res.json({
      projects: list.map((p) => p.toClient())
    });
  } catch (err) {
    next(err);
  }
}

// 2. Create a New Project [4, 5, 18]
export async function create(req, res, next) {
  try {
    const prompt = (req.body.prompt || "").trim();
    const name = (req.body.name || "").trim();
    
    if (!prompt) {
      return res.status(400).json({
        error: "Prompt is required over here"
      });
    }
    
    if (prompt.length > 2000) {
      return res.status(400).json({
        error: "Prompt is too long, maximum 2000 characters over here"
      });
    }
    
    // Generate dynamic fallback name from prompt split [5]
    let finalName = name;
    if (!finalName) {
      finalName = prompt.split(" ").slice(0, 5).join(" ").slice(0, 60) || "Untitled Project";
    }
    
    const project = await Project.create({
      user: req.user._id,
      name: finalName,
      prompt,
      messages: [
        {
          role: "user",
          text: prompt
        }
      ]
    });
    
    return res.status(201).json({
      project: project.toClient()
    });
  } catch (err) {
    next(err);
  }
}

// 3. Fetch Single Project details [18, 19]
export async function get(req, res, next) {
  try {
    const project = await loadOwnProject(req.params.id, req, res);
    if (!project) return;
    
    return res.json({
      project: project.toClient()
    });
  } catch (err) {
    next(err);
  }
}

// 4. Update Project (Name, HTML, Publish state) [6-8, 19]
export async function update(req, res, next) {
  try {
    const project = await loadOwnProject(req.params.id, req, res);
    if (!project) return;
    
    // Update Name [6, 7]
    if (req.body.name !== undefined) {
      const name = String(req.body.name).trim();
      if (name.length < 1 || name.length > 80) {
        return res.status(400).json({
          error: "Name must be 1 to 80 characters over here"
        });
      }
      project.name = name;
    }
    
    // Update HTML [7]
    if (req.body.html !== undefined) {
      const html = String(req.body.html);
      if (html.length > 500000) { // Limit to 500,000 characters [7]
        return res.status(400).json({
          error: "HTML is too long over here"
        });
      }
      project.html = html;
    }
    
    // Toggle published state [8]
    if (req.body.published !== undefined) {
      const published = Boolean(req.body.published);
      project.published = published;
      project.publishedAt = published ? new Date() : null;
    }
    
    await project.save();
    
    return res.json({
      project: project.toClient()
    });
  } catch (err) {
    next(err);
  }
}

// 5. Delete Project [9, 10]
export async function remove(req, res, next) {
  try {
    const project = await loadOwnProject(req.params.id, req, res);
    if (!project) return;
    
    await project.deleteOne();
    
    return res.json({
      ok: true
    });
  } catch (err) {
    next(err);
  }
}

// Helper: Collapses white spaces for HTML scripts & styles [10]
function visibleText(html) {
  if (!html) return "";
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// 6. Generate or Refine Website Code using AI [11-16, 20]
// export async function generate(req, res, next) {
//   try {
//     const project = await loadOwnProject(req.params.id, req, res);
//     if (!project) return;
    
//     // First generation cost is 5, edit/refinement cost is 2 [11]
//     const isFirstTime = !project.html || project.html.length < 100;
//     const cost = isFirstTime ? 5 : 2;
    
//     // Check if user has sufficient credits [13]
//     if (req.user.credits < cost) {
//       return res.status(400).json({
//         error: `You need at least ${cost} credits to generate the site over here`
//       });
//     }
    
//     const prompt = (req.body.prompt || "").trim();
//     if (!prompt) {
//       return res.status(400).json({
//         error: "Prompt is required over here"
//       });
//     }
    
//     if (prompt.length > 2000) { // Max limit 2000 characters [13]
//       return res.status(400).json({
//         error: "Prompt is too long over here"
//       });
//     }
    
//     // Add prompt to project messages [13]
//     project.messages.push({
//       role: "user",
//       text: prompt
//     });
    
//     // Enhance prompt using LLM if first generation [14]
//     let enhancedPrompt = project.enhancedPrompt;
//     if (isFirstTime) {
//       enhancedPrompt = await enhancePrompt(prompt);
//       project.enhancedPrompt = enhancedPrompt;
//     }
    
//     // Formulate previous conversation history for LLM context [15]
//     const history = project.messages.map((m) => ({
//       role: m.role,
//       text: m.text
//     }));
    
//     // Trigger live site HTML generation/refinement [15, 16]
//     const outcome = await generateSite({
//       previousHtml: project.html,
//       history,
//       prompt,
//       enhancedPrompt
//     });
    
//     project.html = outcome.html;
    
//     // Add AI response as assistant message [12]
//     project.messages.push({
//       role: "assistant",
//       text: outcome.message || "Here is your generated website code over here"
//     });
    
//     // Deduct user credits [12]
//     req.user.credits -= cost;
//     await req.user.save();
    
//     await project.save();
    
//     return res.json({
//       project: project.toClient(),
//       user: req.user.toClient()
//     });
//   } catch (err) {
//     next(err);
//   }
// }







// 6. Generate or Refine Website Code using AI [11-16, 20]

export async function generate(req, res, next) {
  try {
    console.log("🚀 Generate started");

    const project = await loadOwnProject(req.params.id, req, res);
    if (!project) return;

    const prompt = (req.body.prompt || "").trim();

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt is required",
      });
    }

    if (prompt.length > 2000) {
      return res.status(400).json({
        error: "Prompt is too long, maximum 2000 characters",
      });
    }

    // First generation = 5 credits
    // Refinement = 2 credits
    const isFirstTime = !project.html || project.html.length < 100;
    const cost = isFirstTime ? 5 : 2;

    // Check credits BEFORE starting expensive AI request
    if (req.user.credits < cost) {
      return res.status(400).json({
        error: `You need at least ${cost} credits to generate the site`,
      });
    }

    console.log("📌 Project:", project._id.toString());
    console.log("📌 First generation:", isFirstTime);
    console.log("📌 Cost:", cost);
    console.log("📌 Prompt:", prompt);

    /*
     * IMPORTANT:
     * Save a version of the project before starting the AI request.
     *
     * This prevents two generate requests from using the same
     * Mongoose document version.
     */

    project.messages.push({
      role: "user",
      text: prompt,
    });

    let enhancedPrompt = project.enhancedPrompt;

    // Enhance prompt only on first generation
    if (isFirstTime) {
      console.log("🤖 Enhancing prompt...");

      const enhancedResult = await enhancePrompt(prompt);

      enhancedPrompt = enhancedResult?.text || prompt;

      project.enhancedPrompt = enhancedPrompt;

      console.log("✅ Enhanced prompt created");
    }

    const history = project.messages.map((m) => ({
      role: m.role,
      text: m.text,
    }));

    console.log("🤖 Generating website...");

    const outcome = await generateSite(
  prompt,
  {
    previousHtml: project.html,
    history,
    originalPrompt: enhancedPrompt,
  }
);

    if (!outcome?.html || outcome.html.length < 100) {
      return res.status(500).json({
        error: "AI failed to generate valid website HTML",
      });
    }

    console.log(
      "✅ Website generated:",
      outcome.html.length,
      "characters"
    );

    /*
     * Re-fetch the project AFTER AI generation.
     *
     * This is important because the original Mongoose document
     * may now be stale if another request modified the project.
     */
    const latestProject = await Project.findOne({
      _id: project._id,
      user: req.user._id,
    });

    if (!latestProject) {
      return res.status(404).json({
        error: "Project no longer exists",
      });
    }

    /*
     * If the project already changed while AI was running,
     * don't overwrite the newer version.
     */
    if (
      latestProject.updatedAt &&
      project.updatedAt &&
      latestProject.updatedAt.getTime() !== project.updatedAt.getTime()
    ) {
      return res.status(409).json({
        error:
          "This project was updated by another request. Please refresh and try again.",
      });
    }

    // Update latest project
    latestProject.html = outcome.html;

    latestProject.enhancedPrompt =
      enhancedPrompt || latestProject.enhancedPrompt;

    latestProject.messages.push({
      role: "assistant",
      text:
        outcome.message ||
        "Here is your generated website.",
    });

    // Deduct credits from latest user state
    const updatedUser = await req.user.constructor.findOneAndUpdate(
      {
        _id: req.user._id,
        credits: { $gte: cost },
      },
      {
        $inc: { credits: -cost },
      },
      {
        new: true,
      }
    );

    if (!updatedUser) {
      return res.status(400).json({
        error: "Insufficient credits",
      });
    }

    try {
      await latestProject.save();
    } catch (saveError) {
      /*
       * Project save failed after credit deduction.
       * Refund the credits so the user is not charged.
       */
      await req.user.constructor.findByIdAndUpdate(
        req.user._id,
        {
          $inc: { credits: cost },
        }
      );

      throw saveError;
    }

    console.log("✅ Project saved");
    console.log("💳 Credits deducted:", cost);

    return res.json({
      project: latestProject.toClient(),
      user: updatedUser.toClient(),
    });
  } catch (err) {
    console.error("❌ GENERATE ERROR:", err);
    next(err);
  }
}