// // Offline fallback website generator — builds a styled template site (palette + pages) when the AI model is unavailable.

// // Palette + brand-name + tagline helpers for the mock generator.
// // Kept separate so the main template can stay focused on layout.

// const PALETTES = [
//   {
//     name: "Indigo",
//     primary: "#6366f1",
//     accent: "#a855f7",
//     bg: "#ffffff",
//     bgSoft: "#f8fafc",
//     ink: "#0f172a",
//     muted: "#475569",
//   },
//   {
//     name: "Emerald",
//     primary: "#10b981",
//     accent: "#14b8a6",
//     bg: "#ffffff",
//     bgSoft: "#f0fdf4",
//     ink: "#052e1a",
//     muted: "#475569",
//   },
//   {
//     name: "Rose",
//     primary: "#f43f5e",
//     accent: "#ec4899",
//     bg: "#ffffff",
//     bgSoft: "#fff1f2",
//     ink: "#3f0712",
//     muted: "#64748b",
//   },
//   {
//     name: "Amber",
//     primary: "#f59e0b",
//     accent: "#f97316",
//     bg: "#ffffff",
//     bgSoft: "#fffbeb",
//     ink: "#451a03",
//     muted: "#78350f",
//   },
//   {
//     name: "Sky",
//     primary: "#0ea5e9",
//     accent: "#6366f1",
//     bg: "#ffffff",
//     bgSoft: "#f0f9ff",
//     ink: "#0c1f3a",
//     muted: "#475569",
//   },
// ];

// // Picks a color palette based on keywords found in the prompt.
// function pickPalette(p) {
//   const s = (p || "").toLowerCase();
//   if (/(warm|restaurant|food|spice|cafe|bakery|fruit)/.test(s))
//     return PALETTES[3];
//   if (/(eco|green|nature|wellness|farm|organic|plant|fruit|vegan)/.test(s))
//     return PALETTES[1];
//   if (/(jewel|beauty|fashion|wedding|cloth|apparel|boutique)/.test(s))
//     return PALETTES[2];
//   if (/(tech|saas|app|software|ai|data|dashboard)/.test(s)) return PALETTES[4];
//   return PALETTES[0];
// }

// // Guesses the kind of site (shop, restaurant, portfolio, etc.) from the prompt.
// function pickType(p) {
//   const s = (p || "").toLowerCase();
//   if (/restaurant|cafe|bakery|menu|dish|cuisine|coffee\s*shop|bistro/.test(s))
//     return "restaurant";
//   if (
//     /shop|store|ecommerce|e-?commerce|buy|cart|product|fruit|food|order|grocery|clothes|cloth(ing)?|fashion|apparel|boutique|wear|outfit|shoe|jewel(ry|lery)|cosmetic|beauty\s*product|skincare/.test(
//       s,
//     )
//   )
//     return "ecommerce";
//   if (
//     /portfolio|designer|photographer|developer|artist|illustrator|writer/.test(
//       s,
//     )
//   )
//     return "portfolio";
//   if (/agency|studio|consult/.test(s)) return "agency";
//   if (/saas|software|app|tool|dashboard|platform/.test(s)) return "saas";
//   if (/event|conference|wedding|workshop|festival/.test(s)) return "event";
//   if (/ngo|charity|nonprofit|donate|foundation/.test(s)) return "nonprofit";
//   return "generic";
// }

// // Pulls a short brand name out of the prompt text.
// function brandName(p) {
//   const t = (p || "")
//     .trim()
//     .replace(/^(create|build|make|design|generate)\s+(a|an|the)\s+/i, "")
//     .replace(/^(a|an|the)\s+/i, "")
//     .split(/[.!?,\n]/)[0]
//     .split(/\s+/)
//     .slice(0, 3)
//     .join(" ")
//     .replace(/[^a-zA-Z0-9\s]/g, "")
//     .trim();
//   return (t || "Mintsite Studio").slice(0, 32);
// }

// // Returns a fitting tagline based on keywords in the prompt.
// function tagline(p) {
//   const s = (p || "").toLowerCase();
//   if (/fruit/.test(s)) return "Farm-fresh fruit, delivered with care.";
//   if (/food|restaurant|cafe|order/.test(s))
//     return "Crave-worthy dishes, delivered fast.";
//   if (/cloth|fashion|apparel/.test(s))
//     return "Style that speaks before you do.";
//   if (/portfolio|designer|developer/.test(s))
//     return "Work worth a closer look.";
//   if (/saas|software|app|tool/.test(s)) return "Built for teams who ship.";
//   if (/wellness|fitness|health/.test(s)) return "Feel your best, every day.";
//   if (/agency|studio/.test(s)) return "Design and engineering that converts.";
//   return "Beautifully made. Built to ship.";
// }

// // 6 themed products for ecommerce-style sites
// function productsFor(p) {
//   const s = (p || "").toLowerCase();
//   if (/fruit/.test(s)) {
//     return [
//       {
//         name: "Crisp Organic Apples",
//         img: "fresh red organic apples wooden basket farmers market",
//         desc: "Perfectly crunchy and sweet — snack or bake.",
//         price: "5.99",
//         unit: "/lb",
//       },
//       {
//         name: "Sweet Ripe Bananas",
//         img: "yellow ripe bananas wooden table sunlight tropical",
//         desc: "Energy-boosting and creamy, a daily essential.",
//         price: "1.99",
//         unit: "/lb",
//       },
//       {
//         name: "Juicy Navel Oranges",
//         img: "fresh orange citrus fruit wooden crate sunny",
//         desc: "Bursting with Vitamin C — incredibly refreshing.",
//         price: "4.49",
//         unit: "/bag",
//       },
//       {
//         name: "Mixed Ripe Berries",
//         img: "mixed berries strawberries blueberries raspberries bowl rustic",
//         desc: "Strawberries, blueberries, and raspberries.",
//         price: "7.29",
//         unit: "/pack",
//       },
//       {
//         name: "Alphonso Mangoes",
//         img: "ripe alphonso mango golden indian summer wooden",
//         desc: "King of mangoes — buttery and aromatic.",
//         price: "12.99",
//         unit: "/box",
//       },
//       {
//         name: "Green Seedless Grapes",
//         img: "fresh green grapes bunch vineyard sunlight",
//         desc: "Crunchy, sweet, perfect for snacking.",
//         price: "3.49",
//         unit: "/lb",
//       },
//     ];
//   }
//   if (/restaurant|cafe|bakery|menu|food/.test(s)) {
//     return [
//       {
//         name: "Margherita Pizza",
//         img: "wood fired margherita pizza fresh basil mozzarella",
//         desc: "San Marzano tomatoes, fior di latte, basil.",
//         price: "14.50",
//         unit: "",
//       },
//       {
//         name: "Truffle Pasta",
//         img: "creamy truffle pasta black truffle italian restaurant",
//         desc: "Hand-rolled tagliatelle, black truffle shavings.",
//         price: "22.00",
//         unit: "",
//       },
//       {
//         name: "Grilled Salmon",
//         img: "grilled salmon fillet lemon asparagus elegant plate",
//         desc: "Atlantic salmon, lemon-butter, seasonal greens.",
//         price: "26.50",
//         unit: "",
//       },
//       {
//         name: "Butter Chicken",
//         img: "creamy butter chicken indian curry naan bread",
//         desc: "Slow-cooked tomato cream sauce, basmati rice.",
//         price: "16.00",
//         unit: "",
//       },
//       {
//         name: "Caesar Salad",
//         img: "fresh caesar salad parmesan croutons romaine",
//         desc: "Crisp romaine, parmesan, garlic croutons.",
//         price: "11.00",
//         unit: "",
//       },
//       {
//         name: "Chocolate Lava Cake",
//         img: "warm chocolate lava cake vanilla ice cream dessert",
//         desc: "Molten center, vanilla bean ice cream.",
//         price: "9.50",
//         unit: "",
//       },
//     ];
//   }
//   // Generic ecommerce
//   return [
//     {
//       name: "Signature Item One",
//       img: "modern lifestyle product photography minimal",
//       desc: "Crafted for daily delight.",
//       price: "29.00",
//       unit: "",
//     },
//     {
//       name: "Bestseller",
//       img: "premium lifestyle product photography clean",
//       desc: "Loved by hundreds.",
//       price: "39.00",
//       unit: "",
//     },
//     {
//       name: "Limited Edition",
//       img: "luxury product photo elegant studio lighting",
//       desc: "Small batch, big personality.",
//       price: "59.00",
//       unit: "",
//     },
//     {
//       name: "Daily Essential",
//       img: "everyday lifestyle product clean studio shot",
//       desc: "Made for the everyday hero.",
//       price: "19.00",
//       unit: "",
//     },
//     {
//       name: "Gift Set",
//       img: "gift box premium products elegant ribbon",
//       desc: "Pre-curated, ready to give.",
//       price: "79.00",
//       unit: "",
//     },
//     {
//       name: "New Arrival",
//       img: "stylish new product photo minimal background",
//       desc: "Just dropped — limited stock.",
//       price: "44.00",
//       unit: "",
//     },
//   ];
// }

// // Builds a square product image URL from a text description.
// function imageUrl(description, seed) {
//   const desc = encodeURIComponent(description);
//   return `https://image.pollinations.ai/prompt/${desc}?width=600&height=600&nologo=true&seed=${seed}`;
// }

// // Builds a larger hero image URL from a text description.
// function heroImageUrl(description, seed) {
//   const desc = encodeURIComponent(description);
//   return `https://image.pollinations.ai/prompt/${desc}?width=900&height=700&nologo=true&seed=${seed}`;
// }

