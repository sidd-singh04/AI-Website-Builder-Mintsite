import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ChevronRight, ArrowRight, Shield, Layers, Code, Globe, Zap, Wand2 } from "lucide-react";
import { useAuth } from "../context/authContext.jsx";
import { PageBackdrop } from "../assets/UI.jsx";
import Footer from "../components/Footer.jsx";
import s from "../styles/LandingPage.module.css";

const featuresData = [
  {
    icon: Wand2,
    title: "AI Site Generation",
    description: "Describe what you want and watch our advanced AI engine write clean, component-driven HTML and CSS in real time.",
    tint: "rgba(168, 85, 247, 0.12)",
    color: "#a855f7"
  },
  {
    icon: Layers,
    title: "Live Refinement & Editing",
    description: "Don't stop at the initial build. Chat directly with the AI assistant to modify colors, structural grid styles, or fonts dynamically.",
    tint: "rgba(99, 102, 241, 0.12)",
    color: "#6366f1"
  },
  {
    icon: Shield,
    title: "Protected Analytics",
    description: "Track unique view sessions and authentic social likes across the community database, strictly free of artificial stat inflation.",
    tint: "rgba(59, 130, 246, 0.12)",
    color: "#3b82f6"
  },
  {
    icon: Code,
    title: "Clean Code Exporting",
    description: "Fully compiled raw index.html codes can be instantly downloaded as static pages, fully clean of complex system dependencies.",
    tint: "rgba(16, 185, 129, 0.12)",
    color: "#10b981"
  },
  {
    icon: Globe,
    title: "Vercel Hosting Pipelines",
    description: "Deploy and go live in seconds! Host static landing pages directly through live production instances of Vercel.",
    tint: "rgba(245, 158, 11, 0.12)",
    color: "#f59e0b"
  },
  {
    icon: Zap,
    title: "GitHub Repository Syncs",
    description: "Publish code directly to your personal GitHub repository, with optional GitHub Pages setup fully configured.",
    tint: "rgba(236, 72, 153, 0.12)",
    color: "#ec4899"
  }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const isAuth = Boolean(user);

  const handleCreate = (e) => {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed) return;

    if (isAuth) {
      navigate(`/dashboard?prompt=${encodeURIComponent(trimmed)}`);
    } else {
      navigate(`/register?prompt=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div className={s.container}>
      <PageBackdrop />

      {/* 1. HERO SECTION */}
      <section className={s.heroSection}>
        <div className={s.heroInner}>
          <button className={s.trialBadge} onClick={() => navigate("/pricing")}>
            <span className={s.trialBadgeNew}>NEW</span>
            <span className={s.trialBadgeText}>Try 20 Free Credits on sign-up</span>
            <ChevronRight size={14} className={s.trialBadgeIcon} />
          </button>


  <h1 className={s.heroTitle}>
  Turn thoughts into
  <br />
  instantly shipped{" "}
  <span className={s.heroTitleHighlight}>AI Websites</span>
</h1>

          <p className={s.heroSub}>
            Create, customize, and publish professional websites faster than ever with MintSite's modular AI layout constructor.
          </p>

          <form className={s.heroInputWrapper} onSubmit={handleCreate}>
            <input
              type="text"
              placeholder="e.g. A gorgeous dark portfolio for a MERN stack developer..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className={s.heroInput}
            />
            <button type="submit" className={s.heroSubmitBtn}>
              <Sparkles size={16} />
              <span>Create with AI</span>
            </button>
          </form>

        
        </div>
      </section>

      {/* 2. FEATURES GRID SECTION */}
      <section className={s.featureSection}>
        <div className={s.featureInner}>
          <div className={s.featureHeader}>
            <p className={s.featureBadge}>FEATURES</p>
            <h2 className={s.featureTitle}>
              Everything you need to <span className={s.featureTitleHighlighted}>Ship</span>
            </h2>
            <p className={s.featureSub}>
              A complete toolkit for designing, refining, and publishing modern responsive websites without leaving your browser.
            </p>
          </div>

          <div className={s.featuresGrid}>
            {featuresData.map((item) => {
              const IconComponent = item.icon;
              return (
                <div key={item.title} className={s.featureCard}>
                  <div className={s.featureIconWrapper} style={{ backgroundColor: item.tint }}>
                    <IconComponent size={24} color={item.color} />
                  </div>
                  <h3 className={s.featureCardTitle}>{item.title}</h3>
                  <p className={s.featureCardDescription}>{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. CTA SECTION */}
      <section className={s.ctaSection}>
        <div className={s.ctaBackground}>
          <div className={s.ctaInner}>
            <div className={s.ctaFreeBadge}>
              <Sparkles size={14} className={s.ctaFreeBadgeIcon} />
              <span>20 Free Credits on sign-up</span>
            </div>

            <h2 className={s.ctaTitle}>
              Stop wireframing,<br />start <span className={s.ctaTitleHighlighted}>shipping</span>
            </h2>

            <p className={s.ctaSub}>
              Your first 20 credits are fully on us—perfectly sufficient to generate 4 complete websites or complete 10 real-time adjustments. No credit card required.
            </p>

            <button className={s.ctaButton} onClick={() => navigate(isAuth ? "/dashboard" : "/register")}>
              <span>{isAuth ? "Go to Dashboard" : "Create Your First Site"}</span>
              <ArrowRight size={16} className={s.ctaButtonIcon} />
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
