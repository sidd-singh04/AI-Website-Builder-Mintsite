import mongoose from "mongoose";
import { Project } from "../models/Project.js";

// ═══════════════════════════════════════════════════════════════════════════
// 1. GET LIST OF PUBLISHED PROJECTS
// ═══════════════════════════════════════════════════════════════════════════

export async function list(req, res, next) {
  try {
    const sort = req.query.sort || "new";

    const sortMap = {
      new: {
        publishedAt: -1,
        createdAt: -1,
      },

      views: {
        views: -1,
        publishedAt: -1,
        createdAt: -1,
      },

      likes: {
        likes: -1,
        publishedAt: -1,
        createdAt: -1,
      },
    };

    const items = await Project.find({
      published: true,
    })
      .sort(sortMap[sort] || sortMap.new)
      .limit(60)
      .populate("user", "name");

    const meId = req.user?._id?.toString();

    const projects = items.map((project) => {
      const card = project.toPublicCard({
        withHtml: true,
      });

      const isOwn = Boolean(
        meId &&
          project.user &&
          (project.user._id || project.user).toString() ===
            meId
      );

      const likedByMe = Boolean(
        meId &&
          project.likedBy &&
          project.likedBy.some(
            (id) => id.toString() === meId
          )
      );

      return {
        ...card,

        isOwn,

        likedByMe,

        // Explicitly send both dates
        createdAt: project.createdAt || null,

        publishedAt:
          project.publishedAt || null,
      };
    });

    return res.json({
      projects,
    });
  } catch (err) {
    next(err);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. GET SINGLE PUBLISHED PROJECT
// ═══════════════════════════════════════════════════════════════════════════

export async function get(req, res, next) {
  try {
    console.log("🔥 COMMUNITY GET STARTED");

    console.log(
      "Project ID:",
      req.params.id
    );

    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(
        "❌ Invalid MongoDB ID"
      );

      return res.status(400).json({
        error: "Invalid ID",
      });
    }

    console.log("✅ ID is valid");

    // Find project
    const project = await Project.findById(id)
      .select(
        "viewedBy likedBy views likes user html name published createdAt updatedAt publishedAt"
      )
      .populate("user", "name");

    console.log(
      "✅ Project query completed"
    );

    if (!project) {
      console.log(
        "❌ Project not found"
      );

      return res.status(404).json({
        error: "Project not found",
      });
    }

    console.log("✅ Project found");

    console.log(
      "Published:",
      project.published
    );

    console.log(
      "HTML length:",
      project.html?.length
    );

    console.log(
      "Created At:",
      project.createdAt
    );

    console.log(
      "Published At:",
      project.publishedAt
    );

    if (!project.published) {
      console.log(
        "❌ Project is not published"
      );

      return res.status(404).json({
        error: "Project is not published",
      });
    }

    // Current user
    const meId =
      req.user?._id?.toString();

    console.log(
      "Current user:",
      meId || "Not logged in"
    );

    const ownerId = project.user?._id
      ? project.user._id.toString()
      : project.user?.toString();

    console.log(
      "Owner ID:",
      ownerId
    );

    const isOwned = Boolean(
      meId && ownerId === meId
    );

    console.log(
      "Is owner:",
      isOwned
    );

    // Check whether already viewed
    const alreadyViewed = Boolean(
      meId &&
        project.viewedBy &&
        project.viewedBy.some(
          (vId) =>
            vId.toString() === meId
        )
    );

    console.log(
      "Already viewed:",
      alreadyViewed
    );

    // Increment view
    if (
      meId &&
      !isOwned &&
      !alreadyViewed
    ) {
      console.log(
        "👁️ Adding new view"
      );

      await Project.updateOne(
        {
          _id: project._id,
        },
        {
          $addToSet: {
            viewedBy: req.user._id,
          },

          $inc: {
            views: 1,
          },
        }
      );

      project.views += 1;

      console.log(
        "✅ View added"
      );
    }

    // Check like
    const likedByMe = Boolean(
      meId &&
        project.likedBy &&
        project.likedBy.some(
          (lId) =>
            lId.toString() === meId
        )
    );

    console.log(
      "Liked by me:",
      likedByMe
    );

    // Create public card
    const card =
      project.toPublicCard({
        withHtml: true,
      });

    // Send response
    return res.json({
      project: {
        ...card,

        isOwn: isOwned,

        likedByMe,

        // Explicit date fields
        createdAt:
          project.createdAt || null,

        publishedAt:
          project.publishedAt || null,
      },

      isOwn: isOwned,

      likedByMe,
    });
  } catch (err) {
    console.error(
      "❌ COMMUNITY GET ERROR:",
      err
    );

    next(err);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. TOGGLE LIKE
// ═══════════════════════════════════════════════════════════════════════════

export async function toggleLike(
  req,
  res,
  next
) {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        error: "Invalid ID",
      });
    }

    const project =
      await Project.findById(id).select(
        "likedBy likes user"
      );

    if (!project) {
      return res.status(404).json({
        error: "Project not found",
      });
    }

    const meId =
      req.user._id.toString();

    const ownerId =
      project.user.toString();

    if (ownerId === meId) {
      return res.status(400).json({
        error:
          "You cannot like your own project",
      });
    }

    const likedIndex =
      project.likedBy.findIndex(
        (uId) =>
          uId.toString() === meId
      );

    let likedByMe = false;

    // Unlike
    if (likedIndex > -1) {
      await Project.updateOne(
        {
          _id: id,
        },
        {
          $pull: {
            likedBy: req.user._id,
          },

          $inc: {
            likes: -1,
          },
        }
      );

      likedByMe = false;
    }

    // Like
    else {
      await Project.updateOne(
        {
          _id: id,
        },
        {
          $addToSet: {
            likedBy: req.user._id,
          },

          $inc: {
            likes: 1,
          },
        }
      );

      likedByMe = true;
    }

    const fresh =
      await Project.findById(id).select(
        "likes"
      );

    return res.json({
      likes: fresh?.likes ?? 0,

      likedByMe,
    });
  } catch (err) {
    next(err);
  }
}