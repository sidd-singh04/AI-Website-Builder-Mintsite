import React from "react";
import { Link } from "react-router-dom";
import { Logo } from "../assets/UI.jsx";
import s from "../styles/Footer.module.css";

const footerLinks = [
  { label: "Community", to: "/community" },
  { label: "Pricing", to: "/pricing" },
  { label: "Terms of Service", to: "#" },
  { label: "Privacy Policy", to: "#" }
];

export default function Footer() {
  return (
    <footer className={s.footer}>
      <div className={s.inner}>
        {/* Brand Column */}
        <div className={s.brand}>
          <Logo />
          <p className={s.brandText}>
            Turns thoughts into fully responsive websites instantly with the power of AI.
          </p>
        </div>

        {/* Navigation Column */}
        <nav className={s.nav}>
          {footerLinks.map((link) => (
            <Link key={link.label} to={link.to} className={s.navLink}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Copyright */}
        <p className={s.copyright}>
          &copy; {new Date().getFullYear()} MintSite. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
