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