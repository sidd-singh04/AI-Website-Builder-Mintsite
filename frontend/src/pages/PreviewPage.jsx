import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  Heart,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../context/authContext.jsx";
import { API } from "../utils/api.js";
import { safePreviewHtml } from "../utils/safePreview.js";
import toast from "react-hot-toast";
import s from "../styles/PreviewPage.module.css";

export default function PreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();
  const isLoggedIn = Boolean(user);

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [liking, setLiking] = useState(false);

  // Load preview data
  useEffect(() => {
    async function loadPreview() {
      setLoading(true);
      setError("");

      try {
        const res = await API.get(`/community/${id}`);

        setProject(res.data.project);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load project preview");
      } finally {
        setLoading(false);
      }
    }

    loadPreview();
  }, [id]);

  // Like / Unlike project
  const handleLike = async () => {
    if (!isLoggedIn) {
      toast.error("Please sign in to like projects!");
      navigate("/login");
      return;
    }

    if (!project) return;

    if (project.isOwn) {
      toast.error("You cannot like your own project!");
      return;
    }

    setLiking(true);

    // Save previous state in case API fails
    const previousLikes = project.likes;
    const previousLiked = project.likedByMe;

    // Optimistic UI update
    setProject((prev) =>
      prev
        ? {
            ...prev,
            likedByMe: !prev.likedByMe,
            likes: prev.likes + (prev.likedByMe ? -1 : 1),
          }
        : null,
    );

    try {
      const res = await API.post(`/community/${id}/like`);

      const { likes, likedByMe } = res.data;

      setProject((prev) =>
        prev
          ? {
              ...prev,
              likes,
              likedByMe,
            }
          : null,
      );
    } catch (err) {
      // Revert optimistic update
      setProject((prev) =>
        prev
          ? {
              ...prev,
              likes: previousLikes,
              likedByMe: previousLiked,
            }
          : null,
      );

      toast.error(err.response?.data?.error || "Failed to update like status");
    } finally {
      setLiking(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={s.centerScreen}>
        <Loader2 className={s.spinIcon} />

        <p>Loading project preview...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={s.centerScreen}>
        <AlertCircle size={44} className={s.errorIcon} />

        <p className={s.errorText}>{error}</p>

        <Link to="/community" className={s.backLinkBtn}>
          Back to Community
        </Link>
      </div>
    );
  }

  return (
    <div className={s.root}>
      {/* HEADER TOOLBAR */}
      <header className={s.header}>
        <div className={s.headerLeft}>
          <Link to="/community" className={s.backLink}>
            <ArrowLeft size={16} className={s.backIcon} />

            <span>Community</span>
          </Link>

          <div className={s.projectInfo}>
            <h1 className={s.projectName}>{project?.name}</h1>

            <p className={s.projectAuthor}>
              By {project?.author || "Anonymous"}
            </p>
          </div>
        </div>

        <div className={s.headerRight}>
          {/* Views */}
          <div className={s.viewBadge}>
            <Eye size={15} className={s.statIcon} />

            <span>{project?.views ?? 0} Views</span>
          </div>

          {/* Like */}
          <button
            onClick={handleLike}
            disabled={liking || project?.isOwn}
            className={`
              ${s.likeButton}
              ${project?.likedByMe ? s.liked : ""}
              ${project?.isOwn ? s.disabledLike : ""}
            `}
            title={
              project?.isOwn
                ? "You cannot like your own project"
                : "Toggle Like"
            }
          >
            <Heart
              size={15}
              className={`
                ${s.likeIcon}
                ${project?.likedByMe ? s.heartFilled : ""}
              `}
            />

            <span>{project?.likes ?? 0}</span>
          </button>
        </div>
      </header>

      {/* RENDER CANVAS PREVIEW AREA */}
      <main className={s.previewArea}>
        {project?.html ? (
          <iframe
            title={project.name}
            srcDoc={safePreviewHtml(project.html)}
            className={s.iframe}
            sandbox="
              allow-scripts
              allow-same-origin
              allow-modals
              allow-popups
            "
          />
        ) : (
          <div className={s.emptyContainer}>
            <Sparkles size={40} className={s.emptyIcon} />

            <p>This project has no generated HTML code.</p>
          </div>
        )}
      </main>
    </div>
  );
}
