import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Logo, PageBackdrop } from "../assets/ui.jsx";
import s from "../styles/AuthShell.module.css";

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className={s.container}>
      <PageBackdrop />
      <header className={s.header}>
        <Logo />
        <Link to="/" className={s.backLink}>
          <ArrowLeft size={16} className={s.backIcon} />
          <span>Back Home</span>
        </Link>
      </header>

      <main className={s.main}>
        <div className={s.inner}>
          <div className={s.card}>
            <h1 className={s.title}>{title}</h1>
            <p className={s.subtitle}>{subtitle}</p>
            {children}
            {footer && <div className={s.footer}>{footer}</div>}
          </div>
        </div>
      </main>
    </div>
  );
}