// // Common onerror fallback string (inline, picks up alt text dynamically)
// const IMG_ONERROR = `this.onerror=null;this.src='https://loremflickr.com/600/600/'+encodeURIComponent(this.alt)+'?lock='+Date.now()`;

// // Individual <main data-page="..."> blocks for the mock template.
// // Each returns ONLY the inner HTML of one route — header + footer live in
// // mockGenerator.js.

// // Builds the home route markup (hero section plus feature cards).
// function homePage({ brand, sub, type, imgKw }) {
//   const heroImg = heroImageUrl(`${imgKw} hero modern lifestyle photo`, 101);
//   // Context-appropriate primary CTA per site type
//   const ctas = {
//     ecommerce: { text: "Shop now", href: "#shop" },
//     restaurant: { text: "View menu", href: "#menu" },
//     portfolio: { text: "See work", href: "#shop" },
//     agency: { text: "Get a quote", href: "#contact" },
//     saas: { text: "Start for free", href: "#signup" },
//     event: { text: "Get tickets", href: "#contact" },
//     nonprofit: { text: "Donate now", href: "#contact" },
//     generic: { text: "Get started", href: "#signup" },
//   };
//   const { text: ctaText, href: ctaHref } = ctas[type] || ctas.generic;
//   return `
//   <main data-page="home" class="page-route">
//     <section class="hero container">
//       <div class="hero-copy">
//         <span class="eyebrow">Welcome to ${brand}</span>
//         <h1>${brand}.<br><span class="gradient">${sub.split(" ").slice(0, 3).join(" ")}</span></h1>
//         <p class="lead">${sub} Built with care, ready to ship.</p>
//         <div class="ctas">
//           <a class="btn-primary" href="${ctaHref}">${ctaText}</a>
//           <a class="btn-ghost" href="#about">Learn more</a>
//         </div>
//       </div>
//       <div class="hero-image">
//         <img src="${heroImg}" alt="${brand} hero" loading="lazy" onerror="${IMG_ONERROR}">
//       </div>
//     </section>
//     <section class="container">
//       <header class="section-head">
//         <span class="eyebrow">Why ${brand}</span>
//         <h2>Crafted to feel special.</h2>
//         <p class="lead">Three reasons our customers come back.</p>
//       </header>
//       <div class="grid-3">
//         <div class="card"><div class="feat-icon">✨</div><h3>Quality first</h3><p class="muted">Hand-picked, never compromised.</p></div>
//         <div class="card"><div class="feat-icon">⚡</div><h3>Fast delivery</h3><p class="muted">From our door to yours within hours.</p></div>
//         <div class="card"><div class="feat-icon">💚</div><h3>Loved by locals</h3><p class="muted">4.9 stars from 2,000+ happy customers.</p></div>
//       </div>
//     </section>
//   </main>`;
// }

// // Builds the shop route with a grid of product cards.
// function shopPage({ brand, products }) {
//   const cards = products
//     .map((p, i) => {
//       const img = imageUrl(p.img, 200 + i);
//       return `
//     <article class="product-card">
//       <img src="${img}" alt="${p.name}" loading="lazy" onerror="${IMG_ONERROR}">
//       <h3>${p.name}</h3>
//       <p class="desc muted">${p.desc}</p>
//       <div class="price-row">
//         <span class="price">$${p.price}${p.unit}</span>
//         <button class="add-to-cart" data-name="${p.name}" data-price="${p.price}" data-image="${img}">Add to Cart</button>
//       </div>
//     </article>`;
//     })
//     .join("");
//   return `
//   <main data-page="shop" class="page-route" hidden>
//     <section class="container">
//       <header class="section-head">
//         <span class="eyebrow">Catalog</span>
//         <h1>Shop ${brand}</h1>
//         <p class="lead">Browse our full lineup — freshly stocked, ready to ship.</p>
//       </header>
//       <div class="product-grid">${cards}</div>
//     </section>
//   </main>`;
// }

// // Builds the restaurant menu route with a grid of dishes.
// function menuPage({ brand, products }) {
//   const items = products
//     .map((p, i) => {
//       const img = imageUrl(p.img, 300 + i);
//       return `
//     <article class="product-card">
//       <img src="${img}" alt="${p.name}" loading="lazy" onerror="${IMG_ONERROR}">
//       <h3>${p.name}</h3>
//       <p class="desc muted">${p.desc}</p>
//       <div class="price-row">
//         <span class="price">$${p.price}</span>
//         <button class="add-to-cart" data-name="${p.name}" data-price="${p.price}" data-image="${img}">Order</button>
//       </div>
//     </article>`;
//     })
//     .join("");
//   return `
//   <main data-page="menu" class="page-route" hidden>
//     <section class="container">
//       <header class="section-head">
//         <span class="eyebrow">Our menu</span>
//         <h1>Made fresh, every day.</h1>
//         <p class="lead">Crafted by our chefs from locally-sourced ingredients.</p>
//       </header>
//       <div class="product-grid">${items}</div>
//     </section>
//   </main>`;
// }

// // Builds the portfolio "work" route with a grid of project tiles.
// function workPage({ brand, imgKw }) {
//   // 6 project tiles for portfolio sites
//   const projects = [
//     {
//       title: "Aurora — Brand Identity",
//       blurb: "A modern wordmark for a wellness studio.",
//       kw: "minimal brand identity logo dark elegant",
//     },
//     {
//       title: "Northwind — Web Redesign",
//       blurb: "Reimagining a 90s airline with bold motion.",
//       kw: "modern airline website design dashboard",
//     },
//     {
//       title: "Mirror — Product Launch",
//       blurb: "Launch site + campaign for a meditation app.",
//       kw: "calm meditation app interface soft gradient",
//     },
//     {
//       title: "Plain & Co — Packaging",
//       blurb: "Sustainable packaging for a craft tea brand.",
//       kw: "elegant tea packaging botanical minimal",
//     },
//     {
//       title: "Sundial — Mobile App",
//       blurb: "An iOS app for daily creative practice.",
//       kw: "ios mobile app interface dark minimal",
//     },
//     {
//       title: "Field Notes — Editorial",
//       blurb: "Magazine layout for a quarterly print zine.",
//       kw: "magazine editorial layout typography",
//     },
//   ];
//   const tiles = projects
//     .map(
//       (p, i) => `
//     <article class="card">
//       <img src="${imageUrl(p.kw + " case study", 400 + i)}" alt="${p.title}" loading="lazy" onerror="${IMG_ONERROR}" style="aspect-ratio:4/3;object-fit:cover;border-radius:.75rem;margin-bottom:1rem">
//       <h3>${p.title}</h3>
//       <p class="muted">${p.blurb}</p>
//     </article>`,
//     )
//     .join("");
//   return `
//   <main data-page="shop" class="page-route" hidden>
//     <section class="container">
//       <header class="section-head">
//         <span class="eyebrow">Selected work</span>
//         <h1>Recent projects.</h1>
//         <p class="lead">A look at what I've shipped over the past year.</p>
//       </header>
//       <div class="product-grid">${tiles}</div>
//     </section>
//   </main>`;
// }

// // Builds the features route listing product highlights.
// function featuresPage({ brand }) {
//   return `
//   <main data-page="features" class="page-route" hidden>
//     <section class="container">
//       <header class="section-head">
//         <span class="eyebrow">Features</span>
//         <h1>Everything you need.</h1>
//         <p class="lead">A focused set of tools that helps you ship faster.</p>
//       </header>
//       <div class="grid-3">
//         <div class="card"><div class="feat-icon">⚡</div><h3>Lightning fast</h3><p class="muted">Sub-second renders, near-perfect Lighthouse.</p></div>
//         <div class="card"><div class="feat-icon">🔁</div><h3>Iterate by chat</h3><p class="muted">Every refinement lands in seconds with full context.</p></div>
//         <div class="card"><div class="feat-icon">📱</div><h3>Production ready</h3><p class="muted">Semantic HTML, accessible markup, fully responsive.</p></div>
//         <div class="card"><div class="feat-icon">🎨</div><h3>Beautiful by default</h3><p class="muted">Crafted typography, palette-aware gradients, motion.</p></div>
//         <div class="card"><div class="feat-icon">🔒</div><h3>Secure & private</h3><p class="muted">Your data, your control — encrypted end to end.</p></div>
       
//       </div>
//     </section>
//   </main>`;
// }

// // Builds the about route with the story text and stat cards.
// function aboutPage({ brand, sub }) {
//   return `
//   <main data-page="about" class="page-route" hidden>
//     <section class="container">
//       <header class="section-head">
//         <span class="eyebrow">Our story</span>
//         <h1>About ${brand}.</h1>
//         <p class="lead">${sub}</p>
//       </header>
//       <div class="prose">
//         <p>${brand} started with a simple belief: great products should feel personal. We obsess over every detail — sourcing, packaging, delivery — so you can focus on enjoying what you ordered.</p>
//         <p>From day one, we've been backed by a small but dedicated team that genuinely cares about quality. Every order is checked by hand, and every customer hears back from a real person.</p>
//       </div>
//       <div class="grid-3" style="margin-top:3rem">
//         <div class="card"><h3 class="stat">10k+</h3><p class="muted">Happy customers</p></div>
//         <div class="card"><h3 class="stat">4.9★</h3><p class="muted">Average rating</p></div>
//         <div class="card"><h3 class="stat">2 hrs</h3><p class="muted">Avg. response time</p></div>
//       </div>
//     </section>
//   </main>`;
// }

