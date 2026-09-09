// import { generateMockSite, mockEnhancePrompt } from "./mockGenerator.js";

// import {
//   callLLM,
//   isLLMConfigured,
//   isQuotaError,
//   ENHANCE_SYSTEM,
//   buildGenerateSystem,
//   postProcess,
//   resolveImages,
// } from "./llm.js";

// import Razorpay from "razorpay";


// // ═══════════════════════════════════════════════════════════════════════════
// // AI GENERATION
// // ═══════════════════════════════════════════════════════════════════════════

// export { postProcess };

// const APPROX_CHARS_PER_TOKEN = 4;
// const INPUT_BUDGET_TOKENS = 30000;
// const IDEAL_OUTPUT_TOKENS = 30000;

// function approxTokens(s) {
//   return Math.ceil((s || "").length / APPROX_CHARS_PER_TOKEN);
// }

// // Remove our own injected runtime before sending HTML back to the AI.
// function stripInjectedRuntime(html) {
//   if (!html) return html;

//   return html
//     .replace(
//       /<script id="__mintsite_link_interceptor__">[\s\S]*?<\/script>/gi,
//       ""
//     )
//     .replace(
//       /<style id="__mintsite_fix__">[\s\S]*?<\/style>/gi,
//       ""
//     );
// }

// // Extract the existing brand identity from the previous HTML.
// function extractBrandIdentity(html) {
//   if (!html) return null;

//   const grab = (re) => {
//     const m = html.match(re);

//     if (!m) return null;

//     return m[1]
//       .replace(/<[^>]+>/g, " ")
//       .replace(/\s+/g, " ")
//       .trim();
//   };

//   const title = grab(/<title[^>]*>([\s\S]*?)<\/title>/i);
//   const h1 = grab(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
//   const h2 = grab(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i);

//   const headerMatch = html.match(/<header[\s\S]*?<\/header>/i);

//   let brandLink = null;

//   if (headerMatch) {
//     const m = headerMatch[0].match(
//       /<a\b[^>]*>([\s\S]*?)<\/a>/i
//     );

//     if (m) {
//       brandLink = m[1]
//         .replace(/<[^>]+>/g, " ")
//         .replace(/\s+/g, " ")
//         .trim();
//     }
//   }

//   if (!title && !h1 && !brandLink) {
//     return null;
//   }

//   return {
//     title: title?.slice(0, 80),
//     h1: h1?.slice(0, 80),
//     h2: h2?.slice(0, 120),
//     brandLink: brandLink?.slice(0, 80),
//   };
// }

// // Shrink previous HTML to fit the token budget.
// function truncatePreviousHtml(html, budgetTokens) {
//   if (!html) return html;

//   const budgetChars =
//     budgetTokens * APPROX_CHARS_PER_TOKEN;

//   if (html.length <= budgetChars) {
//     return html;
//   }

//   const headEnd = html.search(/<\/head>/i);

//   const head =
//     headEnd > 0
//       ? html.slice(0, headEnd + 7)
//       : "";

//   const bodyStart = html.search(/<body[^>]*>/i);

//   const bodyOpen =
//     bodyStart > 0
//       ? html.slice(
//           bodyStart,
//           html.indexOf(">", bodyStart) + 1
//         )
//       : "<body>";

//   const remaining = Math.max(
//     800,
//     budgetChars - head.length - 200
//   );

//   const bodyContentStart =
//     bodyStart > 0
//       ? bodyStart + bodyOpen.length
//       : 0;

//   const tail = html.slice(
//     bodyContentStart,
//     bodyContentStart + remaining
//   );

//   return `${head}
// ${bodyOpen}
// <!-- TRUNCATED FOR TOKEN BUDGET: full original ~${html.length} chars -->
// ${tail}
// <!-- ...truncated... -->
// </body>
// </html>`;
// }

// // ═══════════════════════════════════════════════════════════════════════════
// // PARSING + POST PROCESSING
// // ═══════════════════════════════════════════════════════════════════════════

// const SUMMARY_OPEN = "<<<MINTSITE_SUMMARY>>>";
// const SUMMARY_CLOSE = "<<<END>>>";

// const GENERATE_SYSTEM = buildGenerateSystem({
//   summaryOpen: SUMMARY_OPEN,
//   summaryClose: SUMMARY_CLOSE,
// });

// // Extract a clean HTML document from raw model output.
// function extractHtml(raw) {
//   if (!raw) return "";

//   const fenced = raw.match(
//     /```(?:html)?\s*([\s\S]*?)```/i
//   );

//   let candidate = (
//     fenced ? fenced[1] : raw
//   ).trim();

//   const doctypeIdx = candidate.search(/<!doctype/i);
//   const htmlIdx = candidate.search(/<html[\s>]/i);

//   const start =
//     doctypeIdx !== -1
//       ? doctypeIdx
//       : htmlIdx !== -1
//       ? htmlIdx
//       : -1;

//   if (start === -1) {
//     return `<!doctype html>
// <html>
// <head>
// <meta charset="utf-8">
// <title>Generated site</title>
// </head>
// <body>
// ${candidate}
// </body>
// </html>`;
//   }

//   if (start > 0) {
//     candidate = candidate.slice(start);
//   }

//   const closeMatch = candidate.match(
//     /<\/html\s*>/i
//   );

//   if (closeMatch) {
//     const end =
//       candidate.indexOf(closeMatch[0]) +
//       closeMatch[0].length;

//     candidate = candidate.slice(0, end);
//   }

//   return candidate.trim();
// }

// // Split raw model output into HTML + summary.
// function parseModelOutput(raw) {
//   if (!raw) {
//     return {
//       html: "",
//       summary: "",
//     };
//   }

//   const summaryIdx =
//     raw.indexOf(SUMMARY_OPEN);

//   if (summaryIdx !== -1) {
//     const htmlChunk =
//       raw.slice(0, summaryIdx);

//     const tail = raw.slice(
//       summaryIdx + SUMMARY_OPEN.length
//     );

//     const endIdx =
//       tail.indexOf(SUMMARY_CLOSE);

//     const summary = (
//       endIdx >= 0
//         ? tail.slice(0, endIdx)
//         : tail
//     ).trim();

//     const html = extractHtml(htmlChunk);

//     if (html.length > 200) {
//       return {
//         html,
//         summary,
//       };
//     }
//   }

//   const closeMatch = raw.match(
//     /<\/html\s*>/i
//   );

//   if (closeMatch) {
//     const closeEnd =
//       raw.indexOf(closeMatch[0]) +
//       closeMatch[0].length;

