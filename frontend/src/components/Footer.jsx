import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Sparkles } from "lucide-react";

import { Logo } from "../assets/ui.jsx";
import s from "../styles/Footer.module.css";

const footerLinks = [
  { label: "Community", to: "/community" },
  { label: "Pricing", to: "/pricing" },
  { label: "Terms of Service", to: "#" },
  { label: "Privacy Policy", to: "#" },
];

export default function Footer() {
  return (
    <footer className={s.footer}>
      {/* Background Glow */}
      <div className={s.glow}></div>

      <div className={s.inner}>
        {/* =========================
            TOP SECTION
        ========================= */}
        <div className={s.top}>
          {/* Brand */}
          <div className={s.brand}>
            <Link to="/" className={s.logoLink}>
              <Logo />
            </Link>

            <p className={s.brandText}>
              Turn your ideas into professional websites with the power of AI.
            </p>

            <div className={s.aiBadge}>
              <Sparkles size={13} />
              <span>Powered by AI</span>
            </div>
          </div>

          {/* Navigation */}
          <div className={s.navigation}>
            <p className={s.navTitle}>Explore</p>

            <nav className={s.nav}>
              {footerLinks.map((link) => (
                <Link key={link.label} to={link.to} className={s.navLink}>
                  <span>{link.label}</span>
                  <ArrowUpRight size={13} className={s.navIcon} />
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* =========================
            DIVIDER
        ========================= */}
        <div className={s.divider}></div>

        {/* =========================
            BOTTOM SECTION
        ========================= */}
        <div className={s.bottom}>
          <p className={s.copyright}>
            © {new Date().getFullYear()} MintSite. All rights reserved.
          </p>

          <p className={s.madeWith}>
            Built for creators who want to <span>build smarter.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
