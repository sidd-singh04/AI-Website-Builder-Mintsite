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
  AlertCircle
} from "lucide-react";

import { useAuth } from "../context/authContext.jsx";
import { API } from "../utils/api.js";
import { PageBackdrop } from "../assets/UI.jsx";
import Footer from "../components/Footer.jsx";
import toast from "react-hot-toast";
import s from "../styles/PricingPage.module.css";

// Default packages used if backend packages cannot be loaded
const defaultPackages = [
  {
    id: "starter",
    name: "Starter Pack",
    credits: 50,
    amount: 49900,
    displayAmount: 499,
    currency: "INR",
    popular: false,
    description:
      "Perfect for testing ideas and building simple projects."
  },
  {
    id: "popular",
    name: "Popular Package",
    credits: 200,
    amount: 149900,
    displayAmount: 1499,
    currency: "INR",
    popular: true,
    description:
      "The best value option for active developers and creators."
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
      "Unlock maximum productivity for power builders shipping products."
  }
];

// FAQ
const faqsList = [
  {
    question: "What are credits used for in MintSite?",
    answer:
      "Credits are spent to generate or edit your sites. An initial generation costs 5 credits, and each real-time AI adjustment or refinement costs 2 credits."
  },
  {
    question: "Do my purchased credits expire?",
    answer:
      "No, purchased credits never expire. They remain in your account until you spend them."
  },
  {
    question: "Can I deploy the generated code for free?",
    answer:
      "Yes! MintSite supports exporting your generated code as well as deploying live websites through Vercel or GitHub."
  },
  {
    question: "How secure are payments on MintSite?",
    answer:
      "All payments are securely processed by Razorpay. Your card and payment details are handled by Razorpay and are not stored on our servers."
  }
];