// // Builds the contact route with a message form and contact details.
// function contactPage({ brand }) {
//   return `
//   <main data-page="contact" class="page-route" hidden>
//     <section class="container">
//       <header class="section-head">
//         <span class="eyebrow">Get in touch</span>
//         <h1>We'd love to hear from you.</h1>
//         <p class="lead">Drop us a line — we usually reply within a few hours.</p>
//       </header>
//       <div class="contact-grid">
//         <form class="auth-card" onsubmit="event.preventDefault();window.__ms_toast&&window.__ms_toast('Message sent — we\\'ll be in touch!');this.reset()">
//           <div class="fld"><label>Your name</label><input name="name" type="text" required></div>
//           <div class="fld"><label>Email</label><input name="email" type="email" required></div>
//           <div class="fld"><label>Message</label><textarea name="message" rows="4" required></textarea></div>
//           <button type="submit" class="btn-primary" style="width:100%">Send message</button>
//         </form>
//         <aside class="contact-info">
//           <div><h4>Email</h4><p class="muted">hello@${brand.toLowerCase().replace(/\s+/g, "")}.com</p></div>
//           <div><h4>Phone</h4><p class="muted">+91 98765 43210</p></div>
//           <div><h4>Address</h4><p class="muted">12 Marketplace Ave<br>Mumbai, IN 400001</p></div>
//           <div><h4>Hours</h4><p class="muted">Mon–Sat · 9am–7pm</p></div>
//         </aside>
//       </div>
//     </section>
//   </main>`;
// }

// // Builds the sign-in route with a login form.
// function signinPage({ brand }) {
//   // Use string concat for onsubmit so we don't have to escape quotes.
//   const onSubmit =
//     "event.preventDefault();var b=this.querySelector('button[type=submit]');b.textContent='✓ Signed in';b.disabled=true;setTimeout(function(){b.textContent='Sign in';b.disabled=false},2000);";
//   return `
//   <main data-page="signin" class="page-route" hidden>
//     <section class="container">
//       <form class="auth-card" onsubmit="${onSubmit}">
//         <h1 style="margin-bottom:.5rem">Welcome back</h1>
//         <p class="muted" style="margin-bottom:1.5rem">Sign in to your ${brand} account.</p>
//         <div class="fld"><label>Email</label><input name="email" type="email" placeholder="you@example.com" required></div>
//         <div class="fld"><label>Password</label><input name="password" type="password" placeholder="••••••••" required></div>
//         <button type="submit" class="btn-primary" style="width:100%">Sign in</button>
//         <p class="muted" style="margin-top:1rem;text-align:center;font-size:.9rem">Don't have an account yet? <a href="#signup" style="color:var(--primary);font-weight:600">Create one</a></p>
//       </form>
//     </section>
//   </main>`;
// }

// // Builds the sign-up route with a registration form.
// function signupPage({ brand }) {
//   const onSubmit =
//     "event.preventDefault();var b=this.querySelector('button[type=submit]');b.textContent='✓ Account created';b.disabled=true;setTimeout(function(){b.textContent='Create account';b.disabled=false},2200);";
//   return `
//   <main data-page="signup" class="page-route" hidden>
//     <section class="container">
//       <form class="auth-card" onsubmit="${onSubmit}">
//         <h1 style="margin-bottom:.5rem">Create your ${brand} account</h1>
//         <p class="muted" style="margin-bottom:1.5rem">It takes less than a minute — no credit card needed.</p>
//         <div class="fld"><label>Full name</label><input name="name" type="text" placeholder="Your name" required></div>
//         <div class="fld"><label>Email</label><input name="email" type="email" placeholder="you@example.com" required></div>
//         <div class="fld"><label>Password</label><input name="password" type="password" placeholder="At least 6 characters" minlength="6" required></div>
//         <button type="submit" class="btn-primary" style="width:100%">Create account</button>
//         <p class="muted" style="margin-top:1rem;text-align:center;font-size:.9rem">Already have an account? <a href="#signin" style="color:var(--primary);font-weight:600">Sign in</a></p>
//       </form>
//     </section>
//   </main>`;
// }

// // Multi-page fallback template used when the LLM is unreachable. Each <main>
// // route is a complete destination (header + footer stay shared). The page
// // router in client/utils/previewScript.js handles swapping which <main> is
// // visible — this generator just emits the markup in the agreed shape.

