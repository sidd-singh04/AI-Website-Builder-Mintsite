import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { 
  Sparkles, 
  Trash2, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Globe,  
  Plus, 
  Calendar, 
  Clock, 
  Loader2, 
  AlertCircle 
} from "lucide-react";
import { useAuth } from "../context/authContext.jsx";
import { API } from "../utils/api.js";
import toast from "react-hot-toast";
import s from "../styles/DashboardPage.module.css";

// --- HELPERS FOR CONTRIBUTION GRAPH ---
const LEVEL_COLORS = [
  s.level0, // No contributions
  s.level1, // 1-2 contributions
  s.level2, // 3-5 contributions
  s.level3, // 6-9 contributions
  s.level4  // 10+ contributions
];

function getLevelClass(count) {
  if (!count || count <= 0) return LEVEL_COLORS;
  if (count <= 2) return LEVEL_COLORS[10];
  if (count <= 5) return LEVEL_COLORS[1];
  if (count <= 9) return LEVEL_COLORS[11];
  return LEVEL_COLORS[2];
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Redirect prompt state check
  const initialPrompt = searchParams.get("prompt") || "";

  // Page level states
  const [prompt, setPrompt] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [loadError, setLoadError] = useState("");

  // Contribution states
  const [contributions, setContributions] = useState({});
  const [totalContributions, setTotalContributions] = useState(0);
  const [contribLoading, setContribLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState(null);

  const promptInputRef = useRef(null);

  // Load Projects and Contributions on Mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Autofill and trigger prompt if passed from homepage
  useEffect(() => {
    if (initialPrompt && !loading && projects.length === 0) {
      setPrompt(initialPrompt);
      // Clean query params so refresh doesn't trigger it again
      setSearchParams({});
      if (promptInputRef.current) {
        promptInputRef.current.focus();
      }
    }
  }, [initialPrompt, loading]);

  const loadDashboardData = async () => {
    setLoading(true);
    setLoadError("");
    try {
      // 1. Fetch user projects
      const projRes = await API.get("/projects");
      setProjects(projRes.data.projects || []);

      // 2. Fetch user profile updates (credits check)
      const userRes = await API.get("/me");
      if (userRes.data?.user) {
        updateUser(userRes.data.user);
      }

      // 3. Load Contribution logs
      await loadContributions();
    } catch (err) {
      setLoadError(
        err.response?.data?.error || 
        "Failed to load dashboard workspace over here"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadContributions = async () => {
    setContribLoading(true);
    try {
      const res = await API.get("/me/contributions");
      setContributions(res.data.counts || {});
      setTotalContributions(res.data.total || 0);
    } catch (err) {
      console.error("Failed to load contribution grid over here:", err);
    } finally {
      setLoading(false);
      setContribLoading(false);
    }
  };

  // Create Project handler
  const handleCreateProject = async (e) => {
    e.preventDefault();
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      toast.error("Please describe what site you want to build over here");
      return;
    }

    if (trimmedPrompt.length > 2000) {
      toast.error("Prompt must be 2000 characters or less over here");
      return;
    }

    // Credits guard check (5 credits for initial gen)
    if ((user?.credits ?? 0) < 5) {
      toast.error("You need at least 5 credits to generate a new website over here. Please top up!");
      navigate("/pricing");
      return;
    }

    setCreating(true);
    try {
      const res = await API.post("/projects", { prompt: trimmedPrompt });
      const newProj = res.data.project;
      
      toast.success("Project workspace initialized successfully!");
      // Redirect to builder canvas
      navigate(`/project/${newProj.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create project over here");
    } finally {
      setCreating(false);
    }
  };

  // Toggle published community status
  const handleTogglePublish = async (id, currentPublished) => {
    try {
      const res = await API.patch(`/projects/${id}`, { published: !currentPublished });
      const updatedProj = res.data.project;

      setProjects((prev) => 
        prev.map((p) => (p.id === id ? updatedProj : p))
      );

      toast.success(
        updatedProj.published 
          ? "Published to the Community Showcase over here!" 
          : "Removed from Community Showcase over here!"
      );
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update publish state over here");
    }
  };

  // Delete project handler
  const handleDeleteProject = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" over here?`)) return;

    try {
      await API.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Project deleted successfully over here");
      // Reload contributions to reflect any updates
      loadContributions();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete project over here");
    }
  };

  // Scroll to prompt utility helper
  const scrollToPromptBox = () => {
    if (promptInputRef.current) {
      promptInputRef.current.focus();
      promptInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Renders the 53-week grid columns
  const renderContributionGrid = () => {
    const cells = [];
    const now = new Date();
    
    // Set up a chronological map of the past 364 days starting exactly 52 weeks ago
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(now.getDate() - 364);

    // Adjust start date to previous Sunday to align column blocks
    const startDayOffset = startDate.getDay(); // 0 is Sunday
    startDate.setDate(startDate.getDate() - startDayOffset);

    // Generate cells for 53 weeks x 7 days = 371 cells
    for (let i = 0; i < 371; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const date = String(d.getDate()).padStart(2, "0");
      const dateKey = `${year}-${month}-${date}`; // YYYY-MM-DD matches backend count keys

      const count = contributions[dateKey] || 0;
      const isFuture = d > now;

      cells.push(
        <div
          key={i}
          className={`${s.gridCell} ${isFuture ? s.futureCell : getLevelClass(count)}`}
          onMouseEnter={(e) => {
            if (!isFuture) {
              setHoveredCell({
                date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                count,
                x: e.currentTarget.offsetLeft,
                y: e.currentTarget.offsetTop
              });
            }
          }}
          onMouseLeave={() => setHoveredCell(null)}
        />
      );
    }

    return (
      <div className={s.gridContainer}>
        {/* Left Weekday Labels */}
        <div className={s.gridDayLabels}>
          <span>Sun</span>
          <span>Tue</span>
          <span>Thu</span>
          <span>Sat</span>
        </div>
        
        {/* Actual Scrollable Grid Box */}
        <div className={s.gridScrollWrapper}>
          <div className={s.gridColumns}>
            {cells}
          </div>
          {/* Tooltip Overlay Panel */}
          {hoveredCell && (
            <div 
              className={s.gridTooltip}
              style={{ 
                left: `${hoveredCell.x - 65}px`, 
                top: `${hoveredCell.y - 42}px` 
              }}
            >
              <strong>{hoveredCell.count} contributions</strong> on {hoveredCell.date}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={s.root}>
      {/* 1. TOP STATS BAR */}
      <header className={s.dashboardHeader}>
        <div className={s.headerMeta}>
          <h1 className={s.headerTitle}>Welcome back, {user?.name ?? "Developer"}!</h1>
          <p className={s.headerSubtitle}>Manage your generated websites, check hosting pipelines, and track daily updates over here.</p>
        </div>
        <div className={s.headerStats}>
          <div className={s.statBox}>
            <span className={s.statLabel}>Available Credits</span>
            <div className={s.creditsDisplay}>
              <Sparkles size={16} className={s.sparkIcon} />
              <span className={s.statVal}>{user?.credits ?? 0}</span>
            </div>
            <Link to="/pricing" className={s.statLink}>Buy Credits</Link>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>Total Projects</span>
            <span className={s.statVal}>{projects.length}</span>
            <button onClick={scrollToPromptBox} className={s.statLinkButton}>Create New</button>
          </div>
        </div>
      </header>

      {/* 2. GITHUB-STYLE CONTRIBUTION SECTION */}
      <section className={s.sectionCard}>
        <div className={s.sectionHeader}>
          <div>
            <h2 className={s.sectionTitle}>Your Workspace Contributions</h2>
            <p className={s.sectionSubtitle}>
              Activity timeline tracking site creations (+1) and AI assistant adjustments (+2) over the past year over here.
            </p>
          </div>
          <div className={s.totalContribCount}>
            <strong>{totalContributions}</strong> contributions in past year
          </div>
        </div>

        {contribLoading ? (
          <div className={s.centerLoader}>
            <Loader2 className={s.spinner} />
            <span>Assembling activity history...</span>
          </div>
        ) : (
          <>
            {renderContributionGrid()}
            
            {/* Grid Legend Toggles */}
            <div className={s.gridLegend}>
              <span>Less</span>
              <div className={`${s.legendSquare} ${s.level0}`} />
              <div className={`${s.legendSquare} ${s.level1}`} />
              <div className={`${s.legendSquare} ${s.level2}`} />
              <div className={`${s.legendSquare} ${s.level3}`} />
              <div className={`${s.legendSquare} ${s.level4}`} />
              <span>More</span>
            </div>
          </>
        )}
      </section>

      {/* 3. GENERATION CREATOR INPUT PANEL */}
      <section className={s.promptBoxSection} id="prompt-builder">
        <div className={s.promptHeader}>
          <Sparkles size={20} className={s.sparkTitleIcon} />
          <div>
            <h2 className={s.promptTitle}>Start building a new site</h2>
            <p className={s.promptSubtitle}>Type what you want inside the box below to generate a beautiful responsive site using AI over here.</p>
          </div>
        </div>

        <form onSubmit={handleCreateProject} className={s.promptForm}>
          <textarea
            ref={promptInputRef}
            placeholder="e.g. Build a gorgeous responsive booking landing page for a boutique hotel with a clean pricing table and dark theme..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className={s.promptTextarea}
            disabled={creating}
          />
          <div className={s.promptSubmitRow}>
            <span className={s.chargeIndicator}>
              ⚡ Costs <strong>5 credits</strong> for initial generation
            </span>
            <button type="submit" disabled={creating || !prompt.trim()} className={s.submitBtn}>
              {creating ? (
                <>
                  <Loader2 className={s.spinner} />
                  <span>Generating site workspace...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Generate Website</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* 4. USER PROJECTS LIST SECTION */}
      <section className={s.projectsListSection}>
        <div className={s.sectionHeader}>
          <div>
            <h2 className={s.sectionTitle}>My Projects</h2>
            <p className={s.sectionSubtitle}>View, edit, or configure settings for your past website generations over here.</p>
          </div>
        </div>

        {loading ? (
          <div className={s.projectsLoadingState}>
            <Loader2 className={s.spinnerLarge} />
            <p>Retrieving your website catalog over here...</p>
          </div>
        ) : loadError ? (
          <div className={s.errorStateBox}>
            <AlertCircle size={40} className={s.errorIcon} />
            <p className={s.errorText}>{loadError}</p>
            <button onClick={loadDashboardData} className={s.retryBtn}>Retry Connection</button>
          </div>
        ) : projects.length === 0 ? (
          <div className={s.emptyStateBox}>
            <div className={s.emptyIconWrapper}>
              <Plus size={32} />
            </div>
            <h3 className={s.emptyTitle}>No projects found over here</h3>
            <p className={s.emptySub}>Describe your dream landing page in the builder box above to generate your first responsive workspace site over here!</p>
            <button onClick={scrollToPromptBox} className={s.emptyBtn}>
              Create your first website
            </button>
          </div>
        ) : (
          <div className={s.projectsGrid}>
            {projects.map((project) => (
              <div key={project.id} className={s.projectCard}>
                <div className={s.projectCardBody}>
                  <div className={s.projectCardHeader}>
                    <h3 className={s.projectName}>{project.name}</h3>
                    <div className={s.badgeRow}>
                      {project.published && (
                        <span className={`${s.badge} ${s.publishedBadge}`}>
                          <Eye size={12} />
                          <span>Published</span>
                        </span>
                      )}
                      {project.deployURL && (
                        <span className={`${s.badge} ${s.hostedBadge}`}>
                          <Globe size={12} />
                          <span>Live hosted</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <p className={s.projectPrompt}>
                    "{project.prompt || "No prompt description given"}"
                  </p>

                  <div className={s.projectMetadataRow}>
                    <div className={s.metaItem}>
                      <Calendar size={13} className={s.metaIcon} />
                      <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className={s.metaItem}>
                      <Clock size={13} className={s.metaIcon} />
                      <span>Updated: {new Date(project.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className={s.projectCardActions}>
                  <Link to={`/project/${project.id}`} className={s.editActionBtn}>
                    Edit site
                  </Link>

                  <div className={s.minorActions}>
                    {/* Toggle publish button */}
                    <button
                      onClick={() => handleTogglePublish(project.id, project.published)}
                      title={project.published ? "Remove from showcase over here" : "Publish to showcase over here"}
                      className={`${s.iconActionBtn} ${project.published ? s.activeAction : ""}`}
                    >
                      {project.published ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>

                    {/* Vercel Live link if any */}
                    {project.deployURL && (
                      <a
                        href={project.deployURL}
                        target="_blank"
                        rel="noreferrer"
                        title="Visit live website link over here"
                        className={s.iconActionBtn}
                      >
                        <Globe size={16} />
                      </a>
                    )}

                    {/* Delete project button */}
                    <button
                      onClick={() => handleDeleteProject(project.id, project.name)}
                      title="Delete project permanently over here"
                      className={`${s.iconActionBtn} ${s.deleteBtnColor}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );

}