//     const htmlChunk =
//       raw.slice(0, closeEnd);

//     const tail =
//       raw.slice(closeEnd);

//     let summary = "";

//     const sumIdx =
//       tail.indexOf(SUMMARY_OPEN);

//     if (sumIdx !== -1) {
//       const inner = tail.slice(
//         sumIdx + SUMMARY_OPEN.length
//       );

//       const endIdx =
//         inner.indexOf(SUMMARY_CLOSE);

//       summary = (
//         endIdx >= 0
//           ? inner.slice(0, endIdx)
//           : inner
//       ).trim();
//     } else {
//       summary = tail.trim();
//     }

//     return {
//       html: extractHtml(htmlChunk),
//       summary,
//     };
//   }

//   return {
//     html: extractHtml(raw),
//     summary: "",
//   };
// }

// // ═══════════════════════════════════════════════════════════════════════════
// // ENHANCE PROMPT
// // ═══════════════════════════════════════════════════════════════════════════

// export async function enhancePrompt(prompt) {
//   if (!isLLMConfigured()) {
//     return {
//       text: mockEnhancePrompt(prompt),
//       source: "mock-no-key",
//     };
//   }

//   try {
//     console.log(
//       "\n[ai] Refining your idea into a design brief..."
//     );

//     const out = await callLLM(
//       [
//         {
//           role: "system",
//           content: ENHANCE_SYSTEM,
//         },
//         {
//           role: "user",
//           content: prompt,
//         },
//       ],
//       {
//         temperature: 0.4,
//         maxTokens: 500,
//       }
//     );

//     return {
//       text: out.trim(),
//       source: "llm",
//     };
//   } catch (err) {
//     console.log(
//       "[ai] Could not refine the prompt, using a quick template brief."
//     );

//     return {
//       text: mockEnhancePrompt(prompt),
//       source: "mock-error",
//       error: err.message,
//     };
//   }
// }

// // ═══════════════════════════════════════════════════════════════════════════
// // GENERATE WEBSITE
// // ═══════════════════════════════════════════════════════════════════════════

// export async function generateSite(
//   prompt,
//   {
//     previousHtml = "",
//     history = [],
//     originalPrompt = "",
//   } = {}
// ) {
//   previousHtml =
//     stripInjectedRuntime(previousHtml);

//   const mockSeed =
//     originalPrompt || prompt;

//   if (!isLLMConfigured()) {
//     return {
//       html: postProcess(
//         generateMockSite(mockSeed)
//       ),
//       summary: "",
//       source: "mock-no-key",
//     };
//   }

//   try {
//     const historySlice =
//       history.slice(-2);

//     const sysTokens =
//       approxTokens(GENERATE_SYSTEM);

//     const histTokens =
//       historySlice.reduce(
//         (n, m) =>
//           n + approxTokens(m.text),
//         0
//       );

//     const promptTokens =
//       approxTokens(prompt);

//     const prevBudget = Math.max(
//       500,
//       INPUT_BUDGET_TOKENS -
//         sysTokens -
//         histTokens -
//         promptTokens -
//         250
//     );

//     const trimmedHtml =
//       truncatePreviousHtml(
//         previousHtml,
//         prevBudget
//       );

//     const messages = [
//       {
//         role: "system",
//         content: GENERATE_SYSTEM,
//       },
//     ];

//     for (const m of historySlice) {
//       messages.push({
//         role: m.role,
//         content: m.text,
//       });
//     }

//     if (trimmedHtml) {
//       const brand =
//         extractBrandIdentity(
//           previousHtml
//         );

//       const brandLock = brand
//         ? `
// ═══ BRAND LOCK — DO NOT VIOLATE ═══

// The existing brand on this project is FIXED.

// You MUST preserve it exactly:

// • Title: "${brand.title || "(none)"}"
// • H1: "${brand.h1 || "(none)"}"
// • Brand link: "${brand.brandLink || "(none)"}"
// • Hero subtitle: "${brand.h2 || "(none)"}"

// Do NOT change the brand name.

// Do NOT change the topic or industry.

// Do NOT invent a new company.

// The user's request is a TWEAK to the EXISTING site,
// not a new site.

// If the change request seems to imply a different brand,
// keep the original brand.
// `
//         : "";

//       messages.push({
//         role: "user",
//         content: `Current site HTML (source of truth — keep what works, change only what's requested):

// \`\`\`html
// ${trimmedHtml}
// \`\`\`

// ${brandLock}

// Change request:

// ${prompt}

// Return the FULL updated HTML document followed by the ${SUMMARY_OPEN}...${SUMMARY_CLOSE} block.`,
//       });
//     } else {
//       messages.push({
//         role: "user",
//         content: `Build a complete, production-quality website based on this creative brief:

// ${prompt}

// Return the raw HTML document followed by the ${SUMMARY_OPEN}...${SUMMARY_CLOSE} block.`,
//       });
//     }

//     const isIteration =
//       Boolean(trimmedHtml);

//     console.log(
//       `\n[ai] ${
//         isIteration
//           ? "Updating"
//           : "Building"
//       } your website...`
//     );

//     const raw = await callLLM(
//       messages,
//       {
//         temperature: isIteration
//           ? 0.3
//           : 0.6,
//         maxTokens:
//           IDEAL_OUTPUT_TOKENS,
//       }
//     );

//     const {
//       html,
//       summary,
//     } = parseModelOutput(raw);

//     const truncated =
//       !/<\/html\s*>/i.test(html);

//     const finalHtml =
//       await resolveImages(
//         postProcess(html)
//       );

//     console.log(
//       "[ai] Website ready.\n"
//     );

//     return {
//       html: finalHtml,
//       summary,
//       source: "llm",
//       truncated,
//     };
//   } catch (err) {
//     console.log(
//       `[ai] Every AI model is busy right now, returned a starter template instead. ${friendlyError(err)}\n`
//     );

//     return {
//       html: postProcess(
//         generateMockSite(mockSeed)
//       ),
//       summary: "",
//       source: "mock-error",
//       error: friendlyError(err),
//     };
//   }
// }

// // ═══════════════════════════════════════════════════════════════════════════
// // AI ERROR HANDLING
// // ═══════════════════════════════════════════════════════════════════════════

// function friendlyError(err) {
//   if (!err) {
//     return "Unknown error";
//   }

//   if (isQuotaError(err)) {
//     return "Every AI model hit its free-tier limit for the moment. Please wait and try again.";
//   }

//   if (
//     err.status === 413 ||
//     /too large|request too large/i.test(
//       err.message || ""
//     )
//   ) {
//     return "AI request was too large for the current model's token limit. Try a shorter follow-up.";
//   }

