import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Sparkles, 
  Download, 
  Globe, 
  ChevronLeft, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Send, 
  Loader2, 
  Check, 
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Bot
} from "lucide-react";
import { useAuth } from "../context/authContext.jsx";
import { API } from "../utils/api.js";
import toast from "react-hot-toast";
import s from "../styles/BuilderPage.module.css";

export default function BuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  // State Management
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  
  const [device, setDevice] = useState("desktop"); // desktop, tablet, mobile
  const [projectName, setProjectName] = useState("");
  const [prompt, setPrompt] = useState("");
  
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [saveError, setSaveError] = useState("");

  // Modals Visibility
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);

  // Modal Inputs
  const [githubToken, setGithubToken] = useState(localStorage.getItem("github_token") || "");
  const [githubRepo, setGithubRepo] = useState("");
  const [githubBusy, setGithubBusy] = useState(false);
  const [githubResult, setGithubResult] = useState(null);
  const [rememberGithub, setRememberGithub] = useState(true);

  const [vercelToken, setVercelToken] = useState(localStorage.getItem("vercel_token") || "");
  const [vercelBusy, setVercelBusy] = useState(false);
  const [vercelResult, setVercelResult] = useState(null);
  const [rememberVercel, setRememberVercel] = useState(true);

  const chatEndRef = useRef(null);

  // Fetch Project on Mount
  useEffect(() => {
    loadProject();
  }, [id]);

  // Scroll Chat to Bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [project?.messages, generating]);

  // Auto-Save Project Name after typing finishes (debounce)
  useEffect(() => {
    if (!project || projectName === project.name) return;
    const timer = setTimeout(() => {
      savePatch({ name: projectName });
    }, 1500);
    return () => clearTimeout(timer);
  }, [projectName]);

  // Initial Run: If project has no HTML, trigger initial generate
  useEffect(() => {
    if (project && (!project.html || project.html.length < 100) && !generating) {
      runGenerate(project.prompt);
    }
  }, [project]);

  const loadProject = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await API.get(`/projects/${id}`);
      setProject(res.data.project);
      setProjectName(res.data.project.name || "Untitled Project");
      setGithubRepo(res.data.project.name.toLowerCase().replace(/[^a-z0-9-_]/g, "-"));
    } catch (err) {
      setLoadError(
        err.response?.data?.error || 
        "Failed to load project over here"
      );
    } finally {
      setLoading(false);
    }
  };

  // Generate / Refine Code with AI Assistant
  const runGenerate = async (promptText) => {
    if (generating) return;
    const isFirstTime = !project?.html || project.html.length < 100;
    const cost = isFirstTime ? 5 : 2;

    if ((user?.credits ?? 0) < cost) {
      toast.error(`You need at least ${cost} credits to modify the site over here!`);
      navigate("/pricing");
      return;
    }

    setGenerating(true);
    try {
      const res = await API.post(`/projects/${id}/generate`, { prompt: promptText });
      setProject(res.data.project);
      if (res.data.user) {
        updateUser(res.data.user);
      }
      toast.success("AI generated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.error || "AI Generation failed over here");
    } finally {
      setGenerating(false);
    }
  };

  // Safe patch update utility
  const savePatch = async (fields) => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await API.patch(`/projects/${id}`, fields);
      setProject(res.data.project);
      setSavedAt(new Date());
    } catch (err) {
      setSaveError(err.response?.data?.error || "Autosave failed over here");
    } finally {
      setSaving(false);
    }
  };

  // HTML Downloader Utility
  const handleDownload = () => {
    if (!project?.html) {
      toast.error("No code generated yet over here");
      return;
    }
    const blob = new Blob([project.html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/\s+/g, "-")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("index.html downloaded successfully!");
  };

  // Handle Publish/Unpublish toggle
  const handlePublish = async () => {
    if (!project) return;
    try {
      const res = await API.patch(`/projects/${id}`, { published: !project.published });
      setProject(res.data.project);
      toast.success(
        res.data.project.published 
          ? "Published to Showcase over here!" 
          : "Removed from Showcase over here!"
      );
    } catch (err) {
      toast.error("Failed to toggle publish status over here");
    }
  };

  // GitHub Commit Integration
  const handleGithubUpload = async (e) => {
    e.preventDefault();
    if (!githubToken.trim() || !githubRepo.trim()) {
      toast.error("Both parameters are required over here");
      return;
    }

    setGithubBusy(true);
    setGithubResult(null);
    try {
      const res = await API.post(`/projects/${id}/github`, {
        token: githubToken.trim(),
        repoName: githubRepo.trim()
      });
      setGithubResult({ success: true, url: res.data.pagesUrl || res.data.url });
      toast.success("Successfully uploaded to GitHub!");
      if (rememberGithub) {
        localStorage.setItem("github_token", githubToken.trim());
      } else {
        localStorage.removeItem("github_token");
      }
    } catch (err) {
      setGithubResult({ success: false, error: err.response?.data?.error || "Upload failed over here" });
    } finally {
      setGithubBusy(false);
    }
  };

  // Vercel hosting integration
  const handleVercelDeploy = async (e) => {
    e.preventDefault();
    if (!vercelToken.trim()) {
      toast.error("Vercel token is required over here");
      return;
    }

    setVercelBusy(true);
    setVercelResult(null);
    try {
      const res = await API.post(`/projects/${id}/deploy`, { token: vercelToken.trim() });
      setVercelResult({ success: true, url: res.data.url });
      toast.success("Successfully deployed to Vercel!");
      
      // Update local state deployURL
      setProject(prev => prev ? { ...prev, deployURL: res.data.url } : null);

      if (rememberVercel) {
        localStorage.setItem("vercel_token", vercelToken.trim());
      } else {
        localStorage.removeItem("vercel_token");
      }
    } catch (err) {
      setVercelResult({ success: false, error: err.response?.data?.error || "Deployment failed over here" });
    } finally {
      setVercelBusy(false);
    }
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim() || generating) return;
    runGenerate(prompt.trim());
    setPrompt("");
  };

  // Text Renderer helper to parse bold, paragraphs & bullet points
  const renderMessageContent = (text) => {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let content = line;
      // Bold Markdown check: **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      if (boldRegex.test(line)) {
        const parts = line.split(boldRegex);
        content = parts.map((part, pIdx) => idx % 2 !== 0 ? <strong key={pIdx}>{part}</strong> : part);
      }
      
      if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
        return <li key={idx} className={s.bulletLine}>{line.trim().substring(2)}</li>;
      }
      return <p key={idx} className={s.paragraphLine}>{content}</p>;
    });
  };

  // Loading & Error Screens
  if (loading) {
    return (
      <div className={s.centerScreen}>
        <Loader2 className={s.spinIcon} />
        <p>Initializing sandbox canvas workspace over here...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={s.centerScreen}>
        <AlertCircle size={44} className={s.errorIcon} />
        <p className={s.errorText}>{loadError}</p>
        <button className={s.retryBtn} onClick={loadProject}>Retry Loading</button>
        <Link to="/dashboard" className={s.backLink}>Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className={s.root}>
      {/* 1. TOP BUILDER TOOLBAR */}
      <header className={s.topBar}>
        <div className={s.toolbarLeft}>
          <Link to="/dashboard" className={s.backToDashboardBtn} title="Back to dashboard over here">
            <ChevronLeft size={16} />
            <span>Dashboard</span>
          </Link>
          <div className={s.projectNameWrapper}>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className={s.projectNameInput}
              placeholder="Untitled Project"
            />
            <div className={s.saveStatus}>
              {saving ? (
                <span className={s.savingIndicator}><Loader2 size={12} className={s.spin} /> Saving...</span>
              ) : savedAt ? (
                <span className={s.savedIndicator}>Saved at {savedAt.toLocaleTimeString()}</span>
              ) : null}
              {saveError && <span className={s.saveErrorIndicator}>{saveError}</span>}
            </div>
          </div>
        </div>

        {/* Responsive viewport device selectors */}
        <div className={s.toolbarCenter}>
          <button 
            className={`${s.deviceBtn} ${device === "desktop" ? s.activeDevice : ""}`} 
            onClick={() => setDevice("desktop")}
            title="Desktop view"
          >
            <Monitor size={16} />
          </button>
          <button 
            className={`${s.deviceBtn} ${device === "tablet" ? s.activeDevice : ""}`} 
            onClick={() => setDevice("tablet")}
            title="Tablet view"
          >
            <Tablet size={16} />
          </button>
          <button 
            className={`${s.deviceBtn} ${device === "mobile" ? s.activeDevice : ""}`} 
            onClick={() => setDevice("mobile")}
            title="Mobile view"
          >
            <Smartphone size={16} />
          </button>
        </div>

        {/* Integration Actions */}
        <div className={s.toolbarRight}>
          <button className={s.actionBtn} onClick={handleDownload} title="Download code as raw index.html over here">
            <Download size={15} />
            <span className={s.btnLabel}>Export Code</span>
          </button>
          <button className={s.actionBtn} onClick={() => setShowGithubModal(true)} title="Publish to GitHub over here">
            <Github size={15} />
            <span className={s.btnLabel}>GitHub</span>
          </button>
          <button className={s.actionBtn} onClick={() => setShowDeployModal(true)} title="Deploy live static URL with Vercel over here">
            <Globe size={15} />
            <span className={s.btnLabel}>Vercel</span>
          </button>
          <button 
            className={`${s.actionBtn} ${project?.published ? s.publishedActiveBtn : ""}`} 
            onClick={handlePublish}
            title={project?.published ? "Unpublish from showcase over here" : "Publish to public showcase over here"}
          >
            {project?.published ? <EyeOff size={15} /> : <Eye size={15} />}
            <span className={s.btnLabel}>{project?.published ? "Unpublish" : "Publish"}</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN LAYOUT AREA */}
      <div className={s.workspaceGrid}>
        
        {/* LEFT COLUMN: CHAT WORKSPACE */}
        <aside className={s.chatSidebar}>
          <div className={s.chatHeader}>
            <Sparkles size={16} className={s.sparkIcon} />
            <div>
              <h3>AI Assistant</h3>
              <p className={s.costHint}>Edit / adjustment costs <strong>2 credits</strong></p>
            </div>
            <div className={s.userCreditsBadge}>
              <span>{user?.credits ?? 0} Credits</span>
            </div>
          </div>

          <div className={s.chatMessagesWrapper}>
            {project?.messages?.map((msg, index) => {
              const isUser = msg.role === "user";
              return (
                <div key={index} className={`${s.messageRow} ${isUser ? s.userMsgRow : s.assistantMsgRow}`}>
                  <div className={s.messageBubble}>
                    <div className={s.messageSender}>
                      {isUser ? <User size={12} /> : <Bot size={12} />}
                      <span>{isUser ? "You" : "Assistant"}</span>
                    </div>
                    <div className={s.messageContent}>
                      {renderMessageContent(msg.text)}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {generating && (
              <div className={`${s.messageRow} ${s.assistantMsgRow}`}>
                <div className={s.messageBubble}>
                  <div className={s.messageSender}>
                    <Bot size={12} />
                    <span>AI is generating...</span>
                  </div>
                  <div className={s.typingIndicator}>
                    <span className={s.dot} />
                    <span className={s.dot} />
                    <span className={s.dot} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleChatSubmit} className={s.chatInputForm}>
            <input
              type="text"
              placeholder="Ask AI to change styling, add cards, change colors..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className={s.chatInput}
              disabled={generating}
            />
            <button type="submit" disabled={generating || !prompt.trim()} className={s.chatSendBtn}>
              <Send size={15} />
            </button>
          </form>
        </aside>

        {/* RIGHT COLUMN: CODE RENDER CANVAS */}
        <main className={s.renderCanvas}>
          <div className={`${s.canvasViewport} ${s[device + "Viewport"]}`}>
            {project?.html ? (
              <iframe
                title={project.name}
                srcDoc={project.html}
                className={s.renderedIframe}
                sandbox="allow-scripts allow-same-origin allow-modals allow-popups"
              />
            ) : (
              <div className={s.canvasEmptyState}>
                <Sparkles size={40} className={s.spinnerLarge} />
                <h3>Assembling responsive HTML & CSS over here...</h3>
                <p>Generating project assets from your prompt using AI.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 3. GITHUB PUBLISH MODAL */}
      {showGithubModal && (
        <div className={s.modalBackdrop}>
          <div className={s.modalCard}>
            <div className={s.modalHeader}>
              <div className={s.modalTitleRow}>
                <Github size={18} />
                <h2>Publish repo to GitHub</h2>
              </div>
              <button className={s.closeModalBtn} onClick={() => { setShowGithubModal(false); setGithubResult(null); }}>&times;</button>
            </div>

            {githubResult?.success ? (
              <div className={s.modalSuccessView}>
                <Check size={40} className={s.successIcon} />
                <h3>Successfully Uploaded!</h3>
                <p>Your codebase is live on GitHub and Page builds are deploying.</p>
                <a href={githubResult.url} target="_blank" rel="noreferrer" className={s.resultLinkBtn}>
                  Visit Repository
                </a>
              </div>
            ) : (
              <form onSubmit={handleGithubUpload} className={s.modalForm}>
                <div className={s.inputGroup}>
                  <label className={s.modalLabel}>GitHub Personal Access Token (PAT)</label>
                  <input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    className={s.modalInput}
                    required
                  />
                  <span className={s.fieldHint}>Needs "repo" scopes to create repos and deploy Pages over here.</span>
                </div>

                <div className={s.inputGroup}>
                  <label className={s.modalLabel}>Repository Name</label>
                  <input
                    type="text"
                    placeholder="my-ai-landing-page"
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, "-"))}
                    className={s.modalInput}
                    required
                  />
                </div>

                <div className={s.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="remember_github"
                    checked={rememberGithub}
                    onChange={(e) => setRememberGithub(e.target.checked)}
                  />
                  <label htmlFor="remember_github">Remember Token locally in browser</label>
                </div>

                {githubResult?.error && <p className={s.modalError}>{githubResult.error}</p>}

                <button type="submit" disabled={githubBusy} className={s.modalSubmitBtn}>
                  {githubBusy ? <Loader2 className={s.spin} size={16} /> : "Publish Repository"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 4. VERCEL DEPLOYMENT MODAL */}
      {showDeployModal && (
        <div className={s.modalBackdrop}>
          <div className={s.modalCard}>
            <div className={s.modalHeader}>
              <div className={s.modalTitleRow}>
                <Globe size={18} />
                <h2>Deploy live with Vercel</h2>
              </div>
              <button className={s.closeModalBtn} onClick={() => { setShowDeployModal(false); setVercelResult(null); }}>&times;</button>
            </div>

            {vercelResult?.success ? (
              <div className={s.modalSuccessView}>
                <Check size={40} className={s.successIcon} />
                <h3>Successfully Deployed!</h3>
                <p>Your landing page is now live globally on Vercel Edge networks over here.</p>
                <a href={vercelResult.url} target="_blank" rel="noreferrer" className={s.resultLinkBtn}>
                  Visit Live Site
                </a>
              </div>
            ) : (
              <form onSubmit={handleVercelDeploy} className={s.modalForm}>
                <div className={s.inputGroup}>
                  <label className={s.modalLabel}>Vercel Personal Access Token</label>
                  <input
                    type="password"
                    placeholder="Token"
                    value={vercelToken}
                    onChange={(e) => setVercelToken(e.target.value)}
                    className={s.modalInput}
                    required
                  />
                  <span className={s.fieldHint}>Obtain from Account settings token list inside Vercel over here.</span>
                </div>

                <div className={s.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="remember_vercel"
                    checked={rememberVercel}
                    onChange={(e) => setRememberVercel(e.target.checked)}
                  />
                  <label htmlFor="remember_vercel">Remember Token locally in browser</label>
                </div>

                {vercelResult?.error && <p className={s.modalError}>{vercelResult.error}</p>}

                <button type="submit" disabled={vercelBusy} className={s.modalSubmitBtn}>
                  {vercelBusy ? <Loader2 className={s.spin} size={16} /> : "Trigger Deployment"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );

}
