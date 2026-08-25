import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { Logo, PageBackdrop } from "../assets/UI.jsx";
import s from "../styles/NotFoundPage.module.css";

export default function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className={s.container}>
      <PageBackdrop />
      
      <header className={s.header}>
        <Logo />
      </header>

      <main className={s.main}>
        <div className={s.card}>
          <div className={s.badge}>ERROR 404</div>
          <h1 className={s.number}>404</h1>
          <h2 className={s.title}>This page wandered off</h2>
          <p className={s.description}>
            The page you are looking for doesn't exist, but we can build something better together over here.
          </p>

          <div className={s.buttonGroup}>
            <Link to="/" className={s.primaryButton}>
              <Home size={16} className={s.icon} />
              <span>Back Home</span>
            </Link>
            
            <button onClick={handleGoBack} className={s.secondaryButton}>
              <ArrowLeft size={16} className={s.icon} />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}