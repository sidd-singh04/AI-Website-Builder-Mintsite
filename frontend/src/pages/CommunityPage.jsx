import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Heart, Eye, ExternalLink, Calendar, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { useAuth } from "../context/authContext.jsx";
import { API } from "../utils/api.js";
import { PageBackdrop } from "../assets/ui.jsx";
import Footer from "../components/Footer.jsx";
import toast from "react-hot-toast";
import s from "../styles/CommunityPage.module.css";

const filters = [
  { key: "new", label: "Newest First" },
  { key: "views", label: "Most Viewed" },
  { key: "likes", label: "Most Loved" }
];

export default function CommunityPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLoggedIn = Boolean(user);

  const [sort, setSort] = useState("new");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load published projects based on active sort filter
  useEffect(() => {
    async function loadCommunityProjects() {
      setLoading(true);
      setError("");
      try {
        const res = await API.get(`/community?sort=${sort}`);
        setProjects(res.data.projects || []);
      } catch (err) {
        setError(
          err.response?.data?.error || 
          "Failed to load community projects over here"
        );
      } finally {
        setLoading(false);
      }
    }

    loadCommunityProjects();
  }, [sort]);

  // Handle Liking / Unliking a Project
  const handleLike = async (id) => {
    if (!isLoggedIn) {
      toast.error("Please sign in to like projects over here!");
      navigate("/login");
      return;
    }

    // Save previous state for optimistic UI updates
    const previousProjects = [...projects];

    // Optimistically update UI
    setProjects((oldProjects) =>
      oldProjects.map((p) => {
        if (p.id === id) {
          if (p.isOwn) {
            toast.error("You cannot like your own project over here!");
            return p;
          }
          const nextLiked = !p.likedByMe;
          return {
            ...p,
            likedByMe: nextLiked,
            likes: Math.max(0, p.likes + (nextLiked ? 1 : -1))
          };
        }
        return p;
      })
    );

    try {
      // Trigger actual back-end request
      const res = await API.post(`/community/${id}/like`);
      const { likes, likedByMe } = res.data;

      // Sync with fresh back-end counts
      setProjects((oldProjects) =>
        oldProjects.map((p) =>
          p.id === id ? { ...p, likes, likedByMe } : p
        )
      );
    } catch (err) {
      // Revert optimistic updates on failure
      setProjects(previousProjects);
      toast.error(err.response?.data?.error || "Failed to update like status over here");
    }
  };

  return (
    <div className={s.root}>
      <PageBackdrop />

      {/* 1. HERO HEADER AREA */}
      <section className={s.heroSection}>
        <div className={s.heroInner}>
          <h1 className={s.heroTitle}>Community Showcase</h1>
          <p className={s.heroSub}>
            Real projects published by MintSite users. Click any website card to view code and live previews, or show support by tapping the heart over here.
          </p>
        </div>
      </section>

      {/* 2. FILTER BAR */}
      <section className={s.workspaceArea}>
        <div className={s.filterBar}>
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setSort(filter.key)}
              className={`${s.filterBtn} ${sort === filter.key ? s.filterBtnActive : s.filterBtnInactive}`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* 3. SHOWCASE STATES PANEL */}
        {loading ? (
          <div className={s.cardMessage}>
            <Loader2 className={s.loadingSpinner} />
            <span>Loading community creations over here...</span>
          </div>
        ) : error ? (
          <div className={`${s.cardMessage} ${s.errorText}`}>
            <AlertCircle size={32} />
            <span>{error}</span>
          </div>
        ) : projects.length === 0 ? (
          <div className={s.cardMessage}>
            <p className={s.emptyText}>
              No published projects yet. Be the first to build and hit{" "}
              <span className={s.emptyHighlight}>Publish</span> over here!
            </p>
            <button className={s.createBtn} onClick={() => navigate(isLoggedIn ? "/dashboard" : "/register")}>
              Create a Site
            </button>
          </div>
        ) : (
          /* GRID SHOWCASE */
          <div className={s.grid}>
            {projects.map((project) => (
              <CommunityCard
                key={project.id}
                project={project}
                isLoggedIn={isLoggedIn}
                onLike={() => handleLike(project.id)}
                onOpen={() => navigate(`/preview/${project.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

// --- HELPER COMPONENT: COMMUNITY CARD ---
function CommunityCard({ project, isLoggedIn, onLike, onOpen }) {
  return (
    <div className={s.card}>
      {/* 1. Project Preview Thumbnail Header */}
 <div className={s.cardImageArea} onClick={onOpen}>
  <div className={s.cardOverlay}>
    <div className={s.viewLiveBadge}>
      <ExternalLink size={14} />
      <span>View Website</span>
    </div>
  </div>

  <div className={s.mockBrowser}>
    <div className={s.mockBrowserHeader}>
      <span
        className={s.browserDot}
        style={{ backgroundColor: "#ef4444" }}
      />
      <span
        className={s.browserDot}
        style={{ backgroundColor: "#f59e0b" }}
      />
      <span
        className={s.browserDot}
        style={{ backgroundColor: "#10b981" }}
      />
    </div>

    {project.html ? (
      <iframe
        title={project.name}
        srcDoc={project.html}
        className={s.websitePreview}
        sandbox="allow-scripts"
      />
    ) : (
      <div className={s.mockBrowserBody}>
        <Sparkles className={s.thumbnailIcon} />
        <span className={s.thumbnailText}>
          No preview available
        </span>
      </div>
    )}
  </div>
</div>

      {/* 2. Card Content details */}
      <div className={s.cardBody}>
        <div className={s.cardHeader}>
          <h3 className={s.projectName} onClick={onOpen}>
            {project.name}
          </h3>
          <div className={s.badgeRow}>
            {project.isOwn && (
              <span className={s.ownBadge}>Mine</span>
            )}
          </div>
        </div>

        <div className={s.cardMeta}>
          <span className={s.authorLabel}>By {project.author || "Anonymous"}</span>
          <span className={s.dateLabel}>
            <Calendar size={12} />
            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
          </span>
        </div>
      </div>

      {/* 3. Social Metrics footer */}
      <div className={s.cardFooter}>
        <div className={s.statsItem}>
          <Eye size={15} className={s.statIcon} />
          <span>{project.views ?? 0} Views</span>
        </div>

        <button
          onClick={onLike}
          disabled={project.isOwn}
          className={`${s.likeBtn} ${project.likedByMe ? s.liked : ""} ${project.isOwn ? s.disabledLike : ""}`}
          title={project.isOwn ? "You cannot like your own project over here" : "Toggle Like over here"}
        >
          <Heart size={15} className={`${s.heartIcon} ${project.likedByMe ? s.heartFilled : ""}`} />
          <span>{project.likes ?? 0}</span>
        </button>
      </div>
    </div>
  );
}
