import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../utils/api.js"; // Standard Axios client instance

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Synchronize authentication state on initial page render
  useEffect(() => {
    async function initAuth() {
      try {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (token && savedUser) {
          // Instantly hydrate UI with cached user details while validating
          setUser(JSON.parse(savedUser));
          
          // Request fresh user profile info (e.g. credits, name changes)
          const res = await API.get("/auth/me");
          if (res.data && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem("user", JSON.stringify(res.data.user));
          }
        }
      } catch (err) {
        // Clear corrupt, invalid, or expired sessions
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    
    initAuth();
  }, []);

  // Login handler
  const loginUser = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  // Logout handler
  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // Profile and credit score updates
  const updateUser = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      localStorage.removeItem("user");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginUser,
        logoutUser,
        updateUser,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom React hook for clean usage
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider over here");
  }
  return context;
};
