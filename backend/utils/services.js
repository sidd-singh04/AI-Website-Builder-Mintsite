// External service integrations used by the controllers:
// AI site generation, OTP email, Stripe payments, Vercel deploy, GitHub deploy.

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
import { Octokit } from "@octokit/rest";

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

// Extract the existing brand identity from the previous HTML.
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

  const title = grab(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const h1 = grab(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const h2 = grab(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i);

  const headerMatch = html.match(/<header[\s\S]*?<\/header>/i);

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

// Shrink previous HTML to fit the token budget.
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

  const bodyStart = html.search(/<body[^>]*>/i);

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

// Extract a clean HTML document from raw model output.
function extractHtml(raw) {
  if (!raw) return "";

  const fenced = raw.match(
    /```(?:html)?\s*([\s\S]*?)```/i
  );

  let candidate = (
    fenced ? fenced[1] : raw
  ).trim();

  const doctypeIdx = candidate.search(/<!doctype/i);
  const htmlIdx = candidate.search(/<html[\s>]/i);

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

// Split raw model output into HTML + summary.
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

    const out = await callLLM(
      [
        {
          role: "system",
          content: ENHANCE_SYSTEM,
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

  if (!isLLMConfigured()) {
    return {
      html: postProcess(
        generateMockSite(mockSeed)
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
        content: GENERATE_SYSTEM,
      },
    ];

    for (const m of historySlice) {
      messages.push({
        role: m.role,
        content: m.text,
      });
    }

    if (trimmedHtml) {
      const brand =
        extractBrandIdentity(
          previousHtml
        );

      const brandLock = brand
        ? `
═══ BRAND LOCK — DO NOT VIOLATE ═══

The existing brand on this project is FIXED.

You MUST preserve it exactly:

• Title: "${brand.title || "(none)"}"
• H1: "${brand.h1 || "(none)"}"
• Brand link: "${brand.brandLink || "(none)"}"
• Hero subtitle: "${brand.h2 || "(none)"}"

Do NOT change the brand name.

Do NOT change the topic or industry.

Do NOT invent a new company.

The user's request is a TWEAK to the EXISTING site,
not a new site.

If the change request seems to imply a different brand,
keep the original brand.
`
        : "";

      messages.push({
        role: "user",
        content: `Current site HTML (source of truth — keep what works, change only what's requested):

\`\`\`html
${trimmedHtml}
\`\`\`

${brandLock}

Change request:

${prompt}

Return the FULL updated HTML document followed by the ${SUMMARY_OPEN}...${SUMMARY_CLOSE} block.`,
      });
    } else {
      messages.push({
        role: "user",
        content: `Build a complete, production-quality website based on this creative brief:

${prompt}

Return the raw HTML document followed by the ${SUMMARY_OPEN}...${SUMMARY_CLOSE} block.`,
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
      `[ai] Every AI model is busy right now, returned a starter template instead. ${friendlyError(err)}\n`
    );

    return {
      html: postProcess(
        generateMockSite(mockSeed)
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

// Escape HTML characters.
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

// OTP email HTML.
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

// ═══════════════════════════════════════════════════════════════════════════
// VERCEL DEPLOY
// ═══════════════════════════════════════════════════════════════════════════

const VERCEL_API =
  "https://api.vercel.com";

function toProjectSlug(name) {
  return (
    (name || "mintsite-project")
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) ||
    "mintsite-project"
  );
}

async function vercelRequest(
  token,
  path,
  init = {}
) {
  const r = await fetch(
    VERCEL_API + path,
    {
      ...init,

      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type":
          "application/json",
        ...(init.headers || {}),
      },
    }
  );

  const text =
    await r.text();

  let body = null;

  try {
    body = text
      ? JSON.parse(text)
      : null;
  } catch {
    body = {
      raw: text,
    };
  }

  if (!r.ok) {
    const err = new Error(
      body?.error?.message ||
        `Vercel ${r.status}`
    );

    err.status = r.status;
    err.code =
      body?.error?.code;
    err.providerName =
      "vercel";

    throw err;
  }

  return body;
}

export async function deployToVercel({
  token,
  projectName,
  html,
  prompt,
}) {
  if (
    !token ||
    !token.trim()
  ) {
    throw new Error(
      "Vercel token is required"
    );
  }

  if (
    !html ||
    html.length < 100
  ) {
    throw new Error(
      "Project has no HTML to deploy"
    );
  }

  const slug =
    toProjectSlug(projectName);

  const readme = `# ${
    projectName || slug
  }

Deployed via Mintsite.

Original prompt:

> ${prompt || "(none)"}
`;

  const files = [
    {
      file: "index.html",
      data: html,
      encoding: "utf-8",
    },

    {
      file: "README.md",
      data: readme,
      encoding: "utf-8",
    },

    {
      file: "vercel.json",
      data: JSON.stringify(
        {
          cleanUrls: true,
        },
        null,
        2
      ),
      encoding: "utf-8",
    },
  ];

  const payload = {
    name: slug,
    files,

    target: "production",

    projectSettings: {
      framework: null,
    },
  };

  const result =
    await vercelRequest(
      token,
      "/v13/deployments",
      {
        method: "POST",

        body: JSON.stringify(
          payload
        ),
      }
    );

  const fallback =
    result?.url
      ? `https://${result.url}`
      : null;

  const aliasUrl =
    Array.isArray(result?.alias) &&
    result.alias[0]
      ? `https://${result.alias[0]}`
      : null;

  const productionUrl =
    aliasUrl || fallback;

  if (!productionUrl) {
    throw new Error(
      "Vercel returned no URL"
    );
  }

  return {
    url: productionUrl,

    deploymentId:
      result.id,

    readyState:
      result.readyState ||
      result.status ||
      "QUEUED",

    fallbackUrl:
      fallback,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// GITHUB DEPLOY
// ═══════════════════════════════════════════════════════════════════════════

export async function publishToGitHub({
  token,
  repoName,
  html,
  projectName,
  prompt,
  isPrivate = false,
  enablePages = true,
}) {
  if (!token) {
    throw new Error(
      "GitHub token is required"
    );
  }

  if (!repoName) {
    throw new Error(
      "Repo name is required"
    );
  }

  if (!html) {
    throw new Error(
      "Project has no generated HTML yet"
    );
  }

  const octokit =
    new Octokit({
      auth: token,
    });

  // 1. Get authenticated user
  let me;

  try {
    me = (
      await octokit.rest.users.getAuthenticated()
    ).data;
  } catch (err) {
    if (err.status === 401) {
      throw new Error(
        "GitHub token is invalid or expired"
      );
    }

    throw err;
  }

  const owner = me.login;

  // 2. Create repository if missing
  let repo;
  let alreadyExisted = false;

  try {
    repo = (
      await octokit.rest.repos.get({
        owner,
        repo: repoName,
      })
    ).data;

    alreadyExisted = true;
  } catch (err) {
    if (err.status !== 404) {
      throw err;
    }

    repo = (
      await octokit.rest.repos.createForAuthenticatedUser(
        {
          name: repoName,
          private: isPrivate,
          auto_init: true,

          description: `Built with mintsite — ${
            projectName ||
            "AI-generated website"
          }`,
        }
      )
    ).data;
  }

  const branch =
    repo.default_branch || "main";

  // 3. Commit index.html
  await commitFile({
    octokit,
    owner,
    repo: repoName,
    branch,
    path: "index.html",
    content: html,

    message: alreadyExisted
      ? "chore: update site via mintsite"
      : "feat: initial site from mintsite",
  });

  // 4. Commit README
  const readme =
    renderReadme({
      projectName,
      prompt,
      owner,
      repoName,
    });

  await commitFile({
    octokit,
    owner,
    repo: repoName,
    branch,
    path: "README.md",
    content: readme,
    message: "docs: add README",
  });

  // 5. Enable GitHub Pages
  let pagesUrl = null;

  if (enablePages) {
    try {
      await octokit.request(
        "POST /repos/{owner}/{repo}/pages",
        {
          owner,
          repo: repoName,

          source: {
            branch,
            path: "/",
          },
        }
      );
    } catch (err) {
      if (err.status !== 409) {
        console.warn(
          `[github] could not enable Pages (status ${err.status}):`,
          err.message
        );
      }
    }

    try {
      const pages =
        await octokit.request(
          "GET /repos/{owner}/{repo}/pages",
          {
            owner,
            repo: repoName,
          }
        );

      pagesUrl =
        pages.data?.html_url ||
        null;
    } catch {
      pagesUrl =
        `https://${owner}.github.io/${repoName}/`;
    }
  }

  return {
    owner,
    repoName,
    repoUrl: repo.html_url,
    pagesUrl,
    alreadyExisted,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// GITHUB FILE COMMIT
// ═══════════════════════════════════════════════════════════════════════════

async function commitFile({
  octokit,
  owner,
  repo,
  branch,
  path,
  content,
  message,
}) {
  let sha;

  try {
    const existing =
      await octokit.rest.repos.getContent(
        {
          owner,
          repo,
          path,
          ref: branch,
        }
      );

    if (
      !Array.isArray(
        existing.data
      )
    ) {
      sha =
        existing.data.sha;
    }
  } catch (err) {
    if (err.status !== 404) {
      throw err;
    }
  }

  await octokit.rest.repos.createOrUpdateFileContents(
    {
      owner,
      repo,
      path,
      message,
      branch,

      content:
        Buffer.from(
          content,
          "utf-8"
        ).toString("base64"),

      sha,
    }
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// GITHUB README
// ═══════════════════════════════════════════════════════════════════════════

function renderReadme({
  projectName,
  prompt,
  owner,
  repoName,
}) {
  const title =
    projectName ||
    "AI-generated site";

  return `# ${title}

Generated with Mintsite — turn a prompt into a website.

## Original prompt

> ${(prompt || "—").replace(
    /\n/g,
    "\n> "
  )}

## Run locally

Open \`index.html\` in your browser.

The site is fully self-contained with inline CSS — no build step required.

## Deploy

This repo is set up for **GitHub Pages**.

Once Pages is enabled, your site will be available at:

\`https://${owner}.github.io/${repoName}/\`

---

Edit the prompt in Mintsite to regenerate, then upload again to push the changes here.
`;
}