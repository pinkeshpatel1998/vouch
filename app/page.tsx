"use client";

import { useState } from "react";
import Link from "next/link";
import { Brand, Arrow } from "@/components/brand";
import { TemplatePicker } from "@/components/wall/template-picker";
import { type CardStyle } from "@/lib/wall-templates";
import { WallRender } from "@/components/wall/wall-render";
import { sampleTestimonials } from "@/lib/sample";
import type { WallPayload } from "@/lib/database.types";
import "./marketing.css";

const examples = sampleTestimonials
  .filter((t) => t.type === "text")
  .slice(0, 6)
  .map((t, i) => ({
    ...t,
    author_avatar_url: `/images/portrait-${(i % 3) + 1}.jpg`,
  }));
const layouts = [
  { key: "masonry", label: "Wall of love" },
  { key: "carousel", label: "Carousel" },
  { key: "single", label: "Spotlight" },
] as const;
const faqs = [
  [
    "Do my customers need an account?",
    "No. They open your collection link, write or record their testimonial, and submit. No sign-up, downloads, or extra steps.",
  ],
  [
    "Can I choose which testimonials go live?",
    "Absolutely. Every submission arrives in your inbox for review. Approve the ones you want to share, edit typos, and keep the rest private.",
  ],
  [
    "Will it work with my website?",
    "If your website supports a custom HTML or embed block, you can add a Vouch wall with one snippet. Choose your layout, match your colors, and copy the code.",
  ],
  [
    "Can I collect video testimonials too?",
    "Yes. Customers can record a video directly in their browser. Text and video testimonials live together in the same inbox.",
  ],
];

function Rating() {
  return (
    <span className="demo-stars" aria-label="5 out of 5 stars">
      ★★★★★
    </span>
  );
}
function Person({
  image = 1,
  name,
  role,
}: {
  image?: number;
  name: string;
  role: string;
}) {
  return (
    <div className="demo-person">
      <img
        src={`/images/portrait-${image}.jpg`}
        alt=""
        width="38"
        height="38"
      />
      <div>
        <strong>{name}</strong>
        <span>{role}</span>
      </div>
      <span className="person-check" aria-label="Example testimonial">
        ✓
      </span>
    </div>
  );
}

