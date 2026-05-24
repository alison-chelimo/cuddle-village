import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const GROUP_LABELS = {
  "early-learners":  { label: "Early Learners", age: "Ages 4–5", color: "#f7c948", bg: "#fffbeb" },
  "growing-readers": { label: "Growing Readers", age: "Ages 6–8", color: "#5bb8f5", bg: "#f0f6ff" },
};

export default function ChildProgressPortal() {
  const [child,    setChild]    = useState(null);
  const [upcoming, setUpcoming] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState("overview");

  useEffect(() => {
    Promise.all([
      API.get("/portal/my-child"),
      API.get("/portal/upcoming-session"),
    ])
      .then(([cRes, uRes]) => {
        setChild(cRes.data);
        setUpcoming(uRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ fontFamily: "Nunito, sans-serif", padding: 60, textAlign: "center", color: "#aaa" }}>
      Loading progress…
    </div>
  );

  if (!child?.group) return (
    <div style={{ fontFamily: "Nunito, sans-serif", padding: 60, textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
      <h2 style={{ color: "#2d2640", marginBottom: 8 }}>No Book Club Enrolment Found</h2>
      <p style={{ color: "#aaa", marginBottom: 24 }}>Register your child for the Book Club to see their progress here.</p>
      <Link to="/book-club/register" style={{ padding: "12px 28px", background: "linear-gradient(135deg,#C3B1E1,#afa7e7)", color: "#fff", borderRadius: 12, fontWeight: 800, textDecoration: "none" }}>
        Register Now →
      </Link>
    </div>
  );

  const grp    = GROUP_LABELS[child.group] || {};
  const TABS   = ["overview", "sessions", "books", "skills"];
  const sessionsAttended = child.sessionsAttended || [];
  const booksRead        = child.booksRead        || [];
  const skills           = child.skills           || [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .portal-page { font-family: 'Nunito', sans-serif; background: #faf9fe; min-height: 100vh; padding: 40px 24px; }
        .portal-inner { max-width: 700px; margin: 0 auto; }
        .portal-hero  { background: linear-gradient(135deg, #2d2640, #3d3460); border-radius: 20px; padding: 32px; color: #fff; margin-bottom: 24px; display: flex; align-items: center; gap: 20px; }
        .portal-avatar { width: 64px; height: 64px; border-radius: 50%; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 28px; flex-shrink: 0; }
        .portal-tabs  { display: flex; gap: 4px; background: #fff; border-radius: 14px; padding: 6px; margin-bottom: 20px; box-shadow: 0 2px 12px rgba(175,167,231,0.1); border: 1.5px solid #f0eeff; }
        .portal-tab   { flex: 1; padding: 10px; border-radius: 10px; border: none; background: transparent; font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 700; color: #888; cursor: pointer; transition: all 0.2s; text-transform: capitalize; }
        .portal-tab.active { background: linear-gradient(135deg,#C3B1E1,#afa7e7); color: #fff; }
        .portal-card  { background: #fff; border-radius: 20px; padding: 24px; margin-bottom: 16px; border: 1.5px solid #f0eeff; box-shadow: 0 2px 12px rgba(175,167,231,0.08); }
        .card-label   { font-size: 11px; font-weight: 800; color: #afa7e7; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
        .stat-row     { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
        .stat-box     { background: #faf9fe; border-radius: 14px; padding: 16px; border: 1.5px solid #f0eeff; text-align: center; }
        .stat-num     { font-size: 28px; font-weight: 900; color: #2d2640; }
        .stat-lbl     { font-size: 11px; color: #aaa; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; margin-top: 2px; }
        .session-row  { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid #f5f3ff; }
        .session-row:last-child { border-bottom: none; }
        .session-date { width: 48px; height: 48px; border-radius: 12px; background: #f0eeff; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; }
        .session-day  { font-size: 18px; font-weight: 900; color: #2d2640; line-height: 1; }
        .session-mon  { font-size: 10px; font-weight: 700; color: #afa7e7; text-transform: uppercase; }
        .book-chip    { display: flex; align-items: center; gap: 10px; padding: 12px; background: #faf9fe; border-radius: 12px; border: 1.5px solid #f0eeff; margin-bottom: 8px; }
        .skill-badge  { display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; background: #f0eeff; color: #8b7fd4; margin: 4px; }
        .upcoming-card { background: linear-gradient(135deg,#f0eeff,#faf9fe); border-radius: 14px; padding: 18px; border: 1.5px solid #e8e4f8; margin-top: 16px; }
        @media (max-width: 480px) { .stat-row { grid-template-columns: 1fr 1fr; } .portal-tabs { flex-wrap: wrap; } }
      `}</style>

      <div className="portal-page">
        <div className="portal-inner">

          {/* Hero */}
          <div className="portal-hero">
            <div className="portal-avatar">🧒</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>
                Book Club Progress
              </div>
              <div style={{ fontSize: 24, fontWeight: 900 }}>{child.childName || "Your Child"}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 800, background: grp.bg, color: grp.color, padding: "3px 10px", borderRadius: 20 }}>{grp.label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.55)" }}>{grp.age}</span>
                {child.schedule && <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.55)" }}>· {child.schedule}</span>}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="portal-tabs">
            {TABS.map(t => (
              <button key={t} className={`portal-tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>

          {/* ── Overview ─────────────────────────────────────────────── */}
          {tab === "overview" && (
            <>
              <div className="portal-card">
                <div className="card-label">At a Glance</div>
                <div className="stat-row">
                  <div className="stat-box">
                    <div className="stat-num">{sessionsAttended.length}</div>
                    <div className="stat-lbl">Sessions</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-num">{booksRead.length}</div>
                    <div className="stat-lbl">Books Read</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-num">{skills.length}</div>
                    <div className="stat-lbl">Skills</div>
                  </div>
                </div>

                {upcoming && (
                  <div className="upcoming-card">
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#8b7fd4", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>📅 Upcoming Session</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: "#2d2640" }}>
                      {new Date(upcoming.date).toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </div>
                    {upcoming.title     && <div style={{ fontSize: 13, color: "#666", fontWeight: 600, marginTop: 4 }}>🗒 {upcoming.title}</div>}
                    {upcoming.bookTitle && <div style={{ fontSize: 13, color: "#666", fontWeight: 600, marginTop: 2 }}>📖 {upcoming.bookTitle}{upcoming.bookAuthor ? ` — ${upcoming.bookAuthor}` : ""}</div>}
                  </div>
                )}
              </div>

              {child.notes && (
                <div className="portal-card" style={{ background: "#fffbeb", borderColor: "#f7c94855" }}>
                  <div className="card-label" style={{ color: "#b8860b" }}>💬 Facilitator Note</div>
                  <p style={{ fontSize: 14, color: "#555", fontWeight: 600, margin: 0, lineHeight: 1.6 }}>{child.notes}</p>
                </div>
              )}
            </>
          )}

          {/* ── Sessions ─────────────────────────────────────────────── */}
          {tab === "sessions" && (
            <div className="portal-card">
              <div className="card-label">Session History ({sessionsAttended.length})</div>
              {sessionsAttended.length === 0 ? (
                <p style={{ color: "#aaa", fontWeight: 600, fontSize: 14 }}>No sessions attended yet.</p>
              ) : (
                sessionsAttended.map(s => {
                  const d = new Date(s.date);
                  return (
                    <div className="session-row" key={s._id}>
                      <div className="session-date">
                        <div className="session-day">{d.getDate()}</div>
                        <div className="session-mon">{d.toLocaleString("en", { month: "short" })}</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: "#2d2640", fontSize: 14 }}>{s.title || "Book Club Session"}</div>
                        {s.bookTitle && <div style={{ fontSize: 12, color: "#aaa", fontWeight: 600, marginTop: 2 }}>📖 {s.bookTitle}</div>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── Books ────────────────────────────────────────────────── */}
          {tab === "books" && (
            <div className="portal-card">
              <div className="card-label">Books Read ({booksRead.length})</div>
              {booksRead.length === 0 ? (
                <p style={{ color: "#aaa", fontWeight: 600, fontSize: 14 }}>No books recorded yet.</p>
              ) : (
                booksRead.map((b, i) => (
                  <div className="book-chip" key={i}>
                    <span style={{ fontSize: 22 }}>📚</span>
                    <div>
                      <div style={{ fontWeight: 800, color: "#2d2640", fontSize: 14 }}>{b.title}</div>
                      {b.completedAt && <div style={{ fontSize: 12, color: "#aaa", fontWeight: 600 }}>Completed {new Date(b.completedAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}</div>}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── Skills ───────────────────────────────────────────────── */}
          {tab === "skills" && (
            <div className="portal-card">
              <div className="card-label">Skills Achieved ({skills.length})</div>
              {skills.length === 0 ? (
                <p style={{ color: "#aaa", fontWeight: 600, fontSize: 14 }}>No skills recorded yet.</p>
              ) : (
                <div>
                  {skills.map((s, i) => (
                    <span key={i} className="skill-badge">
                      ✅ {s.name}
                      {s.achievedAt && <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.7, marginLeft: 6 }}>
                        {new Date(s.achievedAt).toLocaleDateString("en-KE", { month: "short", year: "numeric" })}
                      </span>}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
