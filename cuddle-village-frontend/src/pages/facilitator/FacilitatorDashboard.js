import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import FacilitatorLayout from "../../components/FacilitatorLayout";

const GC = {
  "early-learners":  { bg: "#edfaf4", color: "#1a7a4a", label: "Early Learners" },
  "growing-readers": { bg: "#f0eeff", color: "#6b5fc7", label: "Growing Readers" },
};

const now = new Date();
const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

export default function FacilitatorDashboard() {
  const user     = JSON.parse(localStorage.getItem("user") || "{}");
  const initials = user.name
    ? user.name.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join("")
    : "F";

  const [children, setChildren] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [books,    setBooks]    = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      API.get("/portal/admin/enrolled"),
      API.get("/portal/admin/sessions"),
      API.get("/portal/admin/hub-content"),
    ])
      .then(([cRes, sRes, hRes]) => {
        setChildren(cRes.data || []);
        setSessions((sRes.data || []).sort((a, b) => new Date(a.date) - new Date(b.date)));
        setBooks((hRes.data || []).filter(h => h.contentType === "book" && h.isActive));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const earlyCount   = children.filter(c => c.bookClub?.group === "early-learners").length;
  const growingCount = children.filter(c => c.bookClub?.group === "growing-readers").length;
  const sessionsThisMonth = sessions.filter(s => new Date(s.date) >= monthStart).length;
  const pastSessions = sessions.filter(s => new Date(s.date) < now);
  const avgAttendance = pastSessions.length
    ? Math.round(pastSessions.reduce((sum, s) => sum + (s.attendees?.length || 0), 0) / pastSessions.length)
    : 0;
  const upcoming      = sessions.filter(s => new Date(s.date) >= now).slice(0, 4);
  const recentEnrolled = [...children].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <FacilitatorLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .fd2 * { font-family:'Nunito',sans-serif; }
        .fd2 { padding: 36px 32px; background: #faf9fe; min-height: 100vh; }
        .fd2-hero { display:flex; align-items:center; gap:14px; margin-bottom:28px; }
        .fd2-avatar {
          width:56px; height:56px; border-radius:50%; flex-shrink:0;
          background:linear-gradient(135deg,#4caf50,#2e7d32);
          display:flex; align-items:center; justify-content:center;
          font-size:20px; font-weight:900; color:#fff; letter-spacing:1px;
        }
        .fd2-hero h1 { font-size:22px; font-weight:900; color:#2d2640; margin:0 0 3px; }
        .fd2-hero p  { font-size:13px; color:#aaa; margin:0; font-weight:600; }
        .fd2-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:28px; }
        .fd2-stat {
          background:#fff; border-radius:14px; padding:18px;
          border:1.5px solid #f0eeff; box-shadow:0 2px 12px rgba(175,167,231,0.07);
        }
        .fd2-stat-label { font-size:10px; font-weight:800; color:#aaa; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px; }
        .fd2-stat-val   { font-size:26px; font-weight:900; color:#2d2640; }
        .fd2-stat-sub   { font-size:11px; color:#bbb; font-weight:600; margin-top:3px; }

        .fd2-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
        .fd2-card { background:#fff; border-radius:16px; border:1.5px solid #f0eeff; overflow:hidden; box-shadow:0 2px 12px rgba(175,167,231,0.07); }
        .fd2-card-header { padding:14px 18px 0; font-size:13px; font-weight:900; color:#2d2640; display:flex; align-items:center; gap:6px; }
        .fd2-row { padding:12px 18px; border-bottom:1px solid #f5f3ff; display:flex; align-items:center; gap:10px; }
        .fd2-row:last-child { border-bottom:none; }
        .fd2-empty { padding:24px; text-align:center; color:#ccc; font-weight:700; font-size:13px; }

        .fd2-sdate  { font-size:11px; font-weight:800; color:#8b7fd4; min-width:60px; }
        .fd2-stitle { font-size:13px; font-weight:800; color:#2d2640; }
        .fd2-ssub   { font-size:11px; color:#aaa; font-weight:600; }
        .fd2-gbadge { padding:2px 8px; border-radius:20px; font-size:10px; font-weight:900; margin-left:auto; flex-shrink:0; }

        .fd2-child-init {
          width:30px; height:30px; border-radius:50%; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          font-size:12px; font-weight:900; color:#fff;
        }
        .fd2-child-name { font-size:13px; font-weight:800; color:#2d2640; }
        .fd2-child-sub  { font-size:11px; color:#aaa; font-weight:600; }

        .fd2-cta {
          display:flex; align-items:center; justify-content:space-between;
          background:linear-gradient(135deg,#1e2a1e,#2e3d2e);
          border-radius:16px; padding:22px 28px; margin-top:20px;
          text-decoration:none; color:#fff;
          transition:transform 0.18s, box-shadow 0.18s;
        }
        .fd2-cta:hover { transform:translateY(-2px); box-shadow:0 12px 28px rgba(0,0,0,0.18); }
        .fd2-cta h3 { font-size:16px; font-weight:900; margin:0 0 4px; }
        .fd2-cta p  { font-size:12px; color:#81c784; margin:0; font-weight:600; }

        @media(max-width:900px) {
          .fd2 { padding:24px 16px; }
          .fd2-stats { grid-template-columns:1fr 1fr; }
          .fd2-grid  { grid-template-columns:1fr; }
        }
      `}</style>

      <div className="fd2">
        {/* Hero */}
        <div className="fd2-hero">
          <div className="fd2-avatar">{initials}</div>
          <div>
            <h1>Welcome back, {user.name?.split(" ")[0] || "Facilitator"} 👋</h1>
            <p>Here's your book club at a glance.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="fd2-stats">
          {[
            { label: "Total Enrolled",    val: loading ? "…" : children.length, sub: "registered children", color: "#2d2640" },
            { label: "Sessions This Month", val: loading ? "…" : sessionsThisMonth, sub: "this month", color: "#6b5fc7" },
            { label: "Avg Attendance",    val: loading ? "…" : avgAttendance, sub: "per session", color: "#1a7a4a" },
            { label: "Books in Progress", val: loading ? "…" : books.length, sub: "active books", color: "#d4a017" },
          ].map(s => (
            <div className="fd2-stat" key={s.label}>
              <div className="fd2-stat-label">{s.label}</div>
              <div className="fd2-stat-val" style={{ color: s.color }}>{s.val}</div>
              <div className="fd2-stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Two-col cards */}
        <div className="fd2-grid">
          {/* Upcoming sessions */}
          <div className="fd2-card">
            <div className="fd2-card-header">📅 Upcoming Sessions</div>
            <div style={{ paddingTop: 10 }}>
              {loading ? <div className="fd2-empty">Loading…</div> :
               upcoming.length === 0 ? <div className="fd2-empty">No upcoming sessions</div> :
               upcoming.map(s => {
                 const gc = GC[s.group] || { bg: "#f0eeff", color: "#8b7fd4", label: s.group };
                 return (
                   <Link to={`/facilitator/sessions/${s._id}`} key={s._id} style={{ textDecoration: "none" }}>
                     <div className="fd2-row" style={{ cursor: "pointer" }}>
                       <div className="fd2-sdate">
                         {new Date(s.date).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}
                       </div>
                       <div>
                         <div className="fd2-stitle">{s.title || "Session"}</div>
                         {s.bookTitle && <div className="fd2-ssub">📖 {s.bookTitle}</div>}
                       </div>
                       <span className="fd2-gbadge" style={{ background: gc.bg, color: gc.color }}>{gc.label}</span>
                     </div>
                   </Link>
                 );
               })}
            </div>
          </div>

          {/* Recently enrolled */}
          <div className="fd2-card">
            <div className="fd2-card-header">👶 Recently Enrolled</div>
            <div style={{ paddingTop: 10 }}>
              {loading ? <div className="fd2-empty">Loading…</div> :
               recentEnrolled.length === 0 ? <div className="fd2-empty">No children enrolled yet</div> :
               recentEnrolled.map(c => {
                 const gc = GC[c.bookClub?.group] || { bg: "#f0eeff", color: "#8b7fd4", label: "—" };
                 const ini = c.name?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";
                 return (
                   <Link to={`/facilitator/children/${c._id}`} key={c._id} style={{ textDecoration: "none" }}>
                     <div className="fd2-row" style={{ cursor: "pointer" }}>
                       <div className="fd2-child-init" style={{ background: gc.color }}>{ini}</div>
                       <div>
                         <div className="fd2-child-name">{c.name}</div>
                         <div className="fd2-child-sub">{c.bookClub?.childAge ? `Age ${c.bookClub.childAge}` : ""}{c.bookClub?.school ? ` · ${c.bookClub.school}` : ""}</div>
                       </div>
                       <span className="fd2-gbadge" style={{ background: gc.bg, color: gc.color }}>{gc.label}</span>
                     </div>
                   </Link>
                 );
               })}
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link to="/facilitator/sessions/new" className="fd2-cta" onClick={e => { e.preventDefault(); window.location.href = "/facilitator/sessions"; }}>
          <div>
            <h3>Manage Book Club →</h3>
            <p>Sessions · Children · Attendance · Books</p>
          </div>
          <span style={{ fontSize: 28 }}>📚</span>
        </Link>
      </div>
    </FacilitatorLayout>
  );
}