export default function Marketing() {
  const [layout, setLayout] = useState<"masonry" | "carousel" | "single">(
    "masonry",
  );
  const [appearance, setAppearance] = useState<CardStyle>("classic");
  const [menuOpen, setMenuOpen] = useState(false);
  const demoWall: WallPayload = {
    wall: {
      id: "demo",
      layout,
      carousel_style: "rail",
      card_style: appearance,
      theme: "light",
      accent_color: "#b84925",
      show_ratings: true,
      include_video: false,
    },
    space: { name: "Vouch", logo_url: null },
    testimonials: examples,
  };

  return (
    <div className="marketing">
      <nav className="landing-nav" aria-label="Main navigation">
        <Brand />
        <div className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
            How it works
          </a>
          <a href="#showcase" onClick={() => setMenuOpen(false)}>
            The good words
          </a>
          <a href="#questions" onClick={() => setMenuOpen(false)}>
            FAQs
          </a>
        </div>
        <div className="nav-actions">
          <Link className="login-link" href="/app">
            Log in
          </Link>
          <Link className="pill pill-dark nav-cta" href="/app">
            Start collecting <Arrow diagonal />
          </Link>
          <button
            className="menu-toggle"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      <main>
        <section className="landing-hero" aria-labelledby="hero-title">
          <div className="hero-glow" aria-hidden="true" />
          <div className="hero-copy">
            <p className="eyebrow">
              <span /> GOOD WORK DESERVES GOOD WORDS
            </p>
            <h1 id="hero-title">
              Let your customers
              <br />
              do the <em>talking.</em>
              <span className="hero-spark" aria-hidden="true">
                ✳
              </span>
            </h1>
            <p className="hero-description">
              Turn happy customers into your most convincing story.
              <br className="desktop-break" /> Collect, curate, and share
              testimonials that feel human.
            </p>
            <div className="hero-actions">
              <Link href="/app" className="pill pill-orange">
                Start your wall of love <Arrow diagonal />
              </Link>
              <a href="#showcase" className="pill pill-outline">
                <span className="small-play" aria-hidden="true">
                  ▶
                </span>{" "}
                See it in action
              </a>
            </div>
            <p className="hero-note">
              Text & video <span>·</span> No account needed to submit{" "}
              <span>·</span> Yours to make your own
            </p>
          </div>

          <div
            className="testimonial-stage"
            aria-label="Illustrative testimonial designs"
          >
            <div className="stage-note">
              A little customer love.
              <br />
              <span>A lot of possibility.</span>
              <svg viewBox="0 0 70 55" aria-hidden="true">
                <path d="M5 5q45 0 45 38m-12-8 12 9 10-12" />
              </svg>
            </div>
            <article className="hero-card card-note">
              <span className="big-quote" aria-hidden="true">
                “
              </span>
              <Rating />
              <p>
                “The kind of tool you wish you’d found <em>sooner.</em> So
                simple, so good.”
              </p>
              <Person
                name="Ana K."
                role="Small business, big ideas"
                image={3}
              />
              <span className="card-sticker">a little love ♡</span>
            </article>
            <article className="hero-card card-portrait">
              <img
                src="/images/portrait-1.jpg"
                alt="Portrait illustrating a customer story"
                width="640"
                height="800"
              />
              <span className="portrait-tag">
                <span /> CUSTOMER STORIES
              </span>
              <div className="portrait-copy">
                <Rating />
                <p>
                  “Okay, I’m
                  <br />a little obsessed.”
                </p>
                <span>
                  Priya R. <i>·</i> Founder & maker
                </span>
              </div>
            </article>
            <article className="hero-card card-dark">
              <span className="quote-top">
                WORDS THAT MEAN THE WORLD <span>↗</span>
              </span>
              <Rating />
              <p>
                Great work.
                <br />
                Real people.
                <br />
                <em>Happy customers.</em>
              </p>
              <div className="mini-rule" />
              <Person
                name="Marcus O."
                role="Building something good"
                image={2}
              />
            </article>
            <article className="hero-card card-peach">
              <div className="peach-heading">
                <img
                  src="/images/portrait-3.jpg"
                  alt=""
                  width="70"
                  height="70"
                />
                <span aria-hidden="true">”</span>
              </div>
              <Rating />
              <p>
                “Finally, a home for all the nice things our customers say.”
              </p>
              <strong>Dana W.</strong>
              <span className="peach-role">Design lead & detail person</span>
            </article>
            <div className="love-stamp" aria-hidden="true">
              MADE OF
              <br />
              <span>♡</span>
              <br />
              GOOD WORDS
            </div>
          </div>
          <p className="sample-label">
            A preview of the possibilities. Illustrative stories & portraits.
          </p>
        </section>

        <section className="audience-strip" aria-label="Who Vouch is for">
          <p>
            FOR PEOPLE WHO CARE
            <br />
            ABOUT WHAT THEY MAKE
          </p>
          <div>
            ✳ <span>Independent creators</span>
          </div>
          <div>
            ↗ <span>Growing businesses</span>
          </div>
          <div>
            ◈ <span>Thoughtful agencies</span>
          </div>
          <div>
            ✺ <span>Big-hearted brands</span>
          </div>
        </section>

        <section className="how-section section-wrap" id="how-it-works">
          <div className="section-heading">
            <div>
              <p className="eyebrow">LESS CHASING. MORE SHARING.</p>
              <h2>
                From “thank you”
                <br />
                to <em>“take a look.”</em>
              </h2>
            </div>
            <p>
              You do the work worth talking about.
              <br />
              We make it easy to share the good words.
            </p>
          </div>
          <div className="steps-grid">
            <article className="step-card">
              <div className="step-visual visual-link">
                <div className="mini-collection">
                  <span className="mini-flower">✳</span>
                  <strong>Enjoying the experience?</strong>
                  <p>We’d love to hear your story.</p>
                  <div>
                    <span>✎ Write a few words</span>
                    <span>◉ Record a video</span>
                  </div>
                </div>
                <span className="floating-link">
                  ↗ &nbsp; Your link. Their story.
                </span>
              </div>
              <div className="step-heading">
                <span>01</span>
                <h3>Make the first move.</h3>
              </div>
              <p>
                Send one beautiful collection link. They can leave a few words
                or record a video, right there.
              </p>
            </article>
            <article className="step-card">
              <div className="step-visual visual-inbox">
                <div className="mini-review">
                  <Person
                    name="Priya just made your day"
                    role="A new testimonial is waiting"
                  />
                  <p>
                    “It’s the little details that make this so special. Can’t
                    recommend it enough.”
                  </p>
                  <span className="approve-chip">
                    ✓ &nbsp; Approved and ready to shine
                  </span>
                </div>
                <span className="heart-bubble" aria-hidden="true">
                  ♡
                </span>
              </div>
              <div className="step-heading">
                <span>02</span>
                <h3>Keep the good stuff.</h3>
              </div>
              <p>
                All your customer love in one calm inbox. Review, polish a typo,
                and choose what goes live.
              </p>
            </article>
            <article className="step-card">
              <div className="step-visual visual-wall">
                <div className="mini-wall">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div key={i}>
                      <span>★★★★★</span>
                      <i />
                      <i />
                      <i />
                      <b>
                        <img
                          src={`/images/portrait-${(i % 3) + 1}.jpg`}
                          alt=""
                        />
                      </b>
                    </div>
                  ))}
                </div>
                <span className="floating-link">
                  Your website, with more heart. ♡
                </span>
              </div>
              <div className="step-heading">
                <span>03</span>
                <h3>Let the love live on.</h3>
              </div>
              <p>
                Pick a layout, make it yours, and add it to your website. Your
                customers take it from here.
              </p>
            </article>
          </div>
        </section>

        <section className="showcase-section" id="showcase">
          <div className="section-wrap">
            <div className="showcase-heading">
              <p className="eyebrow">REAL WORDS. REALLY GOOD LOOKING.</p>
              <h2>
                A wall of love.
                <br />
                <em>With your name on it.</em>
              </h2>
              <p>Not every story fits the same frame. Find yours.</p>
            </div>
            <TemplatePicker value={appearance} onChange={setAppearance} />
            <div
              className="layout-picker"
              role="group"
              aria-label="Testimonial layout"
            >
              {layouts.map((item) => (
                <button
                  key={item.key}
                  aria-pressed={layout === item.key}
                  onClick={() => setLayout(item.key)}
                >
                  <span aria-hidden="true">
                    {item.key === "masonry"
                      ? "▦"
                      : item.key === "carousel"
                        ? "▤"
                        : "❞"}
                  </span>
                  {item.label}
                </button>
              ))}
            </div>
            <div className="live-wall">
              <WallRender key={`${layout}-${appearance}`} payload={demoWall} />
            </div>
            <p className="sample-label">
              Sample testimonials · Your words, colors, and personality go here.
            </p>
            <Link href="/app" className="text-link">
              Make yourself at home <Arrow />
            </Link>
          </div>
        </section>

        <section className="feature-section section-wrap">
          <div className="feature-manifesto">
            <p className="eyebrow">SMALL DETAILS. BIG DIFFERENCE.</p>
            <h2>
              All the heart.
              <br />
              <em>None of the hassle.</em>
            </h2>
            <p>
              For the solo makers, the small teams, and the people building
              something they believe in. Your customer stories deserve better
              than a forgotten screenshot.
            </p>
            <Link href="/app" className="pill pill-dark">
              Meet your new happy place <Arrow diagonal />
            </Link>
            <span className="manifesto-flower" aria-hidden="true">
              ✳
            </span>
          </div>
          <div className="feature-list">
            {[
              [
                "01",
                "A face. A voice. A real person.",
                "Collect text and video together. Because the best stories come in more than one format.",
              ],
              [
                "02",
                "Feels like you, everywhere.",
                "Your colors, your collection page, your choice of layouts. A natural part of your brand.",
              ],
              [
                "03",
                "One link. Zero friction.",
                "No customer accounts, no apps to download. Just an easy way to say something nice.",
              ],
              [
                "04",
                "Your stories. Your say.",
                "Nothing goes public without your approval. You decide what the world gets to see.",
              ],
            ].map(([n, title, body]) => (
              <article key={n}>
                <span>{n}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
                <Arrow diagonal />
              </article>
            ))}
          </div>
        </section>

        <section id="questions" className="faq-section section-wrap">
          <div>
            <p className="eyebrow">A FEW GOOD QUESTIONS</p>
            <h2>
              Glad you
              <br />
              <em>asked.</em>
            </h2>
          </div>
          <div className="faq-list">
            {faqs.map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="closing-section">
          <span className="closing-star" aria-hidden="true">
            ✳
          </span>
          <p className="eyebrow">YOU’VE ALREADY EARNED THE LOVE.</p>
          <h2>
            Now give it
            <br />
            somewhere to <em>live.</em>
          </h2>
          <Link href="/app" className="pill pill-dark">
            Start your wall of love <Arrow diagonal />
          </Link>
          <p>Good words. Real people. A little more trust.</p>
        </section>
      </main>
      <footer className="landing-footer">
        <Brand />
        <p>A little proof goes a long way.</p>
        <div>
          <a href="#how-it-works">How it works</a>
          <Link href="/app">
            Open the app <Arrow diagonal />
          </Link>
          <span>© {new Date().getFullYear()} Vouch</span>
        </div>
      </footer>
    </div>
  );
}
