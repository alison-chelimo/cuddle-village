import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";

const GROUP_LABEL = { "early-learners": "Early Learners", "growing-readers": "Growing Readers" };
const GROUP_COLOR = { "early-learners": { bg: "#fffbeb", color: "#b8860b" }, "growing-readers": { bg: "#eff6ff", color: "#1e40af" } };

export default function FacilitatorDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const initials = user.name
    ? user.name.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join("")
    : "F";

  const [children, setChildren]   = useState([]);
  const [sessions, setSessions]   = useState([]);
  const [hubBooks, setHubBooks]   = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      API.get("/portal/admin/enrolled"),
      API.get("/portal/admin/sessions"),
      API.get("/portal/admin/hub"),
    ])
      .then(([cRes, sRes, hRes]) => {
        setChildren(cRes.data || []);
        setSessions((sRes.data || []).sort((a, b) => new Date(a.date) - new Date(b.date)));
        const books = (hRes.data || []).filter(item => item.type === "book");
        setHubBooks(books);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const earlyCount   = children.filter(c => c.bookClub?.group === "early-learners").length;
  const growingCount = children.filter(c => c.bookClub?.group === "growing-readers").length;
  const upcomingSessions = sessions.filter(s => new Date(s.date) >= new Date()).slice(0, 3);
  const earlyBooks   = hubBooks.filter(b => b.group === "early-learners");
  const growingBooks = hubBooks.filter(b => b.group === "growing-readers");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .fd-page { font-family: 'Nunito', sans-serif; background: #faf9fe; min-height: 100vh; padding: 40px 24px; }
        .fd-inner { max-width: 800px; margin: 0 auto; }

        .fd-hero { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
        .fd-avatar {
          width: 64px; height: 64px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg,#C3B1E1,#afa7e7);
          display: flex; align-items: center; justify-content: center;
          font-size: 24px; font-weight: 900; color: #fff; letter-spacing: 1px;
          box-shadow: 0 4px 16px rgba(175,167,231,0.3);
        }
        .fd-hero-text h1 { font-size: 24px; font-weight: 900; color: #2d2640; margin: 0 0 4px; }
        .fd-hero-text p  { font-size: 14px; color: #aaa; font-weight: 600; margin: 0; }

        .fd-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 28px; }
        .fd-stat-card {
          background: #fff; border-radius: 16px; padding: 20px;
          border: 1.5px solid #f0eeff; box-shadow: 0 4px 16px rgba(175,167,231,0.08);
        }
        .fd-stat-label { font-size: 11px; font-weight: 800; color: #aaa; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .fd-stat-value { font-size: 28px; font-weight: 900; color: #2d2640; }
        .fd-stat-sub   { font-size: 12px; font-weight: 600; color: #aaa; margin-top: 4px; }

        .fd-section { margin-bottom: 28px; }
        .fd-section-title { font-size: 15px; font-weight: 900; color: "#2d2640"; margin: 0 0 14px; display: flex; align-items: center; gap: 8px; }

        .fd-card { background: #fff; border-radius: 16px; border: 1.5px solid #f0eeff; box-shadow: 0 2px 12px rgba(175,167,231,0.08); overflow: hidden; }

        .fd-session-row { padding: 14px 18px; border-bottom: 1px solid #f5f3ff; display: flex; align-items: center; gap: 12px; }
        .fd-session-row:last-child { border-bottom: none; }
        .fd-session-date { font-size: 12px; font-weight: 800; color: #8b7fd4; min-width: 72px; }
        .fd-session-title { font-size: 14px; font-weight: 800; color: #2d2640; }
        .fd-session-sub { font-size: 12px; color: #aaa; font-weight: 600; }
        .fd-group-badge { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 900; margin-left: auto; flex-shrink: 0; }

        .fd-book-row { padding: 12px 18px; border-bottom: 1px solid #f5f3ff; display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 700; color: #2d2640; }
        .fd-book-row:last-child { border-bottom: none; }
        .fd-book-group { font-size: 11px; font-weight: 900; padding: 2px 10px; border-radius: 20px; margin-left: auto; flex-shrink: 0; }

        .fd-empty { padding: 28px; text-align: center; color: "#bbb"; font-weight: 700; font-size: 14px; }

        .fd-cta {
          display: flex; align-items: center; justify-content: space-between;
          background: linear-gradient(135deg,#2d2640,#3d3460);
          border-radius: 20px; padding: 28px 32px;
          text-decoration: none; color: #fff; transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 8px 24px rgba(45,38,64,0.2);
        }
        .fd-cta:hover { transform: translateY(-2px); box-shadow: 0 14px 32px rgba(45,38,64,0.28); }
        .fd-cta-text h3 { font-size: 18px; font-weight: 900; margin: 0 0 6px; }
        .fd-cta-text p  { font-size: 13px; color: #bbb; margin: 0; font-weight: 600; }
        .fd-cta-arrow { font-size: 28px; flex-shrink: 0; }

        @media (max-width: 600px) {
          .fd-stats { grid-template-columns: 1fr 1fr; }
          .fd-cta { flex-direction: column; align-items: flex-start; gap: 12px; }
        }
      `}</style>

      <div className="fd-page">
        <div className="fd-inner">

          {/* Hero greeting */}
          <div className="fd-hero">
            <div className="fd-avatar">{initials}</div>
            <div className="fd-hero-text">
              <h1>Welcome back, {user.name?.split(" ")[0] || "Facilitator"} 👋</h1>
              <p>Here's a quick overview of your book club today.</p>
            </div>
          </div>

          {/* Stat cards */}
          <div className="fd-stats">
            <div className="fd-stat-card">
              <div className="fd-stat-label">Total Enrolled</div>
              <div className="fd-stat-value">{loading ? "…" : children.length}</div>
              <div className="fd-stat-sub">children registered</div>
            </div>
            <div className="fd-stat-card">
              <div className="fd-stat-label">Early Learners</div>
              <div className="fd-stat-value" style={{ color: "#b8860b" }}>{loading ? "…" : earlyCount}</div>
              <div className="fd-stat-sub">Ages 4–5</div>
            </div>
            <div className="fd-stat-card">
              <div className="fd-stat-label">Growing Readers</div>
              <div className="fd-stat-value" style={{ color: "#1e40af" }}>{loading ? "…" : growingCount}</div>
              <div className="fd-stat-sub">Ages 6–8</div>
            </div>
          </div>

          {/* Upcoming sessions */}
          <div className="fd-section">
            <div className="fd-section-title" style={{ color: "#2d2640" }}>📅 Upcoming Sessions</div>
            <div className="fd-card">
              {loading ? (
                <div className="fd-empty">Loading…</div>
              ) : upcomingSessions.length === 0 ? (
                <div className="fd-empty">No upcoming sessions scheduled.</div>
              ) : (
                upcomingSessions.map(s => {
                  const gc = GROUP_COLOR[s.group] || { bg: "#f0eeff", color: "#8b7fd4" };
                  return (
                    <div className="fd-session-row" key={s._id}>
                      <div className="fd-session-date">
                        {new Date(s.date).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}
                      </div>
                      <div>
                        <div className="fd-session-title">{s.title || "Untitled Session"}</div>
                        {s.book && <div className="fd-session-sub">📖 {s.book}</div>}
                      </div>
                      <span className="fd-group-badge" style={{ background: gc.bg, color: gc.color }}>
                        {GROUP_LABEL[s.group] || s.group}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Books to cover */}
          <div className="fd-section">
            <div className="fd-section-title" style={{ color: "#2d2640" }}>📚 Books to Cover</div>
            <div className="fd-card">
              {loading ? (
                <div className="fd-empty">Loading…</div>
              ) : hubBooks.length === 0 ? (
                <div className="fd-empty">No books assigned yet. Add them in the Book Club Manager.</div>
              ) : (
                [...earlyBooks, ...growingBooks].map((b, i) => {
                  const gc = GROUP_COLOR[b.group] || { bg: "#f0eeff", color: "#8b7fd4" };
                  return (
                    <div className="fd-book-row" key={b._id || i}>
                      <span style={{ fontSize: 18 }}>📖</span>
                      {b.title}
                      <span className="fd-book-group" style={{ background: gc.bg, color: gc.color }}>
                        {GROUP_LABEL[b.group] || b.group}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* CTA */}
          <Link to="/facilitator/book-club" className="fd-cta">
            <div className="fd-cta-text">
              <h3>Open Book Club Manager</h3>
              <p>Manage children, mark attendance, and update sessions</p>
            </div>
            <span className="fd-cta-arrow">→</span>
          </Link>

        </div>
      </div>
    </>
  );
}
