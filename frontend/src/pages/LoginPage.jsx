import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthShell from "../components/AuthShell.jsx";
import { useAuth } from "../context/authContext.jsx";
import { login } from "../utils/api.js";
import s from "../styles/LoginPage.module.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [searchParams] = useSearchParams();

  // Get parameters passed from other pages
  const initialEmail = searchParams.get("email") || "";
  const initialPrompt = searchParams.get("prompt") || "";

  const [form, setForm] = useState({
    email: initialEmail,
    password: ""
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  // Prefill email if it is provided in the URL
  useEffect(() => {
    if (initialEmail) {
      setForm((prev) => ({
        ...prev,
        email: initialEmail
      }));
    }
  }, [initialEmail]);

  // Input change handler
  const update = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: undefined
    }));

    setSubmitError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const er = {};

    // Client-side validation
    if (!form.email.includes("@")) {
      er.email = "Enter a valid email.";
    }

    if (form.password.length < 6) {
      er.password = "Password must be at least 6 characters.";
    }

    setErrors(er);

    if (Object.keys(er).length > 0) {
      return;
    }

    setLoading(true);
    setSubmitError("");

    try {
      // Login API
      const res = await login(form);

      const { token, user } = res;

      // Store authenticated user/session
      loginUser(token, user);

      // Redirect to dashboard
      if (initialPrompt) {
        navigate(
          `/dashboard?prompt=${encodeURIComponent(initialPrompt)}`
        );
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const data = err.response?.data || {};

      setSubmitError(
        data.error ||
        data.message ||
        "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Sign In"
      subtitle="Enter your email below to log in to your account."
      footer={
        <>
          Don't have an account?{" "}
          <Link
            to="/register"
            className={s.signupLink}
          >
            Sign Up
          </Link>
        </>
      }
    >
      <form
        onSubmit={handleSubmit}
        className={s.form}
      >
        {/* Email */}
        <div className={s.inputGroup}>
          <label className={s.label}>
            Email
          </label>

          <input
            type="email"
            placeholder="me@example.com"
            value={form.email}
            onChange={update("email")}
            className={`${s.input} ${
              errors.email ? s.inputError : ""
            }`}
            autoComplete="email"
          />

          {errors.email && (
            <p className={s.errorText}>
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div className={s.inputGroup}>
          <label className={s.label}>
            Password
          </label>

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={update("password")}
            className={`${s.input} ${
              errors.password ? s.inputError : ""
            }`}
            autoComplete="current-password"
          />

          {errors.password && (
            <p className={s.errorText}>
              {errors.password}
            </p>
          )}
        </div>

        {/* Submission Error */}
        {submitError && (
          <p className={s.submitError}>
            {submitError}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={s.submitButton}
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </AuthShell>
  );
}