//   if (
//     err.status === 401 ||
//     err.status === 403
//   ) {
//     return `${
//       err.providerName || "AI"
//     } rejected the API key. Check your API key in server/.env.`;
//   }

//   if (
//     err.status === 503 ||
//     err.status === 502 ||
//     err.status === 504
//   ) {
//     return "The AI provider is overloaded right now. Please try again in a minute.";
//   }

//   const msg = (
//     err.message ||
//     String(err)
//   ).slice(0, 240);

//   return `AI generation failed: ${msg}`;
// }

// // ═══════════════════════════════════════════════════════════════════════════
// // EMAIL / OTP
// // ═══════════════════════════════════════════════════════════════════════════

// const BREVO_ENDPOINT =
//   "https://api.brevo.com/v3/smtp/email";

// export function isEmailConfigured() {
//   return Boolean(
//     process.env.BREVO_API_KEY &&
//       process.env.BREVO_SENDER_EMAIL
//   );
// }

// function consoleFallback(
//   to,
//   code,
//   reason
// ) {
//   console.log(
//     `\n[email:dev-fallback] OTP for ${to} → ${code} (${reason})\n`
//   );
// }

// function parseBrevoError(
//   status,
//   body
// ) {
//   try {
//     const parsed = JSON.parse(body);

//     const message =
//       parsed.message ||
//       JSON.stringify(parsed);

//     if (status === 401) {
//       if (/sender/i.test(message)) {
//         return `Brevo 401: ${message}. Verify the sender email in your Brevo account.`;
//       }

//       return `Brevo 401: ${message}. Check BREVO_API_KEY.`;
//     }

//     return `Brevo ${status}: ${message}`;
//   } catch {
//     return `Brevo ${status}: ${body.slice(
//       0,
//       200
//     )}`;
//   }
// }

// export async function sendOtpEmail({
//   to,
//   name,
//   code,
//   purpose,
// }) {
//   const isSignup =
//     purpose === "signup";

//   const subject = isSignup
//     ? `Verify your mintsite account — code: ${code}`
//     : `Your mintsite code: ${code}`;

//   const intro = isSignup
//     ? "Welcome to mintsite! Use this code to verify your email and finish signing up."
//     : "Enter this code to sign in. It expires in 10 minutes.";

//   const textContent = `Hi ${
//     name || "there"
//   },

// ${intro}

// Your code: ${code}

// This code expires in 10 minutes.

// If you didn't request this, you can safely ignore this email.

// — mintsite`;

//   const htmlContent =
//     renderEmailHtml({
//       name,
//       code,
//       intro,
//     });

//   if (!isEmailConfigured()) {
//     consoleFallback(
//       to,
//       code,
//       "BREVO_API_KEY not set"
//     );

//     return {
//       sent: false,
//       fallback: true,
//       reason: "not_configured",
//     };
//   }

//   const payload = {
//     sender: {
//       name:
//         process.env.BREVO_SENDER_NAME ||
//         "mintsite",
//       email:
//         process.env.BREVO_SENDER_EMAIL,
//     },

//     to: [
//       {
//         email: to,
//         name: name || to,
//       },
//     ],

//     subject,
//     htmlContent,
//     textContent,
//   };

//   try {
//     const r = await fetch(
//       BREVO_ENDPOINT,
//       {
//         method: "POST",

//         headers: {
//           accept: "application/json",
//           "content-type":
//             "application/json",
//           "api-key":
//             process.env.BREVO_API_KEY,
//         },

//         body: JSON.stringify(payload),
//       }
//     );

//     if (r.ok) {
//       return {
//         sent: true,
//         fallback: false,
//       };
//     }

//     const body =
//       await r.text();

//     const message =
//       parseBrevoError(
//         r.status,
//         body
//       );

//     console.error(
//       "[brevo]",
//       message
//     );

//     consoleFallback(
//       to,
//       code,
//       `provider error ${r.status}`
//     );

//     return {
//       sent: false,
//       fallback: true,
//       reason: "provider_error",
//       status: r.status,
//       providerError: message,
//     };
//   } catch (err) {
//     console.error(
//       "[brevo] network error:",
//       err.message
//     );

//     consoleFallback(
//       to,
//       code,
//       `network error: ${err.message}`
//     );

//     return {
//       sent: false,
//       fallback: true,
//       reason: "network_error",
//       providerError: err.message,
//     };
//   }
// }

// // Escape HTML characters.
// function escape(s) {
//   return String(s).replace(
//     /[<>&"']/g,
//     (c) =>
//       ({
//         "<": "&lt;",
//         ">": "&gt;",
//         "&": "&amp;",
//         '"': "&quot;",
//         "'": "&#39;",
//       })[c]
//   );
// }

// // OTP email HTML.
// function renderEmailHtml({
//   name,
//   code,
//   intro,
// }) {
//   const lead =
//     intro ||
//     "Enter this code to sign in. It expires in 10 minutes.";

//   return `<!doctype html>
// <html>
// <body style="font-family:Inter,system-ui,sans-serif;background:#f4f4f5;padding:24px;color:#0f172a;margin:0">

// <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:14px;padding:32px;border:1px solid #e2e8f0">

// <h1 style="margin:0 0 12px;font-size:20px">
// Your mintsite code
// </h1>

// <p style="margin:0 0 20px;color:#475569;font-size:14px">
// Hi ${escape(name || "there")}, ${escape(lead)}
// </p>

// <div style="font-size:34px;font-weight:700;letter-spacing:8px;text-align:center;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px 0;margin:0 0 20px;color:#0f172a">
// ${code}
// </div>

// <p style="margin:0;color:#94a3b8;font-size:12px">
// If you didn't request this, you can safely ignore this email.
// </p>

// </div>

// </body>
// </html>`;
// }

// // ═══════════════════════════════════════════════════════════════════════════
// // OTP STORE
// // ═══════════════════════════════════════════════════════════════════════════

// const otpStore = new Map();

// const OTP_TTL_MS =
//   10 * 60 * 1000;

// export const generateOtp = () =>
//   String(
//     Math.floor(
//       100000 +
//         Math.random() * 900000
//     )
//   );

// export function saveOtp(
//   email,
//   code
// ) {
//   otpStore.set(email, {
//     code,
//     expiresAt:
//       Date.now() + OTP_TTL_MS,
//   });
// }

// export function verifyOtp(
//   email,
//   code
// ) {
//   const record =
//     otpStore.get(email);

//   if (!record) {
//     return {
//       ok: false,
//       reason:
//         "No code requested. Request a new one.",
//     };
//   }

