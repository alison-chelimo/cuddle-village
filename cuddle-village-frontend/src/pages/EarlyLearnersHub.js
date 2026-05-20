import { Link } from "react-router-dom";
import readersImg from "../assets/readers.png";

const weeklyBooks = [
  { title: "The Very Hungry Caterpillar", author: "Eric Carle", emoji: "🐛", tag: "Nature & Growth" },
  { title: "Where the Wild Things Are", author: "Maurice Sendak", emoji: "🌿", tag: "Imagination" },
  { title: "Goodnight Moon", author: "Margaret Wise Brown", emoji: "🌙", tag: "Bedtime" },
  { title: "The Snowy Day", author: "Ezra Jack Keats", emoji: "❄️", tag: "Seasons" },
];

const activities = [
  { icon: "📖", title: "Picture Book Time", desc: "Guided reading with vibrant illustrations to spark curiosity and vocabulary." },
  { icon: "🎨", title: "Creative Craft", desc: "Hands-on art projects inspired by the week's featured book." },
  { icon: "👂", title: "Listening Circles", desc: "Short audio stories that build focus and comprehension skills." },
  { icon: "🎭", title: "Story Play", desc: "Children act out scenes, building confidence through imaginative play." },
  { icon: "🖍️", title: "Drawing & Colouring", desc: "Illustrate favourite story moments and share with the group." },
  { icon: "🎵", title: "Rhyme & Song", desc: "Fun nursery rhymes and songs that make language learning joyful." },
];

const milestones = [
  { label: "Week 1–2", title: "Getting Comfortable", desc: "Settling in, learning names, and discovering our favourite story spots." },
  { label: "Week 3–4", title: "Listening & Looking", desc: "Building attention through picture exploration and read-alouds." },
  { label: "Week 5–6", title: "Talking About Stories", desc: "Sharing thoughts on characters and what happens next." },
  { label: "Week 7–8", title: "Making Connections", desc: "Relating stories to real life and beginning to predict endings." },
];

