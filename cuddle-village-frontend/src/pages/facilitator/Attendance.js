import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import FacilitatorLayout from "../../components/FacilitatorLayout";

const GC = {
  "early-learners":  { bg: "#edfaf4", color: "#1a7a4a", label: "Early Learners" },
  "growing-readers": { bg: "#f0eeff", color: "#6b5fc7", label: "Growing Readers" },
};

export default function Attendance() {
  const [children, setChildren] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [group,    setGroup]    = useState("early-learners");

  useEffect(() => {
    Promise.all([
      API.get("/portal/admin/enrolled"),
      API.get("/portal/admin/sessions"),
    ])
      .then(([cRes, sRes]) => {
        setChildren(cRes.data || []);
        setSessions((sRes.data || []).sort((a, b) => new Date(b.date) - new Date(a.date)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const gc = GC[group] || GC["early-learners"];
  const groupChildren  = children.filter(c => c.bookClub?.group === group);
  const groupSessions  = sessions.filter(s => s.group === group).slice(0, 10);

  const attended = (child, session) => {
    const attended = child.bookClub?.sessionsAttended || [];
    return attended.some(s => (s._id || s) === session._id);
  };

  const rate = (child) => {
    if (!groupSessions.length) return 0;
    const count = groupSessions.filter(s => attended(child, s)).length;
    return Math.round((count / groupSessions.length) * 100);
  };

  return (
    <FacilitatorLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .at * { font-family:'Nunito',sans-serif; }
        .at { padding:36px 32px; background:#faf9fe; min-height:100vh; }
        .at-tab { padding:8px 16px; border-radius:20px; border:1.5px solid #e8e4f8; font-size:12px; font-weight:800; cursor:pointer; background:#fff; color:#888; transition:all 0.18s; }
        .at-tab.early  { }
        .at-tab.active.early   { background:linear-gradient(135deg,#4caf50,#2e7d32); color:#fff; border-color:transparent; }
        .at-tab.active.growing { background:linear-gradient(135deg,#C3B1E1,#afa7e7); color:#fff; border-color:transparent; }
        .at-table-wrap { overflow-x:auto; }
        .at-table { border-collapse:collapse; min-width:100%; }
        .at-table th, .at-table td { padding:10px 12px; border-bottom:1px solid #f5f3ff; white-space:nowrap; font-size:12px; font-weight:600; }
        .at-table th { font-size:10px; font-weight:800; color:#aaa; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid #f0eeff; background:#faf9fe; }
        .at-table tr:hover td { background:#faf9fe; }
        .at-present { color:#1a7a4a; font-weight:900; font-size:15px; }
        .at-absent  { color:#ddd; font-size:15px; }
        .at-rate    { padding:2px 8px; border-radius:20px; font-size:11px; font-weight:900; }
        .at-session-link { color:#6b5fc7; text-decoration:none; font-weight:800; font-size:11px; }
        .at-session-link:hover { text-decoration:underline; }
        .at-empty { padding:32px; text-align:center; color:#ccc; font-weight:700; }
        @media(max-width:768px) { .at { padding:20px 14px; } }
      `}</style>

      <div className="at">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "#2d2640", margin: "0 0 4px" }}>Attendance</h1>
            <p style={{ fontSize: 13, color: "#aaa", margin: 0, fontWeight: 600 }}>Overview across last 10 sessions per group</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {Object.entries(GC).map(([key, g]) => (
              <button
                key={key}
                className={`at-tab${group === key ? " active " + (key === "early-learners" ? "early" : "growing") : ""}`}
                onClick={() => setGroup(key)}
              >{g.label}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="at-empty">Loading…</div>
        ) : groupChildren.length === 0 ? (
          <div className="at-empty">No children enrolled in {gc.label} yet.</div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #f0eeff", overflow: "hidden", boxShadow: "0 2px 14px rgba(175,167,231,0.07)" }}>
            <div className="at-table-wrap">
              <table className="at-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", minWidth: 140 }}>Child</th>
                    <th>Rate</th>
                    {groupSessions.map(s => (
                      <th key={s._id} style={{ textAlign: "center" }}>
                        <Link to={`/facilitator/sessions/${s._id}`} className="at-session-link">
                          {new Date(s.date).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groupChildren.map(c => {
                    const r = rate(c);
                    const rBg = r >= 75 ? "#edfaf4" : r >= 50 ? "#fffbeb" : "#fff3f3";
                    const rColor = r >= 75 ? "#1a7a4a" : r >= 50 ? "#b8860b" : "#c0392b";
                    return (
                      <tr key={c._id}>
                        <td>
                          <Link to={`/facilitator/children/${c._id}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: gc.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
                              {c.name?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 700, color: "#2d2640" }}>{c.name}</span>
                          </Link>
                        </td>
                        <td>
                          <span className="at-rate" style={{ background: rBg, color: rColor }}>{r}%</span>
                        </td>
                        {groupSessions.map(s => (
                          <td key={s._id} style={{ textAlign: "center" }}>
                            {attended(c, s)
                              ? <span className="at-present">✓</span>
                              : <span className="at-absent">–</span>}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </FacilitatorLayout>
  );
}
