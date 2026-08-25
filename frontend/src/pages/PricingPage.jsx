import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Check, HelpCircle, ChevronDown, ChevronUp, Loader2, Sparkles, Zap, AlertCircle } from "lucide-react";
import { useAuth } from "../context/authContext.jsx";
import { API } from "../utils/api.js";
import { PageBackdrop } from "../assets/UI.jsx";
import Footer from "../components/Footer.jsx";
import toast from "react-hot-toast";
import s from "../styles/PricingPage.module.css";

// 3 Credit Packages configured on the backend [1]
const defaultPackages = [
  { id: "starter", name: "Starter Pack", credits: 50, amount: 499, popular: false, description: "Perfect for testing ideas and building simple projects over here." },
  { id: "popular", name: "Popular Package", credits: 200, amount: 1499, popular: true, description: "The best value option for active developers and creators over here." },
  { id: "pro", name: "Pro Package", credits: 500, amount: 2999, popular: false, description: "Unlock maximum productivity for power builders shipping products over here." }
];

// Dummy FAQ Data [5]
const faqsList = [
  {
    question: "What are credits used for in MintSite?",
    answer: "Credits are spent to generate or edit your sites. An initial generation costs 5 credits, and each real-time AI adjustment or refinement costs 2 credits."
  },
  {
    question: "Do my purchased credits expire?",
    answer: "No, credits purchased through Stripe or received on sign-up never expire. They remain in your account ledger forever until you spend them."
  },
  {
    question: "Can I deploy the generated code for free?",
    answer: "Yes! MintSite supports exporting the raw index.html code for free, as well as deploying live hosting through Vercel or pushing to your GitHub pages."
  },
  {
    question: "How secure are payments on MintSite?",
    answer: "All transaction processing is securely handled by Stripe over SSL. We never store, process, or view your credit card details on our servers."
  }
];