// // Returns the full CSS stylesheet, filled in with the chosen palette colors.
// const BASE_CSS = (c) => `
// :root{--primary:${c.primary};--accent:${c.accent};--bg:${c.bg};--bg-soft:${c.bgSoft};--ink:${c.ink};--muted:${c.muted};--radius:18px;--max:1200px}
// *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
// body{font-family:Inter,system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--ink);line-height:1.6;overflow-x:hidden}
// a{color:inherit;text-decoration:none}
// ul{list-style:none}
// img,svg{display:block;max-width:100%}
// [hidden]{display:none!important}
// .container{max-width:var(--max);margin:0 auto;padding:0 1.5rem}
// section{padding:clamp(3rem,6vw,5rem) 0;position:relative;z-index:1}
// h1{font-size:clamp(2.2rem,6vw,4rem);font-weight:800;letter-spacing:-.02em;line-height:1.05;overflow-wrap:break-word}
// h2{font-size:clamp(1.75rem,4vw,2.75rem);font-weight:700;letter-spacing:-.02em;line-height:1.15}
// h3{font-size:1.1rem;font-weight:600;letter-spacing:-.01em}
// h4{font-size:.85rem;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.55);margin-bottom:.75rem;font-weight:600}
// .muted{color:var(--muted);font-size:.95rem}
// .lead{color:var(--muted);font-size:1.05rem;line-height:1.65;max-width:60ch}
// .gradient{background:linear-gradient(135deg,var(--primary),var(--accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;color:transparent}
// .eyebrow{display:inline-block;padding:.4rem .85rem;border-radius:999px;background:color-mix(in oklab,var(--primary) 12%,transparent);color:var(--primary);font-size:.78rem;font-weight:600;letter-spacing:.04em;margin-bottom:.85rem}
// .btn-primary{display:inline-flex;align-items:center;gap:.5rem;padding:.85rem 1.6rem;border-radius:.75rem;background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff;font-weight:600;font-size:.95rem;border:0;cursor:pointer;box-shadow:0 12px 30px -10px var(--primary);transition:transform .2s,box-shadow .2s}
// .btn-primary:hover{transform:translateY(-2px);box-shadow:0 20px 40px -10px var(--primary)}
// .btn-ghost{display:inline-flex;align-items:center;gap:.5rem;padding:.85rem 1.6rem;border-radius:.75rem;background:transparent;color:var(--ink);font-weight:600;font-size:.95rem;border:1px solid color-mix(in oklab,var(--ink) 15%,transparent);cursor:pointer}
// .card{background:#fff;padding:1.75rem;border-radius:1rem;border:1px solid color-mix(in oklab,var(--ink) 8%,transparent);box-shadow:0 1px 3px rgba(0,0,0,.04);transition:transform .25s,box-shadow .25s}
// .card:hover{transform:translateY(-4px);box-shadow:0 20px 40px -10px rgba(0,0,0,.12)}
// .section-head{text-align:center;max-width:640px;margin:0 auto 3rem}
// .section-head .lead{margin:0 auto}
// .grid-3{display:grid;grid-template-columns:1fr;gap:1.25rem}
// @media(min-width:768px){.grid-3{grid-template-columns:repeat(3,1fr)}}
// .product-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem}
// .product-card{background:#fff;border-radius:1rem;padding:1rem;border:1px solid color-mix(in oklab,var(--ink) 8%,transparent);transition:transform .2s,box-shadow .2s;display:flex;flex-direction:column}
// .product-card:hover{transform:translateY(-4px);box-shadow:0 20px 40px -20px rgba(0,0,0,.15)}
// .product-card img{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:.75rem;margin-bottom:1rem}
// .product-card h3{margin-bottom:.35rem}
// .product-card .desc{font-size:.9rem;margin-bottom:1rem;flex:1}
// .price-row{display:flex;align-items:center;justify-content:space-between;gap:.5rem;margin-top:auto}
// .price{font-weight:700;font-size:1.1rem;color:var(--primary)}
// .add-to-cart{padding:.55rem 1rem;border-radius:.5rem;background:var(--primary);color:#fff;font-weight:600;font-size:.85rem;border:0;cursor:pointer;transition:background .15s}
// .add-to-cart:hover{background:var(--accent)}
// .feat-icon{font-size:1.75rem;margin-bottom:.75rem}
// .stat{font-size:2.4rem;font-weight:800;background:linear-gradient(135deg,var(--primary),var(--accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
// .hero{display:grid;grid-template-columns:1fr;gap:2rem;align-items:center;padding-top:clamp(2rem,5vw,4rem)}
// @media(min-width:1024px){.hero{grid-template-columns:1.1fr 1fr;gap:3rem}}
// .hero-copy{max-width:560px}
// .hero-copy .lead{margin:1.25rem 0 1.75rem}
// .ctas{display:flex;flex-wrap:wrap;gap:.75rem}
// .hero-image img{border-radius:1.5rem;box-shadow:0 30px 60px -20px rgba(0,0,0,.25);aspect-ratio:4/3;object-fit:cover}
// .prose p{margin-bottom:1rem;color:var(--muted);max-width:65ch;margin-left:auto;margin-right:auto;text-align:center}
// .contact-grid{display:grid;grid-template-columns:1fr;gap:2rem;align-items:start;max-width:880px;margin:0 auto}
// @media(min-width:768px){.contact-grid{grid-template-columns:1.2fr 1fr}}
// .contact-info{display:flex;flex-direction:column;gap:1.25rem;padding:2rem 1.5rem}
// .contact-info h4{color:var(--ink);letter-spacing:.04em;margin-bottom:.25rem;text-transform:none;font-size:.95rem}
// .auth-card{max-width:420px;margin:2rem auto;padding:2.25rem;background:#fff;border-radius:1rem;box-shadow:0 20px 50px -20px rgba(0,0,0,.15);border:1px solid color-mix(in oklab,var(--ink) 8%,transparent)}
// .fld{margin-bottom:1rem}
// .fld label{display:block;font-size:.85rem;font-weight:600;margin-bottom:.4rem;color:var(--ink)}
// .fld input,.fld textarea{width:100%;padding:.7rem .9rem;border-radius:.5rem;border:1px solid color-mix(in oklab,var(--ink) 15%,transparent);background:var(--bg-soft);font:inherit;color:var(--ink)}
// .fld input:focus,.fld textarea:focus{outline:2px solid var(--primary);outline-offset:1px;border-color:var(--primary)}
// header.nav{position:sticky;top:0;z-index:50;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);background:rgba(255,255,255,.92);border-bottom:1px solid color-mix(in oklab,var(--ink) 8%,transparent)}
// .nav .inner{display:flex;align-items:center;gap:1rem;height:68px;padding:0 clamp(1rem,4vw,2rem);max-width:var(--max);margin:0 auto}
// .nav .logo{display:flex;align-items:center;gap:.6rem;font-weight:700;font-size:1.05rem}
// .nav .logo .mark{width:30px;height:30px;border-radius:9px;background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff;display:grid;place-items:center;font-weight:800}
// .nav .links{display:none;gap:.25rem;margin-left:auto}
// @media(min-width:768px){.nav .links{display:flex}}
// .nav .links a{padding:.5rem .85rem;border-radius:8px;font-size:.92rem;color:var(--muted);font-weight:500;transition:color .15s,background .15s}
// .nav .links a:hover{color:var(--ink);background:color-mix(in oklab,var(--ink) 5%,transparent)}
// .nav .auth{display:flex;gap:.4rem;margin-left:.5rem}
// .nav .auth a{padding:.5rem .85rem;border-radius:.5rem;font-size:.9rem;font-weight:600;border:1px solid color-mix(in oklab,var(--ink) 15%,transparent)}
// .nav .auth a.primary{background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff;border-color:transparent}
// .cart-icon{position:relative;background:transparent;border:0;cursor:pointer;font-size:22px;padding:8px;color:var(--ink)}
// .cart-count{position:absolute;top:-2px;right:-2px;background:var(--primary);color:#fff;font-size:11px;border-radius:999px;min-width:18px;height:18px;padding:0 5px;display:inline-flex;align-items:center;justify-content:center;font-weight:700}
// [data-page]{animation:pageIn .35s ease}
// @keyframes pageIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
// footer{background:var(--ink);color:#fff;padding:clamp(2.5rem,5vw,4rem) 0 2rem;margin-top:4rem}
// .foot-grid{display:grid;grid-template-columns:1fr;gap:2rem;max-width:var(--max);margin:0 auto;padding:0 1.5rem}
// @media(min-width:768px){.foot-grid{grid-template-columns:1.4fr 1fr 1fr 1fr}}
// footer .brand-block p{color:rgba(255,255,255,.65);margin:.85rem 0;font-size:.92rem;max-width:340px}
// footer ul li a{display:block;padding:.35rem 0;color:rgba(255,255,255,.78);font-size:.93rem}
// footer ul li a:hover{color:#fff}
// .foot-bottom{margin-top:2.5rem;padding-top:1.5rem;border-top:1px solid rgba(255,255,255,.08);font-size:.82rem;color:rgba(255,255,255,.55);max-width:var(--max);margin-left:auto;margin-right:auto;padding-left:1.5rem;padding-right:1.5rem;display:flex;flex-wrap:wrap;gap:1rem;justify-content:space-between}
// @media(max-width:768px){.container{padding:0 1rem}.product-grid{grid-template-columns:1fr 1fr;gap:1rem}.product-card img{aspect-ratio:1/1}.hero{grid-template-columns:1fr;gap:1.5rem}.hero-image{order:-1}.contact-grid{grid-template-columns:1fr}.foot-grid{grid-template-columns:1fr 1fr}h1{font-size:clamp(1.6rem,5vw,2.4rem)}h2{font-size:clamp(1.3rem,4vw,1.9rem)}section{padding:2.5rem 0}}
// @media(max-width:480px){.container{padding:0 .85rem}.nav .inner{flex-wrap:wrap;gap:.4rem;height:auto;min-height:56px;padding:.6rem 1rem}.nav .links{display:flex;flex-wrap:wrap;gap:.2rem;width:100%;justify-content:center;margin-left:0;order:3}.nav .links a{padding:.35rem .55rem;font-size:.8rem}.nav .auth{margin-left:auto;gap:.3rem}.nav .auth a{padding:.35rem .65rem;font-size:.78rem}.nav .logo{font-size:.95rem}.cart-icon{padding:5px;font-size:18px}.cart-count{font-size:10px;min-width:16px;height:16px}.product-grid{grid-template-columns:1fr;gap:1rem}.grid-3{grid-template-columns:1fr;gap:1rem}.hero{padding-top:1.5rem;gap:1rem}.ctas{flex-direction:column;width:100%}.ctas>*{width:100%;text-align:center;min-height:44px}h1{font-size:clamp(1.4rem,7vw,1.9rem);line-height:1.15}h2{font-size:clamp(1.15rem,5vw,1.5rem)}p,.lead{font-size:.92rem}.card,.product-card{padding:1rem}.auth-card{max-width:100%;margin:1.5rem .5rem;padding:1.5rem}.foot-grid{grid-template-columns:1fr;text-align:center;gap:1.5rem}footer .brand-block{margin:0 auto;max-width:280px}.foot-bottom{flex-direction:column;text-align:center;gap:.5rem}section{padding:2rem 0}.section-head{margin-bottom:2rem}}
// `;

// // Each entry: [label, hash, dataPageValue]
// function navConfig(type) {
//   return (
//     {
//       ecommerce: [
//         ["Home", "#home", "home"],
//         ["Shop", "#shop", "shop"],
//         ["About", "#about", "about"],
//         ["Contact", "#contact", "contact"],
//       ],
//       restaurant: [
//         ["Home", "#home", "home"],
//         ["Menu", "#menu", "menu"],
//         ["About", "#about", "about"],
//         ["Contact", "#contact", "contact"],
//       ],
//       portfolio: [
//         ["Home", "#home", "home"],
//         ["Work", "#shop", "shop"],
//         ["About", "#about", "about"],
//         ["Contact", "#contact", "contact"],
//       ],
//       agency: [
//         ["Home", "#home", "home"],
//         ["Services", "#features", "features"],
//         ["About", "#about", "about"],
//         ["Contact", "#contact", "contact"],
//       ],
//       saas: [
//         ["Home", "#home", "home"],
//         ["Features", "#features", "features"],
//         ["About", "#about", "about"],
//         ["Contact", "#contact", "contact"],
//       ],
//       event: [
//         ["Home", "#home", "home"],
//         ["About", "#about", "about"],
//         ["Contact", "#contact", "contact"],
//       ],
//       nonprofit: [
//         ["Home", "#home", "home"],
//         ["About", "#about", "about"],
//         ["Contact", "#contact", "contact"],
//       ],
//       generic: [
//         ["Home", "#home", "home"],
//         ["Features", "#features", "features"],
//         ["About", "#about", "about"],
//         ["Contact", "#contact", "contact"],
//       ],
//     }[type] || [
//       ["Home", "#home", "home"],
//       ["About", "#about", "about"],
//       ["Contact", "#contact", "contact"],
//     ]
//   );
// }

// // Builds the nav bar link markup for the given site type.
// function navFor(type) {
//   return navConfig(type)
//     .map(([t, h]) => `<a href="${h}">${t}</a>`)
//     .join("\n      ");
// }

// // Returns a cart button, but only for shop and restaurant sites.
// function cartIcon(type) {
//   if (type !== "ecommerce" && type !== "restaurant") return "";
//   return `<button class="cart-icon" aria-label="Cart">🛒 <span class="cart-count">0</span></button>`;
// }

// // Build a footer "Browse" column from the same nav config — so we never link
// // to a #page that doesn't exist on this site type.
// function footerBrowseLinks(type) {
//   return navConfig(type)
//     .map(([t, h]) => `<li><a href="${h}">${t}</a></li>`)
//     .join("");
// }

// // Assembles all the page routes needed for the given site type.
// function pagesFor({ type, brand, sub, imgKw, products }) {
//   const out = [homePage({ brand, sub, type, imgKw })];
//   if (type === "ecommerce") out.push(shopPage({ brand, products }));
//   if (type === "restaurant") out.push(menuPage({ brand, products }));
//   if (type === "portfolio") out.push(workPage({ brand, imgKw }));
//   if (["saas", "agency", "generic"].includes(type))
//     out.push(featuresPage({ brand }));
//   out.push(aboutPage({ brand, sub }));
//   out.push(contactPage({ brand }));
//   out.push(signinPage({ brand }));
//   out.push(signupPage({ brand }));
//   return out.join("\n");
// }

// // Builds the complete fallback HTML page (head, nav, pages, footer) from a prompt.
// export function generateMockSite(prompt) {
//   const c = pickPalette(prompt);
//   const type = pickType(prompt);
//   const brand = brandName(prompt);
//   const sub = tagline(prompt);
//   const initial = brand[0]?.toUpperCase() || "M";
//   const imgKw = (prompt || "modern lifestyle")
//     .split(/\s+/)
//     .slice(0, 3)
//     .join(" ");
//   const products = productsFor(prompt);

