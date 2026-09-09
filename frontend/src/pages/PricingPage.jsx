import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  Zap,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../context/authContext.jsx";
import { API } from "../utils/api.js";
import { PageBackdrop } from "../assets/UI.jsx";
import Footer from "../components/Footer.jsx";
import toast from "react-hot-toast";
import s from "../styles/PricingPage.module.css";

// ============================================================
// DEFAULT PACKAGES
// Used as fallback if backend packages cannot be loaded.
// ============================================================

const defaultPackages = [
  {
    id: "starter",
    name: "Starter Pack",
    credits: 50,
    amount: 49900,
    displayAmount: 499,
    currency: "INR",
    popular: false,
    description: "Perfect for testing ideas and building simple projects.",
  },
  {
    id: "popular",
    name: "Popular Package",
    credits: 200,
    amount: 149900,
    displayAmount: 1499,
    currency: "INR",
    popular: true,
    description: "The best value option for active developers and creators.",
  },
  {
    id: "pro",
    name: "Pro Package",
    credits: 500,
    amount: 299900,
    displayAmount: 2999,
    currency: "INR",
    popular: false,
    description:
      "Unlock maximum productivity for power builders shipping products.",
  },
];

// ============================================================
// FAQ DATA
// ============================================================

const faqsList = [
  {
    question: "What are credits used for in MintSite?",
    answer:
      "Credits are spent to generate or edit your sites. An initial generation costs 5 credits, and each real-time AI adjustment or refinement costs 2 credits.",
  },
  {
    question: "Do my purchased credits expire?",
    answer:
      "No, purchased credits never expire. They remain in your account until you spend them.",
  },

  {
    question: "How secure are payments on MintSite?",
    answer:
      "All payments are securely processed by Razorpay. Your card and payment details are handled by Razorpay and are not stored on our servers.",
  },
];