export default function PricingPage() {
  const { user, updateUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [packages, setPackages] = useState(defaultPackages);
  const [stripeConfigured, setStripeConfigured] = useState(true);
  const [loadingPackages, setLoadingPackages] = useState(true);

  // Stripe Redirection & Session Verification states [5, 6]
  const sessionId = searchParams.get("session_id") || "";
  const paymentCanceled = searchParams.get("canceled") === "1";
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [buyingId, setBuyingId] = useState(null);

  // FAQ Accordion toggles state
  const [openFaq, setOpenFaq] = useState(null);

  // Load packages and check Stripe availability on mount [7]
  useEffect(() => {
    async function fetchPricingPackages() {
      setLoadingPackages(true);
      try {
        const res = await API.get("/payments/packages");
        if (res.data?.packages) {
          setPackages(res.data.packages);
        }
        setStripeConfigured(res.data?.configured ?? true);
      } catch (err) {
        console.error("Failed to load packages, using default fallback over here:", err);
      } finally {
        setLoadingPackages(false);
      }
    }
    fetchPricingPackages();
  }, []);

  // Handle Stripe Redirection URL Verification [5, 6]
  useEffect(() => {
    if (sessionId) {
      verifyStripeSession();
    }
  }, [sessionId]);

  const verifyStripeSession = async () => {
    setVerifyingPayment(true);
    try {
      const res = await API.post("/payments/verify-session", { sessionId });
      if (res.data?.ok) {
        setVerificationSuccess(true);
        if (res.data.user) {
          updateUser(res.data.user);
        }
        toast.success("Payment received! Credits have been added over here.");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to verify payment session over here");
    } finally {
      setVerifyingPayment(false);
      // Clean query search parameters safely
      setSearchParams({});
    }
  };

  // Trigger Stripe Checkout [2, 8]
  const handleBuy = async (packageId) => {
    if (!user) {
      toast.error("Please sign in to buy credit packages over here!");
      navigate("/login");
      return;
    }

    if (!stripeConfigured) {
      toast.error("Stripe payment gateway is not configured on the backend environment over here!");
      return;
    }

    setBuyingId(packageId);
    try {
      const res = await API.post("/payments/create-checkout-session", { packageId });
      if (res.data?.url) {
        // Direct browser redirect to Stripe Checkout page [3, 9]
        window.location.href = res.data.url;
      } else {
        throw new Error("Stripe checkout URL missing over here");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to initiate purchase over here");
    } finally {
      setBuyingId(null);
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className={s.root}>
      <PageBackdrop />

      {/* 1. HERO SECTION */}
      <section className={s.heroSection}>
        <div className={s.heroInner}>
          <div className={s.freeBanner}>
            <Sparkles size={14} className={s.bannerIcon} />
            <span>Try 20 Free Credits on first login over here!</span>
          </div>
          <h1 className={s.heroTitle}>Upgrade Your AI Workspace</h1>
          <p className={s.heroSub}>
            Acquire credits to keep generating, editing, and publishing your custom sites over here. Buy only what you need—no recurring subscriptions!
          </p>
        </div>
      </section>

      {/* 2. PAYMENT FEEDBACK NOTIFICATIONS */}
      <div className={s.workspaceArea}>
        {verifyingPayment && (
          <div className={s.notificationBanner}>
            <Loader2 className={s.spinner} />
            <span>Verifying Stripe checkout session status over here...</span>
          </div>
        )}

        {verificationSuccess && (
          <div className={`${s.notificationBanner} ${s.successBanner}`}>
            <Sparkles className={s.successIcon} />
            <div>
              <strong>Payment Processed Successfully!</strong>
              <p>Your credit balance has been updated. Go ship some code over here!</p>
            </div>
          </div>
        )}

        {paymentCanceled && (
          <div className={`${s.notificationBanner} ${s.canceledBanner}`}>
            <AlertCircle className={s.canceledIcon} />
            <span>Transaction cancelled over here. No charges were made.</span>
          </div>
        )}

        {/* 3. CREDIT TIERS CARDS */}
        {loadingPackages ? (
          <div className={s.loadingBox}>
            <Loader2 className={s.spinnerLarge} />
            <span>Fetching credit packages and tiers...</span>
          </div>
        ) : (
          <div className={s.pricingGrid}>
            {packages.map((pkg) => {
              const staticPkgInfo = defaultPackages.find((p) => p.id === pkg.id) || {};
              const isPopular = staticPkgInfo.popular;
              const formattedPrice = (pkg.amount / 100).toLocaleString("en-US", {
                style: "currency",
                currency: pkg.currency || "USD"
              });

              return (
                <div key={pkg.id} className={`${s.card} ${isPopular ? s.popularCard : ""}`}>
                  {isPopular && (
                    <div className={s.popularBadge}>
                      <span>MOST POPULAR</span>
                    </div>
                  )}

                  <div className={s.cardHeader}>
                    <h3 className={s.packageName}>{pkg.name}</h3>
                    <p className={s.packageDescription}>
                      {staticPkgInfo.description || "Top up credits for generating site workspaces over here."}
                    </p>
                  </div>

                  <div className={s.priceBox}>
                    <span className={s.priceAmount}>{formattedPrice}</span>
                    <span className={s.priceOneTime}>one-time payment</span>
                  </div>

                  <div className={s.creditsBox}>
                    <Zap size={18} className={s.zapIcon} />
                    <span className={s.creditsCount}>{pkg.credits} Credits</span>
                  </div>

                  <button
                    onClick={() => handleBuy(pkg.id)}
                    disabled={buyingId !== null || verifyingPayment}
                    className={`${s.buyBtn} ${isPopular ? s.buyBtnPopular : s.buyBtnDefault}`}
                  >
                    {buyingId === pkg.id ? (
                      <>
                        <Loader2 className={s.spinner} />
                        <span>Redirecting...</span>
                      </>
                    ) : (
                      <span>Buy Credits</span>
                    )}
                  </button>

                  <div className={s.featuresList}>
                    <div className={s.featureRow}>
                      <Check size={14} className={s.checkIcon} />
                      <span>Generate {Math.floor(pkg.credits / 5)} complete websites</span>
                    </div>
                    <div className={s.featureRow}>
                      <Check size={14} className={s.checkIcon} />
                      <span>Refine code up to {Math.floor(pkg.credits / 2)} times</span>
                    </div>
                    <div className={s.featureRow}>
                      <Check size={14} className={s.checkIcon} />
                      <span>Live Vercel & GitHub Deployments</span>
                    </div>
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

        {/* 4. FAQ ACCORDION PANEL */}
        <section className={s.faqSection}>
          <div className={s.faqHeader}>
            <HelpCircle size={24} className={s.faqIconHeader} />
            <h2 className={s.faqTitle}>Frequently Asked Questions</h2>
            <p className={s.faqSubtitle}>Got questions? We have got answers. Here are details about credits, Stripe payments, and hosting over here.</p>
          </div>

          <div className={s.faqGrid}>
            {faqsList.map((faq, i) => (
              <div key={i} className={s.faqCard}>
                <button className={s.faqQuestionBtn} onClick={() => toggleFaq(i)}>
                  <span>{faq.question}</span>
                  {openFaq === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openFaq === i && (
                  <div className={s.faqAnswer}>
                    <p>{faq.answer}</p>
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