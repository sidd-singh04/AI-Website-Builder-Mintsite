import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import CommunityPage from "./pages/CommunityPage.jsx";
import PricingPage from "./pages/PricingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import VerifyEmailPage from "./pages/VerifyEmailPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import BuilderPage from "./pages/BuilderPage.jsx";
import PreviewPage from "./pages/PreviewPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import { Toaster } from "react-hot-toast";

export default function App() {
  const { pathname } = useLocation();

  // Pages where standard Navbar should NOT be shown (Canvas screens or custom Shells)
  const hideNavbarList = [
    "/login", 
    "/register", 
    "/verify-email", 
    "/forgot-password",
    "/project", 
    "/preview"
  ];
  
  const shouldHideNavbar = hideNavbarList.some(path => pathname.startsWith(path));

  return (
    <>
      <ScrollToTop />
      <Toaster position="top-right" reverseOrder={false} />
      {!shouldHideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/project/:id" element={<ProtectedRoute><BuilderPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        
        {/* Public Canvas Previews */}
        <Route path="/preview/:id" element={<PreviewPage />} />
        
        {/* Not Found Catchall */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}