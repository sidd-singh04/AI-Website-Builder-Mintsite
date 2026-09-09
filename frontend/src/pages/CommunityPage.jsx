import React, {
  useState,
  useEffect,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  Heart,
  Eye,
  ExternalLink,
  Calendar,
  Loader2,
  Sparkles,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../context/authContext.jsx";

import { API } from "../utils/api.js";

import { PageBackdrop } from "../assets/ui.jsx";

import Footer from "../components/Footer.jsx";

import toast from "react-hot-toast";

import s from "../styles/CommunityPage.module.css";

// ═══════════════════════════════════════════════════════════════════════════
// FILTERS
// ═══════════════════════════════════════════════════════════════════════════

const filters = [
  {
    key: "new",
    label: "Newest First",
  },

  {
    key: "views",
    label: "Most Viewed",
  },

  {
    key: "likes",
    label: "Most Loved",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// DATE FORMATTER
// ═══════════════════════════════════════════════════════════════════════════

function formatProjectDate(project) {
  // Prefer published date
  const dateValue =
    project?.publishedAt ||
    project?.createdAt;

  if (!dateValue) {
    return "Unknown date";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMUNITY PAGE
// ═══════════════════════════════════════════════════════════════════════════

export default function CommunityPage() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const isLoggedIn = Boolean(user);

  const [sort, setSort] =
    useState("new");

  const [projects, setProjects] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ═══════════════════════════════════════════════════════════════════════
  // LOAD COMMUNITY PROJECTS
  // ═══════════════════════════════════════════════════════════════════════

  useEffect(() => {
    let cancelled = false;

    async function loadCommunityProjects() {
      setLoading(true);

      setError("");

      try {
        const res = await API.get(
          `/community?sort=${sort}`
        );

        if (cancelled) {
          return;
        }

        const fetchedProjects =
          res.data?.projects || [];

        console.log(
          "Community projects:",
          fetchedProjects
        );

        /*
          Backend normally handles sorting.

          We also sort on frontend as a fallback.
        */

        const sortedProjects = [
          ...fetchedProjects,
        ].sort((a, b) => {
          if (sort === "views") {
            return (
              (b.views ?? 0) -
              (a.views ?? 0)
            );
          }

          if (sort === "likes") {
            return (
              (b.likes ?? 0) -
              (a.likes ?? 0)
            );
          }

          // Newest first
          const dateA =
            new Date(
              a.publishedAt ||
                a.createdAt ||
                0
            ).getTime();

          const dateB =
            new Date(
              b.publishedAt ||
                b.createdAt ||
                0
            ).getTime();

          return dateB - dateA;
        });

        setProjects(
          sortedProjects
        );
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(
          err.response?.data?.error ||
            "Failed to load community projects"
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCommunityProjects();

    return () => {
      cancelled = true;
    };
  }, [sort]);

  // ═══════════════════════════════════════════════════════════════════════
  // LIKE / UNLIKE
  // ═══════════════════════════════════════════════════════════════════════

  const handleLike = async (id) => {
    if (!isLoggedIn) {
      toast.error(
        "Please sign in to like projects!"
      );

      navigate("/login");

      return;
    }

    const currentProject =
      projects.find(
        (p) => p.id === id
      );

    if (!currentProject) {
      return;
    }

    if (currentProject.isOwn) {
      toast.error(
        "You cannot like your own project!"
      );

      return;
    }

    const previousProjects = [
      ...projects,
    ];

    // Optimistic update
    setProjects(
      (oldProjects) =>
        oldProjects.map((p) => {
          if (p.id !== id) {
            return p;
          }

          const nextLiked =
            !p.likedByMe;

          return {
            ...p,

            likedByMe:
              nextLiked,

            likes: Math.max(
              0,
              (p.likes ?? 0) +
                (nextLiked ? 1 : -1)
            ),
          };
        })
    );

    try {
      const res =
        await API.post(
          `/community/${id}/like`
        );

      const {
        likes,
        likedByMe,
      } = res.data;

      setProjects(
        (oldProjects) =>
          oldProjects.map((p) =>
            p.id === id
              ? {
                  ...p,
                  likes,
                  likedByMe,
                }
              : p
          )
      );
    } catch (err) {
      setProjects(
        previousProjects
      );

      toast.error(
        err.response?.data?.error ||
          "Failed to update like status"
      );
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // UI
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <div className={s.root}>
      <PageBackdrop />

      {/* HERO */}

      <section
        className={s.heroSection}
      >
        <div
          className={s.heroInner}
        >
          <h1
            className={s.heroTitle}
          >
            Community Showcase
          </h1>

          <p
            className={s.heroSub}
          >
            Real projects published by
            MintSite users. Explore
            websites created with AI
            and discover what others
            are building.
          </p>
        </div>
      </section>

      {/* WORKSPACE */}

      <section
        className={s.workspaceArea}
      >
        {/* FILTER BAR */}

        <div className={s.filterBar}>
          {filters.map(
            (filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() =>
                  setSort(
                    filter.key
                  )
                }
                className={`${
                  s.filterBtn
                } ${
                  sort ===
                  filter.key
                    ? s.filterBtnActive
                    : s.filterBtnInactive
                }`}
              >
                {filter.label}
              </button>
            )
          )}
        </div>

        {/* LOADING */}

        {loading ? (
          <div
            className={
              s.cardMessage
            }
          >
            <Loader2
              className={
                s.loadingSpinner
              }
            />

            <span>
              Loading community
              creations...
            </span>
          </div>
        ) : error ? (
          /* ERROR */

          <div
            className={`${s.cardMessage} ${s.errorText}`}
          >
            <AlertCircle size={32} />

            <span>{error}</span>

            <button
              className={
                s.createBtn
              }
              onClick={() =>
                setSort(
                  sort
                )
              }
            >
              Try Again
            </button>
          </div>
        ) : projects.length ===
          0 ? (
          /* EMPTY */

          <div
            className={
              s.cardMessage
            }
          >
            <p
              className={
                s.emptyText
              }
            >
              No published projects
              yet. Be the first to
              build and publish your
              website!
            </p>

            <button
              className={
                s.createBtn
              }
              onClick={() =>
                navigate(
                  isLoggedIn
                    ? "/dashboard"
                    : "/register"
                )
              }
            >
              Create a Site
            </button>
          </div>
        ) : (
          /* PROJECT GRID */

          <div className={s.grid}>
            {projects.map(
              (project) => (
                <CommunityCard
                  key={project.id}
                  project={project}
                  onLike={() =>
                    handleLike(
                      project.id
                    )
                  }
                  onOpen={() =>
                    navigate(
                      `/preview/${project.id}`
                    )
                  }
                />
              )
            )}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMUNITY CARD
// ═══════════════════════════════════════════════════════════════════════════

function CommunityCard({
  project,
  onLike,
  onOpen,
}) {
  return (
    <div className={s.card}>
      {/* WEBSITE PREVIEW */}

      <div
        className={
          s.cardImageArea
        }
        onClick={onOpen}
      >
        <div
          className={
            s.cardOverlay
          }
        >
          <div
            className={
              s.viewLiveBadge
            }
          >
            <ExternalLink
              size={14}
            />

            <span>
              View Website
            </span>
          </div>
        </div>

        <div
          className={
            s.mockBrowser
          }
        >
          {/* Browser Header */}

          <div
            className={
              s.mockBrowserHeader
            }
          >
            <span
              className={
                s.browserDot
              }
              style={{
                backgroundColor:
                  "#ef4444",
              }}
            />

            <span
              className={
                s.browserDot
              }
              style={{
                backgroundColor:
                  "#f59e0b",
              }}
            />

            <span
              className={
                s.browserDot
              }
              style={{
                backgroundColor:
                  "#10b981",
              }}
            />
          </div>

          {/* Website */}

          {project.html ? (
            <iframe
              title={
                project.name
              }
              srcDoc={
                project.html
              }
              className={
                s.websitePreview
              }
              sandbox="allow-scripts"
            />
          ) : (
            <div
              className={
                s.mockBrowserBody
              }
            >
              <Sparkles
                className={
                  s.thumbnailIcon
                }
              />

              <span
                className={
                  s.thumbnailText
                }
              >
                No preview available
              </span>
            </div>
          )}
        </div>
      </div>

      {/* PROJECT DETAILS */}

      <div
        className={s.cardBody}
      >
        <div
          className={
            s.cardHeader
          }
        >
          <h3
            className={
              s.projectName
            }
            onClick={onOpen}
          >
            {project.name}
          </h3>

          <div
            className={
              s.badgeRow
            }
          >
            {project.isOwn && (
              <span
                className={
                  s.ownBadge
                }
              >
                Mine
              </span>
            )}
          </div>
        </div>

        <div
          className={
            s.cardMeta
          }
        >
          <span
            className={
              s.authorLabel
            }
          >
            By{" "}
            {project.author ||
              "Anonymous"}
          </span>

          <span
            className={
              s.dateLabel
            }
          >
            <Calendar
              size={12}
            />

            <span>
              {formatProjectDate(
                project
              )}
            </span>
          </span>
        </div>
      </div>

      {/* METRICS */}

      <div
        className={
          s.cardFooter
        }
      >
        <div
          className={
            s.statsItem
          }
        >
          <Eye
            size={15}
            className={
              s.statIcon
            }
          />

          <span>
            {project.views ??
              0}{" "}
            Views
          </span>
        </div>

        <button
          type="button"
          onClick={onLike}
          disabled={
            project.isOwn
          }
          className={`${s.likeBtn} ${
            project.likedByMe
              ? s.liked
              : ""
          } ${
            project.isOwn
              ? s.disabledLike
              : ""
          }`}
          title={
            project.isOwn
              ? "You cannot like your own project"
              : "Like this project"
          }
        >
          <Heart
            size={15}
            className={`${s.heartIcon} ${
              project.likedByMe
                ? s.heartFilled
                : ""
            }`}
          />

          <span>
            {project.likes ??
              0}
          </span>
        </button>
      </div>
    </div>
  );
}