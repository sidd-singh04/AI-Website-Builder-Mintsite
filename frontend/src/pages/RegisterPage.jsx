import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthShell from "../components/AuthShell.jsx";
import { API } from "../utils/api.js";
import { useAuth } from "../context/authContext.jsx";
import s from "../styles/RegisterPage.module.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginUser } = useAuth();

  // Homepage prompt value
  const initialPrompt = searchParams.get("prompt") || "";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  // Update form fields
  const update = (field) => (event) => {
    setForm({
      ...form,
      [field]: event.target.value
    });

    setErrors({
      ...errors,
      [field]: undefined
    });

    setSubmitError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const er = {};

    // Frontend validation
    if (!form.name.trim() || form.name.trim().length < 2) {
      er.name = "Enter your name";
    }

    if (!form.email.includes("@")) {
      er.email = "Enter a valid email";
    }

    if (form.password.length < 6) {
      er.password = "Password must be at least 6 characters";
    }

    setErrors(er);

    if (Object.keys(er).length > 0) return;

    setLoading(true);
    setSubmitError("");

    try {
      // Create account
      const res = await API.post("/auth/register", form);

      const { token, user } = res.data;

      // Registration also logs the user in
      loginUser(token, user);

      // Keep the existing prompt flow
      if (initialPrompt) {
        navigate(
          `/dashboard?prompt=${encodeURIComponent(initialPrompt)}`
        );
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setSubmitError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Something went wrong during registration"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Sign Up"
      subtitle="Enter your information to create an account"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className={s.signinLink}>
            Sign In
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className={s.form}>
        {/* Name Input Group */}
        <div className={s.inputGroup}>
          <label className={s.label}>Name</label>

          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={update("name")}
            className={`${s.input} ${errors.name ? s.inputError : ""}`}
            autoComplete="name"
          />

          {errors.name && (
            <p className={s.errorText}>{errors.name}</p>
          )}
        </div>

        {/* Email Input Group */}
        <div className={s.inputGroup}>
          <label className={s.label}>Email</label>

          <input
            type="email"
            placeholder="me@example.com"
            value={form.email}
            onChange={update("email")}
            className={`${s.input} ${errors.email ? s.inputError : ""}`}
            autoComplete="email"
          />

          {errors.email && (
            <p className={s.errorText}>{errors.email}</p>
          )}
        </div>

        {/* Password Input Group */}
        <div className={s.inputGroup}>
          <label className={s.label}>Password</label>

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={update("password")}
            className={`${s.input} ${errors.password ? s.inputError : ""}`}
            autoComplete="new-password"
          />

          {errors.password && (
            <p className={s.errorText}>{errors.password}</p>
          )}
        </div>

        {/* Error Notice */}
        {submitError && (
          <p className={s.submitError}>{submitError}</p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={s.submitButton}
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

        {/* Informative Instructions */}
        <div className={s.infoBox}>
          <div className={s.infoRow}>
            <span className={`${s.infoIndicator} ${s.indigo}`} />

            <span>
              Create your account and start building websites with
              Mintsite.
            </span>
          </div>

          <div className={s.infoRow}>
            <span className={`${s.infoIndicator} ${s.emerald}`} />

            <span>
              You get{" "}
              <span className={s.infoHighlighted}>
                20 free credits
              </span>{" "}
              when you create your account.
            </span>
          </div>
        </div>
      </form>
    </AuthShell>
  );
}