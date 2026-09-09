import React, {
  useState,
  useEffect,
  useRef,
} from "react";

import {
  useNavigate,
  useSearchParams,
  Link,
} from "react-router-dom";

import {
  Sparkles,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  Calendar,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../context/authContext.jsx";
import { API } from "../utils/api.js";
import toast from "react-hot-toast";
import s from "../styles/DashboardPage.module.css";

export default function DashboardPage() {
  const navigate = useNavigate();

  const { user, updateUser } = useAuth();

  const [searchParams, setSearchParams] =
    useSearchParams();

  const initialPrompt =
    searchParams.get("prompt") || "";

  /* ==========================================================
     STATE
  ========================================================== */

  const [prompt, setPrompt] = useState("");

  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);

  const [loadError, setLoadError] = useState("");

  const promptInputRef = useRef(null);

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    loadDashboardData();
  }, []);

  /* ==========================================================
     HANDLE PROMPT FROM LANDING PAGE
  ========================================================== */

  useEffect(() => {
    if (
      initialPrompt &&
      !loading &&
      projects.length === 0
    ) {
      setPrompt(initialPrompt);

      setSearchParams({});

      if (promptInputRef.current) {
        promptInputRef.current.focus();
      }
    }
  }, [
    initialPrompt,
    loading,
    projects.length,
    setSearchParams,
  ]);

  /* ==========================================================
     LOAD DASHBOARD DATA
  ========================================================== */

  const loadDashboardData = async () => {
    setLoading(true);
    setLoadError("");

    try {
      const [projRes, userRes] =
        await Promise.all([
          API.get("/projects"),
          API.get("/auth/me"),
        ]);

      setProjects(
        projRes.data?.projects || []
      );

      if (userRes.data?.user) {
        updateUser(userRes.data.user);
      }
    } catch (err) {
      console.error(
        "Failed to load dashboard:",
        err
      );

      setLoadError(
        err.response?.data?.error ||
          "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     CREATE PROJECT
  ========================================================== */

  const handleCreateProject = async (e) => {
    e.preventDefault();

    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      toast.error(
        "Please describe the website you want to build."
      );
      return;
    }

    if (trimmedPrompt.length > 2000) {
      toast.error(
        "Prompt must be 2000 characters or less."
      );
      return;
    }

    if ((user?.credits ?? 0) < 5) {
      toast.error(
        "You need at least 5 credits to generate a new website."
      );

      navigate("/pricing");
      return;
    }

    setCreating(true);

    try {
      const res = await API.post(
        "/projects",
        {
          prompt: trimmedPrompt,
        }
      );

      const newProject =
        res.data?.project;

      if (!newProject?.id) {
        throw new Error(
          "Project creation failed."
        );
      }

      toast.success(
        "Project workspace initialized successfully!"
      );

      navigate(
        `/project/${newProject.id}`
      );
    } catch (err) {
      console.error(
        "Failed to create project:",
        err
      );

      toast.error(
        err.response?.data?.error ||
          "Failed to create project."
      );
    } finally {
      setCreating(false);
    }
  };

  /* ==========================================================
     TOGGLE COMMUNITY PUBLISH
  ========================================================== */

  const handleTogglePublish = async (
    id,
    currentPublished
  ) => {
    try {
      const res = await API.patch(
        `/projects/${id}`,
        {
          published: !currentPublished,
        }
      );

      const updatedProject =
        res.data?.project;

      setProjects((prev) =>
        prev.map((project) =>
          project.id === id
            ? updatedProject
            : project
        )
      );

      toast.success(
        updatedProject?.published
          ? "Published to the Community Showcase!"
          : "Removed from Community Showcase!"
      );
    } catch (err) {
      console.error(
        "Failed to update publish status:",
        err
      );

      toast.error(
        err.response?.data?.error ||
          "Failed to update publish status."
      );
    }
  };

  /* ==========================================================
     DELETE PROJECT
  ========================================================== */

  const handleDeleteProject = async (
    id,
    name
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await API.delete(
        `/projects/${id}`
      );

      setProjects((prev) =>
        prev.filter(
          (project) =>
            project.id !== id
        )
      );

      toast.success(
        "Project deleted successfully."
      );
    } catch (err) {
      console.error(
        "Failed to delete project:",
        err
      );

      toast.error(
        err.response?.data?.error ||
          "Failed to delete project."
      );
    }
  };

  /* ==========================================================
     SCROLL TO PROMPT
  ========================================================== */

  const scrollToPromptBox = () => {
    if (!promptInputRef.current) {
      return;
    }

    promptInputRef.current.focus();

    promptInputRef.current.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className={s.root}>
      {/* ======================================================
          TOP HEADER
      ====================================================== */}

      <header
        className={s.dashboardHeader}
      >
        <div className={s.headerMeta}>
          <h1
            className={s.headerTitle}
          >
            Welcome back,{" "}
            {user?.name ?? "Developer"}!
          </h1>

          <p
            className={s.headerSubtitle}
          >
            Manage your generated
            websites and continue
            building your projects.
          </p>
        </div>

        <div
          className={s.headerStats}
        >
          {/* AVAILABLE CREDITS */}

          <div
            className={s.statBox}
          >
            <span
              className={s.statLabel}
            >
              Available Credits
            </span>

            <div
              className={s.creditsDisplay}
            >
              <Sparkles
                size={16}
                className={s.sparkIcon}
              />

              <span
                className={s.statVal}
              >
                {user?.credits ?? 0}
              </span>
            </div>

            <Link
              to="/pricing"
              className={s.statLink}
            >
              Buy Credits
            </Link>
          </div>

          {/* TOTAL PROJECTS */}

          <div
            className={s.statBox}
          >
            <span
              className={s.statLabel}
            >
              Total Projects
            </span>

            <span
              className={s.statVal}
            >
              {projects.length}
            </span>

            <button
              type="button"
              onClick={scrollToPromptBox}
              className={s.statLinkButton}
            >
              Create New
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================
          CREATE PROJECT
      ====================================================== */}

      <section
        className={s.promptBoxSection}
        id="prompt-builder"
      >
        <div
          className={s.promptHeader}
        >
          <Sparkles
            size={20}
            className={s.sparkTitleIcon}
          />

          <div>
            <h2
              className={s.promptTitle}
            >
              Start building a new
              site
            </h2>

            <p
              className={s.promptSubtitle}
            >
              Describe what you want
              and AI will generate a
              responsive website for
              you.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleCreateProject}
          className={s.promptForm}
        >
          <textarea
            ref={promptInputRef}
            placeholder="e.g. Build a gorgeous responsive booking landing page for a boutique hotel with a clean pricing table and dark theme..."
            value={prompt}
            onChange={(e) =>
              setPrompt(e.target.value)
            }
            className={s.promptTextarea}
            disabled={creating}
          />

          <div
            className={s.promptSubmitRow}
          >
            <span
              className={s.chargeIndicator}
            >
              ⚡ Costs{" "}
              <strong>
                5 credits
              </strong>{" "}
              for initial
              generation
            </span>

            <button
              type="submit"
              disabled={
                creating ||
                !prompt.trim()
              }
              className={s.submitBtn}
            >
              {creating ? (
                <>
                  <Loader2
                    className={s.spinner}
                  />

                  <span>
                    Creating
                    workspace...
                  </span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />

                  <span>
                    Generate Website
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* ======================================================
          PROJECTS
      ====================================================== */}

      <section
        className={s.projectsListSection}
      >
        <div
          className={s.sectionHeader}
        >
          <div>
            <h2
              className={s.sectionTitle}
            >
              My Projects
            </h2>

            <p
              className={s.sectionSubtitle}
            >
              View, edit
              or delete your
              generated websites.
            </p>
          </div>
        </div>

        {/* LOADING */}

        {loading ? (
          <div
            className={s.projectsLoadingState}
          >
            <Loader2
              className={s.spinnerLarge}
            />

            <p>
              Retrieving your
              projects...
            </p>
          </div>
        ) : loadError ? (
          /* ERROR */

          <div
            className={s.errorStateBox}
          >
            <AlertCircle
              size={40}
              className={s.errorIcon}
            />

            <p
              className={s.errorText}
            >
              {loadError}
            </p>

            <button
              type="button"
              onClick={loadDashboardData}
              className={s.retryBtn}
            >
              Retry Connection
            </button>
          </div>
        ) : projects.length === 0 ? (
          /* EMPTY STATE */

          <div
            className={s.emptyStateBox}
          >
            <div
              className={
                s.emptyIconWrapper
              }
            >
              <Plus size={32} />
            </div>

            <h3
              className={s.emptyTitle}
            >
              No projects found
            </h3>

            <p
              className={s.emptySub}
            >
              Describe your dream
              website above to
              generate your first
              project.
            </p>

            <button
              type="button"
              onClick={scrollToPromptBox}
              className={s.emptyBtn}
            >
              Create your first
              website
            </button>
          </div>
        ) : (
          /* PROJECT GRID */

          <div
            className={s.projectsGrid}
          >
            {projects.map(
              (project) => (
                <div
                  key={project.id}
                  className={s.projectCard}
                >
                  {/* PROJECT BODY */}

                  <div
                    className={
                      s.projectCardBody
                    }
                  >
                    <div
                      className={
                        s.projectCardHeader
                      }
                    >
                      <h3
                        className={
                          s.projectName
                        }
                      >
                        {project.name}
                      </h3>

                      {/* PUBLISHED BADGE */}

                      {project.published && (
                        <div
                          className={
                            s.badgeRow
                          }
                        >
                          <span
                            className={`${s.badge} ${s.publishedBadge}`}
                          >
                            <Eye size={12} />

                            <span>
                              Published
                            </span>
                          </span>
                        </div>
                      )}
                    </div>

                    <p
                      className={
                        s.projectPrompt
                      }
                    >
                      "
                      {project.prompt ||
                        "No prompt description given"}
                      "
                    </p>

                    {/* PROJECT METADATA */}

                    <div
                      className={
                        s.projectMetadataRow
                      }
                    >
                      <div
                        className={s.metaItem}
                      >
                        <Calendar
                          size={13}
                          className={
                            s.metaIcon
                          }
                        />

                        <span>
                          Created:{" "}
                          {new Date(
                            project.createdAt
                          ).toLocaleDateString()}
                        </span>
                      </div>

                      <div
                        className={s.metaItem}
                      >
                        <Clock
                          size={13}
                          className={
                            s.metaIcon
                          }
                        />

                        <span>
                          Updated:{" "}
                          {new Date(
                            project.updatedAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PROJECT ACTIONS */}

                  <div
                    className={
                      s.projectCardActions
                    }
                  >
                    <Link
                      to={`/project/${project.id}`}
                      className={
                        s.editActionBtn
                      }
                    >
                      Edit Site
                    </Link>

                    <div
                      className={
                        s.minorActions
                      }
                    >
                      {/* PUBLISH / UNPUBLISH */}

                      <button
                        type="button"
                        onClick={() =>
                          handleTogglePublish(
                            project.id,
                            project.published
                          )
                        }
                        title={
                          project.published
                            ? "Remove from showcase"
                            : "Publish to showcase"
                        }
                        className={`${s.iconActionBtn} ${
                          project.published
                            ? s.activeAction
                            : ""
                        }`}
                      >
                        {project.published ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>

                      {/* DELETE */}

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteProject(
                            project.id,
                            project.name
                          )
                        }
                        title="Delete project permanently"
                        className={`${s.iconActionBtn} ${s.deleteBtnColor}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}