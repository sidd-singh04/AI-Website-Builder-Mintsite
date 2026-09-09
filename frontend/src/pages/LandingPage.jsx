import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  ChevronRight,
  ArrowRight,
  Shield,
  Layers,
  Code,
  Globe,
  Zap,
  Wand2,
} from "lucide-react";

import { useAuth } from "../context/authContext.jsx";
import { PageBackdrop } from "../assets/UI.jsx";
import Footer from "../components/Footer.jsx";
import s from "../styles/LandingPage.module.css";

const featuresData = [
  {
    icon: Wand2,
    title: "AI Website Generation",
    description:
      "Describe your website idea in natural language and let MintSite generate a complete website using AI.",
    tint: "rgba(168, 85, 247, 0.12)",
    color: "#a855f7",
  },
  {
    icon: Layers,
    title: "AI-Powered Refinement",
    description:
      "Continue chatting with the AI to refine your generated website, update its design, content, and layout.",
    tint: "rgba(99, 102, 241, 0.12)",
    color: "#6366f1",
  },
  {
    icon: Code,
    title: "Code Export",
    description:
      "Download your generated website as a standalone HTML file and use the code anywhere you want.",
    tint: "rgba(16, 185, 129, 0.12)",
    color: "#10b981",
  },
  {
    icon: Shield,
    title: "Project Dashboard",
    description:
     "  Keep all your generated websites organized and continue working on them from one dashboard.",
    tint: "rgba(59, 130, 246, 0.12)",
    color: "#3b82f6",
  },
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

      {/* ==================== HERO SECTION ==================== */}
      <section className={s.heroSection}>
        <div className={s.heroInner}>
          {/* Free Credits Badge */}
          <button className={s.trialBadge} onClick={() => navigate("/pricing")}>
            <span className={s.trialBadgeNew}>NEW</span>

            <span className={s.trialBadgeText}>
              Try 20 Free Credits on sign-up
            </span>

            <ChevronRight size={14} className={s.trialBadgeIcon} />
          </button>

          {/* Hero Heading */}
          <h1 className={s.heroTitle}>
            Turn thoughts into
            <br />
            instantly shipped{" "}
            <span className={s.heroTitleHighlight}>AI Websites</span>
          </h1>

          {/* Hero Description */}
          <p className={s.heroSub}>
            Describe your idea and let AI turn it into a professional website.
            Create, customize, and refine with ease.
          </p>

          {/* AI Prompt Input */}
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

      {/* ==================== FEATURES SECTION ==================== */}
      <section className={s.featureSection}>
        <div className={s.featureInner}>
          {/* Feature Header */}
          <div className={s.featureHeader}>
            <p className={s.featureBadge}>FEATURES</p>

            <h2 className={s.featureTitle}>
              Everything you need to{" "}
              <span className={s.featureTitleHighlighted}>Ship</span>
            </h2>

            <p className={s.featureSub}>
              A complete toolkit for designing, refining, and publishing modern
              responsive websites without leaving your browser.
            </p>
          </div>

          {/* Features Grid */}
          <div className={s.featuresGrid}>
            {featuresData.map((item) => {
              const IconComponent = item.icon;

              return (
                <div key={item.title} className={s.featureCard}>
                  <div
                    className={s.featureIconWrapper}
                    style={{
                      backgroundColor: item.tint,
                    }}
                  >
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

      {/* ==================== CTA SECTION ==================== */}
      <section className={s.ctaSection}>
        <div className={s.ctaBackground}>
          <div className={s.ctaInner}>
            {/* Free Credits Badge */}
            <div className={s.ctaFreeBadge}>
              <Sparkles size={14} className={s.ctaFreeBadgeIcon} />

              <span>20 Free Credits on sign-up</span>
            </div>

            {/* CTA Heading */}
            <h2 className={s.ctaTitle}>
              Stop wireframing,
              <br />
              start <span className={s.ctaTitleHighlighted}>shipping</span>
            </h2>

            {/* CTA Description */}
            <p className={s.ctaSub}>
              Your first 20 credits are fully on us—perfectly sufficient to
              generate 4 complete websites or complete 10 real-time adjustments.
              No credit card required.
            </p>

            {/* CTA Button */}
            <button
              className={s.ctaButton}
              onClick={() => navigate(isAuth ? "/dashboard" : "/register")}
            >
              <span>
                {isAuth ? "Go to Dashboard" : "Create Your First Site"}
              </span>

              <ArrowRight size={16} className={s.ctaButtonIcon} />
            </button>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <Footer />
    </div>
  );
}
