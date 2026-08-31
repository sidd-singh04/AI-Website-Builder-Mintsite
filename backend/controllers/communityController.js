import mongoose from "mongoose";
import { Project } from "../models/Project.js";

// 1. Get List of Published Projects [2-5]
export async function list(req, res, next) {
  try {
    const sort = req.query.sort || "new";
    
    const sortMap = {
      new: { publishedAt: -1, createdAt: -1 },
      views: { views: -1, publishedAt: -1 },
      likes: { likes: -1, publishedAt: -1 }
    };
    
    const items = await Project.find({ published: true })
      .sort(sortMap[sort] || sortMap.new)
      .limit(60)
      .populate("user", "name");
    
    const meId = req.user?._id?.toString();
    
    const projects = items.map((project) => {
      // Obtain base public card attributes from helper or fallback structure
      const card = project.toPublicCard
  ? project.toPublicCard({ withHtml: true })
  : {
      id: project._id.toString(),
      name: project.name,
      views: project.views,
      likes: project.likes,
      html: project.html,
      author: project.user?.name || "Anonymous",
      createdAt: project.createdAt
    };
      
      const isOwn = Boolean(
        meId && 
        project.user && 
        (project.user._id || project.user).toString() === meId
      );
      
      const likedByMe = Boolean(
        meId && 
        project.likedBy && 
        project.likedBy.some((id) => id.toString() === meId)
      );
      
      return {
        ...card,
        isOwn,
        likedByMe
      };
    });
    
    return res.json({ projects });
  } catch (err) {
    next(err);
  }
}

// 2. Fetch Single Published Project Details & Track Views [6-9]
// 2. Fetch Single Published Project Details & Track Views
export async function get(req, res, next) {
  try {
    console.log("🔥 COMMUNITY GET STARTED");
    console.log("Project ID:", req.params.id);

    const { id } = req.params;

    // 1. Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("❌ Invalid MongoDB ID");

      return res.status(400).json({
        error: "Invalid ID"
      });
    }

    console.log("✅ ID is valid");

    // 2. Find project
    const project = await Project.findById(id)
      .select("viewedBy likedBy views likes user html name published createdAt")
      .populate("user", "name");

    console.log("✅ Project query completed");

    if (!project) {
      console.log("❌ Project not found");

      return res.status(404).json({
        error: "Project not found"
      });
    }

    console.log("✅ Project found");
    console.log("Published:", project.published);
    console.log("HTML length:", project.html?.length);

    if (!project.published) {
      console.log("❌ Project is not published");

      return res.status(404).json({
        error: "Project is not published"
      });
    }

    // 3. Current user
    const meId = req.user?._id?.toString();

    console.log("Current user:", meId || "Not logged in");

    const ownerId = project.user?._id
      ? project.user._id.toString()
      : project.user?.toString();

    console.log("Owner ID:", ownerId);

    const isOwned = Boolean(
      meId && ownerId === meId
    );

    console.log("Is owner:", isOwned);

    // 4. Check whether user already viewed
    const alreadyViewed = Boolean(
      meId &&
      project.viewedBy &&
      project.viewedBy.some(
        (vId) => vId.toString() === meId
      )
    );

    console.log("Already viewed:", alreadyViewed);

    // 5. Increment view
    if (meId && !isOwned && !alreadyViewed) {
      console.log("👁️ Adding new view");

      await Project.updateOne(
        { _id: project._id },
        {
          $addToSet: {
            viewedBy: req.user._id
          },
          $inc: {
            views: 1
          }
        }
      );

      project.views += 1;

      console.log("✅ View added");
    }

    // 6. Check like
    const likedByMe = Boolean(
      meId &&
      project.likedBy &&
      project.likedBy.some(
        (lId) => lId.toString() === meId
      )
    );

    console.log("Liked by me:", likedByMe);

    // 7. Create public card
    console.log("🔄 Creating public card");

    const card = project.toPublicCard
      ? project.toPublicCard({ withHtml: true })
      : {
          id: project._id.toString(),
          name: project.name,
          views: project.views,
          likes: project.likes,
          html: project.html,
          author: project.user?.name || "Anonymous",
          createdAt: project.createdAt
        };

    console.log("✅ Public card created");

    // 8. Send response
    return res.json({
      project: {
        ...card,
        isOwn: isOwned,
        likedByMe
      },
      isOwn: isOwned,
      likedByMe
    });

  } catch (err) {
    console.error("❌ COMMUNITY GET ERROR:", err);
    next(err);
  }
}

// 3. Toggle Likes on Published Projects [10, 11]
export async function toggleLike(req, res, next) {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "Invalid ID over here"
      });
    }
    
    const project = await Project.findById(id).select("likedBy likes user");
    if (!project) {
      return res.status(404).json({
        error: "not found over here"
      });
    }
    
    const meId = req.user._id.toString();
    const ownerId = project.user.toString();
    
    if (ownerId === meId) {
      return res.status(400).json({
        error: "You cannot like your own project over here"
      });
    }
    
    const likedIndex = project.likedBy.findIndex((uId) => uId.toString() === meId);
    let likedByMe = false;
    
    if (likedIndex > -1) {
      // Already liked, pull user ID and decrement counts [11]
      await Project.updateOne(
        { _id: id },
        { 
          $pull: { likedBy: req.user._id },
          $inc: { likes: -1 }
        }
      );
      likedByMe = false;
    } else {
      // Not liked yet, push user ID and increment counts [11]
      await Project.updateOne(
        { _id: id },
        { 
          $addToSet: { likedBy: req.user._id },
          $inc: { likes: 1 }
        }
      );
      likedByMe = true;
    }
    
    const fresh = await Project.findById(id).select("likes");
    
    return res.json({
      likes: fresh.likes,
      likedByMe
    });
  } catch (err) {
    next(err);
  }


}