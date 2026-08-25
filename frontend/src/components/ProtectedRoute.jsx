import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0a0a0c",
        color: "#ffffff",
        gap: "1rem"
      }}>
        <Loader2 size={40} style={{ animation: "spin 1s linear infinite", color: "#a855f7" }} />
        <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "14.5px" }}>Verifying your session over here...</p>
        <style>{`
          @keyframes spin {
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}