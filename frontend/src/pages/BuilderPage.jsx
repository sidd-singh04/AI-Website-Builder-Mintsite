import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Sparkles,
  Download,
  ChevronLeft,
  Monitor,
  Tablet,
  Smartphone,
  Send,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Bot,
} from "lucide-react";
import { useAuth } from "../context/authContext.jsx";
import { API } from "../utils/api.js";
import toast from "react-hot-toast";
import s from "../styles/BuilderPage.module.css";

export default function BuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [device, setDevice] = useState("desktop");
  const [projectName, setProjectName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [saveError, setSaveError] = useState("");

  const chatEndRef = useRef(null);

  // Load project when page opens
  useEffect(() => {
    loadProject();
  }, [id]);

  // Automatically scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [project?.messages, generating]);

  // Auto-save project name
  useEffect(() => {
    if (!project || projectName === project.name) {
      return;
    }

    const timer = setTimeout(() => {
      savePatch({ name: projectName });
    }, 1500);

    return () => clearTimeout(timer);
  }, [projectName]);

  // Automatically generate website for a new project
  useEffect(() => {
    if (
      project &&
      (!project.html || project.html.length < 100) &&
      !generating
    ) {
      runGenerate(project.prompt);
    }
  }, [project]);

  // Load project
  const loadProject = async () => {
    setLoading(true);
    setLoadError("");

    try {
      const res = await API.get(`/projects/${id}`);

      setProject(res.data.project);

      setProjectName(
        res.data.project.name || "Untitled Project"
      );
    } catch (err) {
      setLoadError(
        err.response?.data?.error ||
          "Failed to load project"
      );
    } finally {
      setLoading(false);
    }
  };

  // Generate / Refine website
  const runGenerate = async (promptText) => {
    if (generating) return;

    const trimmedPrompt = promptText.trim();

    if (!trimmedPrompt) return;

    const isFirstTime =
      !project?.html || project.html.length < 100;

    const cost = isFirstTime ? 5 : 2;

    // Check credits
    if ((user?.credits ?? 0) < cost) {
      toast.error(
        `You need at least ${cost} credits to modify the site!`
      );

      navigate("/pricing");
      return;
    }

    /*
      IMPORTANT:
      Show user's message immediately in the chat.
      We don't wait for the backend or AI response.
    */
    setProject((currentProject) => {
      if (!currentProject) {
        return currentProject;
      }

      return {
        ...currentProject,
        messages: [
          ...(currentProject.messages || []),
          {
            role: "user",
            text: trimmedPrompt,
          },
        ],
      };
    });

    setGenerating(true);

    try {
      const res = await API.post(
        `/projects/${id}/generate`,
        {
          prompt: trimmedPrompt,
        }
      );

      /*
        Backend returns the latest project.
        This contains:
        - user's prompt
        - AI response
        - updated HTML
      */
      setProject(res.data.project);

      // Update credits
      if (res.data.user) {
        updateUser(res.data.user);
      }

      toast.success("AI generated successfully!");
    } catch (err) {
      /*
        If AI generation fails, reload project
        so the temporary user message disappears.
      */
      try {
        const projectRes = await API.get(
          `/projects/${id}`
        );

        setProject(projectRes.data.project);
      } catch (reloadError) {
        console.error(
          "Failed to reload project:",
          reloadError
        );
      }

      toast.error(
        err.response?.data?.error ||
          "AI Generation failed"
      );
    } finally {
      setGenerating(false);
    }
  };

  // Save project changes
  const savePatch = async (fields) => {
    setSaving(true);
    setSaveError("");

    try {
      const res = await API.patch(
        `/projects/${id}`,
        fields
      );

      setProject(res.data.project);
      setSavedAt(new Date());
    } catch (err) {
      setSaveError(
        err.response?.data?.error ||
          "Autosave failed"
      );
    } finally {
      setSaving(false);
    }
  };

  // Download generated HTML
  const handleDownload = () => {
    if (!project?.html) {
      toast.error("No code generated yet");
      return;
    }

    const blob = new Blob(
      [project.html],
      {
        type: "text/html",
      }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = `${project.name
      .toLowerCase()
      .replace(/\s+/g, "-")}.html`;

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);

    toast.success(
      "index.html downloaded successfully!"
    );
  };

  // Publish / Unpublish project
  const handlePublish = async () => {
    if (!project) return;

    try {
      const res = await API.patch(
        `/projects/${id}`,
        {
          published: !project.published,
        }
      );

      setProject(res.data.project);

      toast.success(
        res.data.project.published
          ? "Published to Showcase!"
          : "Removed from Showcase!"
      );
    } catch (err) {
      toast.error(
        "Failed to toggle publish status"
      );
    }
  };

  // Submit chat prompt
  const handleChatSubmit = (e) => {
    e.preventDefault();

    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt || generating) {
      return;
    }

    // Clear input immediately
    setPrompt("");

    // Send prompt to AI
    runGenerate(trimmedPrompt);
  };

  // Format assistant messages
  const renderMessageContent = (text) => {
    if (!text) return null;

    const lines = text.split("\n");

    return lines.map((line, idx) => {
      const parts = line.split(
        /(\*\*.*?\*\*)/g
      );

      const content = parts.map(
        (part, pIdx) => {
          if (
            part.startsWith("**") &&
            part.endsWith("**")
          ) {
            return (
              <strong key={pIdx}>
                {part.slice(2, -2)}
              </strong>
            );
          }

          return part;
        }
      );

      if (
        line.trim().startsWith("* ") ||
        line.trim().startsWith("- ")
      ) {
        return (
          <li
            key={idx}
            className={s.bulletLine}
          >
            {line.trim().substring(2)}
          </li>
        );
      }

      return (
        <p
          key={idx}
          className={s.paragraphLine}
        >
          {content}
        </p>
      );
    });
  };

  // Loading screen
  if (loading) {
    return (
      <div className={s.centerScreen}>
        <Loader2
          className={s.spinIcon}
        />

        <p>
          Initializing sandbox canvas
          workspace...
        </p>
      </div>
    );
  }

  // Error screen
  if (loadError) {
    return (
      <div className={s.centerScreen}>
        <AlertCircle
          size={44}
          className={s.errorIcon}
        />

        <p className={s.errorText}>
          {loadError}
        </p>

        <button
          className={s.retryBtn}
          onClick={loadProject}
        >
          Retry Loading
        </button>

        <Link
          to="/dashboard"
          className={s.backLink}
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className={s.root}>
      {/* TOP BUILDER TOOLBAR */}

      <header className={s.topBar}>
        {/* LEFT SIDE */}

        <div className={s.toolbarLeft}>
          <Link
            to="/dashboard"
            className={s.backToDashboardBtn}
            title="Back to dashboard"
          >
            <ChevronLeft size={16} />

            <span>
              Dashboard
            </span>
          </Link>

          <div
            className={
              s.projectNameWrapper
            }
          >
            <input
              type="text"
              value={projectName}
              onChange={(e) =>
                setProjectName(
                  e.target.value
                )
              }
              className={
                s.projectNameInput
              }
              placeholder="Untitled Project"
            />

            <div className={s.saveStatus}>
              {saving ? (
                <span
                  className={
                    s.savingIndicator
                  }
                >
                  <Loader2
                    size={12}
                    className={s.spin}
                  />

                  Saving...
                </span>
              ) : savedAt ? (
                <span
                  className={
                    s.savedIndicator
                  }
                >
                  Saved at{" "}
                  {savedAt.toLocaleTimeString()}
                </span>
              ) : null}

              {saveError && (
                <span
                  className={
                    s.saveErrorIndicator
                  }
                >
                  {saveError}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* DEVICE SELECTORS */}

        <div className={s.toolbarCenter}>
          <button
            className={`${s.deviceBtn} ${
              device === "desktop"
                ? s.activeDevice
                : ""
            }`}
            onClick={() =>
              setDevice("desktop")
            }
            title="Desktop view"
          >
            <Monitor size={16} />
          </button>

          <button
            className={`${s.deviceBtn} ${
              device === "tablet"
                ? s.activeDevice
                : ""
            }`}
            onClick={() =>
              setDevice("tablet")
            }
            title="Tablet view"
          >
            <Tablet size={16} />
          </button>

          <button
            className={`${s.deviceBtn} ${
              device === "mobile"
                ? s.activeDevice
                : ""
            }`}
            onClick={() =>
              setDevice("mobile")
            }
            title="Mobile view"
          >
            <Smartphone size={16} />
          </button>
        </div>

        {/* ACTION BUTTONS */}

        <div className={s.toolbarRight}>
          <button
            className={s.actionBtn}
            onClick={handleDownload}
            title="Download code as index.html"
          >
            <Download size={15} />

            <span className={s.btnLabel}>
              Export Code
            </span>
          </button>

          <button
            className={`${s.actionBtn} ${
              project?.published
                ? s.publishedActiveBtn
                : ""
            }`}
            onClick={handlePublish}
            title={
              project?.published
                ? "Unpublish from showcase"
                : "Publish to public showcase"
            }
          >
            {project?.published ? (
              <EyeOff size={15} />
            ) : (
              <Eye size={15} />
            )}

            <span className={s.btnLabel}>
              {project?.published
                ? "Unpublish"
                : "Publish"}
            </span>
          </button>
        </div>
      </header>

      {/* MAIN WORKSPACE */}

      <div className={s.workspaceGrid}>
        {/* CHAT SIDEBAR */}

        <aside className={s.chatSidebar}>
          {/* CHAT HEADER */}

          <div className={s.chatHeader}>
            <Sparkles
              size={16}
              className={s.sparkIcon}
            />

            <div>
              <h3>
                AI Assistant
              </h3>

              <p className={s.costHint}>
                Edit / adjustment costs{" "}
                <strong>
                  2 credits
                </strong>
              </p>
            </div>

            <div
              className={
                s.userCreditsBadge
              }
            >
              <span>
                {user?.credits ?? 0} Credits
              </span>
            </div>
          </div>

          {/* CHAT MESSAGES */}

          <div
            className={
              s.chatMessagesWrapper
            }
          >
            {project?.messages?.map(
              (msg, index) => {
                const isUser =
                  msg.role === "user";

                return (
                  <div
                    key={index}
                    className={`${s.messageRow} ${
                      isUser
                        ? s.userMsgRow
                        : s.assistantMsgRow
                    }`}
                  >
                    <div
                      className={
                        s.messageBubble
                      }
                    >
                      <div
                        className={
                          s.messageSender
                        }
                      >
                        {isUser ? (
                          <User size={12} />
                        ) : (
                          <Bot size={12} />
                        )}

                        <span>
                          {isUser
                            ? "You"
                            : "Assistant"}
                        </span>
                      </div>

                      <div
                        className={
                          s.messageContent
                        }
                      >
                        {renderMessageContent(
                          msg.text
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
            )}

            {/* AI GENERATING MESSAGE */}

            {generating && (
              <div
                className={`${s.messageRow} ${s.assistantMsgRow}`}
              >
                <div
                  className={
                    s.messageBubble
                  }
                >
                  <div
                    className={
                      s.messageSender
                    }
                  >
                    <Bot size={12} />

                    <span>
                      AI is generating...
                    </span>
                  </div>

                  <div
                    className={
                      s.typingIndicator
                    }
                  >
                    <span
                      className={s.dot}
                    />

                    <span
                      className={s.dot}
                    />

                    <span
                      className={s.dot}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* CHAT INPUT */}

          <form
            onSubmit={handleChatSubmit}
            className={s.chatInputForm}
          >
            <input
              type="text"
              placeholder="Ask AI to change styling, add cards, change colors..."
              value={prompt}
              onChange={(e) =>
                setPrompt(
                  e.target.value
                )
              }
              className={s.chatInput}
              disabled={generating}
            />

            <button
              type="submit"
              disabled={
                generating ||
                !prompt.trim()
              }
              className={s.chatSendBtn}
            >
              <Send size={15} />
            </button>
          </form>
        </aside>

        {/* WEBSITE PREVIEW */}

        <main className={s.renderCanvas}>
          <div
            className={`${s.canvasViewport} ${
              s[device + "Viewport"]
            }`}
          >
            {project?.html ? (
              <iframe
                title={project.name}
                srcDoc={project.html}
                className={
                  s.renderedIframe
                }
                sandbox="allow-scripts allow-same-origin allow-modals allow-popups"
              />
            ) : (
              <div
                className={
                  s.canvasEmptyState
                }
              >
                <Sparkles
                  size={40}
                  className={
                    s.spinnerLarge
                  }
                />

                <h3>
                  Assembling responsive
                  HTML & CSS...
                </h3>

                <p>
                  Generating project
                  assets from your
                  prompt using AI.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}