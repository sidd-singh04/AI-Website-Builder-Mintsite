// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate, useSearchParams, Link } from "react-router-dom";
// import { Mail, CheckCircle2 } from "lucide-react";
// import AuthShell from "../components/AuthShell.jsx";
// import { API } from "../utils/api.js";
// import s from "../styles/VerifyEmailPage.module.css";

// const COOLDOWN_SECONDS = 60;

// export default function VerifyEmailPage() {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const email = searchParams.get("email") || "";
//   const initialPrompt = searchParams.get("prompt") || "";

//   const [otp, setOtp] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [resending, setResending] = useState(false);
//   const [verified, setVerified] = useState(false);
//   const [cooldown, setCooldown] = useState(COOLDOWN_SECONDS);

//   const otpRef = useRef(null);

//   // Focus input on load
//   useEffect(() => {
//     if (otpRef.current) {
//       otpRef.current.focus();
//     }
//   }, []);

//   // Cooldown timer for resending OTP
//   useEffect(() => {
//     if (cooldown <= 0) return;
//     const timer = setInterval(() => {
//       setCooldown((prev) => prev - 1);
//     }, 1000);
//     return () => clearInterval(timer);
//   }, [cooldown]);

//   // Redirect to register if email parameter is missing
//   useEffect(() => {
//     if (!email) {
//       navigate("/register");
//     }
//   }, [email, navigate]);

//   // Handle OTP verification submit
//   const handleVerify = async (e) => {
//     e.preventDefault();
//     if (otp.length !== 6) {
//       setError("Please enter a valid six-digit code over here");
//       return;
//     }

//     setLoading(true);
//     setError("");

//     try {
//       await API.post("/register/verify", { email, code: otp });
//       setVerified(true);
      
//       // Auto-redirect to login screen after successful verification
//       setTimeout(() => {
//         const params = new URLSearchParams({ email, verified: "1" });
//         if (initialPrompt) {
//           params.append("prompt", initialPrompt);
//         }
//         navigate(`/login?${params.toString()}`);
//       }, 2000);
//     } catch (err) {
//       setError(
//         err.response?.data?.error || 
//         err.response?.data?.reason || 
//         "Incorrect or expired verification code over here"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle Resending OTP
//   const handleResend = async () => {
//     if (cooldown > 0 || resending) return;
//     setResending(true);
//     setError("");

//     try {
//       await API.post("/register/resend", { email });
//       setCooldown(COOLDOWN_SECONDS);
//       setOtp("");
//       if (otpRef.current) otpRef.current.focus();
//     } catch (err) {
//       setError(
//         err.response?.data?.error || 
//         "Something went wrong while resending the OTP code over here"
//       );
//     } finally {
//       setResending(false);
//     }
//   };

//   // Input change handler restricting characters to 6 digits maximum
//   const handleOtpChange = (e) => {
//     const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
//     setOtp(val);
//     setError("");
//   };

//   // Success view once verified successfully
//   if (verified) {
//     return (
//       <AuthShell
//         title="Email Verified!"
//         subtitle="Your account is fully activated. Redirecting you to sign in..."
//       >
//         <div className={s.successCard}>
//           <CheckCircle2 size={64} className={s.successIcon} />
//           <p className={s.successText}>Thank you! Your email has been verified successfully.</p>
//         </div>
//       </AuthShell>
//     );
//   }

//   return (
//     <AuthShell
//       title="Verify Your Email"
//       subtitle={
//         <>
//           We sent a six-digit verification code to{" "}
//           <span className="text-white font-medium">{email}</span>. Please enter it below to activate your account over here.
//         </>
//       }
//       footer={
//         <>
//           Entered the wrong email?{" "}
//           <Link to="/register" className={s.signupLink}>
//             Sign Up again
//           </Link>
//         </>
//       }
//     >
//       <form onSubmit={handleVerify} className={s.form}>
//         <div className={s.inputGroup}>
//           <label className={s.label}>Verification Code</label>
//           <input
//             ref={otpRef}
//             type="text"
//             inputMode="numeric"
//             pattern="[6-14]*"
//             maxLength={6}
//             placeholder="123456"
//             value={otp}
//             onChange={handleOtpChange}
//             className={`${s.otpInput} ${error ? s.inputError : ""}`}
//             autoComplete="one-time-code"
//           />
//           {error && <p className={s.errorText}>{error}</p>}
//         </div>