//   if (
//     Date.now() >
//     record.expiresAt
//   ) {
//     otpStore.delete(email);

//     return {
//       ok: false,
//       reason:
//         "Code expired. Request a new one.",
//     };
//   }

//   if (
//     record.code !==
//     String(code).trim()
//   ) {
//     return {
//       ok: false,
//       reason: "Incorrect code.",
//     };
//   }

//   otpStore.delete(email);

//   return {
//     ok: true,
//   };
// }

// export function peekOtp(
//   email,
//   code
// ) {
//   const record =
//     otpStore.get(email);

//   if (!record) {
//     return {
//       ok: false,
//       reason:
//         "No code requested. Request a new one.",
//     };
//   }

//   if (
//     Date.now() >
//     record.expiresAt
//   ) {
//     otpStore.delete(email);

//     return {
//       ok: false,
//       reason:
//         "Code expired. Request a new one.",
//     };
//   }

//   if (
//     record.code !==
//     String(code).trim()
//   ) {
//     return {
//       ok: false,
//       reason: "Incorrect code.",
//     };
//   }

//   return {
//     ok: true,
//   };
// }

// // ═══════════════════════════════════════════════════════════════════════════
// // RAZORPAY PAYMENTS
// // ═══════════════════════════════════════════════════════════════════════════

// let razorpayClient = null;

// function getRazorpay() {
//   if (razorpayClient) {
//     return razorpayClient;
//   }

//   const keyId =
//     process.env.RAZORPAY_KEY_ID;

//   const keySecret =
//     process.env.RAZORPAY_KEY_SECRET;

//   if (!keyId || !keySecret) {
//     return null;
//   }

//   razorpayClient =
//     new Razorpay({
//       key_id: keyId,
//       key_secret: keySecret,
//     });

//   return razorpayClient;
// }

// export function isRazorpayConfigured() {
//   return Boolean(
//     process.env.RAZORPAY_KEY_ID &&
//       process.env.RAZORPAY_KEY_SECRET
//   );
// }

// export async function createRazorpayOrder({
//   amount,
//   currency = "INR",
//   receipt,
//   notes = {},
// }) {
//   const razorpay =
//     getRazorpay();

//   if (!razorpay) {
//     throw new Error(
//       "Razorpay not configured"
//     );
//   }

//   const order =
//     await razorpay.orders.create({
//       amount,
//       currency,
//       receipt,
//       notes,
//     });

//   return {
//     id: order.id,
//     amount: order.amount,
//     currency: order.currency,
//     receipt: order.receipt,
//     status: order.status,
//   };
// }

// export async function verifyRazorpayPayment({
//   orderId,
//   paymentId,
//   signature,
// }) {
//   const crypto =
//     await import("crypto");

//   const generatedSignature =
//     crypto
//       .createHmac(
//         "sha256",
//         process.env.RAZORPAY_KEY_SECRET
//       )
//       .update(
//         `${orderId}|${paymentId}`
//       )
//       .digest("hex");

//   return (
//     generatedSignature ===
//     signature
//   );
// }
 

import { generateMockSite, mockEnhancePrompt } from "./mockGenerator.js";

import {
  callLLM,
  isLLMConfigured,
  isQuotaError,
  ENHANCE_SYSTEM,
  buildGenerateSystem,
  postProcess,
  resolveImages,
} from "./llm.js";

import Razorpay from "razorpay";

// ═══════════════════════════════════════════════════════════════════════════
// AI GENERATION
// ═══════════════════════════════════════════════════════════════════════════

export { postProcess };

const APPROX_CHARS_PER_TOKEN = 4;
const INPUT_BUDGET_TOKENS = 30000;
const IDEAL_OUTPUT_TOKENS = 30000;

function approxTokens(s) {
  return Math.ceil((s || "").length / APPROX_CHARS_PER_TOKEN);
}