//   return `<!doctype html>
// <html lang="en" style="scroll-behavior:smooth">
// <head>
// <meta charset="utf-8">
// <meta name="viewport" content="width=device-width,initial-scale=1">
// <title>${brand}</title>
// <link rel="preconnect" href="https://fonts.googleapis.com">
// <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
// <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
// <style>${BASE_CSS(c)}</style>
// </head>
// <body>

// <header class="nav">
//   <div class="inner">
//     <a class="logo" href="#home"><span class="mark">${initial}</span>${brand}</a>
//     <nav class="links">
//       ${navFor(type)}
//     </nav>
//     <div class="auth">
//       <a href="#signin">Sign In</a>
//       <a class="primary" href="#signup">Sign Up</a>
//     </div>
//     ${cartIcon(type)}
//   </div>
// </header>

// ${pagesFor({ type, brand, sub, imgKw, products })}

// <footer>
//   <div class="foot-grid">
//     <div class="brand-block">
//       <div class="logo" style="display:flex;align-items:center;gap:.6rem;font-weight:700;color:#fff"><span style="width:30px;height:30px;border-radius:9px;background:linear-gradient(135deg,var(--primary),var(--accent));display:grid;place-items:center;color:#fff;font-weight:800">${initial}</span>${brand}</div>
//       <p>${sub} Built with care, served with love.</p>
//     </div>
//     <div><h4>Browse</h4><ul>${footerBrowseLinks(type)}</ul></div>
//     <div><h4>Account</h4><ul><li><a href="#signup">Create account</a></li><li><a href="#signin">Sign in</a></li><li><a href="#contact">Help</a></li></ul></div>
//     <div><h4>Connect</h4><ul><li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a></li><li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a></li><li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a></li></ul></div>
//   </div>
//   <div class="foot-bottom"><span>© ${new Date().getFullYear()} ${brand}. All rights reserved.</span><span>Built with Mintsite · ${c.name} edition</span></div>
// </footer>

// </body></html>`;
// }

// // Returns a plain-text site plan (type, brand, palette, pages) for a prompt.
// export function mockEnhancePrompt(prompt) {
//   const c = pickPalette(prompt);
//   const type = pickType(prompt);
//   const pageMap = {
//     ecommerce: "Home, Shop, About, Contact, Sign In, Sign Up",
//     restaurant: "Home, Menu, About, Contact, Sign In, Sign Up",
//     portfolio: "Home, Work, About, Contact, Sign In, Sign Up",
//     agency: "Home, Services, About, Contact, Sign In, Sign Up",
//     saas: "Home, Features, About, Contact, Sign In, Sign Up",
//     event: "Home, Schedule, About, Contact, Sign In, Sign Up",
//     nonprofit: "Home, Programs, About, Donate, Contact, Sign In, Sign Up",
//     generic: "Home, Features, About, Contact, Sign In, Sign Up",
//   };
//   return `Type: ${type}
// Brand: ${brandName(prompt)}
// Audience: people looking for ${prompt || "a polished site"}.
// Tone: modern, confident, friendly
// Palette: primary ${c.primary}, accent ${c.accent}, bg #ffffff, ink #0f172a
// Fonts: Inter, Inter
// Hero headline: ${tagline(prompt)}
// Hero subhead: A clean, accessible multi-page site shaped around what you described.
// Image keyword: ${(prompt || "lifestyle").split(/\s+/).slice(0, 3).join(" ")}
// Pages: ${pageMap[type]}
// Unique touch: A themed gradient hero with context-aware product photography.`;
// }









// Offline fallback website generator — builds a styled template site
// when the AI model is unavailable.
//
// Important:
// - User prompts are treated as instructions, NOT as website copy.
// - The hero headline is generated separately.
// - The user's prompt is never directly used as the main hero headline.

const PALETTES = [
  {
    name: "Indigo",
    primary: "#6366f1",
    accent: "#a855f7",
    bg: "#ffffff",
    bgSoft: "#f8fafc",
    ink: "#111827",
    muted: "#64748b",
  },
  {
    name: "Ocean",
    primary: "#0ea5e9",
    accent: "#06b6d4",
    bg: "#ffffff",
    bgSoft: "#f0f9ff",
    ink: "#0f172a",
    muted: "#64748b",
  },
  {
    name: "Emerald",
    primary: "#10b981",
    accent: "#14b8a6",
    bg: "#ffffff",
    bgSoft: "#f0fdf4",
    ink: "#064e3b",
    muted: "#64748b",
  },
  {
    name: "Rose",
    primary: "#f43f5e",
    accent: "#ec4899",
    bg: "#ffffff",
    bgSoft: "#fff1f2",
    ink: "#1f2937",
    muted: "#64748b",
  },
  {
    name: "Amber",
    primary: "#f59e0b",
    accent: "#f97316",
    bg: "#ffffff",
    bgSoft: "#fffbeb",
    ink: "#1c1917",
    muted: "#78716c",
  },
  {
    name: "Violet",
    primary: "#8b5cf6",
    accent: "#d946ef",
    bg: "#ffffff",
    bgSoft: "#faf5ff",
    ink: "#1e1b4b",
    muted: "#64748b",
  },
];

function pickPalette(prompt = "") {
  const p = prompt.toLowerCase();

  if (/ocean|sea|water|marine|blue/.test(p)) {
    return PALETTES[1];
  }

  if (/green|eco|nature|organic|environment|sustainable/.test(p)) {
    return PALETTES[2];
  }

  if (/pink|beauty|fashion|love|romantic/.test(p)) {
    return PALETTES[3];
  }

  if (/food|restaurant|coffee|cafe|bakery|pizza|ice cream/.test(p)) {
    return PALETTES[4];
  }

  if (/creative|portfolio|agency|design|art/.test(p)) {
    return PALETTES[5];
  }

  return PALETTES[0];
}

function pickType(prompt = "") {
  const p = prompt.toLowerCase();

  if (
    /restaurant|cafe|coffee|bakery|pizza|food|burger|ice cream|dessert/.test(
      p
    )
  ) {
    return "restaurant";
  }

  if (/portfolio|developer portfolio|designer portfolio|personal website/.test(p)) {
    return "portfolio";
  }

  if (/agency|marketing agency|creative agency|digital agency/.test(p)) {
    return "agency";
  }

  if (/saas|software|startup|platform|app|application/.test(p)) {
    return "saas";
  }

  if (/event|conference|workshop|festival|meetup/.test(p)) {
    return "event";
  }

  if (/nonprofit|ngo|charity|foundation|social cause/.test(p)) {
    return "nonprofit";
  }

  if (/movie|cinema|film|theater|theatre/.test(p)) {
    return "movie";
  }

  if (
    /shop|store|ecommerce|e-commerce|fashion|clothing|product|products/.test(p)
  ) {
    return "ecommerce";
  }

  return "general";
}

/*
|--------------------------------------------------------------------------
| Brand name
|--------------------------------------------------------------------------
|
| IMPORTANT:
| Do not use the complete user prompt as the brand name.
|
| Example:
| "make a movie website"
|     ↓
| "CineVerse"
|
*/

function brandName(prompt = "") {
  const p = prompt.toLowerCase();

  if (/ice\s*cream/.test(p)) {
    return "Sweet Scoop";
  }

  if (/pizza/.test(p)) {
    return "Oven & Crust";
  }

  if (/burger/.test(p)) {
    return "Grill House";
  }

  if (/restaurant/.test(p)) {
    return "The Kitchen";
  }

  if (/cafe|coffee/.test(p)) {
    return "Brew & Co.";
  }

  if (/bakery/.test(p)) {
    return "Golden Oven";
  }

  if (/movie|cinema|film|theater|theatre/.test(p)) {
    return "CineVerse";
  }

  if (/portfolio|developer/.test(p)) {
    return "DevStudio";
  }

  if (/designer|design|creative/.test(p)) {
    return "Creative Studio";
  }

  if (/agency/.test(p)) {
    return "Northstar Studio";
  }

  if (/saas|software|startup|platform|app/.test(p)) {
    return "Flowly";
  }

  if (/event|conference|festival|meetup/.test(p)) {
    return "Gather";
  }

  if (/nonprofit|ngo|charity|foundation/.test(p)) {
    return "Good Works";
  }

  if (/shop|store|ecommerce|e-commerce|fashion|clothing/.test(p)) {
    return "Modern Market";
  }

  return "MintSite";
}

/*
|--------------------------------------------------------------------------
| Hero headline
|--------------------------------------------------------------------------
|
| This is the important fix.
|
| The prompt:
| "make a movie website"
|
| should NOT become:
| "make a movie website"
|
| Instead it becomes:
| "Stories Worth Watching"
|
*/

function heroHeadline(prompt = "", type = "general") {
  const p = prompt.toLowerCase();

  if (/ice\s*cream/.test(p)) {
    return "Sweet Moments, One Scoop at a Time";
  }

  if (/pizza/.test(p)) {
    return "Fresh From the Oven";
  }

  if (/burger/.test(p)) {
    return "Big Flavor, Made Fresh";
  }

  if (/restaurant/.test(p)) {
    return "Good Food, Great Moments";
  }

  if (/cafe|coffee/.test(p)) {
    return "Good Coffee, Better Moments";
  }

  if (/bakery/.test(p)) {
    return "Freshly Baked Happiness";
  }

  if (/movie|cinema|film|theater|theatre/.test(p)) {
    return "Stories Worth Watching";
  }

  if (type === "portfolio") {
    return "Ideas Made to Stand Out";
  }

  if (type === "agency") {
    return "Ideas That Move Brands Forward";
  }

  if (type === "saas") {
    return "Work Smarter. Move Faster.";
  }

  if (type === "event") {
    return "Make Moments Worth Remembering";
  }

  if (type === "nonprofit") {
    return "Small Actions. Lasting Change.";
  }

  if (type === "ecommerce") {
    return "Discover Something You'll Love";
  }

  return "Built Around Your Ideas";
}

