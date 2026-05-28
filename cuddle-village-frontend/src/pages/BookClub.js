import React, { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";

const faqs = [
  {
    q: "What age groups do you cater for?",
    a: "Our Book Club is open to children aged 4–8. Early Learners covers ages 4–5, and Growing Readers covers ages 6–8. We're working on expanding to older age groups — stay tuned!",
  },
  {
    q: "What days are sessions held?",
    a: "We run sessions every Saturday and Sunday. You choose your preferred day during enrolment, and you can switch with advance notice.",
  },
  {
    q: "What should my child bring?",
    a: "Just themselves and a love of stories! We provide all books and activity materials. A small water bottle and a snack are welcome.",
  },
  {
    q: "Can I cancel or reschedule a session?",
    a: "Yes — notify us at least 24 hours in advance and we'll arrange a make-up session at no extra charge.",
  },
  {
    q: "Is the Monthly plan auto-renewed?",
    a: "Yes, monthly plans renew automatically. You can pause or cancel anytime from your account dashboard.",
  },
];

const testimonials = [
  {
    name: "Amara's Mum",
    text: "Amara used to resist reading. After just three sessions she was asking for bedtime stories every night. Absolutely magical.",
    emoji: "🌟",
    group: "Early Learners",
  },
  {
    name: "David's Dad",
    text: "The Growing Readers group has transformed David's comprehension. His teachers noticed the difference within a month.",
    emoji: "📖",
    group: "Growing Readers",
  },
  {
    name: "Zuri's Mum",
    text: "Warm, nurturing environment. The facilitators genuinely care about every child. Worth every shilling.",
    emoji: "💜",
    group: "Early Learners",
  },
];

export default function BookClub() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get("status");
  const [openFaq, setOpenFaq] = useState(null);

  // Try to get user from localStorage
  let user = null;
  try { user = JSON.parse(localStorage.getItem("user")); } catch {}

  const banner =
    status === "coming-soon"
      ? {
          bg: "linear-gradient(135deg,#1a3a5c,#1e4976)",
          border: "#5bb8f5",
          icon: "🚀",
          title: "Coming Soon for Older Readers!",
          text: "We're crafting something special for children above age 8. Leave your email and we'll notify you the moment it launches.",
        }
      : status === "too-young"
      ? {
          bg: "linear-gradient(135deg,#3a2a00,#5c4400)",
          border: "#f7c948",
          icon: "🌱",
          title: "Almost Ready!",
          text: "Your little one is still blossoming — our Book Club opens from age 4. Bookmark this page and come back when they're ready!",
        }
      : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Playfair+Display:wght@700;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .bc-page {
          font-family: 'Nunito', sans-serif;
          background: #0f0d1a;
          color: #e8e4f8;
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* ── Status Banner ───────────────────────────────────────────── */
        .bc-status-banner {
          border-radius: 18px;
          padding: 22px 28px;
          margin: 28px 40px 0;
          border: 1.5px solid;
          display: flex;
          gap: 18px;
          align-items: flex-start;
          animation: fadeSlideDown 0.5s ease both;
        }
        .bc-status-icon { font-size: 32px; flex-shrink: 0; margin-top: 2px; }
        .bc-status-title { font-size: 17px; font-weight: 900; margin-bottom: 4px; }
        .bc-status-text  { font-size: 13px; font-weight: 600; opacity: 0.8; line-height: 1.6; }

        /* ── Hero ────────────────────────────────────────────────────── */
        .bc-hero {
          position: relative;
          min-height: 520px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 40px 60px;
          text-align: center;
          overflow: hidden;
        }
        .bc-hero-bg {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(195,177,225,0.18) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 20% 80%, rgba(91,184,245,0.10) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 80% 70%, rgba(247,201,72,0.08) 0%, transparent 60%),
            #0f0d1a;
        }
        /* Floating orbs */
        .bc-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.25;
          animation: float 8s ease-in-out infinite;
        }
        .bc-orb-1 { width: 320px; height: 320px; background: #C3B1E1; top: -100px; left: -80px; animation-delay: 0s; }
        .bc-orb-2 { width: 200px; height: 200px; background: #5bb8f5; bottom: -40px; right: 60px; animation-delay: -3s; }
        .bc-orb-3 { width: 160px; height: 160px; background: #f7c948; bottom: 60px; left: 40%; animation-delay: -6s; }
        @keyframes float {
          0%,100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-20px) scale(1.05); }
        }

        .bc-hero-content { position: relative; z-index: 1; max-width: 680px; }
        .bc-hero-badge {
          display: inline-block;
          background: rgba(195,177,225,0.15);
          border: 1px solid rgba(195,177,225,0.35);
          color: #C3B1E1;
          font-size: 11px; font-weight: 900;
          letter-spacing: 2px; text-transform: uppercase;
          padding: 6px 16px; border-radius: 20px;
          margin-bottom: 20px;
        }
        .bc-hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(38px, 6vw, 64px);
          font-weight: 900;
          line-height: 1.1;
          color: #fff;
          margin-bottom: 18px;
        }
        .bc-hero-title span { color: #C3B1E1; }
        .bc-hero-sub {
          font-size: 16px; font-weight: 600; color: #aaa;
          line-height: 1.7; margin-bottom: 36px;
        }
        .bc-hero-cta {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #C3B1E1, #afa7e7);
          color: #1a1530; font-size: 15px; font-weight: 900;
          padding: 14px 32px; border-radius: 50px;
          text-decoration: none;
          box-shadow: 0 12px 32px rgba(195,177,225,0.35);
          transition: all 0.25s;
        }
        .bc-hero-cta:hover {
          transform: translateY(-3px);
          box-shadow: 0 18px 40px rgba(195,177,225,0.45);
        }

        /* ── Section wrapper ─────────────────────────────────────────── */
        .bc-section {
          padding: 70px 40px;
          max-width: 1100px;
          margin: 0 auto;
        }
        .bc-section-label {
          font-size: 11px; font-weight: 900; letter-spacing: 2.5px;
          text-transform: uppercase; color: #C3B1E1; margin-bottom: 10px;
        }
        .bc-section-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(24px, 4vw, 38px);
          font-weight: 900; color: #fff; margin-bottom: 14px; line-height: 1.2;
        }
        .bc-section-sub {
          font-size: 14px; color: #888; font-weight: 600; line-height: 1.7;
          max-width: 520px; margin-bottom: 48px;
        }

        /* ── Group Cards ─────────────────────────────────────────────── */
        .bc-groups {
          display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
          margin-bottom: 0;
        }
        .bc-group-card {
          border-radius: 24px; padding: 32px 28px;
          border: 1.5px solid;
          text-decoration: none;
          display: block;
          transition: all 0.3s;
          position: relative; overflow: hidden;
        }
        .bc-group-card::before {
          content: '';
          position: absolute; inset: 0;
          opacity: 0; transition: opacity 0.3s;
        }
        .bc-group-card:hover { transform: translateY(-6px); }
        .bc-group-card:hover::before { opacity: 1; }

        .bc-group-yellow {
          background: linear-gradient(135deg, rgba(247,201,72,0.08), rgba(247,201,72,0.03));
          border-color: rgba(247,201,72,0.3);
        }
        .bc-group-yellow::before {
          background: linear-gradient(135deg, rgba(247,201,72,0.12), transparent);
        }
        .bc-group-yellow:hover { border-color: rgba(247,201,72,0.6); box-shadow: 0 20px 48px rgba(247,201,72,0.12); }

        .bc-group-blue {
          background: linear-gradient(135deg, rgba(91,184,245,0.08), rgba(91,184,245,0.03));
          border-color: rgba(91,184,245,0.3);
        }
        .bc-group-blue::before {
          background: linear-gradient(135deg, rgba(91,184,245,0.12), transparent);
        }
        .bc-group-blue:hover { border-color: rgba(91,184,245,0.6); box-shadow: 0 20px 48px rgba(91,184,245,0.12); }

        .bc-group-age {
          font-size: 11px; font-weight: 900; letter-spacing: 1.5px;
          text-transform: uppercase; margin-bottom: 10px;
        }
        .bc-group-yellow .bc-group-age { color: #f7c948; }
        .bc-group-blue   .bc-group-age { color: #5bb8f5; }

        .bc-group-name {
          font-family: 'Playfair Display', serif;
          font-size: 24px; font-weight: 900; color: #fff; margin-bottom: 8px;
        }
        .bc-group-emoji { font-size: 36px; margin-bottom: 14px; display: block; }
        .bc-group-desc { font-size: 13px; font-weight: 600; color: #999; line-height: 1.6; margin-bottom: 20px; }
        .bc-group-link {
          font-size: 13px; font-weight: 900;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .bc-group-yellow .bc-group-link { color: #f7c948; }
        .bc-group-blue   .bc-group-link { color: #5bb8f5; }

        /* Activities */
        .bc-group-activities {
          display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px;
        }
        .bc-activity-tag {
          font-size: 11px; font-weight: 800; padding: 4px 10px;
          border-radius: 20px;
        }
        .bc-group-yellow .bc-activity-tag { background: rgba(247,201,72,0.12); color: #f7c948; }
        .bc-group-blue   .bc-activity-tag { background: rgba(91,184,245,0.12); color: #5bb8f5; }

        /* ── How it works ────────────────────────────────────────────── */
        .bc-steps {
          display: grid; grid-template-columns: repeat(3,1fr); gap: 24px;
        }
        .bc-step {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; padding: 28px 24px;
          position: relative; text-align: center;
          transition: all 0.3s;
        }
        .bc-step:hover {
          background: rgba(195,177,225,0.06);
          border-color: rgba(195,177,225,0.2);
          transform: translateY(-4px);
        }
        .bc-step-num {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #C3B1E1, #afa7e7);
          border-radius: 50%; display: flex; align-items: center;
          justify-content: center; font-size: 16px; font-weight: 900;
          color: #1a1530; margin: 0 auto 16px;
        }
        .bc-step-icon { font-size: 28px; margin-bottom: 10px; display: block; }
        .bc-step-title { font-size: 16px; font-weight: 900; color: #fff; margin-bottom: 8px; }
        .bc-step-desc  { font-size: 13px; font-weight: 600; color: #888; line-height: 1.6; }

        /* ── Schedule ────────────────────────────────────────────────── */
        .bc-schedule-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .bc-schedule-card {
          background: rgba(255,255,255,0.03);
          border: 1.5px solid rgba(255,255,255,0.07);
          border-radius: 20px; padding: 28px;
          transition: all 0.3s;
        }
        .bc-schedule-card:hover {
          border-color: rgba(195,177,225,0.25);
          background: rgba(195,177,225,0.04);
        }
        .bc-schedule-day {
          font-size: 11px; font-weight: 900; letter-spacing: 2px;
          text-transform: uppercase; color: #C3B1E1; margin-bottom: 6px;
        }
        .bc-schedule-time {
          font-family: 'Playfair Display', serif;
          font-size: 28px; font-weight: 900; color: #fff; margin-bottom: 16px;
        }
        .bc-schedule-item {
          display: flex; align-items: center; gap: 10px;
          font-size: 13px; font-weight: 700; color: #bbb;
          margin-bottom: 10px;
        }
        .bc-schedule-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #C3B1E1; flex-shrink: 0;
        }

        /* ── Plans ───────────────────────────────────────────────────── */
        .bc-plans { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
        .bc-plan {
          background: rgba(255,255,255,0.03);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 24px; padding: 32px 24px;
          transition: all 0.3s; text-align: center;
          position: relative; overflow: hidden;
        }
        .bc-plan.featured {
          background: linear-gradient(135deg, rgba(195,177,225,0.12), rgba(175,167,231,0.06));
          border-color: rgba(195,177,225,0.4);
        }
        .bc-plan.featured::before {
          content: 'Most Popular';
          position: absolute; top: 12px; right: 12px;
          background: linear-gradient(135deg,#C3B1E1,#afa7e7);
          color: #1a1530; font-size: 9px; font-weight: 900;
          padding: 4px 10px; border-radius: 20px;
          letter-spacing: 1px; text-transform: uppercase;
          transform: none;
        }
        .bc-plan.featured { padding-top: 44px; }
        .bc-plan:hover {
          transform: translateY(-6px);
          border-color: rgba(195,177,225,0.35);
          box-shadow: 0 24px 48px rgba(0,0,0,0.3);
        }
        .bc-plan-icon { font-size: 32px; margin-bottom: 14px; display: block; }
        .bc-plan-name { font-size: 13px; font-weight: 900; color: #888; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; }
        .bc-plan-price {
          font-family: 'Playfair Display', serif;
          font-size: 36px; font-weight: 900; color: #fff; margin-bottom: 4px;
        }
        .bc-plan-period { font-size: 12px; color: #666; font-weight: 700; margin-bottom: 24px; }
        .bc-plan-feature {
          display: flex; align-items: center; gap: 10px;
          font-size: 13px; font-weight: 700; color: #bbb;
          margin-bottom: 10px; text-align: left;
        }
        .bc-plan-check { color: #C3B1E1; font-size: 14px; flex-shrink: 0; }
        .bc-plan-btn {
          width: 100%; padding: 12px;
          background: rgba(195,177,225,0.12);
          border: 1.5px solid rgba(195,177,225,0.25);
          color: #C3B1E1; border-radius: 12px;
          font-size: 14px; font-weight: 900;
          cursor: pointer; margin-top: 20px;
          font-family: 'Nunito', sans-serif;
          transition: all 0.2s;
        }
        .bc-plan.featured .bc-plan-btn {
          background: linear-gradient(135deg,#C3B1E1,#afa7e7);
          border-color: transparent; color: #1a1530;
        }
        .bc-plan-btn:hover { opacity: 0.85; transform: translateY(-1px); }

        /* ── Testimonials ────────────────────────────────────────────── */
        .bc-testimonials { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
        .bc-testimonial {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; padding: 28px 24px;
          transition: all 0.3s;
        }
        .bc-testimonial:hover {
          background: rgba(195,177,225,0.05);
          border-color: rgba(195,177,225,0.18);
          transform: translateY(-4px);
        }
        .bc-t-quote { font-size: 28px; margin-bottom: 14px; display: block; }
        .bc-t-text { font-size: 14px; font-weight: 700; color: #ccc; line-height: 1.7; margin-bottom: 20px; font-style: italic; }
        .bc-t-footer { display: flex; align-items: center; gap: 10px; }
        .bc-t-avatar {
          width: 38px; height: 38px; border-radius: 50%;
          background: linear-gradient(135deg,#C3B1E1,#8b7fd4);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }
        .bc-t-name { font-size: 13px; font-weight: 900; color: #fff; }
        .bc-t-group { font-size: 11px; font-weight: 700; color: #C3B1E1; }

        /* ── FAQ ─────────────────────────────────────────────────────── */
        .bc-faq-item {
          border-bottom: 1px solid rgba(255,255,255,0.07);
          overflow: hidden;
        }
        .bc-faq-q {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 0; cursor: pointer;
          font-size: 15px; font-weight: 800; color: #e8e4f8;
          transition: color 0.2s;
          background: none; border: none; width: 100%; text-align: left;
          font-family: 'Nunito', sans-serif;
        }
        .bc-faq-q:hover { color: #C3B1E1; }
        .bc-faq-chevron {
          font-size: 18px; transition: transform 0.25s; flex-shrink: 0;
          color: #C3B1E1;
        }
        .bc-faq-chevron.open { transform: rotate(180deg); }
        .bc-faq-a {
          font-size: 14px; font-weight: 600; color: #888;
          line-height: 1.7; max-height: 0; overflow: hidden;
          transition: max-height 0.35s ease, padding 0.25s ease;
        }
        .bc-faq-a.open { max-height: 200px; padding-bottom: 20px; }

        /* ── CTA Banner ──────────────────────────────────────────────── */
        .bc-cta {
          margin: 0 40px 70px;
          background: linear-gradient(135deg, #1e1a30, #2a2240);
          border: 1.5px solid rgba(195,177,225,0.2);
          border-radius: 28px; padding: 60px 40px;
          text-align: center; position: relative; overflow: hidden;
        }
        .bc-cta::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 80% at 50% 0%, rgba(195,177,225,0.12), transparent);
        }
        .bc-cta-content { position: relative; z-index: 1; }
        .bc-cta-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(26px, 4vw, 42px);
          font-weight: 900; color: #fff; margin-bottom: 12px;
        }
        .bc-cta-sub { font-size: 15px; color: #888; font-weight: 600; margin-bottom: 32px; }
        .bc-cta-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #C3B1E1, #afa7e7);
          color: #1a1530; font-size: 16px; font-weight: 900;
          padding: 16px 36px; border-radius: 50px;
          text-decoration: none;
          box-shadow: 0 14px 36px rgba(195,177,225,0.35);
          transition: all 0.25s;
        }
        .bc-cta-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 44px rgba(195,177,225,0.45);
        }

        /* ── Divider ─────────────────────────────────────────────────── */
        .bc-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(195,177,225,0.2), transparent);
          margin: 0 40px;
        }

        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Responsive ──────────────────────────────────────────────── */
        @media (max-width: 768px) {
          .bc-status-banner { margin: 20px 20px 0; }
          .bc-section { padding: 50px 20px; }
          .bc-groups { grid-template-columns: 1fr; }
          .bc-steps  { grid-template-columns: 1fr; }
          .bc-schedule-grid { grid-template-columns: 1fr; }
          .bc-plans  { grid-template-columns: 1fr; }
          .bc-testimonials { grid-template-columns: 1fr; }
          .bc-cta    { margin: 0 20px 50px; padding: 40px 24px; }
          .bc-divider { margin: 0 20px; }
        }
      `}</style>

      <div className="bc-page">

        {/* ── Status Banner ──────────────────────────────────────────── */}
        {banner && (
          <div
            className="bc-status-banner"
            style={{ background: banner.bg, borderColor: banner.border }}
          >
            <span className="bc-status-icon">{banner.icon}</span>
            <div>
              <div className="bc-status-title">{banner.title}</div>
              <div className="bc-status-text">{banner.text}</div>
            </div>
          </div>
        )}

        {/* ── Hero ───────────────────────────────────────────────────── */}
        <div className="bc-hero">
          <div className="bc-hero-bg" />
          <div className="bc-orb bc-orb-1" />
          <div className="bc-orb bc-orb-2" />
          <div className="bc-orb bc-orb-3" />
          <div className="bc-hero-content">
            <div className="bc-hero-badge">📚 The Cuddle Village</div>
            <h1 className="bc-hero-title">
              Where Little Minds<br />
              <span>Fall in Love</span> with Books
            </h1>
            <p className="bc-hero-sub">
              A nurturing weekly Book Club for children aged 4–8, blending stories,
              creativity, and play — guided by caring facilitators.
            </p>
            <Link
              to={user ? "#groups" : "/register"}
              className="bc-hero-cta"
              onClick={user ? (e) => { e.preventDefault(); document.getElementById("groups")?.scrollIntoView({ behavior: "smooth" }); } : undefined}
            >
              {user ? "Explore Groups ↓" : "Enrol Your Child →"}
            </Link>
          </div>
        </div>

        <div className="bc-divider" />

        {/* ── Groups ─────────────────────────────────────────────────── */}
        <div className="bc-section" id="groups">
          <div className="bc-section-label">Our Groups</div>
          <h2 className="bc-section-title">Find the Right Group</h2>
          <p className="bc-section-sub">
            Each group is thoughtfully designed for its age range — different books,
            activities, and learning goals.
          </p>
          <div className="bc-groups">
            <Link to="/early-learners" className="bc-group-card bc-group-yellow">
              <span className="bc-group-emoji">🧸</span>
              <div className="bc-group-age">Ages 4–5</div>
              <div className="bc-group-name">Early Learners Hub</div>
              <div className="bc-group-activities">
                {["Picture Books","Listening Activities","Short Stories","Creative Play"].map(t => (
                  <span key={t} className="bc-activity-tag">{t}</span>
                ))}
              </div>
              <p className="bc-group-desc">
                Gentle introductions to the world of books through interactive
                picture books, guided listening, and imaginative storytelling.
              </p>
              <span className="bc-group-link">Explore group →</span>
            </Link>

            <Link to="/growing-readers" className="bc-group-card bc-group-blue">
              <span className="bc-group-emoji">📚</span>
              <div className="bc-group-age">Ages 6–8</div>
              <div className="bc-group-name">Growing Readers Hub</div>
              <div className="bc-group-activities">
                {["Storytelling","Comprehension","Book Discussion","Writing Prompts"].map(t => (
                  <span key={t} className="bc-activity-tag">{t}</span>
                ))}
              </div>
              <p className="bc-group-desc">
                Building confidence through richer stories, group discussions,
                comprehension activities, and early creative writing.
              </p>
              <span className="bc-group-link">Explore group →</span>
            </Link>
          </div>
        </div>

        <div className="bc-divider" />

        {/* ── How It Works ───────────────────────────────────────────── */}
        <div className="bc-section">
          <div className="bc-section-label">Getting Started</div>
          <h2 className="bc-section-title">How It Works</h2>
          <p className="bc-section-sub">Three simple steps to get your child reading and thriving.</p>
          <div className="bc-steps">
            {[
              { icon: "✍️", title: "1. Enrol Online", desc: "Create your account, add your child's details and choose a membership plan — takes under 2 minutes." },
              { icon: "📅", title: "2. Pick a Schedule", desc: "Choose Saturday or Sunday sessions. We'll confirm your spot and send a welcome kit before the first session." },
              { icon: "🎉", title: "3. Attend & Grow", desc: "Show up, settle in, and let the stories begin. Watch your child's love of reading blossom week after week." },
            ].map((s, i) => (
              <div className="bc-step" key={i}>
                <span className="bc-step-icon">{s.icon}</span>
                <div className="bc-step-title">{s.title}</div>
                <div className="bc-step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bc-divider" />

        {/* ── Schedule ───────────────────────────────────────────────── */}
        <div className="bc-section">
          <div className="bc-section-label">Sessions</div>
          <h2 className="bc-section-title">Weekly Schedule</h2>
          <p className="bc-section-sub">All sessions run for 60 minutes and are held at our Nairobi venue.</p>
          <div className="bc-schedule-grid">
            {[
              {
                day: "Saturday",
                time: "10:00 – 11:00 AM",
                items: ["Welcome & warm-up activity", "Featured book reading", "Comprehension & discussion", "Creative craft or drawing"],
              },
              {
                day: "Sunday",
                time: "11:00 AM – 12:00 PM",
                items: ["Storytime circle", "Guided listening session", "Group activity or roleplay", "Book recommendation sharing"],
              },
            ].map((s) => (
              <div className="bc-schedule-card" key={s.day}>
                <div className="bc-schedule-day">{s.day}</div>
                <div className="bc-schedule-time">{s.time}</div>
                {s.items.map((item) => (
                  <div className="bc-schedule-item" key={item}>
                    <div className="bc-schedule-dot" />
                    {item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="bc-divider" />

        {/* ── Plans ──────────────────────────────────────────────────── */}
        <div className="bc-section">
          <div className="bc-section-label">Membership</div>
          <h2 className="bc-section-title">Choose a Plan</h2>
          <p className="bc-section-sub">Flexible options to suit every family.</p>
          <div className="bc-plans">
            {[
              {
                icon: "🎟️", name: "Per Session", price: "KSh 800", period: "per visit",
                features: ["Drop-in anytime", "No commitment", "All materials included", "Session recap sent home"],
                featured: false,
              },
              {
                icon: "📅", name: "Monthly", price: "KSh 3,000", period: "per month",
                features: ["4 sessions per month", "Priority booking", "Progress report monthly", "10% sibling discount"],
                featured: true,
              },
              {
                icon: "⭐", name: "Premium", price: "Custom", period: "tailored plan",
                features: ["Flexible scheduling", "1-on-1 reading support", "Custom reading list", "Dedicated facilitator"],
                featured: false,
              },
            ].map((plan) => (
              <div className={`bc-plan ${plan.featured ? "featured" : ""}`} key={plan.name}>
                <span className="bc-plan-icon">{plan.icon}</span>
                <div className="bc-plan-name">{plan.name}</div>
                <div className="bc-plan-price">{plan.price}</div>
                <div className="bc-plan-period">{plan.period}</div>
                {plan.features.map((f) => (
                  <div className="bc-plan-feature" key={f}>
                    <span className="bc-plan-check">✓</span> {f}
                  </div>
                ))}
                <button
                  className="bc-plan-btn"
                  onClick={() => navigate(user ? "/book-club/register" : "/register")}
                >
                  {user ? "Enrol Now" : "Get Started"}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bc-divider" />

        {/* ── Testimonials ───────────────────────────────────────────── */}
        <div className="bc-section">
          <div className="bc-section-label">Families Love Us</div>
          <h2 className="bc-section-title">What Parents Say</h2>
          <p className="bc-section-sub">Real stories from families whose children have blossomed.</p>
          <div className="bc-testimonials">
            {testimonials.map((t, i) => (
              <div className="bc-testimonial" key={i}>
                <span className="bc-t-quote">{t.emoji}</span>
                <p className="bc-t-text">"{t.text}"</p>
                <div className="bc-t-footer">
                  <div className="bc-t-avatar">{t.emoji}</div>
                  <div>
                    <div className="bc-t-name">{t.name}</div>
                    <div className="bc-t-group">{t.group}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bc-divider" />

        {/* ── FAQ ────────────────────────────────────────────────────── */}
        <div className="bc-section">
          <div className="bc-section-label">FAQ</div>
          <h2 className="bc-section-title">Common Questions</h2>
          <p className="bc-section-sub">Everything you need to know before enrolling.</p>
          <div>
            {faqs.map((f, i) => (
              <div className="bc-faq-item" key={i}>
                <button className="bc-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {f.q}
                  <span className={`bc-faq-chevron ${openFaq === i ? "open" : ""}`}>⌄</span>
                </button>
                <div className={`bc-faq-a ${openFaq === i ? "open" : ""}`}>
                  {f.a}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ────────────────────────────────────────────────────── */}
        <div className="bc-cta">
          <div className="bc-cta-content">
            <h2 className="bc-cta-title">Ready to Begin the Story?</h2>
            <p className="bc-cta-sub">
              Join hundreds of Nairobi families giving their children the gift of reading.
            </p>
            <Link to={user ? "/book-club/register" : "/register"} className="bc-cta-btn">
              Enrol Your Child Today →
            </Link>
          </div>
        </div>

      </div>
    </>
  );
}