//         <button
//           type="submit"
//           disabled={loading || otp.length !== 6}
//           className={s.submitButton}
//         >
//           {loading ? "Verifying..." : "Verify Email"}
//         </button>

//         <div className={s.resendRow}>
//           <Mail size={16} className={s.resendIcon} />
//           <span>Didn't get the code?</span>
//           <button
//             type="button"
//             onClick={handleResend}
//             disabled={cooldown > 0 || resending}
//             className={s.resendButton}
//           >
//             {resending ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
//           </button>
//         </div>
//       </form>
//     </AuthShell>
//   );

// }










import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Mail, CheckCircle2 } from "lucide-react";
import AuthShell from "../components/AuthShell.jsx";
import { registerVerify, registerResend } from "../utils/api.js";
import s from "../styles/VerifyEmailPage.module.css";

const COOLDOWN_SECONDS = 60;

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email") || "";
  const initialPrompt = searchParams.get("prompt") || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [cooldown, setCooldown] = useState(COOLDOWN_SECONDS);

  const otpRef = useRef(null);

  // Focus input on page load
  useEffect(() => {
    if (otpRef.current) {
      otpRef.current.focus();
    }
  }, []);

  // Cooldown timer for resending OTP
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  // Redirect to register if email is missing
  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  // Handle OTP verification
  const handleVerify = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setError("Please enter a valid six-digit code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // API helper already uses:
      // POST /api/auth/register/verify
      await registerVerify(email, otp);

      setVerified(true);

      // Redirect to login after successful verification
      setTimeout(() => {
        const params = new URLSearchParams({
          email,
          verified: "1",
        });

        if (initialPrompt) {
          params.append("prompt", initialPrompt);
        }

        navigate(`/login?${params.toString()}`);
      }, 2000);

    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.reason ||
        "Incorrect or expired verification code."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResend = async () => {
    if (cooldown > 0 || resending) return;

    setResending(true);
    setError("");

    try {
      // API helper already uses:
      // POST /api/auth/register/resend
      await registerResend(email);

      setCooldown(COOLDOWN_SECONDS);
      setOtp("");

      if (otpRef.current) {
        otpRef.current.focus();
      }

    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Something went wrong while resending the OTP."
      );
    } finally {
      setResending(false);
    }
  };

  // Allow only numbers and maximum 6 digits
  const handleOtpChange = (e) => {
    const value = e.target.value
      .replace(/[^0-9]/g, "")
      .slice(0, 6);

    setOtp(value);
    setError("");
  };

  // Success screen
  if (verified) {
    return (
      <AuthShell
        title="Email Verified!"
        subtitle="Your account is fully activated. Redirecting you to sign in..."
      >
        <div className={s.successCard}>
          <CheckCircle2
            size={64}
            className={s.successIcon}
          />

          <p className={s.successText}>
            Thank you! Your email has been verified successfully.
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Verify Your Email"
      subtitle={
        <>
          We sent a six-digit verification code to{" "}
          <span className="text-white font-medium">
            {email}
          </span>
          . Please enter it below to activate your account.
        </>
      }
      footer={
        <>
          Entered the wrong email?{" "}
          <Link
            to="/register"
            className={s.signupLink}
          >
            Sign Up again
          </Link>
        </>
      }
    >
      <form
        onSubmit={handleVerify}
        className={s.form}
      >
        <div className={s.inputGroup}>
          <label className={s.label}>
            Verification Code
          </label>

          <input
            ref={otpRef}
            type="text"
            inputMode="numeric"

            // FIXED REGEX
            pattern="[0-9]{6}"

            maxLength={6}
            placeholder="123456"
            value={otp}
            onChange={handleOtpChange}
            className={`${s.otpInput} ${
              error ? s.inputError : ""
            }`}
            autoComplete="one-time-code"
          />

          {error && (
            <p className={s.errorText}>
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={
            loading ||
            otp.length !== 6
          }
          className={s.submitButton}
        >
          {loading
            ? "Verifying..."
            : "Verify Email"}
        </button>

        <div className={s.resendRow}>
          <Mail
            size={16}
            className={s.resendIcon}
          />

          <span>
            Didn't get the code?
          </span>

          <button
            type="button"
            onClick={handleResend}
            disabled={
              cooldown > 0 ||
              resending
            }
            className={s.resendButton}
          >
            {resending
              ? "Sending..."
              : cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Resend code"}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}