function tagline(prompt = "") {
  const p = prompt.toLowerCase();

  if (/ice\s*cream/.test(p)) {
    return "Delicious flavors, creamy textures, and sweet memories made every day.";
  }

  if (/pizza/.test(p)) {
    return "Handcrafted pizzas made with fresh ingredients and plenty of flavor.";
  }

  if (/burger/.test(p)) {
    return "Juicy, flavorful burgers made fresh for every craving.";
  }

  if (/restaurant/.test(p)) {
    return "Fresh ingredients, thoughtful recipes, and unforgettable dining experiences.";
  }

  if (/cafe|coffee/.test(p)) {
    return "A welcoming place for great coffee, good conversations, and memorable moments.";
  }

  if (/bakery/.test(p)) {
    return "Freshly baked treats made with care, quality ingredients, and a little love.";
  }

  if (/movie|cinema|film|theater|theatre/.test(p)) {
    return "Explore unforgettable stories, memorable characters, and experiences worth sharing.";
  }

  if (/portfolio|developer/.test(p)) {
    return "A collection of projects, skills, and ideas built with purpose.";
  }

  if (/designer|design|creative/.test(p)) {
    return "Thoughtful design and creative solutions built to make an impact.";
  }

  if (/agency/.test(p)) {
    return "Creative strategies and digital experiences that help brands grow.";
  }

  if (/saas|software|startup|platform|app/.test(p)) {
    return "Powerful tools designed to simplify your workflow and help you move faster.";
  }

  if (/event|conference|festival|meetup/.test(p)) {
    return "Connect, learn, celebrate, and create experiences worth remembering.";
  }

  if (/nonprofit|ngo|charity|foundation/.test(p)) {
    return "Together, we can turn meaningful ideas into positive change.";
  }

  if (/shop|store|ecommerce|e-commerce|fashion|clothing/.test(p)) {
    return "Discover thoughtfully selected products designed for modern lifestyles.";
  }

  return "A modern digital experience created around your vision.";
}

function productsFor(prompt = "") {
  const p = prompt.toLowerCase();

  if (/ice\s*cream/.test(p)) {
    return [
      {
        name: "Classic Vanilla",
        price: "$5.99",
        image:
          "https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Chocolate Dream",
        price: "$6.49",
        image:
          "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Berry Bliss",
        price: "$6.99",
        image:
          "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=900&q=80",
      },
    ];
  }

  if (/pizza/.test(p)) {
    return [
      {
        name: "Margherita",
        price: "$12.99",
        image:
          "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Pepperoni",
        price: "$14.99",
        image:
          "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Veggie Supreme",
        price: "$15.49",
        image:
          "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=900&q=80",
      },
    ];
  }

  if (/burger/.test(p)) {
    return [
      {
        name: "Classic Burger",
        price: "$10.99",
        image:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Cheese Burger",
        price: "$12.49",
        image:
          "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Double Stack",
        price: "$14.99",
        image:
          "https://images.unsplash.com/photo-1553979459-d2229ba7433a?auto=format&fit=crop&w=900&q=80",
      },
    ];
  }

  return [
    {
      name: "Featured Product",
      price: "$29.99",
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    },
    {
      name: "Popular Choice",
      price: "$39.99",
      image:
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
    },
    {
      name: "New Arrival",
      price: "$49.99",
      image:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    },
  ];
}

function imageUrl(keyword = "modern website") {
  return `https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=80`;
}

function heroImageUrl(prompt = "") {
  const p = prompt.toLowerCase();

  if (/ice\s*cream/.test(p)) {
    return "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=1600&q=80";
  }

  if (/pizza/.test(p)) {
    return "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=1600&q=80";
  }

  if (/burger/.test(p)) {
    return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1600&q=80";
  }

  if (/restaurant|food/.test(p)) {
    return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80";
  }

  if (/coffee|cafe/.test(p)) {
    return "https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1600&q=80";
  }

  if (/movie|cinema|film|theater|theatre/.test(p)) {
    return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80";
  }

  if (/portfolio|developer|designer/.test(p)) {
    return "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80";
  }

  if (/nature|eco|environment|organic/.test(p)) {
    return "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80";
  }

  return imageUrl();
}

const IMG_ONERROR = `
  this.onerror=null;
  this.src='https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=80';
`;

function homePage({
  brand,
  sub,
  type,
  headline,
  imgKw,
  heroImage,
}) {
  const buttonText =
    type === "restaurant"
      ? "Explore Menu"
      : type === "portfolio"
      ? "View My Work"
      : type === "agency"
      ? "Start a Project"
      : type === "movie"
      ? "Explore Movies"
      : type === "ecommerce"
      ? "Shop Now"
      : "Get Started";

  return `
    <section class="hero">
      <div class="heroContent">
        <span class="eyebrow">${brand}</span>

        <h1>
          ${headline}
        </h1>

        <p class="heroSubtitle">
          ${sub}
        </p>

        <div class="heroActions">
          <a href="#shop" class="btn btnPrimary">${buttonText}</a>
          <a href="#about" class="btn btnSecondary">Learn More</a>
        </div>
      </div>

      <div class="heroVisual">
        <img
          src="${heroImage}"
          alt="${imgKw}"
          onerror="${IMG_ONERROR}"
        />
      </div>
    </section>

    <section class="section">
      <div class="sectionHeader">
        <span class="eyebrow">Why Choose Us</span>
        <h2>Designed for a better experience</h2>
        <p>
          Everything you need in one beautiful and easy-to-use experience.
        </p>
      </div>

      <div class="featureGrid">
        <article class="featureCard">
          <div class="featureIcon">✦</div>
          <h3>Thoughtful Design</h3>
          <p>
            A clean, modern interface designed to make every interaction feel effortless.
          </p>
        </article>

        <article class="featureCard">
          <div class="featureIcon">⚡</div>
          <h3>Fast Experience</h3>
          <p>
            Smooth interactions and focused layouts that help visitors find what they need.
          </p>
        </article>

        <article class="featureCard">
          <div class="featureIcon">♥</div>
          <h3>Made With Care</h3>
          <p>
            Every section is thoughtfully structured around the goals of your website.
          </p>
        </article>
      </div>
    </section>
  `;
}

