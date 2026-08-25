import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Shield, Key, Eye, EyeOff, ArrowLeft } from "lucide-react";
import AuthShell from "../components/AuthShell.jsx";
import { API } from "../utils/api.js";
import toast from "react-hot-toast";
import s from "../styles/ForgotPasswordPage.module.css";

const COOLDOWN_SECONDS = 60;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  // Step 1: email, Step 2: verify code, Step 3: reset password
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const otpRef = useRef(null);

  // Cooldown timer logic
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Focus on OTP input when step 2 loads
  useEffect(() => {
    if (step === 2 && otpRef.current) {
      otpRef.current.focus();
    }
  }, [step]);

  // Step 1: Request Password Reset Code
  const handleRequest = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail.includes("@")) {
      setError("Please enter a valid email address over here");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await API.post("/forgot/request", { email: trimmedEmail });
      toast.success("Verification code sent to your email!");
      setStep(2);
      setCooldown(COOLDOWN_SECONDS);
    } catch (err) {
      setError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        "No account found with this email over here"
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify the Code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError("Please enter a valid 6-digit code over here");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await API.post("/forgot/verify-code", { email: email.trim().toLowerCase(), code });
      toast.success("Code verified successfully!");
      setStep(3);
    } catch (err) {
      setError(
        err.response?.data?.error || 
        "Incorrect or expired verification code over here"
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2b: Resend Code
  const handleResendCode = async () => {
    if (cooldown > 0 || loading) return;
    setLoading(true);
    setError("");

    try {
      await API.post("/forgot/request", { email: email.trim().toLowerCase() });
      toast.success("A new verification code has been sent over here!");
      setCooldown(COOLDOWN_SECONDS);
      setCode("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend code over here");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset the Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("The password must be at least of six characters over here");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await API.post("/forgot/reset", {
        email: email.trim().toLowerCase(),
        code,
        newPassword
      });
      toast.success("Password has been reset successfully!");
      
      // Navigate to login prefilled with user's verified details
      setTimeout(() => {
        navigate(`/login?email=${encodeURIComponent(email)}&verified=1`);
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.error || 
        "Something went wrong while resetting the password over here"
      );
    } finally {
      setLoading(false);
    }
  };

  // Render Step 1: Request Email View
  const renderStep1 = () => (
    <form onSubmit={handleRequest} className={s.form}>
      <div className={s.inputGroup}>
        <label className={s.label}>Email Address</label>
        <div className={s.inputWrapper}>
          <Mail size={18} className={s.inputIcon} />
          <input
            type="email"
            placeholder="me@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            className={s.inputWithIcon}
            required
            autoComplete="email"
          />
        </div>
      </div>
      
      {error && <p className={s.errorText}>{error}</p>}

      <button type="submit" disabled={loading} className={s.submitButton}>
        {loading ? "Sending Code..." : "Send Verification Code"}
      </button>
    </form>
  );

  // Render Step 2: OTP Verification View
  const renderStep2 = () => (
    <form onSubmit={handleVerifyCode} className={s.form}>
      <div className={s.inputGroup}>
        <label className={s.label}>6-Digit Code</label>
        <div className={s.inputWrapper}>
          <Shield size={18} className={s.inputIcon} />
          <input
            ref={otpRef}
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/[^0-9]/g, ""));
              setError("");
            }}
            className={s.inputWithIcon}
            required
            autoComplete="one-time-code"
          />
        </div>
      </div>

      {error && <p className={s.errorText}>{error}</p>}

      <button
        type="submit"
        disabled={loading || code.length !== 6}
        className={s.submitButton}
      >
        {loading ? "Verifying..." : "Verify Code"}
      </button>

      <div className={s.resendRow}>
        <span>Didn't get the code?</span>
        <button
          type="button"
          onClick={handleResendCode}
          disabled={cooldown > 0 || loading}
          className={s.resendButton}
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
        </button>
      </div>
    </form>
  );

  // Render Step 3: Enter New Password View
  const renderStep3 = () => (
    <form onSubmit={handleResetPassword} className={s.form}>
      <div className={s.inputGroup}>
        <label className={s.label}>New Password</label>
        <div className={s.inputWrapper}>
          <Key size={18} className={s.inputIcon} />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Min 6 characters"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setError("");
            }}
            className={s.inputWithIcon}
            required
            autoComplete="new-password"
          />
          <button
            type="button"
            className={s.eyeButton}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {error && <p className={s.errorText}>{error}</p>}

      <button
        type="submit"
        disabled={loading || newPassword.length < 6}
        className={s.submitButton}
      >
        {loading ? "Resetting Password..." : "Reset Password"}
      </button>
    </form>
  );

  const getSubtitle = () => {
    if (step === 1) return "Enter your account email to receive a password reset code over here";
    if (step === 2) return `Enter the 6-digit security code sent to ${email} over here`;
    return "Create a secure new password for your account over here";
  };

  return (
    <AuthShell
      title={step === 3 ? "Setup New Password" : "Reset Password"}
      subtitle={getSubtitle()}
      footer={
        <div className={s.shellFooter}>
          {step > 1 && step < 3 && (
            <button
              onClick={() => {
                setStep(step - 1);
                setError("");
              }}
              className={s.backToStepBtn}
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          )}
          <div style={{ flex: 1, textAlign: "right" }}>
            <Link to="/login" className={s.backToLogin}>
              Back to Sign In
            </Link>
          </div>
        </div>
      }
    >
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </AuthShell>
  );
}