export default function PricingPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // ============================================================
  // STATE
  // ============================================================

  const [packages, setPackages] = useState(defaultPackages);

  const [razorpayConfigured, setRazorpayConfigured] = useState(false);

  const [loadingPackages, setLoadingPackages] = useState(true);

  const [buyingId, setBuyingId] = useState(null);

  const [verifyingPayment, setVerifyingPayment] = useState(false);

  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [paymentCanceled, setPaymentCanceled] = useState(false);

  const [openFaq, setOpenFaq] = useState(null);

  // ============================================================
  // LOAD PAYMENT PACKAGES
  // ============================================================

  useEffect(() => {
    const fetchPricingPackages = async () => {
      try {
        setLoadingPackages(true);

        const res = await API.get("/payments/packages");

        if (res.data?.packages?.length) {
          setPackages(res.data.packages);
        }

        setRazorpayConfigured(res.data?.configured ?? false);
      } catch (err) {
        console.error("Failed to load payment packages:", err);

        toast.error(
          "Unable to load payment packages. Showing default packages.",
        );

        // Keep default packages as fallback.
        setPackages(defaultPackages);

        setRazorpayConfigured(false);
      } finally {
        setLoadingPackages(false);
      }
    };

    fetchPricingPackages();
  }, []);

  // ============================================================
  // LOAD RAZORPAY CHECKOUT SCRIPT
  // ============================================================

  useEffect(() => {
    if (window.Razorpay) {
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );

    if (existingScript) {
      return;
    }

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.async = true;

    document.body.appendChild(script);

    return () => {
      // Do not remove the script here.
      // Razorpay may be needed by another component.
    };
  }, []);

  // ============================================================
  // BUY PACKAGE
  // ============================================================

  const handleBuy = async (packageId) => {
    // User must be logged in.
    if (!user) {
      toast.error("Please sign in to buy credits.");
      navigate("/login");
      return;
    }

    // Backend must have Razorpay configured.
    if (!razorpayConfigured) {
      toast.error("Razorpay payment gateway is not configured on the backend.");
      return;
    }

    // Razorpay script must be available.
    if (!window.Razorpay) {
      toast.error("Razorpay checkout is still loading. Please try again.");
      return;
    }

    try {
      setBuyingId(packageId);

      setPaymentSuccess(false);
      setPaymentCanceled(false);

      // --------------------------------------------------------
      // STEP 1: CREATE RAZORPAY ORDER
      // --------------------------------------------------------

      const res = await API.post("/payments/create-order", {
        packageId,
      });

      const { keyId, orderId, amount, currency, credits } = res.data;

      if (!keyId || !orderId || !amount) {
        throw new Error("Invalid Razorpay order response.");
      }

      // --------------------------------------------------------
      // STEP 2: RAZORPAY CHECKOUT OPTIONS
      // --------------------------------------------------------

      const options = {
        key: keyId,

        amount,

        currency: currency || "INR",

        name: "MintSite",

        description: `${credits} Credits`,

        order_id: orderId,

        prefill: {
          name: user.name || "",
          email: user.email || "",
        },

        theme: {
          color: "#6366f1",
        },

        // ------------------------------------------------------
        // PAYMENT SUCCESS
        // ------------------------------------------------------

        handler: async (response) => {
          await verifyPayment(response);
        },

        // ------------------------------------------------------
        // CHECKOUT CLOSED
        // ------------------------------------------------------

        modal: {
          ondismiss: () => {
            setBuyingId(null);
            setPaymentCanceled(true);

            toast("Payment cancelled.");
          },
        },
      };

      // --------------------------------------------------------
      // STEP 3: CREATE RAZORPAY INSTANCE
      // --------------------------------------------------------

      const razorpay = new window.Razorpay(options);

      // --------------------------------------------------------
      // PAYMENT FAILED
      // --------------------------------------------------------

      razorpay.on("payment.failed", (response) => {
        console.error("Razorpay payment failed:", response.error);

        setBuyingId(null);
        setPaymentCanceled(true);

        toast.error(
          response.error?.description || "Payment failed. Please try again.",
        );
      });

      // --------------------------------------------------------
      // OPEN CHECKOUT
      // --------------------------------------------------------

      razorpay.open();
    } catch (err) {
      console.error("Create order error:", err);

      toast.error(
        err.response?.data?.error ||
          err.message ||
          "Failed to initiate payment.",
      );

      setBuyingId(null);
    }
  };

  // ============================================================
  // VERIFY RAZORPAY PAYMENT
  // ============================================================

  const verifyPayment = async (paymentResponse) => {
    try {
      setVerifyingPayment(true);

      const res = await API.post("/payments/verify-payment", {
        razorpay_payment_id: paymentResponse.razorpay_payment_id,

        razorpay_order_id: paymentResponse.razorpay_order_id,

        razorpay_signature: paymentResponse.razorpay_signature,
      });

      // --------------------------------------------------------
      // PAYMENT VERIFIED SUCCESSFULLY
      // --------------------------------------------------------

      if (res.data?.ok) {
        setPaymentSuccess(true);
        setPaymentCanceled(false);

        // Update logged-in user with new credit balance.
        if (res.data.user) {
          updateUser(res.data.user);
        }

        toast.success("Payment successful! Credits have been added.");
      } else {
        throw new Error(res.data?.error || "Payment verification failed.");
      }
    } catch (err) {
      console.error("Payment verification error:", err);

      toast.error(
        err.response?.data?.error ||
          err.message ||
          "Payment verification failed.",
      );
    } finally {
      setVerifyingPayment(false);
      setBuyingId(null);
    }
  };

  // ============================================================
  // FAQ
  // ============================================================

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className={s.root}>
      <PageBackdrop />

      {/* ======================================================
          HERO SECTION
      ====================================================== */}

      <section className={s.heroSection}>
        <div className={s.heroInner}>
          <div className={s.freeBanner}>
            <Sparkles size={14} className={s.bannerIcon} />

            <span>Try 20 Free Credits on your first login!</span>
          </div>

          <h1 className={s.heroTitle}>Upgrade Your AI Workspace</h1>

          <p className={s.heroSub}>
            Get credits to keep creating and refining your websites. Buy only
            what you need with simple, one-time payments.
          </p>
        </div>
      </section>

      {/* ======================================================
          PAYMENT WORKSPACE
      ====================================================== */}

      <div className={s.workspaceArea}>
        {/* PAYMENT VERIFICATION */}

        {verifyingPayment && (
          <div className={s.notificationBanner}>
            <Loader2 className={s.spinner} />

            <span>Verifying your Razorpay payment...</span>
          </div>
        )}

        {/* PAYMENT SUCCESS */}

        {paymentSuccess && (
          <div className={`${s.notificationBanner} ${s.successBanner}`}>
            <Sparkles className={s.successIcon} />

            <div>
              <strong>Payment Processed Successfully!</strong>

              <p>Your credit balance has been updated.</p>
            </div>
          </div>
        )}

        {/* PAYMENT CANCELLED */}

        {paymentCanceled && (
          <div className={`${s.notificationBanner} ${s.canceledBanner}`}>
            <AlertCircle className={s.canceledIcon} />

            <span>Transaction cancelled. No charges were made.</span>
          </div>
        )}

        {/* ==================================================
            PRICING CARDS
        ================================================== */}

        {loadingPackages ? (
          <div className={s.loadingBox}>
            <Loader2 className={s.spinnerLarge} />

            <span>Fetching credit packages...</span>
          </div>
        ) : (
          <div className={s.pricingGrid}>
            {packages.map((pkg) => {
              // Find static package information.
              const staticPkgInfo =
                defaultPackages.find((p) => p.id === pkg.id) || {};

              // Determine whether package is popular.
              const isPopular = staticPkgInfo.popular ?? pkg.popular ?? false;

              // Backend amount is stored in paise.
              const amountInPaise = Number(pkg.amount) || 0;

              const formattedPrice = (amountInPaise / 100).toLocaleString(
                "en-IN",
                {
                  style: "currency",
                  currency: pkg.currency || "INR",
                  maximumFractionDigits: 0,
                },
              );

              return (
                <div
                  key={pkg.id}
                  className={`${s.card} ${isPopular ? s.popularCard : ""}`}
                >
                  {/* POPULAR BADGE */}

                  {isPopular && (
                    <div className={s.popularBadge}>
                      <span>POPULAR</span>
                    </div>
                  )}

                  {/* CARD HEADER */}

                  <div className={s.cardHeader}>
                    <h3 className={s.packageName}>{pkg.name}</h3>

                    <p className={s.packageDescription}>
                      {pkg.description ||
                        staticPkgInfo.description ||
                        "Top up your credits and continue building with AI."}
                    </p>
                  </div>

                  {/* PRICE */}

                  <div className={s.priceBox}>
                    <span className={s.priceAmount}>{formattedPrice}</span>

                    <span className={s.priceOneTime}>one-time payment</span>
                  </div>

                  {/* CREDITS */}

                  <div className={s.creditsBox}>
                    <Zap size={18} className={s.zapIcon} />

                    <span className={s.creditsCount}>
                      {pkg.credits} Credits
                    </span>
                  </div>

                  {/* BUY BUTTON */}

                  <button
                    type="button"
                    onClick={() => handleBuy(pkg.id)}
                    disabled={buyingId !== null || verifyingPayment}
                    className={`${s.buyBtn} ${
                      isPopular ? s.buyBtnPopular : s.buyBtnDefault
                    }`}
                  >
                    {buyingId === pkg.id ? (
                      <>
                        <Loader2 className={s.spinner} />

                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>Buy Credits</span>
                    )}
                  </button>

                  {/* FEATURES */}

                  <div className={s.featuresList}>
                    {/* GENERATION */}

                    <div className={s.featureRow}>
                      <Check size={14} className={s.checkIcon} />

                      <span>
                        Generate {Math.floor(pkg.credits / 5)} complete websites
                      </span>
                    </div>

                    {/* REFINEMENTS */}

                    <div className={s.featureRow}>
                      <Check size={14} className={s.checkIcon} />

                      <span>
                        Refine code up to {Math.floor(pkg.credits / 2)} times
                      </span>
                    </div>

                    {/* SUBSCRIPTION */}

                    <div className={s.featureRow}>
                      <Check size={14} className={s.checkIcon} />

                      <span>No Monthly Subscriptions</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ==================================================
            FAQ SECTION
        ================================================== */}

        <section className={s.faqSection}>
          <div className={s.faqHeader}>
            <HelpCircle size={24} className={s.faqIconHeader} />

            <h2 className={s.faqTitle}>Frequently Asked Questions</h2>

            <p className={s.faqSubtitle}>
              Got questions? We have got answers about credits, payments, and
              hosting.
            </p>
          </div>

          <div className={s.faqGrid}>
            {faqsList.map((faq, index) => (
              <div key={index} className={s.faqCard}>
                <button
                  type="button"
                  className={s.faqQuestionBtn}
                  onClick={() => toggleFaq(index)}
                  aria-expanded={openFaq === index}
                >
                  <span>{faq.question}</span>

                  {openFaq === index ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>

                {openFaq === index && (
                  <div className={s.faqAnswer}>
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <Footer />
    </div>
  );
}
