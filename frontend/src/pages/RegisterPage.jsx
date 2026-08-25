import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthShell from "../components/AuthShell.jsx";
import { API } from "../utils/api.js";
import s from "../styles/RegisterPage.module.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Homepage prompt value input prefill validation checks
  const initialPrompt = searchParams.get("prompt") || "";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  // Field change handler helper updates
  const update = (field) => (event) => {
    setForm({
      ...form,
      [field]: event.target.value
    });
    // Clear validation error on key down/interaction
    setErrors({
      ...errors,
      [field]: undefined
    });
    setSubmitError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const er = {};

    // Form Field Validations matching back-end controller guards
    if (!form.name.trim() || form.name.trim().length < 2) {
      er.name = "Enter your name over here";
    }
    
    if (!form.email.includes("@")) {
      er.email = "Enter a valid email over here";
    }

    if (form.password.length < 6) {
      er.password = "At least six characters for the password is required over here";
    }

    setErrors(er);

    // If there are validation errors, halt submission
    if (Object.keys(er).length > 0) return;

    setLoading(true);
    setSubmitError("");

    try {
      // Trigger live axios API call pointing to endpoint
      const res = await API.post("/auth/register", form);
      const result = res.data;

      // Pass email as search parameter to verify email screen
      const params = new URLSearchParams({ email: result.email });
      
      // Keep prompt if redirect was completed from index
      if (initialPrompt) {
        params.append("prompt", initialPrompt);
      }

      navigate(`/verify-email?${params.toString()}`);
    } catch (err) {
      setSubmitError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        "Something went wrong over here during registration"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Sign Up"
      subtitle="Enter your information to create an account over here"
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
          {errors.name && <p className={s.errorText}>{errors.name}</p>}
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
          {errors.email && <p className={s.errorText}>{errors.email}</p>}
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
          {errors.password && <p className={s.errorText}>{errors.password}</p>}
        </div>

        {/* Error Notice Panel */}
        {submitError && <p className={s.submitError}>{submitError}</p>}

        {/* Submit Actions */}
        <button type="submit" disabled={loading} className={s.submitButton}>
          {loading ? "Sending code..." : "Send verification code"}
        </button>

        {/* Informative Instructions panel */}
        <div className={s.infoBox}>
          <div className={s.infoRow}>
            <span className={`${s.infoIndicator} ${s.indigo}`} />
            <span>We will email a six-digit code. Enter it to verify, then sign in over here.</span>
          </div>
          <div className={s.infoRow}>
            <span className={`${s.infoIndicator} ${s.emerald}`} />
            <span>
              You get <span className={s.infoHighlighted}>20 free credits</span> on first login over here.
            </span>
          </div>
        </div>
      </form>
    </AuthShell>
  );
}