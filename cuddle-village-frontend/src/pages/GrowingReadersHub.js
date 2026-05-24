import { useState, useEffect } from "react";
import readersImg from "../assets/readers.png";
import API from "../services/api";
import { isAuthenticated } from "../utils/auth";

const DEFAULT_BOOKS = [
  { title: "Charlotte's Web", author: "E.B. White", emoji: "🕸️", tag: "Friendship" },
  { title: "The BFG", author: "Roald Dahl", emoji: "👁️", tag: "Adventure" },
  { title: "Matilda", author: "Roald Dahl", emoji: "✨", tag: "Empowerment" },
  { title: "The Lion, the Witch and the Wardrobe", author: "C.S. Lewis", emoji: "🦁", tag: "Fantasy" },
];

const DEFAULT_ACTIVITIES = [
  { icon: "📖", title: "Shared Reading", desc: "Chapter-by-chapter reading sessions that build stamina and focus." },
  { icon: "💬", title: "Book Discussion", desc: "Guided conversations about characters, themes and what students notice." },
  { icon: "✍️", title: "Writing Prompts", desc: "Short creative writing exercises inspired by the week's story." },
  { icon: "🎭", title: "Storytelling", desc: "Children craft and present their own original stories to the group." },
  { icon: "🧩", title: "Comprehension Games", desc: "Fun activities to reinforce understanding and recall of key events." },
  { icon: "🗣️", title: "Vocabulary Builder", desc: "Learning rich new words from books and putting them into practice." },
];

const DEFAULT_SKILLS = [
  { icon: "👁️", label: "Reading Fluency", desc: "Smooth, expressive reading with growing speed and accuracy." },
  { icon: "🧠", label: "Comprehension", desc: "Understanding plot, character motivation, and story structure." },
  { icon: "💡", label: "Critical Thinking", desc: "Questioning, predicting, and forming opinions about what they read." },
  { icon: "✏️", label: "Creative Writing", desc: "Beginning to construct their own stories with structure and detail." },
];

const DEFAULT_MILESTONES = [
  { label: "Week 1–2", title: "Getting into the Story", desc: "Introductions, setting group norms, and diving into our first book together." },
  { label: "Week 3–4", title: "Reading with Purpose", desc: "Practising fluency, exploring vocabulary, and making predictions." },
  { label: "Week 5–6", title: "Thinking Deeper", desc: "Discussing character motivations, story themes, and personal connections." },
  { label: "Week 7–8", title: "Creating & Sharing", desc: "Writing responses, crafting original stories, and celebrating reading growth." },
];