export default function PricingPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [packages, setPackages] = useState(defaultPackages);
  const [razorpayConfigured, setRazorpayConfigured] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(true);

  const [buyingId, setBuyingId] = useState(null);
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentCanceled, setPaymentCanceled] = useState(false);

  const [openFaq, setOpenFaq] = useState(null);

  // --------------------------------------------------
  // Load packages
  // --------------------------------------------------

  useEffect(() => {
    async function fetchPricingPackages() {
      try {
        setLoadingPackages(true);

        const res = await API.get("/payments/packages");

        if (res.data?.packages) {
          setPackages(res.data.packages);
        }

        setRazorpayConfigured(res.data?.configured ?? false);
      } catch (err) {
        console.error("Failed to load payment packages:", err);

        toast.error(
          "Unable to load payment packages. Showing default packages."
        );
      } finally {
        setLoadingPackages(false);
      }
    }

    fetchPricingPackages();
  }, []);

  // --------------------------------------------------
  // Load Razorpay script
  // --------------------------------------------------

  useEffect(() => {
    if (window.Razorpay) {
      return;
    }

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // --------------------------------------------------
  // Buy package
  // --------------------------------------------------

  const handleBuy = async (packageId) => {
    if (!user) {
      toast.error("Please sign in to buy credits.");
      navigate("/login");
      return;
    }

    if (!razorpayConfigured) {
      toast.error(
        "Razorpay payment gateway is not configured on the backend."
      );
      return;
    }

    if (!window.Razorpay) {
      toast.error(
        "Razorpay checkout is still loading. Please try again."
      );
      return;
    }

    try {
      setBuyingId(packageId);

      // --------------------------------------------
      // 1. Create Razorpay order
      // --------------------------------------------

      const res = await API.post("/payments/create-order", {
        packageId
      });

      const {
        keyId,
        orderId,
        amount,
        currency,
        credits
      } = res.data;

      if (!keyId || !orderId) {
        throw new Error("Invalid Razorpay order response.");
      }

      // --------------------------------------------
      // 2. Open Razorpay Checkout
      // --------------------------------------------

      const options = {
        key: keyId,

        amount,
        currency,

        name: "MintSite",
        description: `${credits} Credits`,

        order_id: orderId,

        prefill: {
          name: user.name || "",
          email: user.email || ""
        },

        theme: {
          color: "#6366f1"
        },

        handler: async function (response) {
          await verifyPayment(response);
        },

        modal: {
          ondismiss: function () {
            setBuyingId(null);

            toast("Payment cancelled.");
          }
        }
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.error("Razorpay payment failed:", response.error);

        setBuyingId(null);

        toast.error(
          response.error?.description ||
            "Payment failed. Please try again."
        );
      });

      razorpay.open();
    } catch (err) {
      console.error("Create order error:", err);

      toast.error(
        err.response?.data?.error ||
          "Failed to initiate payment."
      );

      setBuyingId(null);
    }
  };

  // --------------------------------------------------
  // Verify Razorpay payment
  // --------------------------------------------------

  const verifyPayment = async (paymentResponse) => {
    try {
      setVerifyingPayment(true);

      const res = await API.post("/payments/verify-payment", {
        razorpay_payment_id:
          paymentResponse.razorpay_payment_id,

        razorpay_order_id:
          paymentResponse.razorpay_order_id,

        razorpay_signature:
          paymentResponse.razorpay_signature
      });

      if (res.data?.ok) {
        setPaymentSuccess(true);

        if (res.data.user) {
          updateUser(res.data.user);
        }

        toast.success(
          "Payment successful! Credits have been added."
        );
      }
    } catch (err) {
      console.error("Payment verification error:", err);

      toast.error(
        err.response?.data?.error ||
          "Payment verification failed."
      );
    } finally {
      setVerifyingPayment(false);
      setBuyingId(null);
    }
  };

  // --------------------------------------------------
  // FAQ
  // --------------------------------------------------

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className={s.root}>
      <PageBackdrop />

      {/* HERO */}
      <section className={s.heroSection}>
        <div className={s.heroInner}>
          <div className={s.freeBanner}>
            <Sparkles
              size={14}
              className={s.bannerIcon}
            />

            <span>
              Try 20 Free Credits on your first login!
            </span>
          </div>

          <h1 className={s.heroTitle}>
            Upgrade Your AI Workspace
          </h1>

          <p className={s.heroSub}>
            Purchase credits to keep generating, editing,
            and publishing your custom websites. Buy only
            what you need — no recurring subscriptions.
          </p>
        </div>
      </section>

      {/* PAYMENT STATUS */}
      <div className={s.workspaceArea}>
        {verifyingPayment && (
          <div className={s.notificationBanner}>
            <Loader2 className={s.spinner} />

            <span>
              Verifying your Razorpay payment...
            </span>
          </div>
        )}

        {paymentSuccess && (
          <div
            className={`${s.notificationBanner} ${s.successBanner}`}
          >
            <Sparkles className={s.successIcon} />

            <div>
              <strong>
                Payment Processed Successfully!
              </strong>

              <p>
                Your credit balance has been updated.
              </p>
            </div>
          </div>
        )}

        {paymentCanceled && (
          <div
            className={`${s.notificationBanner} ${s.canceledBanner}`}
          >
            <AlertCircle
              className={s.canceledIcon}
            />

            <span>
              Transaction cancelled. No charges were made.
            </span>
          </div>
        )}

        {/* PRICING CARDS */}
        {loadingPackages ? (
          <div className={s.loadingBox}>
            <Loader2 className={s.spinnerLarge} />

            <span>
              Fetching credit packages...
            </span>
          </div>
        ) : (
          <div className={s.pricingGrid}>
            {packages.map((pkg) => {
              const staticPkgInfo =
                defaultPackages.find(
                  (p) => p.id === pkg.id
                ) || {};

              const isPopular =
                staticPkgInfo.popular ?? pkg.popular ?? false;

              // Backend amount is in paise
              const formattedPrice =
                (pkg.amount / 100).toLocaleString(
                  "en-IN",
                  {
                    style: "currency",
                    currency: pkg.currency || "INR"
                  }
                );

              return (
                <div
                  key={pkg.id}
                  className={`${s.card} ${
                    isPopular
                      ? s.popularCard
                      : ""
                  }`}
                >
                  {isPopular && (
                    <div className={s.popularBadge}>
                      <span>MOST POPULAR</span>
                    </div>
                  )}

                  {/* HEADER */}
                  <div className={s.cardHeader}>
                    <h3 className={s.packageName}>
                      {pkg.name}
                    </h3>

                    <p
                      className={
                        s.packageDescription
                      }
                    >
                      {staticPkgInfo.description ||
                        "Top up your credits and continue building with AI."}
                    </p>
                  </div>

                  {/* PRICE */}
                  <div className={s.priceBox}>
                    <span className={s.priceAmount}>
                      {formattedPrice}
                    </span>

                    <span className={s.priceOneTime}>
                      one-time payment
                    </span>
                  </div>

                  {/* CREDITS */}
                  <div className={s.creditsBox}>
                    <Zap
                      size={18}
                      className={s.zapIcon}
                    />

                    <span
                      className={
                        s.creditsCount
                      }
                    >
                      {pkg.credits} Credits
                    </span>
                  </div>

                  {/* BUY BUTTON */}
                  <button
                    onClick={() =>
                      handleBuy(pkg.id)
                    }
                    disabled={
                      buyingId !== null ||
                      verifyingPayment
                    }
                    className={`${s.buyBtn} ${
                      isPopular
                        ? s.buyBtnPopular
                        : s.buyBtnDefault
                    }`}
                  >
                    {buyingId === pkg.id ? (
                      <>
                        <Loader2
                          className={s.spinner}
                        />

                        <span>
                          Processing...
                        </span>
                      </>
                    ) : (
                      <span>
                        Buy Credits
                      </span>
                    )}
                  </button>

                  {/* FEATURES */}
                  <div className={s.featuresList}>
                    <div className={s.featureRow}>
                      <Check
                        size={14}
                        className={s.checkIcon}
                      />

                      <span>
                        Generate{" "}
                        {Math.floor(
                          pkg.credits / 5
                        )}{" "}
                        complete websites
                      </span>
                    </div>

                    <div className={s.featureRow}>
                      <Check
                        size={14}
                        className={s.checkIcon}
                      />

                      <span>
                        Refine code up to{" "}
                        {Math.floor(
                          pkg.credits / 2
                        )}{" "}
                        times
                      </span>
                    </div>

                    <div className={s.featureRow}>
                      <Check
                        size={14}
                        className={s.checkIcon}
                      />

                      <span>
                        Live Vercel & GitHub
                        Deployments
                      </span>
                    </div>

                    <div className={s.featureRow}>
                      <Check
                        size={14}
                        className={s.checkIcon}
                      />

                      <span>
                        No Monthly
                        Subscriptions
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* FAQ */}
        <section className={s.faqSection}>
          <div className={s.faqHeader}>
            <HelpCircle
              size={24}
              className={s.faqIconHeader}
            />

            <h2 className={s.faqTitle}>
              Frequently Asked Questions
            </h2>

            <p className={s.faqSubtitle}>
              Got questions? We have got answers
              about credits, payments, and hosting.
            </p>
          </div>

          <div className={s.faqGrid}>
            {faqsList.map((faq, i) => (
              <div
                key={i}
                className={s.faqCard}
              >
                <button
                  className={
                    s.faqQuestionBtn
                  }
                  onClick={() =>
                    toggleFaq(i)
                  }
                >
                  <span>
                    {faq.question}
                  </span>

                  {openFaq === i ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>

                {openFaq === i && (
                  <div
                    className={
                      s.faqAnswer
                    }
                  >
                    <p>
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );

}