export default function EarlyLearnersHub() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .el-page {
          font-family: 'Nunito', sans-serif;
          background: #fdf8f0;
          color: #2a1f0e;
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* ── Hero ─────────────────────────────────────────────────── */
        .el-hero {
          position: relative;
          height: 520px;
          overflow: hidden;
        }
        .el-hero-img {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
        }
        .el-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            to top,
            rgba(20,12,4,0.88) 0%,
            rgba(20,12,4,0.45) 45%,
            rgba(20,12,4,0.1) 100%
          );
        }
        .el-hero-content {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 0 56px 44px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
        }
        .el-hero-left {}
        .el-hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(245,200,66,0.18);
          border: 1px solid rgba(245,200,66,0.45);
          color: #f5c842;
          font-size: 11px; font-weight: 900;
          letter-spacing: 2.5px; text-transform: uppercase;
          padding: 5px 14px; border-radius: 20px;
          margin-bottom: 14px;
        }
        .el-hero-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(36px, 5vw, 58px);
          font-weight: 900;
          color: #fff;
          line-height: 1.1;
          margin-bottom: 12px;
        }
        .el-hero-title span { color: #f5c842; }
        .el-hero-sub {
          font-size: 15px; color: rgba(255,255,255,0.7);
          font-weight: 600; line-height: 1.6; max-width: 420px;
        }
        .el-hero-badge {
          flex-shrink: 0;
          background: rgba(245,200,66,0.12);
          border: 1.5px solid rgba(245,200,66,0.35);
          border-radius: 20px; padding: 20px 28px;
          text-align: center;
        }
        .el-hero-badge-num {
          font-family: 'Fraunces', serif;
          font-size: 42px; font-weight: 900; color: #f5c842; line-height: 1;
        }
        .el-hero-badge-label {
          font-size: 11px; font-weight: 800; color: rgba(255,255,255,0.6);
          text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px;
        }

        /* ── Breadcrumb strip ──────────────────────────────────────── */
        .el-breadcrumb {
          background: #f5c842;
          padding: 12px 56px;
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 800;
          color: #2a1f0e; letter-spacing: 0.3px;
        }
        .el-breadcrumb a { color: #2a1f0e; text-decoration: none; opacity: 0.6; }
        .el-breadcrumb a:hover { opacity: 1; }
        .el-breadcrumb-sep { opacity: 0.4; }

        /* ── Section ───────────────────────────────────────────────── */
        .el-section {
          padding: 64px 56px;
          max-width: 1140px;
          margin: 0 auto;
        }
        .el-section-eyebrow {
          font-size: 11px; font-weight: 900; letter-spacing: 2.5px;
          text-transform: uppercase; color: #c8960a;
          margin-bottom: 8px;
        }
        .el-section-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(26px, 3.5vw, 40px);
          font-weight: 900; color: #2a1f0e;
          line-height: 1.2; margin-bottom: 12px;
        }
        .el-section-sub {
          font-size: 14px; color: #7a6a52;
          font-weight: 600; line-height: 1.7;
          max-width: 500px; margin-bottom: 44px;
        }

        /* ── Activities grid ───────────────────────────────────────── */
        .el-activities {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }
        .el-activity {
          background: #fff;
          border: 1.5px solid #ede5d8;
          border-radius: 20px; padding: 26px 22px;
          transition: all 0.25s;
          position: relative; overflow: hidden;
        }
        .el-activity::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #f5c842, #f7a832);
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.3s;
        }
        .el-activity:hover { transform: translateY(-4px); border-color: #f5c842; box-shadow: 0 12px 32px rgba(245,200,66,0.15); }
        .el-activity:hover::before { transform: scaleX(1); }
        .el-activity-icon { font-size: 30px; margin-bottom: 12px; display: block; }
        .el-activity-title { font-size: 15px; font-weight: 900; color: #2a1f0e; margin-bottom: 6px; }
        .el-activity-desc  { font-size: 13px; font-weight: 600; color: #9a8a72; line-height: 1.6; }

        /* ── Warm divider ──────────────────────────────────────────── */
        .el-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, #ede5d8, transparent);
          margin: 0 56px;
        }

        /* ── Books shelf ───────────────────────────────────────────── */
        .el-books {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
        }
        .el-book {
          background: #fff;
          border: 1.5px solid #ede5d8;
          border-radius: 18px; padding: 22px 18px;
          text-align: center; transition: all 0.25s;
        }
        .el-book:hover { transform: translateY(-5px) rotate(-1deg); border-color: #f5c842; box-shadow: 0 14px 28px rgba(245,200,66,0.15); }
        .el-book-emoji { font-size: 40px; margin-bottom: 12px; display: block; }
        .el-book-tag {
          display: inline-block;
          background: #fef9e6; color: #c8960a;
          font-size: 10px; font-weight: 900;
          letter-spacing: 1px; text-transform: uppercase;
          padding: 3px 10px; border-radius: 20px;
          border: 1px solid #f5e098;
          margin-bottom: 10px;
        }
        .el-book-title { font-size: 13px; font-weight: 900; color: #2a1f0e; margin-bottom: 4px; line-height: 1.3; }
        .el-book-author { font-size: 11px; font-weight: 700; color: #b0a090; }

        /* ── Journey timeline ──────────────────────────────────────── */
        .el-timeline { position: relative; }
        .el-timeline::before {
          content: '';
          position: absolute; left: 19px; top: 0; bottom: 0;
          width: 2px; background: linear-gradient(to bottom, #f5c842, #ede5d8);
        }
        .el-milestone {
          display: flex; gap: 24px;
          margin-bottom: 36px; position: relative;
        }
        .el-milestone:last-child { margin-bottom: 0; }
        .el-milestone-dot {
          width: 40px; height: 40px; border-radius: 50%;
          background: #f5c842;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; font-weight: 900; color: #2a1f0e;
          flex-shrink: 0; position: relative; z-index: 1;
          box-shadow: 0 0 0 4px #fdf8f0, 0 0 0 6px #f5c842;
        }
        .el-milestone-body {
          background: #fff;
          border: 1.5px solid #ede5d8;
          border-radius: 16px; padding: 18px 22px;
          flex: 1; transition: all 0.2s;
        }
        .el-milestone-body:hover { border-color: #f5c842; box-shadow: 0 8px 20px rgba(245,200,66,0.1); }
        .el-milestone-label {
          font-size: 10px; font-weight: 900; letter-spacing: 2px;
          text-transform: uppercase; color: #c8960a; margin-bottom: 4px;
        }
        .el-milestone-title { font-size: 16px; font-weight: 900; color: #2a1f0e; margin-bottom: 4px; }
        .el-milestone-desc  { font-size: 13px; font-weight: 600; color: #9a8a72; line-height: 1.6; }

        /* ── CTA strip ─────────────────────────────────────────────── */
        .el-cta {
          margin: 0 56px 64px;
          background: linear-gradient(135deg, #2a1f0e, #3d2e18);
          border-radius: 28px; padding: 56px 48px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 32px; position: relative; overflow: hidden;
        }
        .el-cta::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 50% 80% at 0% 50%, rgba(245,200,66,0.15), transparent);
        }
        .el-cta-left { position: relative; z-index: 1; }
        .el-cta-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(22px, 3vw, 34px);
          font-weight: 900; color: #fff; margin-bottom: 8px;
        }
        .el-cta-sub { font-size: 14px; color: rgba(255,255,255,0.6); font-weight: 600; }
        .el-cta-btn {
          position: relative; z-index: 1;
          display: inline-flex; align-items: center; gap: 10px;
          background: #f5c842; color: #2a1f0e;
          font-size: 15px; font-weight: 900;
          padding: 16px 32px; border-radius: 50px;
          text-decoration: none; white-space: nowrap;
          box-shadow: 0 12px 32px rgba(245,200,66,0.35);
          transition: all 0.25s; flex-shrink: 0;
        }
        .el-cta-btn:hover { transform: translateY(-3px); box-shadow: 0 18px 40px rgba(245,200,66,0.45); }

        /* ── Schedule info bar ─────────────────────────────────────── */
        .el-info-bar {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 0;
          border-top: 1.5px solid #ede5d8;
          border-bottom: 1.5px solid #ede5d8;
          margin: 0 0 0 0;
          background: #fff;
        }
        .el-info-item {
          padding: 24px 32px;
          border-right: 1.5px solid #ede5d8;
          display: flex; align-items: center; gap: 14px;
        }
        .el-info-item:last-child { border-right: none; }
        .el-info-icon { font-size: 24px; flex-shrink: 0; }
        .el-info-label { font-size: 11px; font-weight: 800; color: #b0a090; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px; }
        .el-info-value { font-size: 14px; font-weight: 900; color: #2a1f0e; }

        /* ── Responsive ────────────────────────────────────────────── */
        @media (max-width: 900px) {
          .el-hero-content { padding: 0 28px 32px; flex-direction: column; align-items: flex-start; }
          .el-section { padding: 48px 28px; }
          .el-breadcrumb { padding: 12px 28px; }
          .el-activities { grid-template-columns: 1fr 1fr; }
          .el-books { grid-template-columns: 1fr 1fr; }
          .el-info-bar { grid-template-columns: 1fr; }
          .el-info-item { border-right: none; border-bottom: 1.5px solid #ede5d8; }
          .el-info-item:last-child { border-bottom: none; }
          .el-cta { flex-direction: column; margin: 0 28px 48px; padding: 36px 28px; }
          .el-divider { margin: 0 28px; }
        }
        @media (max-width: 580px) {
          .el-hero { height: 420px; }
          .el-activities { grid-template-columns: 1fr; }
          .el-books { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="el-page">

        {/* ── Hero ───────────────────────────────────────────────────── */}
        <div className="el-hero">
          <img src={readersImg} alt="Early Learners" className="el-hero-img" />
          <div className="el-hero-overlay" />
          <div className="el-hero-content">
            <div className="el-hero-left">
              <div className="el-hero-eyebrow">🧸 Book Club · Ages 4–5</div>
              <h1 className="el-hero-title">
                Early Learners<br /><span>Hub</span>
              </h1>
              <p className="el-hero-sub">
                Picture books, short stories &amp; listening activities — where
                every child discovers the magic of reading at their own pace.
              </p>
            </div>
            <div className="el-hero-badge">
              <div className="el-hero-badge-num">4–5</div>
              <div className="el-hero-badge-label">Years Old</div>
            </div>
          </div>
        </div>

        {/* ── Breadcrumb ─────────────────────────────────────────────── */}
        <div className="el-breadcrumb">
          <a href="/">Home</a>
          <span className="el-breadcrumb-sep">›</span>
          <a href="/book-club">Book Club</a>
          <span className="el-breadcrumb-sep">›</span>
          <span>Early Learners Hub</span>
        </div>

        {/* ── Info bar ───────────────────────────────────────────────── */}
        <div className="el-info-bar">
          <div className="el-info-item">
            <span className="el-info-icon">📅</span>
            <div>
              <div className="el-info-label">Sessions</div>
              <div className="el-info-value">Saturdays &amp; Sundays</div>
            </div>
          </div>
          <div className="el-info-item">
            <span className="el-info-icon">⏱️</span>
            <div>
              <div className="el-info-label">Duration</div>
              <div className="el-info-value">60 minutes per session</div>
            </div>
          </div>
          <div className="el-info-item">
            <span className="el-info-icon">👶</span>
            <div>
              <div className="el-info-label">Age Group</div>
              <div className="el-info-value">4 to 5 years old</div>
            </div>
          </div>
        </div>

        {/* ── Activities ─────────────────────────────────────────────── */}
        <div className="el-section">
          <div className="el-section-eyebrow">What We Do</div>
          <h2 className="el-section-title">Session Activities</h2>
          <p className="el-section-sub">
            Every session is a blend of structured learning and joyful play, designed
            to build early literacy in a warm, supportive setting.
          </p>
          <div className="el-activities">
            {activities.map((a) => (
              <div className="el-activity" key={a.title}>
                <span className="el-activity-icon">{a.icon}</span>
                <div className="el-activity-title">{a.title}</div>
                <div className="el-activity-desc">{a.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="el-divider" />

        {/* ── Books ──────────────────────────────────────────────────── */}
        <div className="el-section">
          <div className="el-section-eyebrow">Reading List</div>
          <h2 className="el-section-title">Featured Books</h2>
          <p className="el-section-sub">
            A curated selection of beloved picture books that spark imagination
            and build vocabulary for early learners.
          </p>
          <div className="el-books">
            {weeklyBooks.map((b) => (
              <div className="el-book" key={b.title}>
                <span className="el-book-emoji">{b.emoji}</span>
                <div className="el-book-tag">{b.tag}</div>
                <div className="el-book-title">{b.title}</div>
                <div className="el-book-author">by {b.author}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="el-divider" />

        {/* ── Journey ────────────────────────────────────────────────── */}
        <div className="el-section">
          <div className="el-section-eyebrow">Learning Journey</div>
          <h2 className="el-section-title">Your Child's Progress</h2>
          <p className="el-section-sub">
            A gentle, structured journey that builds confidence and skills
            week by week throughout the term.
          </p>
          <div className="el-timeline">
            {milestones.map((m, i) => (
              <div className="el-milestone" key={i}>
                <div className="el-milestone-dot">{i + 1}</div>
                <div className="el-milestone-body">
                  <div className="el-milestone-label">{m.label}</div>
                  <div className="el-milestone-title">{m.title}</div>
                  <div className="el-milestone-desc">{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ────────────────────────────────────────────────────── */}
        <div className="el-cta">
          <div className="el-cta-left">
            <h2 className="el-cta-title">Ready to enrol your little one?</h2>
            <p className="el-cta-sub">Join the Early Learners Hub and watch your child fall in love with stories.</p>
          </div>
          <a href="/register" className="el-cta-btn">Enrol Now →</a>
        </div>

      </div>
    </>
  );
}