// Remove our own injected runtime before sending HTML back to the AI.
function stripInjectedRuntime(html) {
  if (!html) return html;

  return html
    .replace(
      /<script id="__mintsite_link_interceptor__">[\s\S]*?<\/script>/gi,
      ""
    )
    .replace(
      /<style id="__mintsite_fix__">[\s\S]*?<\/style>/gi,
      ""
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXTRACT EXISTING BRAND IDENTITY
// ═══════════════════════════════════════════════════════════════════════════

function extractBrandIdentity(html) {
  if (!html) return null;

  const grab = (re) => {
    const m = html.match(re);

    if (!m) return null;

    return m[1]
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const title = grab(
    /<title[^>]*>([\s\S]*?)<\/title>/i
  );

  const h1 = grab(
    /<h1\b[^>]*>([\s\S]*?)<\/h1>/i
  );

  const h2 = grab(
    /<h2\b[^>]*>([\s\S]*?)<\/h2>/i
  );

  const headerMatch = html.match(
    /<header[\s\S]*?<\/header>/i
  );

  let brandLink = null;

  if (headerMatch) {
    const m = headerMatch[0].match(
      /<a\b[^>]*>([\s\S]*?)<\/a>/i
    );

    if (m) {
      brandLink = m[1]
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }
  }

  if (!title && !h1 && !brandLink) {
    return null;
  }

  return {
    title: title?.slice(0, 80),
    h1: h1?.slice(0, 80),
    h2: h2?.slice(0, 120),
    brandLink: brandLink?.slice(0, 80),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SHRINK PREVIOUS HTML TO FIT TOKEN BUDGET
// ═══════════════════════════════════════════════════════════════════════════

function truncatePreviousHtml(html, budgetTokens) {
  if (!html) return html;

  const budgetChars =
    budgetTokens * APPROX_CHARS_PER_TOKEN;

  if (html.length <= budgetChars) {
    return html;
  }

  const headEnd = html.search(/<\/head>/i);

  const head =
    headEnd > 0
      ? html.slice(0, headEnd + 7)
      : "";

  const bodyStart = html.search(
    /<body[^>]*>/i
  );

  const bodyOpen =
    bodyStart > 0
      ? html.slice(
          bodyStart,
          html.indexOf(">", bodyStart) + 1
        )
      : "<body>";

  const remaining = Math.max(
    800,
    budgetChars - head.length - 200
  );

  const bodyContentStart =
    bodyStart > 0
      ? bodyStart + bodyOpen.length
      : 0;

  const tail = html.slice(
    bodyContentStart,
    bodyContentStart + remaining
  );

  return `${head}
${bodyOpen}

<!-- TRUNCATED FOR TOKEN BUDGET: full original ~${html.length} chars -->

${tail}

<!-- ...truncated... -->

</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// PARSING + POST PROCESSING
// ═══════════════════════════════════════════════════════════════════════════

const SUMMARY_OPEN = "<<<MINTSITE_SUMMARY>>>";
const SUMMARY_CLOSE = "<<<END>>>";

const GENERATE_SYSTEM = buildGenerateSystem({
  summaryOpen: SUMMARY_OPEN,
  summaryClose: SUMMARY_CLOSE,
});

// ═══════════════════════════════════════════════════════════════════════════
// IMPORTANT CONTENT RULES
// ═══════════════════════════════════════════════════════════════════════════

/*
  IMPORTANT:

  The user's prompt is an instruction.

  It is NOT website copy.

  The AI must understand the request and create original website content.
*/

const CONTENT_GENERATION_RULES = `
════════════════════════════════════════════════════════════════════
CRITICAL WEBSITE CONTENT INSTRUCTIONS
════════════════════════════════════════════════════════════════════

The user's message is an INSTRUCTION describing the website they want.

The user's message is NOT website copy.

You must understand the meaning of the user's request and then create
professional, original website content from that meaning.

────────────────────────────────────────────────────────────────────
HERO HEADLINE RULES
────────────────────────────────────────────────────────────────────

The hero H1 is extremely important.

NEVER use the user's request itself as the hero H1.

NEVER copy instruction-style phrases into the H1.

For example:

User request:
"make a natural scenery website"

BAD:
"Make a Natural Scenery Website"

BAD:
"Natural Scenery Website"

BAD:
"Create a Natural Scenery Website"

GOOD:
"Escape Into Nature"

GOOD:
"Where Nature Comes Alive"

GOOD:
"Discover the Beauty of Nature"

Another example:

User request:
"make an ice cream website"

BAD:
"Make an Ice Cream Website"

GOOD:
"Sweet Moments, One Scoop at a Time"

Another example:

User request:
"make a movie website"

BAD:
"Make a Movie Website"

GOOD:
"Stories Worth Watching"

The hero H1 should normally:

- be around 3-8 words
- sound like real marketing copy
- be natural and memorable
- communicate the website's purpose or value
- NOT sound like an instruction
- NOT repeat the user's prompt
- NOT contain phrases like "make a website"
- NOT contain phrases like "create a website"
- NOT contain phrases like "build a website"
- NOT contain phrases like "design a website"

────────────────────────────────────────────────────────────────────
UNDERSTAND THE REQUEST
────────────────────────────────────────────────────────────────────

Extract these things from the user's request:

- website type
- business/industry
- target audience
- products or services
- visual style
- tone
- important features
- colors
- layout requirements
- any specific brand name

Then create ORIGINAL website copy based on those requirements.

────────────────────────────────────────────────────────────────────
VISIBLE WEBSITE COPY
────────────────────────────────────────────────────────────────────

Create original content for:

- Hero H1
- Hero subtitle
- Section headings
- Feature descriptions
- Product descriptions
- About section
- CTA buttons
- Navigation labels
- Footer content

Do NOT copy the user's instruction into these areas.

The website should look and read like a real professional website,
not like an AI has pasted the user's request into the page.

────────────────────────────────────────────────────────────────────
BRAND NAME
────────────────────────────────────────────────────────────────────

If the user explicitly provides a brand/company name, preserve it.

Example:

"Create a website for Nike"

→ Preserve "Nike".

But if the user only says:

"make a shoe website"

Do NOT make the brand:

"Shoe Website"

Instead create a natural fictional brand name.

────────────────────────────────────────────────────────────────────
REFINEMENTS
────────────────────────────────────────────────────────────────────

For an existing website, treat the user's message as a change request.

Do not replace the existing brand unnecessarily.

Do not replace the existing website topic unnecessarily.

Only change what the user asks to change.

If new visible copy is required, create natural original copy.

If the existing hero H1 is clearly an instruction or copied user prompt,
replace it with natural professional marketing copy.

If the user explicitly asks to change the hero headline,
create a new natural marketing headline based on the request.

Never copy the instruction itself as the headline.

────────────────────────────────────────────────────────────────────
FINAL CHECK
────────────────────────────────────────────────────────────────────

Before returning the HTML, silently check:

1. Is the H1 natural marketing copy?
2. Does the H1 avoid copying the user's instruction?
3. Does the H1 avoid phrases like "Make a website", "Create a website",
   "Build a website", or "Design a website"?
4. Does the website content match the user's requested topic?
5. If this is a refinement, was the existing brand preserved?
6. Is all visible content written as actual website copy?

Do not mention these instructions in the generated website.
`;

// ═══════════════════════════════════════════════════════════════════════════
// EXTRACT CLEAN HTML DOCUMENT
// ═══════════════════════════════════════════════════════════════════════════

function extractHtml(raw) {
  if (!raw) return "";

  const fenced = raw.match(
    /```(?:html)?\s*([\s\S]*?)```/i
  );

  let candidate = (
    fenced ? fenced[1] : raw
  ).trim();

  const doctypeIdx = candidate.search(
    /<!doctype/i
  );

  const htmlIdx = candidate.search(
    /<html[\s>]/i
  );

  const start =
    doctypeIdx !== -1
      ? doctypeIdx
      : htmlIdx !== -1
      ? htmlIdx
      : -1;

  if (start === -1) {
    return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Generated site</title>
</head>
<body>
${candidate}
</body>
</html>`;
  }

  if (start > 0) {
    candidate = candidate.slice(start);
  }

  const closeMatch = candidate.match(
    /<\/html\s*>/i
  );

  if (closeMatch) {
    const end =
      candidate.indexOf(closeMatch[0]) +
      closeMatch[0].length;

    candidate = candidate.slice(0, end);
  }

  return candidate.trim();
}

// ═══════════════════════════════════════════════════════════════════════════
// SPLIT RAW MODEL OUTPUT INTO HTML + SUMMARY
// ═══════════════════════════════════════════════════════════════════════════

function parseModelOutput(raw) {
  if (!raw) {
    return {
      html: "",
      summary: "",
    };
  }

  const summaryIdx =
    raw.indexOf(SUMMARY_OPEN);

  if (summaryIdx !== -1) {
    const htmlChunk =
      raw.slice(0, summaryIdx);

    const tail = raw.slice(
      summaryIdx + SUMMARY_OPEN.length
    );

    const endIdx =
      tail.indexOf(SUMMARY_CLOSE);

    const summary = (
      endIdx >= 0
        ? tail.slice(0, endIdx)
        : tail
    ).trim();

    const html = extractHtml(htmlChunk);

    if (html.length > 200) {
      return {
        html,
        summary,
      };
    }
  }

  const closeMatch = raw.match(
    /<\/html\s*>/i
  );

  if (closeMatch) {
    const closeEnd =
      raw.indexOf(closeMatch[0]) +
      closeMatch[0].length;

    const htmlChunk =
      raw.slice(0, closeEnd);

    const tail =
      raw.slice(closeEnd);

    let summary = "";

    const sumIdx =
      tail.indexOf(SUMMARY_OPEN);

    if (sumIdx !== -1) {
      const inner = tail.slice(
        sumIdx + SUMMARY_OPEN.length
      );

      const endIdx =
        inner.indexOf(SUMMARY_CLOSE);

      summary = (
        endIdx >= 0
          ? inner.slice(0, endIdx)
          : inner
      ).trim();
    } else {
      summary = tail.trim();
    }

    return {
      html: extractHtml(htmlChunk),
      summary,
    };
  }

  return {
    html: extractHtml(raw),
    summary: "",
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ENHANCE PROMPT
// ═══════════════════════════════════════════════════════════════════════════

export async function enhancePrompt(prompt) {
  if (!isLLMConfigured()) {
    return {
      text: mockEnhancePrompt(prompt),
      source: "mock-no-key",
    };
  }

  try {
    console.log(
      "\n[ai] Refining your idea into a design brief..."
    );

    const enhanceSystem = `
${ENHANCE_SYSTEM}

${CONTENT_GENERATION_RULES}

════════════════════════════════════════════════════════════════════
ADDITIONAL PROMPT-ENHANCEMENT RULES
════════════════════════════════════════════════════════════════════

The user's prompt is a request for a website, not finished website copy.

Extract the actual requirements from the user's request and turn them
into a useful creative/design brief.

Do not turn the original request into a hero headline.

Do not recommend using the user's exact instruction as visible website text.

The generated brief should help the website generator create original:

- hero headline
- hero subtitle
- section headings
- CTA text
- feature descriptions
- marketing copy

The website copy should be natural and appropriate for the business or
website described by the user.

IMPORTANT:

If the user says:

"make a natural scenery website"

the enhanced brief should describe the desired natural scenery website,
but it MUST NOT say that the hero H1 should be:

"make a natural scenery website"

Instead it should recommend natural marketing copy such as:

"Escape Into Nature"

or

"Discover the Beauty of Nature".

The enhanced prompt is an internal design brief.
It should help the final website generator understand the user's intent.
`;

    const out = await callLLM(
      [
        {
          role: "system",
          content: enhanceSystem,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      {
        temperature: 0.4,
        maxTokens: 500,
      }
    );

    return {
      text: out.trim(),
      source: "llm",
    };
  } catch (err) {
    console.log(
      "[ai] Could not refine the prompt, using a quick template brief."
    );

    return {
      text: mockEnhancePrompt(prompt),
      source: "mock-error",
      error: err.message,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// GENERATE WEBSITE
// ═══════════════════════════════════════════════════════════════════════════

export async function generateSite(
  prompt,
  {
    previousHtml = "",
    history = [],
    originalPrompt = "",
  } = {}
) {
  previousHtml =
    stripInjectedRuntime(previousHtml);

  const mockSeed =
    originalPrompt || prompt;

  // ═══════════════════════════════════════════════════════════════════════
  // OFFLINE / MOCK FALLBACK
  // ═══════════════════════════════════════════════════════════════════════

  if (!isLLMConfigured()) {
    return {
      html: postProcess(
        generateMockSite(mockSeed).html
      ),
      summary: "",
      source: "mock-no-key",
    };
  }

  try {
    const historySlice =
      history.slice(-2);

    const sysTokens =
      approxTokens(GENERATE_SYSTEM);

    const histTokens =
      historySlice.reduce(
        (n, m) =>
          n + approxTokens(m.text),
        0
      );

    const promptTokens =
      approxTokens(prompt);

    const prevBudget = Math.max(
      500,
      INPUT_BUDGET_TOKENS -
        sysTokens -
        histTokens -
        promptTokens -
        250
    );

    const trimmedHtml =
      truncatePreviousHtml(
        previousHtml,
        prevBudget
      );

    const messages = [
      {
        role: "system",
        content: `
${GENERATE_SYSTEM}

${CONTENT_GENERATION_RULES}

════════════════════════════════════════════════════════════════════
ABSOLUTE PRIORITY
════════════════════════════════════════════════════════════════════

The user's prompt is an instruction.

It is NOT website copy.

Never use the user's instruction verbatim as the website's H1.

If the user's prompt contains:

"make a natural scenery website"

the H1 must NOT be:

"Make a Natural Scenery Website"

It must be original marketing copy such as:

"Escape Into Nature"

"Where Nature Comes Alive"

"Discover the Beauty of Nature"

The same rule applies to every other website request.

Before returning HTML, inspect the H1 and rewrite it if it resembles
the user's instruction.
`,
      },
    ];

    // ═════════════════════════════════════════════════════════════════════
    // EXISTING WEBSITE / REFINEMENT
    // ═════════════════════════════════════════════════════════════════════

    if (trimmedHtml) {
      const brand =
        extractBrandIdentity(
          previousHtml
        );

      const brandLock = brand
        ? `
════════════════════════════════════════════════════════════════════
BRAND LOCK — DO NOT VIOLATE
════════════════════════════════════════════════════════════════════

The existing brand identity is FIXED.

Preserve:

• Title: "${brand.title || "(none)"}"
• Brand link: "${brand.brandLink || "(none)"}"

Do NOT change the brand name.

Do NOT change the website topic or industry.

Do NOT invent a different company.

The user's request is a TWEAK to the EXISTING website.

IMPORTANT:

The existing H1 is NOT automatically protected.

If the existing H1 is clearly an instruction, prompt, or copied request,
you MUST replace it with natural professional marketing copy.

For example:

"Make a Natural Scenery Website"
→ "Escape Into Nature"

"Create an Ice Cream Website"
→ "Sweet Moments, One Scoop at a Time"

"Build a Movie Website"
→ "Stories Worth Watching"

For normal refinements:

- preserve a good existing H1
- preserve the existing brand
- preserve the existing topic
- change only what the user requested

If the user explicitly asks to change the headline,
create a new natural marketing headline.

Do NOT copy the user's instruction as the new H1.
`
        : "";

      messages.push({
        role: "user",
        content: `
Current site HTML is the source of truth.

Keep what already works.

Change ONLY what the user requested.

\`\`\`html
${trimmedHtml}
\`\`\`

${brandLock}

════════════════════════════════════════════════════════════════════
CHANGE REQUEST
════════════════════════════════════════════════════════════════════

${prompt}

════════════════════════════════════════════════════════════════════
REFINEMENT RULES
════════════════════════════════════════════════════════════════════

The change request is an instruction.

Do NOT copy the change request verbatim into visible website content.

If new copy is required, write natural, original website copy.

Do not replace the existing brand.

Do not replace the existing website topic.

Do not unnecessarily replace a good existing hero headline.

If the current hero headline is clearly a copied instruction,
correct it to natural marketing copy.

Return the FULL updated HTML document followed by:

${SUMMARY_OPEN}

your summary

${SUMMARY_CLOSE}
`,
      });
    }

    // ═════════════════════════════════════════════════════════════════════
    // FIRST WEBSITE GENERATION
    // ═════════════════════════════════════════════════════════════════════

    else {
      messages.push({
        role: "user",
        content: `
Create a complete, production-quality website based on the following
user request:

"${prompt}"

════════════════════════════════════════════════════════════════════
VERY IMPORTANT
════════════════════════════════════════════════════════════════════

The text above is a USER INSTRUCTION.

It is NOT website copy.

Understand what the user wants and create the website accordingly.

Do NOT copy the user's instruction into the website.

════════════════════════════════════════════════════════════════════
HERO H1 REQUIREMENT
════════════════════════════════════════════════════════════════════

The hero H1 MUST be original marketing copy.

It must NOT be the user's request.

It must NOT contain instruction-style wording such as:

- Make a website
- Create a website
- Build a website
- Design a website
- Generate a website
- Make a [topic] website
- Create a [topic] website
- Build a [topic] website

Example:

User:
"make a natural scenery website"

DO NOT generate:

<h1>Make a Natural Scenery Website</h1>

DO NOT generate:

<h1>Natural Scenery Website</h1>

Instead generate something like:

<h1>Escape Into Nature</h1>

or:

<h1>Where Nature Comes Alive</h1>

or:

<h1>Discover the Beauty of Nature</h1>

Another example:

User:
"make a movie website"

DO NOT generate:

<h1>Make a Movie Website</h1>

Instead generate:

<h1>Stories Worth Watching</h1>

Another example:

User:
"make an ice cream website"

DO NOT generate:

<h1>Make an Ice Cream Website</h1>

Instead generate:

<h1>Sweet Moments, One Scoop at a Time</h1>

════════════════════════════════════════════════════════════════════
CONTENT REQUIREMENTS
════════════════════════════════════════════════════════════════════

Create original and natural:

- hero headline
- hero subtitle
- section headings
- descriptions
- CTA text
- feature content
- product/service content
- about content
- footer content

The website should feel like a real professional website.

The user's request should influence the website's CONTENT and DESIGN,
but the request itself should not appear as website copy.

════════════════════════════════════════════════════════════════════
BRAND NAME
════════════════════════════════════════════════════════════════════

If the user explicitly provides a brand/company name, preserve it.

Example:

"Create a website for Nike"

→ Keep "Nike".

But if the user only says:

"make a shoe website"

Do NOT create a brand called:

"Shoe Website"

Instead create a natural fictional brand name.

════════════════════════════════════════════════════════════════════
FINAL VALIDATION
════════════════════════════════════════════════════════════════════

Before returning the HTML, inspect the hero H1.

If the H1 resembles the user's request, rewrite it.

The final H1 must:

- sound like professional marketing copy
- be natural
- usually be 3-8 words
- represent the website's purpose
- NOT sound like an instruction
- NOT copy the user's request

Return the raw HTML document followed by:

${SUMMARY_OPEN}

your summary

${SUMMARY_CLOSE}
`,
      });
    }

    const isIteration =
      Boolean(trimmedHtml);

    console.log(
      `\n[ai] ${
        isIteration
          ? "Updating"
          : "Building"
      } your website...`
    );

    const raw = await callLLM(
      messages,
      {
        temperature: isIteration
          ? 0.3
          : 0.6,

        maxTokens:
          IDEAL_OUTPUT_TOKENS,
      }
    );

    const {
      html,
      summary,
    } = parseModelOutput(raw);

    const truncated =
      !/<\/html\s*>/i.test(html);

    const finalHtml =
      await resolveImages(
        postProcess(html)
      );

    console.log(
      "[ai] Website ready.\n"
    );

    return {
      html: finalHtml,
      summary,
      source: "llm",
      truncated,
    };
  } catch (err) {
    console.log(
      `[ai] Every AI model is busy right now, returned a starter template instead. ${friendlyError(
        err
      )}\n`
    );

    return {
      html: postProcess(
        generateMockSite(mockSeed).html
      ),
      summary: "",
      source: "mock-error",
      error: friendlyError(err),
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AI ERROR HANDLING
// ═══════════════════════════════════════════════════════════════════════════

function friendlyError(err) {
  if (!err) {
    return "Unknown error";
  }

  if (isQuotaError(err)) {
    return "Every AI model hit its free-tier limit for the moment. Please wait and try again.";
  }

  if (
    err.status === 413 ||
    /too large|request too large/i.test(
      err.message || ""
    )
  ) {
    return "AI request was too large for the current model's token limit. Try a shorter follow-up.";
  }

  if (
    err.status === 401 ||
    err.status === 403
  ) {
    return `${
      err.providerName || "AI"
    } rejected the API key. Check your API key in server/.env.`;
  }

  if (
    err.status === 503 ||
    err.status === 502 ||
    err.status === 504
  ) {
    return "The AI provider is overloaded right now. Please try again in a minute.";
  }

  const msg = (
    err.message ||
    String(err)
  ).slice(0, 240);

  return `AI generation failed: ${msg}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// EMAIL / OTP
// ═══════════════════════════════════════════════════════════════════════════

const BREVO_ENDPOINT =
  "https://api.brevo.com/v3/smtp/email";

export function isEmailConfigured() {
  return Boolean(
    process.env.BREVO_API_KEY &&
      process.env.BREVO_SENDER_EMAIL
  );
}

function consoleFallback(
  to,
  code,
  reason
) {
  console.log(
    `\n[email:dev-fallback] OTP for ${to} → ${code} (${reason})\n`
  );
}

function parseBrevoError(
  status,
  body
) {
  try {
    const parsed = JSON.parse(body);

    const message =
      parsed.message ||
      JSON.stringify(parsed);

    if (status === 401) {
      if (/sender/i.test(message)) {
        return `Brevo 401: ${message}. Verify the sender email in your Brevo account.`;
      }

      return `Brevo 401: ${message}. Check BREVO_API_KEY.`;
    }

    return `Brevo ${status}: ${message}`;
  } catch {
    return `Brevo ${status}: ${body.slice(
      0,
      200
    )}`;
  }
}

export async function sendOtpEmail({
  to,
  name,
  code,
  purpose,
}) {
  const isSignup =
    purpose === "signup";

  const subject = isSignup
    ? `Verify your mintsite account — code: ${code}`
    : `Your mintsite code: ${code}`;

  const intro = isSignup
    ? "Welcome to mintsite! Use this code to verify your email and finish signing up."
    : "Enter this code to sign in. It expires in 10 minutes.";

  const textContent = `Hi ${
    name || "there"
  },

${intro}

Your code: ${code}

This code expires in 10 minutes.

If you didn't request this, you can safely ignore this email.

— mintsite`;

  const htmlContent =
    renderEmailHtml({
      name,
      code,
      intro,
    });

  if (!isEmailConfigured()) {
    consoleFallback(
      to,
      code,
      "BREVO_API_KEY not set"
    );

    return {
      sent: false,
      fallback: true,
      reason: "not_configured",
    };
  }

  const payload = {
    sender: {
      name:
        process.env.BREVO_SENDER_NAME ||
        "mintsite",

      email:
        process.env.BREVO_SENDER_EMAIL,
    },

    to: [
      {
        email: to,
        name: name || to,
      },
    ],

    subject,
    htmlContent,
    textContent,
  };

  try {
    const r = await fetch(
      BREVO_ENDPOINT,
      {
        method: "POST",

        headers: {
          accept: "application/json",
          "content-type":
            "application/json",
          "api-key":
            process.env.BREVO_API_KEY,
        },

        body: JSON.stringify(payload),
      }
    );

    if (r.ok) {
      return {
        sent: true,
        fallback: false,
      };
    }

    const body =
      await r.text();

    const message =
      parseBrevoError(
        r.status,
        body
      );

    console.error(
      "[brevo]",
      message
    );

    consoleFallback(
      to,
      code,
      `provider error ${r.status}`
    );

    return {
      sent: false,
      fallback: true,
      reason: "provider_error",
      status: r.status,
      providerError: message,
    };
  } catch (err) {
    console.error(
      "[brevo] network error:",
      err.message
    );

    consoleFallback(
      to,
      code,
      `network error: ${err.message}`
    );

    return {
      sent: false,
      fallback: true,
      reason: "network_error",
      providerError: err.message,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ESCAPE HTML
// ═══════════════════════════════════════════════════════════════════════════

function escape(s) {
  return String(s).replace(
    /[<>&"']/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&#39;",
      })[c]
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// OTP EMAIL HTML
// ═══════════════════════════════════════════════════════════════════════════

function renderEmailHtml({
  name,
  code,
  intro,
}) {
  const lead =
    intro ||
    "Enter this code to sign in. It expires in 10 minutes.";

  return `<!doctype html>
<html>
<body style="font-family:Inter,system-ui,sans-serif;background:#f4f4f5;padding:24px;color:#0f172a;margin:0">

<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:14px;padding:32px;border:1px solid #e2e8f0">

<h1 style="margin:0 0 12px;font-size:20px">
Your mintsite code
</h1>

<p style="margin:0 0 20px;color:#475569;font-size:14px">
Hi ${escape(name || "there")}, ${escape(lead)}
</p>

<div style="font-size:34px;font-weight:700;letter-spacing:8px;text-align:center;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px 0;margin:0 0 20px;color:#0f172a">
${code}
</div>

<p style="margin:0;color:#94a3b8;font-size:12px">
If you didn't request this, you can safely ignore this email.
</p>

</div>

</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// OTP STORE
// ═══════════════════════════════════════════════════════════════════════════

const otpStore = new Map();

const OTP_TTL_MS =
  10 * 60 * 1000;

export const generateOtp = () =>
  String(
    Math.floor(
      100000 +
        Math.random() * 900000
    )
  );

export function saveOtp(
  email,
  code
) {
  otpStore.set(email, {
    code,
    expiresAt:
      Date.now() + OTP_TTL_MS,
  });
}

export function verifyOtp(
  email,
  code
) {
  const record =
    otpStore.get(email);

  if (!record) {
    return {
      ok: false,
      reason:
        "No code requested. Request a new one.",
    };
  }

  if (
    Date.now() >
    record.expiresAt
  ) {
    otpStore.delete(email);

    return {
      ok: false,
      reason:
        "Code expired. Request a new one.",
    };
  }

  if (
    record.code !==
    String(code).trim()
  ) {
    return {
      ok: false,
      reason: "Incorrect code.",
    };
  }

  otpStore.delete(email);

  return {
    ok: true,
  };
}

export function peekOtp(
  email,
  code
) {
  const record =
    otpStore.get(email);

  if (!record) {
    return {
      ok: false,
      reason:
        "No code requested. Request a new one.",
    };
  }

  if (
    Date.now() >
    record.expiresAt
  ) {
    otpStore.delete(email);

    return {
      ok: false,
      reason:
        "Code expired. Request a new one.",
    };
  }

  if (
    record.code !==
    String(code).trim()
  ) {
    return {
      ok: false,
      reason: "Incorrect code.",
    };
  }

  return {
    ok: true,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// RAZORPAY PAYMENTS
// ═══════════════════════════════════════════════════════════════════════════

let razorpayClient = null;

function getRazorpay() {
  if (razorpayClient) {
    return razorpayClient;
  }

  const keyId =
    process.env.RAZORPAY_KEY_ID;

  const keySecret =
    process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  razorpayClient =
    new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

  return razorpayClient;
}

export function isRazorpayConfigured() {
  return Boolean(
    process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET
  );
}

export async function createRazorpayOrder({
  amount,
  currency = "INR",
  receipt,
  notes = {},
}) {
  const razorpay =
    getRazorpay();

  if (!razorpay) {
    throw new Error(
      "Razorpay not configured"
    );
  }

  const order =
    await razorpay.orders.create({
      amount,
      currency,
      receipt,
      notes,
    });

  return {
    id: order.id,
    amount: order.amount,
    currency: order.currency,
    receipt: order.receipt,
    status: order.status,
  };
}

export async function verifyRazorpayPayment({
  orderId,
  paymentId,
  signature,
}) {
  const crypto =
    await import("crypto");

  const generatedSignature =
    crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${orderId}|${paymentId}`
      )
      .digest("hex");

  return (
    generatedSignature ===
    signature
  );
}