import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import AuthShell from "../components/AuthShell.jsx";
import { useAuth } from "../context/authContext.jsx";
import { login } from "../utils/api.js";
import s from "../styles/LoginPage.module.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [searchParams] = useSearchParams();

  // Retrieve parameters passed during registration/email verification redirects
  const initialEmail = searchParams.get("email") || "";
  const justVerified = searchParams.get("verified") === "1";
  const initialPrompt = searchParams.get("prompt") || "";

  const [form, setForm] = useState({
    email: initialEmail,
    password: ""
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  // Prefill email if it changes in search parameters
  useEffect(() => {
    if (initialEmail) {
      setForm((prev) => ({
        ...prev,
        email: initialEmail
      }));
    }
  }, [initialEmail]);

  // Generic input change handler
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

    // Stop if validation fails
    if (Object.keys(er).length > 0) {
      return;
    }

    setLoading(true);
    setSubmitError("");

    try {
      // api.js handles:
      // POST /api/auth/login
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
      const status = err.response?.status;
      const data = err.response?.data || {};

      // User exists but email is not verified
      if (
        status === 403 &&
        data.needsVerification &&
        data.email
      ) {
        const params = new URLSearchParams({
          email: data.email
        });

        if (initialPrompt) {
          params.append("prompt", initialPrompt);
        }

        navigate(`/verify-email?${params.toString()}`);
        return;
      }

      setSubmitError(
        data.error ||
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

        {/* Verification Success Notice */}
        {justVerified && !submitError && (
          <div className={s.verifiedBanner}>
            <CheckCircle2
              size={18}
              className={s.verifiedIcon}
            />

            <span>
              Email verified! Sign in to get your 20 free credits.
            </span>
          </div>
        )}

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
          <div className={s.passwordRow}>
            <label className={s.label}>
              Password
            </label>

            <Link
              to="/forgot-password"
              className={s.forgotLink}
            >
              Forgot your password?
            </Link>
          </div>

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
          {loading
            ? "Signing in..."
            : "Login"}
        </button>

      </form>
    </AuthShell>
  );
}