function shopPage({ brand, type, products }) {
  const title =
    type === "restaurant"
      ? "Our Menu"
      : type === "movie"
      ? "Featured Movies"
      : "Featured Collection";

  return `
    <section class="section pageSection">
      <div class="sectionHeader">
        <span class="eyebrow">${brand}</span>
        <h2>${title}</h2>
        <p>Explore some of our featured selections.</p>
      </div>

      <div class="productGrid">
        ${products
          .map(
            (product) => `
              <article class="productCard">
                <div class="productImage">
                  <img
                    src="${product.image}"
                    alt="${product.name}"
                    onerror="${IMG_ONERROR}"
                  />
                </div>

                <div class="productInfo">
                  <h3>${product.name}</h3>
                  <p class="productPrice">${product.price}</p>
                  <button class="btn btnPrimary">View Details</button>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function menuPage({ brand }) {
  return `
    <section class="section pageSection">
      <div class="sectionHeader">
        <span class="eyebrow">${brand}</span>
        <h2>Our Menu</h2>
        <p>Something delicious for everyone.</p>
      </div>

      <div class="menuGrid">
        <article class="menuCard">
          <h3>Starters</h3>
          <div class="menuItem">
            <span>Signature Starter</span>
            <strong>$8</strong>
          </div>
          <div class="menuItem">
            <span>Fresh Garden Salad</span>
            <strong>$7</strong>
          </div>
          <div class="menuItem">
            <span>House Special</span>
            <strong>$9</strong>
          </div>
        </article>

        <article class="menuCard">
          <h3>Main Course</h3>
          <div class="menuItem">
            <span>Chef's Special</span>
            <strong>$16</strong>
          </div>
          <div class="menuItem">
            <span>Classic Favorite</span>
            <strong>$14</strong>
          </div>
          <div class="menuItem">
            <span>Signature Plate</span>
            <strong>$18</strong>
          </div>
        </article>

        <article class="menuCard">
          <h3>Desserts</h3>
          <div class="menuItem">
            <span>House Dessert</span>
            <strong>$7</strong>
          </div>
          <div class="menuItem">
            <span>Sweet Special</span>
            <strong>$8</strong>
          </div>
          <div class="menuItem">
            <span>Chef's Creation</span>
            <strong>$9</strong>
          </div>
        </article>
      </div>
    </section>
  `;
}

function workPage({ brand }) {
  return `
    <section class="section pageSection">
      <div class="sectionHeader">
        <span class="eyebrow">${brand}</span>
        <h2>Selected Work</h2>
        <p>A showcase of ideas brought to life.</p>
      </div>

      <div class="workGrid">
        <article class="workCard">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80"
            alt="Creative workspace"
            onerror="${IMG_ONERROR}"
          />
          <div>
            <span class="tag">Branding</span>
            <h3>Modern Brand Identity</h3>
            <p>A thoughtful identity built around a clear visual language.</p>
          </div>
        </article>

        <article class="workCard">
          <img
            src="https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1000&q=80"
            alt="Digital design"
            onerror="${IMG_ONERROR}"
          />
          <div>
            <span class="tag">Web Design</span>
            <h3>Digital Experience</h3>
            <p>A clean and engaging experience designed for modern users.</p>
          </div>
        </article>

        <article class="workCard">
          <img
            src="https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1000&q=80"
            alt="Creative design"
            onerror="${IMG_ONERROR}"
          />
          <div>
            <span class="tag">Creative</span>
            <h3>Creative Campaign</h3>
            <p>A bold campaign built to communicate a memorable message.</p>
          </div>
        </article>
      </div>
    </section>
  `;
}

function featuresPage({ brand }) {
  return `
    <section class="section pageSection">
      <div class="sectionHeader">
        <span class="eyebrow">${brand}</span>
        <h2>Features</h2>
        <p>Everything designed to create a smooth experience.</p>
      </div>

      <div class="featureGrid">
        <article class="featureCard">
          <div class="featureIcon">⚡</div>
          <h3>Fast & Simple</h3>
          <p>
            A straightforward experience that helps users accomplish their goals quickly.
          </p>
        </article>

        <article class="featureCard">
          <div class="featureIcon">◈</div>
          <h3>Modern Design</h3>
          <p>
            Clean layouts, strong typography, and responsive sections across devices.
          </p>
        </article>

        <article class="featureCard">
          <div class="featureIcon">✓</div>
          <h3>Reliable</h3>
          <p>
            Carefully structured pages designed for clarity and consistency.
          </p>
        </article>

        <article class="featureCard">
          <div class="featureIcon">✦</div>
          <h3>Flexible</h3>
          <p>
            Content and sections can be adapted to different needs and audiences.
          </p>
        </article>
      </div>
    </section>
  `;
}

function aboutPage({ brand, type }) {
  const description =
    type === "restaurant"
      ? "We believe great food brings people together. Our goal is to create memorable experiences through quality ingredients, thoughtful recipes, and genuine hospitality."
      : type === "movie"
      ? "We celebrate the art of storytelling and bring audiences closer to the movies, characters, and experiences they love."
      : "We believe great digital experiences begin with a clear idea and thoughtful execution. Everything we create is designed to be useful, beautiful, and memorable.";

  return `
    <section class="section pageSection">
      <div class="aboutLayout">
        <div>
          <span class="eyebrow">About ${brand}</span>
          <h2>Built with purpose.</h2>
        </div>

        <div>
          <p class="largeText">
            ${description}
          </p>

          <p>
            Our focus is simple: create experiences that people enjoy using
            while keeping the design clear, modern, and approachable.
          </p>
        </div>
      </div>
    </section>
  `;
}

function contactPage({ brand }) {
  return `
    <section class="section pageSection">
      <div class="sectionHeader">
        <span class="eyebrow">${brand}</span>
        <h2>Let's Connect</h2>
        <p>Have a question? We'd love to hear from you.</p>
      </div>

      <form class="contactForm">
        <div class="formGrid">
          <div class="formGroup">
            <label>Name</label>
            <input type="text" placeholder="Your name" />
          </div>

          <div class="formGroup">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" />
          </div>
        </div>

        <div class="formGroup">
          <label>Message</label>
          <textarea
            rows="6"
            placeholder="Tell us how we can help..."
          ></textarea>
        </div>

        <button type="button" class="btn btnPrimary">
          Send Message
        </button>
      </form>
    </section>
  `;
}

function signinPage({ brand }) {
  return `
    <section class="authSection">
      <div class="authCard">
        <span class="eyebrow">${brand}</span>
        <h2>Welcome Back</h2>
        <p>Sign in to continue.</p>

        <form class="authForm">
          <div class="formGroup">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" />
          </div>

          <div class="formGroup">
            <label>Password</label>
            <input type="password" placeholder="••••••••" />
          </div>

          <button type="button" class="btn btnPrimary">
            Sign In
          </button>
        </form>
      </div>
    </section>
  `;
}

function signupPage({ brand }) {
  return `
    <section class="authSection">
      <div class="authCard">
        <span class="eyebrow">${brand}</span>
        <h2>Create Account</h2>
        <p>Start your journey today.</p>

        <form class="authForm">
          <div class="formGroup">
            <label>Name</label>
            <input type="text" placeholder="Your name" />
          </div>

          <div class="formGroup">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" />
          </div>

          <div class="formGroup">
            <label>Password</label>
            <input type="password" placeholder="••••••••" />
          </div>

          <button type="button" class="btn btnPrimary">
            Create Account
          </button>
        </form>
      </div>
    </section>
  `;
}

const BASE_CSS = `
:root {
  --primary: #6366f1;
  --accent: #a855f7;
  --bg: #ffffff;
  --bg-soft: #f8fafc;
  --ink: #111827;
  --muted: #64748b;
  --border: #e2e8f0;
  --radius: 22px;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  line-height: 1.6;
}

a {
  color: inherit;
  text-decoration: none;
}

img {
  max-width: 100%;
  display: block;
}

button,
input,
textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

.siteShell {
  min-height: 100vh;
  background:
    radial-gradient(
      circle at top right,
      rgba(99, 102, 241, 0.08),
      transparent 32%
    ),
    var(--bg);
}

.navbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 6%;
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.7);
}

.logo {
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.navLinks {
  display: flex;
  align-items: center;
  gap: 22px;
}

.navLinks a {
  color: var(--muted);
  font-size: 0.95rem;
  font-weight: 600;
  transition: color 0.2s ease;
}

.navLinks a:hover {
  color: var(--primary);
}

.hero {
  width: min(1200px, 88%);
  margin: 0 auto;
  min-height: 680px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 70px;
  padding: 90px 0;
}

.heroContent {
  max-width: 650px;
}

.eyebrow {
  display: inline-block;
  margin-bottom: 14px;
  color: var(--primary);
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.hero h1 {
  margin: 0;
  font-size: clamp(3.2rem, 7vw, 6.4rem);
  line-height: 0.98;
  letter-spacing: -0.065em;
  font-weight: 850;
}

.heroSubtitle {
  max-width: 580px;
  margin: 30px 0 0;
  color: var(--muted);
  font-size: 1.15rem;
  line-height: 1.8;
}

.heroActions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 32px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 22px;
  border-radius: 999px;
  border: 1px solid transparent;
  font-weight: 700;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.btn:hover {
  transform: translateY(-2px);
}

.btnPrimary {
  color: #ffffff;
  background: linear-gradient(
    135deg,
    var(--primary),
    var(--accent)
  );
  box-shadow: 0 14px 30px rgba(99, 102, 241, 0.22);
}

.btnSecondary {
  background: var(--bg);
  border-color: var(--border);
}

.heroVisual {
  position: relative;
}

.heroVisual::before {
  content: "";
  position: absolute;
  inset: -20px;
  border-radius: 35px;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.15),
    rgba(168, 85, 247, 0.12)
  );
  filter: blur(25px);
}

.heroVisual img {
  position: relative;
  width: 100%;
  height: 520px;
  object-fit: cover;
  border-radius: 32px;
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.16);
}

.section {
  width: min(1200px, 88%);
  margin: 0 auto;
  padding: 110px 0;
}

.pageSection {
  min-height: 650px;
}

.sectionHeader {
  max-width: 700px;
  margin: 0 auto 55px;
  text-align: center;
}

.sectionHeader h2 {
  margin: 0;
  font-size: clamp(2.2rem, 5vw, 4rem);
  line-height: 1.05;
  letter-spacing: -0.05em;
}

.sectionHeader p {
  margin: 18px 0 0;
  color: var(--muted);
  font-size: 1.05rem;
}

.featureGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
}

.featureCard {
  padding: 32px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 15px 45px rgba(15, 23, 42, 0.05);
}

.featureIcon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  margin-bottom: 20px;
  border-radius: 14px;
  color: var(--primary);
  background: var(--bg-soft);
  font-size: 1.3rem;
  font-weight: 800;
}

.featureCard h3 {
  margin: 0;
  font-size: 1.2rem;
}

.featureCard p {
  margin: 10px 0 0;
  color: var(--muted);
}

.productGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
}

.productCard {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: #ffffff;
  box-shadow: 0 15px 45px rgba(15, 23, 42, 0.06);
}

.productImage {
  aspect-ratio: 1 / 0.8;
  overflow: hidden;
}

.productImage img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.productCard:hover .productImage img {
  transform: scale(1.05);
}

.productInfo {
  padding: 24px;
}

.productInfo h3 {
  margin: 0;
  font-size: 1.2rem;
}

.productPrice {
  margin: 8px 0 20px;
  color: var(--primary);
  font-weight: 800;
}

.menuGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
}

.menuCard {
  padding: 30px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-soft);
}

.menuCard h3 {
  margin: 0 0 24px;
  font-size: 1.3rem;
}

.menuItem {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 15px 0;
  border-bottom: 1px solid var(--border);
}

.menuItem:last-child {
  border-bottom: 0;
}

.menuItem span {
  color: var(--muted);
}

.menuItem strong {
  color: var(--primary);
}

.workGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
}

.workCard {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: #ffffff;
}

.workCard img {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.workCard > div {
  padding: 24px;
}

.workCard h3 {
  margin: 8px 0;
}

.workCard p {
  margin: 0;
  color: var(--muted);
}

.tag {
  color: var(--primary);
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.aboutLayout {
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 80px;
  align-items: start;
}

.aboutLayout h2 {
  margin: 0;
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  line-height: 1;
  letter-spacing: -0.05em;
}

.aboutLayout p {
  color: var(--muted);
  font-size: 1.05rem;
}

.aboutLayout .largeText {
  margin-top: 0;
  color: var(--ink);
  font-size: 1.35rem;
  line-height: 1.7;
}

.contactForm {
  max-width: 800px;
  margin: 0 auto;
  padding: 35px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: #ffffff;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.07);
}

.formGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.formGroup {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.formGroup label {
  font-size: 0.9rem;
  font-weight: 700;
}

.formGroup input,
.formGroup textarea {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: 14px;
  outline: none;
  background: var(--bg-soft);
  color: var(--ink);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.formGroup input:focus,
.formGroup textarea:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.authSection {
  min-height: 700px;
  display: grid;
  place-items: center;
  padding: 80px 20px;
}

.authCard {
  width: min(460px, 100%);
  padding: 40px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: #ffffff;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
}

.authCard h2 {
  margin: 0;
  font-size: 2.4rem;
  letter-spacing: -0.04em;
}

.authCard > p {
  color: var(--muted);
}

.authForm {
  margin-top: 28px;
}

footer {
  margin-top: 60px;
  padding: 50px 6%;
  background: #0f172a;
  color: #ffffff;
}

.footerInner {
  width: min(1200px, 88%);
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  gap: 30px;
}

.footerBrand {
  font-weight: 800;
}

.footerLinks {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.footerLinks a {
  color: #cbd5e1;
}

@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
    gap: 45px;
    padding: 70px 0;
  }

  .heroVisual img {
    height: 420px;
  }

  .featureGrid,
  .productGrid,
  .menuGrid,
  .workGrid {
    grid-template-columns: 1fr 1fr;
  }

  .aboutLayout {
    grid-template-columns: 1fr;
    gap: 30px;
  }
}

@media (max-width: 640px) {
  .navbar {
    padding: 15px 5%;
  }

  .navLinks {
    display: none;
  }

  .hero {
    width: 90%;
    min-height: auto;
    padding: 60px 0;
  }

  .hero h1 {
    font-size: clamp(2.8rem, 14vw, 4.5rem);
  }

  .heroSubtitle {
    font-size: 1rem;
  }

  .heroVisual img {
    height: 320px;
    border-radius: 24px;
  }

  .section {
    width: 90%;
    padding: 75px 0;
  }

  .featureGrid,
  .productGrid,
  .menuGrid,
  .workGrid,
  .formGrid {
    grid-template-columns: 1fr;
  }

  .contactForm,
  .authCard {
    padding: 25px;
  }

  .footerInner {
    flex-direction: column;
  }
}
`;

function navConfig(type) {
  if (type === "restaurant") {
    return [
      ["Home", "#home"],
      ["Menu", "#menu"],
      ["About", "#about"],
      ["Contact", "#contact"],
    ];
  }

  if (type === "portfolio") {
    return [
      ["Home", "#home"],
      ["Work", "#work"],
      ["About", "#about"],
      ["Contact", "#contact"],
    ];
  }

  if (type === "movie") {
    return [
      ["Home", "#home"],
      ["Movies", "#shop"],
      ["About", "#about"],
      ["Contact", "#contact"],
    ];
  }

  return [
    ["Home", "#home"],
    ["Features", "#features"],
    ["About", "#about"],
    ["Contact", "#contact"],
  ];
}

function navFor({ type }) {
  return navConfig(type);
}

function cartIcon() {
  return `
    <span
      style="
        display:inline-flex;
        align-items:center;
        justify-content:center;
        width:34px;
        height:34px;
        border-radius:50%;
        background:#f1f5f9;
      "
    >
      🛒
    </span>
  `;
}

function footerBrowseLinks({ type }) {
  if (type === "restaurant") {
    return `
      <a href="#home">Home</a>
      <a href="#menu">Menu</a>
      <a href="#about">About</a>
      <a href="#contact">Contact</a>
    `;
  }

  if (type === "portfolio") {
    return `
      <a href="#home">Home</a>
      <a href="#work">Work</a>
      <a href="#about">About</a>
      <a href="#contact">Contact</a>
    `;
  }

  return `
    <a href="#home">Home</a>
    <a href="#features">Features</a>
    <a href="#about">About</a>
    <a href="#contact">Contact</a>
  `;
}

function pagesFor({
  type,
  brand,
  sub,
  headline,
  imgKw,
  heroImage,
  products,
}) {
  const pages = [];

  pages.push({
    id: "home",
    title: "Home",
    html: homePage({
      brand,
      sub,
      type,
      headline,
      imgKw,
      heroImage,
    }),
  });

  if (type === "restaurant") {
    pages.push({
      id: "menu",
      title: "Menu",
      html: menuPage({ brand }),
    });
  }

  if (type === "portfolio" || type === "agency") {
    pages.push({
      id: "work",
      title: "Work",
      html: workPage({ brand }),
    });
  }

  if (
    type === "ecommerce" ||
    type === "restaurant" ||
    type === "movie"
  ) {
    pages.push({
      id: "shop",
      title: type === "restaurant" ? "Menu" : "Shop",
      html: shopPage({
        brand,
        type,
        products,
      }),
    });
  }

  if (type === "saas" || type === "general") {
    pages.push({
      id: "features",
      title: "Features",
      html: featuresPage({ brand }),
    });
  }

  pages.push({
    id: "about",
    title: "About",
    html: aboutPage({ brand, type }),
  });

  pages.push({
    id: "contact",
    title: "Contact",
    html: contactPage({ brand }),
  });

  pages.push({
    id: "signin",
    title: "Sign In",
    html: signinPage({ brand }),
  });

  pages.push({
    id: "signup",
    title: "Sign Up",
    html: signupPage({ brand }),
  });

  return pages;
}

/*
|--------------------------------------------------------------------------
| Main mock generator
|--------------------------------------------------------------------------
*/

export function generateMockSite(prompt = "") {
  const safePrompt = String(prompt || "").trim();

  const palette = pickPalette(safePrompt);
  const type = pickType(safePrompt);

  const brand = brandName(safePrompt);

  // IMPORTANT:
  // Hero headline is now completely separate from the brand.
  const headline = heroHeadline(safePrompt, type);

  const sub = tagline(safePrompt);

  const imgKw = safePrompt
    .replace(
      /^(create|build|make|design|generate)\s+(a|an|the)\s+/i,
      ""
    )
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .join(" ");

  const heroImage = heroImageUrl(safePrompt);

  const products = productsFor(safePrompt);

  const pages = pagesFor({
    type,
    brand,
    sub,
    headline,
    imgKw,
    heroImage,
    products,
  });

  const navItems = navFor({ type });

  const navHtml = navItems
    .map(
      ([label, href]) => `
        <a href="${href}">${label}</a>
      `
    )
    .join("");

  const footerLinks = footerBrowseLinks({ type });

  const rootCss = `
    ${BASE_CSS}

    :root {
      --primary: ${palette.primary};
      --accent: ${palette.accent};
      --bg: ${palette.bg};
      --bg-soft: ${palette.bgSoft};
      --ink: ${palette.ink};
      --muted: ${palette.muted};
    }
  `;

  const pageHtml = pages
    .map(
      (page) => `
        <section
          id="${page.id}"
          data-page="${page.id}"
        >
          ${page.html}
        </section>
      `
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>${brand}</title>

  <style>
    ${rootCss}
  </style>
</head>

<body>
  <div class="siteShell">

    <nav class="navbar">
      <a href="#home" class="logo">
        ${brand}
      </a>

      <div class="navLinks">
        ${navHtml}
      </div>

      ${
        type === "ecommerce"
          ? cartIcon()
          : ""
      }
    </nav>

    <main>
      ${pageHtml}
    </main>

    <footer>
      <div class="footerInner">
        <div>
          <div class="footerBrand">${brand}</div>

          <p
            style="
              max-width:420px;
              color:#94a3b8;
              margin:10px 0 0;
            "
          >
            ${sub}
          </p>
        </div>

        <div class="footerLinks">
          ${footerLinks}
        </div>
      </div>
    </footer>

  </div>

  <script>
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", function (event) {
        const targetId = this.getAttribute("href");

        if (!targetId || targetId === "#") {
          return;
        }

        const target = document.querySelector(targetId);

        if (target) {
          event.preventDefault();

          target.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      });
    });
  </script>
</body>
</html>
`;

  return {
    html,
    pages,
    brand,
    type,
    palette,
    headline,
    tagline: sub,
  };
}

/*
|--------------------------------------------------------------------------
| Mock prompt enhancer
|--------------------------------------------------------------------------
|
| Again, the user's prompt is treated as an instruction.
| It is NOT copied directly into website content.
*/

export function mockEnhancePrompt(prompt = "") {
  const safePrompt = String(prompt || "").trim();

  const type = pickType(safePrompt);
  const brand = brandName(safePrompt);
  const headline = heroHeadline(safePrompt, type);
  const sub = tagline(safePrompt);

  return {
    text: `
Create a polished ${type} website.

Brand:
${brand}

Website purpose:
Build a professional website based on the user's requirements.

Hero headline:
${headline}

Hero subtitle:
${sub}

Important content rule:
The user's original prompt is an instruction for generating the website.
Do not copy the original prompt verbatim into visible website content.

Create original, natural website copy for:
- Hero headline
- Hero subtitle
- Section headings
- Feature descriptions
- CTA buttons
- About section
- Contact section

The website should feel like a real professional website rather than an AI-generated interpretation of the user's instruction.
    `.trim(),
  };
}