export default function GrowingReadersHub() {
  const [featuredBooks, setBooks]      = useState(DEFAULT_BOOKS);
  const [activities,    setActivities] = useState(DEFAULT_ACTIVITIES);
  const [skills]                        = useState(DEFAULT_SKILLS);
  const [milestones,    setMilestones] = useState(DEFAULT_MILESTONES);
  const [childData,     setChildData]  = useState(null);
  const [upcoming,      setUpcoming]   = useState(null);

  const storedUser = (() => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } })();
  const isEnrolled = isAuthenticated() && storedUser?.bookClub?.group === "growing-readers";

  useEffect(() => {
    API.get("/portal/hub-content/growing-readers").then(res => {
      const data = res.data;
      if (!data.length) return;
      const b = data.filter(i => i.contentType === "book");
      const a = data.filter(i => i.contentType === "activity");
      const m = data.filter(i => i.contentType === "milestone");
      if (b.length) setBooks(b.map(i => ({ title: i.title, author: i.author, emoji: i.emoji || "📚", tag: i.tag })));
      if (a.length) setActivities(a.map(i => ({ icon: i.emoji || "📖", title: i.title, desc: i.description })));
      if (m.length) setMilestones(m.map(i => ({ label: i.weekLabel, title: i.title, desc: i.description })));
    }).catch(() => {});

    if (isEnrolled) {
      Promise.all([
        API.get("/portal/my-child"),
        API.get("/portal/upcoming-session"),
      ]).then(([cRes, uRes]) => {
        setChildData(cRes.data);
        setUpcoming(uRes.data);
      }).catch(() => {});
    }
  }, [isEnrolled]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .gr-page {
          font-family: 'Nunito', sans-serif;
          background: #f0f6ff;
          color: #0e1f2a;
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* ── Hero ─────────────────────────────────────────────────── */
        .gr-hero {
          position: relative;
          height: 520px;
          overflow: hidden;
        }
        .gr-hero-img {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
          filter: saturate(1.1);
        }
        .gr-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            to top,
            rgba(8,20,38,0.92) 0%,
            rgba(8,20,38,0.5) 45%,
            rgba(8,20,38,0.1) 100%
          );
        }
        /* Teal accent wash */
        .gr-hero-overlay::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(to right, rgba(91,184,245,0.08), transparent);
        }
        .gr-hero-content {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 0 56px 44px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
        }
        .gr-hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(91,184,245,0.18);
          border: 1px solid rgba(91,184,245,0.45);
          color: #5bb8f5;
          font-size: 11px; font-weight: 900;
          letter-spacing: 2.5px; text-transform: uppercase;
          padding: 5px 14px; border-radius: 20px;
          margin-bottom: 14px;
        }
        .gr-hero-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(36px, 5vw, 58px);
          font-weight: 900;
          color: #fff;
          line-height: 1.1;
          margin-bottom: 12px;
        }
        .gr-hero-title span { color: #5bb8f5; }
        .gr-hero-sub {
          font-size: 15px; color: rgba(255,255,255,0.68);
          font-weight: 600; line-height: 1.6; max-width: 420px;
        }
        .gr-hero-badge {
          flex-shrink: 0;
          background: rgba(91,184,245,0.12);
          border: 1.5px solid rgba(91,184,245,0.35);
          border-radius: 20px; padding: 20px 28px;
          text-align: center;
        }
        .gr-hero-badge-num {
          font-family: 'Fraunces', serif;
          font-size: 42px; font-weight: 900; color: #5bb8f5; line-height: 1;
        }
        .gr-hero-badge-label {
          font-size: 11px; font-weight: 800; color: rgba(255,255,255,0.55);
          text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px;
        }

        /* ── Breadcrumb strip ──────────────────────────────────────── */
        .gr-breadcrumb {
          background: #1a4a6e;
          padding: 12px 56px;
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 800; color: #fff;
          letter-spacing: 0.3px;
        }
        .gr-breadcrumb a { color: #fff; text-decoration: none; opacity: 0.55; }
        .gr-breadcrumb a:hover { opacity: 1; }
        .gr-breadcrumb-sep { opacity: 0.35; }

        /* ── Info bar ──────────────────────────────────────────────── */
        .gr-info-bar {
          display: grid; grid-template-columns: repeat(3, 1fr);
          background: #fff;
          border-top: 1.5px solid #d4e8f8;
          border-bottom: 1.5px solid #d4e8f8;
        }
        .gr-info-item {
          padding: 24px 32px;
          border-right: 1.5px solid #d4e8f8;
          display: flex; align-items: center; gap: 14px;
        }
        .gr-info-item:last-child { border-right: none; }
        .gr-info-icon { font-size: 24px; flex-shrink: 0; }
        .gr-info-label { font-size: 11px; font-weight: 800; color: #8aafc8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px; }
        .gr-info-value { font-size: 14px; font-weight: 900; color: #0e1f2a; }

        /* ── Section ───────────────────────────────────────────────── */
        .gr-section {
          padding: 64px 56px;
          max-width: 1140px;
          margin: 0 auto;
        }
        .gr-section-eyebrow {
          font-size: 11px; font-weight: 900; letter-spacing: 2.5px;
          text-transform: uppercase; color: #1a6fa8;
          margin-bottom: 8px;
        }
        .gr-section-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(26px, 3.5vw, 40px);
          font-weight: 900; color: #0e1f2a;
          line-height: 1.2; margin-bottom: 12px;
        }
        .gr-section-sub {
          font-size: 14px; color: #5a7a92;
          font-weight: 600; line-height: 1.7;
          max-width: 500px; margin-bottom: 44px;
        }

        /* ── Activities ────────────────────────────────────────────── */
        .gr-activities {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px;
        }
        .gr-activity {
          background: #fff;
          border: 1.5px solid #d4e8f8;
          border-radius: 20px; padding: 26px 22px;
          transition: all 0.25s; position: relative; overflow: hidden;
        }
        .gr-activity::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #5bb8f5, #1a6fa8);
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.3s;
        }
        .gr-activity:hover { transform: translateY(-4px); border-color: #5bb8f5; box-shadow: 0 12px 32px rgba(91,184,245,0.15); }
        .gr-activity:hover::before { transform: scaleX(1); }
        .gr-activity-icon { font-size: 30px; margin-bottom: 12px; display: block; }
        .gr-activity-title { font-size: 15px; font-weight: 900; color: #0e1f2a; margin-bottom: 6px; }
        .gr-activity-desc  { font-size: 13px; font-weight: 600; color: #7a9ab0; line-height: 1.6; }

        /* ── Divider ───────────────────────────────────────────────── */
        .gr-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, #d4e8f8, transparent);
          margin: 0 56px;
        }

        /* ── Books ─────────────────────────────────────────────────── */
        .gr-books { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .gr-book {
          background: #fff;
          border: 1.5px solid #d4e8f8;
          border-radius: 18px; padding: 22px 18px;
          text-align: center; transition: all 0.25s;
        }
        .gr-book:hover { transform: translateY(-5px) rotate(1deg); border-color: #5bb8f5; box-shadow: 0 14px 28px rgba(91,184,245,0.15); }
        .gr-book-emoji { font-size: 40px; margin-bottom: 12px; display: block; }
        .gr-book-tag {
          display: inline-block;
          background: #e8f4fd; color: #1a6fa8;
          font-size: 10px; font-weight: 900;
          letter-spacing: 1px; text-transform: uppercase;
          padding: 3px 10px; border-radius: 20px;
          border: 1px solid #b8ddf5;
          margin-bottom: 10px;
        }
        .gr-book-title  { font-size: 13px; font-weight: 900; color: #0e1f2a; margin-bottom: 4px; line-height: 1.3; }
        .gr-book-author { font-size: 11px; font-weight: 700; color: #8aafc8; }

        /* ── Skills ────────────────────────────────────────────────── */
        .gr-skills { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }
        .gr-skill {
          background: #fff;
          border: 1.5px solid #d4e8f8;
          border-radius: 18px; padding: 24px 22px;
          display: flex; gap: 16px; align-items: flex-start;
          transition: all 0.25s;
        }
        .gr-skill:hover { border-color: #5bb8f5; box-shadow: 0 8px 24px rgba(91,184,245,0.12); transform: translateY(-3px); }
        .gr-skill-icon {
          width: 46px; height: 46px; border-radius: 14px;
          background: linear-gradient(135deg, #e8f4fd, #cce8f8);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; flex-shrink: 0;
        }
        .gr-skill-label { font-size: 15px; font-weight: 900; color: #0e1f2a; margin-bottom: 4px; }
        .gr-skill-desc  { font-size: 13px; font-weight: 600; color: #7a9ab0; line-height: 1.5; }

        /* ── Timeline ──────────────────────────────────────────────── */
        .gr-timeline { position: relative; }
        .gr-timeline::before {
          content: '';
          position: absolute; left: 19px; top: 0; bottom: 0;
          width: 2px; background: linear-gradient(to bottom, #5bb8f5, #d4e8f8);
        }
        .gr-milestone { display: flex; gap: 24px; margin-bottom: 36px; position: relative; }
        .gr-milestone:last-child { margin-bottom: 0; }
        .gr-milestone-dot {
          width: 40px; height: 40px; border-radius: 50%;
          background: #5bb8f5;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; font-weight: 900; color: #fff;
          flex-shrink: 0; position: relative; z-index: 1;
          box-shadow: 0 0 0 4px #f0f6ff, 0 0 0 6px #5bb8f5;
        }
        .gr-milestone-body {
          background: #fff;
          border: 1.5px solid #d4e8f8;
          border-radius: 16px; padding: 18px 22px;
          flex: 1; transition: all 0.2s;
        }
        .gr-milestone-body:hover { border-color: #5bb8f5; box-shadow: 0 8px 20px rgba(91,184,245,0.1); }
        .gr-milestone-label { font-size: 10px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; color: #1a6fa8; margin-bottom: 4px; }
        .gr-milestone-title { font-size: 16px; font-weight: 900; color: #0e1f2a; margin-bottom: 4px; }
        .gr-milestone-desc  { font-size: 13px; font-weight: 600; color: #7a9ab0; line-height: 1.6; }

        /* ── CTA ───────────────────────────────────────────────────── */
        .gr-cta {
          margin: 0 56px 64px;
          background: linear-gradient(135deg, #081428, #0e2240);
          border-radius: 28px; padding: 56px 48px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 32px; position: relative; overflow: hidden;
        }
        .gr-cta::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 50% 80% at 0% 50%, rgba(91,184,245,0.15), transparent);
        }
        .gr-cta-left { position: relative; z-index: 1; }
        .gr-cta-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(22px, 3vw, 34px);
          font-weight: 900; color: #fff; margin-bottom: 8px;
        }
        .gr-cta-sub { font-size: 14px; color: rgba(255,255,255,0.55); font-weight: 600; }
        .gr-cta-btn {
          position: relative; z-index: 1;
          display: inline-flex; align-items: center; gap: 10px;
          background: #5bb8f5; color: #081428;
          font-size: 15px; font-weight: 900;
          padding: 16px 32px; border-radius: 50px;
          text-decoration: none; white-space: nowrap;
          box-shadow: 0 12px 32px rgba(91,184,245,0.35);
          transition: all 0.25s; flex-shrink: 0;
        }
        .gr-cta-btn:hover { transform: translateY(-3px); box-shadow: 0 18px 40px rgba(91,184,245,0.45); }

        /* ── Responsive ────────────────────────────────────────────── */
        @media (max-width: 900px) {
          .gr-hero-content { padding: 0 28px 32px; flex-direction: column; align-items: flex-start; }
          .gr-section { padding: 48px 28px; }
          .gr-breadcrumb { padding: 12px 28px; }
          .gr-activities { grid-template-columns: 1fr 1fr; }
          .gr-books { grid-template-columns: 1fr 1fr; }
          .gr-skills { grid-template-columns: 1fr; }
          .gr-info-bar { grid-template-columns: 1fr; }
          .gr-info-item { border-right: none; border-bottom: 1.5px solid #d4e8f8; }
          .gr-info-item:last-child { border-bottom: none; }
          .gr-cta { flex-direction: column; margin: 0 28px 48px; padding: 36px 28px; }
          .gr-divider { margin: 0 28px; }
        }
        @media (max-width: 580px) {
          .gr-hero { height: 420px; }
          .gr-activities { grid-template-columns: 1fr; }
        }

        /* ── Child Progress Section ─────────────────────────────────── */
        .gr-progress { background: #fff; border-radius: 24px; padding: 36px; margin: 0 60px 60px; box-shadow: 0 4px 24px rgba(91,184,245,0.1); border: 2px solid #dbeeff; }
        .gr-progress-title { font-size: 22px; font-weight: 900; color: #0e1f2a; margin: 0 0 6px; }
        .gr-progress-sub   { font-size: 14px; color: #aaa; font-weight: 600; margin: 0 0 24px; }
        .gr-progress-grid  { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
        .gr-progress-card  { background: #f0f6ff; border-radius: 16px; padding: 20px; border: 1.5px solid #dbeeff; }
        .gr-progress-card-title { font-size: 11px; font-weight: 800; color: #1a6fa8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }
        .gr-progress-num   { font-size: 32px; font-weight: 900; color: #0e1f2a; }
        .gr-skill-pill     { display: inline-block; background: #dbeeff; color: #1a6fa8; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 800; margin: 3px 4px 3px 0; }
        .gr-progress-link  { display: inline-block; margin-top: 20px; padding: 11px 24px; background: linear-gradient(135deg, #5bb8f5, #1a6fa8); color: #fff; border-radius: 12px; font-weight: 800; font-size: 14px; text-decoration: none; transition: opacity 0.2s; }
        .gr-progress-link:hover { opacity: 0.88; }
        @media (max-width: 900px) {
          .gr-progress { margin: 0 20px 40px; padding: 24px; }
          .gr-progress-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="gr-page">

        {/* ── Hero ───────────────────────────────────────────────────── */}
        <div className="gr-hero">
          <img src={readersImg} alt="Growing Readers" className="gr-hero-img" />
          <div className="gr-hero-overlay" />
          <div className="gr-hero-content">
            <div>
              <div className="gr-hero-eyebrow">📚 Book Club · Ages 6–8</div>
              <h1 className="gr-hero-title">
                Growing Readers<br /><span>Hub</span>
              </h1>
              <p className="gr-hero-sub">
                Storytelling, comprehension &amp; discussion — building the
                skills and confidence that turn children into lifelong readers.
              </p>
            </div>
            <div className="gr-hero-badge">
              <div className="gr-hero-badge-num">6–8</div>
              <div className="gr-hero-badge-label">Years Old</div>
            </div>
          </div>
        </div>

        {/* ── Breadcrumb ─────────────────────────────────────────────── */}
        <div className="gr-breadcrumb">
          <a href="/">Home</a>
          <span className="gr-breadcrumb-sep">›</span>
          <a href="/book-club">Book Club</a>
          <span className="gr-breadcrumb-sep">›</span>
          <span>Growing Readers Hub</span>
        </div>

        {/* ── Info bar ───────────────────────────────────────────────── */}
        <div className="gr-info-bar">
          <div className="gr-info-item">
            <span className="gr-info-icon">📅</span>
            <div>
              <div className="gr-info-label">Sessions</div>
              <div className="gr-info-value">Saturdays &amp; Sundays</div>
            </div>
          </div>
          <div className="gr-info-item">
            <span className="gr-info-icon">⏱️</span>
            <div>
              <div className="gr-info-label">Duration</div>
              <div className="gr-info-value">60 minutes per session</div>
            </div>
          </div>
          <div className="gr-info-item">
            <span className="gr-info-icon">📗</span>
            <div>
              <div className="gr-info-label">Age Group</div>
              <div className="gr-info-value">6 to 8 years old</div>
            </div>
          </div>
        </div>

        {/* ── Activities ─────────────────────────────────────────────── */}
        <div className="gr-section">
          <div className="gr-section-eyebrow">What We Do</div>
          <h2 className="gr-section-title">Session Activities</h2>
          <p className="gr-section-sub">
            Rich, varied activities that grow reading skills while keeping
            children genuinely engaged and excited about books.
          </p>
          <div className="gr-activities">
            {activities.map((a) => (
              <div className="gr-activity" key={a.title}>
                <span className="gr-activity-icon">{a.icon}</span>
                <div className="gr-activity-title">{a.title}</div>
                <div className="gr-activity-desc">{a.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="gr-divider" />

        {/* ── Books ──────────────────────────────────────────────────── */}
        <div className="gr-section">
          <div className="gr-section-eyebrow">Reading List</div>
          <h2 className="gr-section-title">Featured Books</h2>
          <p className="gr-section-sub">
            Carefully chosen titles that challenge growing readers while
            sparking discussion and a love of storytelling.
          </p>
          <div className="gr-books">
            {featuredBooks.map((b) => (
              <div className="gr-book" key={b.title}>
                <span className="gr-book-emoji">{b.emoji}</span>
                <div className="gr-book-tag">{b.tag}</div>
                <div className="gr-book-title">{b.title}</div>
                <div className="gr-book-author">by {b.author}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="gr-divider" />

        {/* ── Skills ─────────────────────────────────────────────────── */}
        <div className="gr-section">
          <div className="gr-section-eyebrow">What They'll Build</div>
          <h2 className="gr-section-title">Key Skills Developed</h2>
          <p className="gr-section-sub">
            Each session is intentionally designed to strengthen the core
            literacy skills that set children up for success.
          </p>
          <div className="gr-skills">
            {skills.map((s) => (
              <div className="gr-skill" key={s.label}>
                <div className="gr-skill-icon">{s.icon}</div>
                <div>
                  <div className="gr-skill-label">{s.label}</div>
                  <div className="gr-skill-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="gr-divider" />

        {/* ── Timeline ───────────────────────────────────────────────── */}
        <div className="gr-section">
          <div className="gr-section-eyebrow">Learning Journey</div>
          <h2 className="gr-section-title">Term Progression</h2>
          <p className="gr-section-sub">
            A structured, cumulative journey from settling in to confidently
            creating and sharing their own stories.
          </p>
          <div className="gr-timeline">
            {milestones.map((m, i) => (
              <div className="gr-milestone" key={i}>
                <div className="gr-milestone-dot">{i + 1}</div>
                <div className="gr-milestone-body">
                  <div className="gr-milestone-label">{m.label}</div>
                  <div className="gr-milestone-title">{m.title}</div>
                  <div className="gr-milestone-desc">{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Child Progress (enrolled parents only) ─────────────────── */}
        {isEnrolled && childData && (
          <div className="gr-progress">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <span style={{ fontSize: 28 }}>📖</span>
              <div>
                <div className="gr-progress-title">
                  {childData.childName ? `${childData.childName}'s Progress` : "My Child's Progress"}
                </div>
                <div className="gr-progress-sub">Growing Readers · {childData.schedule || "Book Club"}</div>
              </div>
            </div>

            <div className="gr-progress-grid">
              <div className="gr-progress-card">
                <div className="gr-progress-card-title">📅 Sessions Attended</div>
                <div className="gr-progress-num">{childData.sessionsAttended?.length || 0}</div>
              </div>
              <div className="gr-progress-card">
                <div className="gr-progress-card-title">📚 Books Read</div>
                <div className="gr-progress-num">{childData.booksRead?.length || 0}</div>
                {childData.booksRead?.slice(0, 2).map(b => (
                  <div key={b.title} style={{ fontSize: 12, color: "#555", fontWeight: 600, marginTop: 4 }}>{b.title}</div>
                ))}
              </div>
              <div className="gr-progress-card">
                <div className="gr-progress-card-title">🌟 Skills Achieved</div>
                <div className="gr-progress-num">{childData.skills?.length || 0}</div>
                {childData.skills?.slice(0, 3).map(s => (
                  <span key={s.name} className="gr-skill-pill">{s.name}</span>
                ))}
              </div>
            </div>

            {upcoming && (
              <div style={{ marginTop: 20, background: "#dbeeff", borderRadius: 14, padding: "16px 20px" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#1a6fa8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>📅 Next Session</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: "#0e1f2a" }}>{new Date(upcoming.date).toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long" })}</div>
                {upcoming.bookTitle && <div style={{ fontSize: 13, color: "#555", fontWeight: 600, marginTop: 4 }}>📖 {upcoming.bookTitle}{upcoming.bookAuthor ? ` by ${upcoming.bookAuthor}` : ""}</div>}
                {upcoming.title && <div style={{ fontSize: 13, color: "#555", fontWeight: 600, marginTop: 2 }}>🗒 {upcoming.title}</div>}
              </div>
            )}

            {childData.notes && (
              <div style={{ marginTop: 16, background: "#fffbeb", borderRadius: 14, padding: "14px 18px", border: "1.5px solid #f7c94855" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#b8860b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>💬 Facilitator Note</div>
                <div style={{ fontSize: 14, color: "#555", fontWeight: 600 }}>{childData.notes}</div>
              </div>
            )}

            <a href="/portal/my-child" className="gr-progress-link">View Full Progress →</a>
          </div>
        )}

        {/* ── CTA ────────────────────────────────────────────────────── */}
        <div className="gr-cta">
          <div className="gr-cta-left">
            <h2 className="gr-cta-title">Ready to grow your young reader?</h2>
            <p className="gr-cta-sub">Join the Growing Readers Hub and nurture a lifelong love of books.</p>
          </div>
          <a href="/register" className="gr-cta-btn">Enrol Now →</a>
        </div>

      </div>
    </>
  );
}