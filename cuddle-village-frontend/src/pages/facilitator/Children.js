import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import FacilitatorLayout from "../../components/FacilitatorLayout";

const GC = {
  "early-learners":  { bg: "#edfaf4", color: "#1a7a4a", dot: "#34c77b", label: "Early Learners" },
  "growing-readers": { bg: "#f0eeff", color: "#6b5fc7", dot: "#afa7e7", label: "Growing Readers" },
};

export default function Children() {
  const [children, setChildren] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState("all");
  const [search,   setSearch]   = useState("");

  useEffect(() => {
    API.get("/portal/admin/enrolled")
      .then(r => setChildren(r.data || []))
      .finally(() => setLoading(false));
  }, []);

  const byGroup = tab === "all" ? children
    : children.filter(c => c.bookClub?.group === tab);

  const filtered = byGroup.filter(c =>
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.bookClub?.school?.toLowerCase().includes(search.toLowerCase())
  );

  const early   = children.filter(c => c.bookClub?.group === "early-learners").length;
  const growing = children.filter(c => c.bookClub?.group === "growing-readers").length;

  return (
    <FacilitatorLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .ch * { font-family:'Nunito',sans-serif; }
        .ch { padding:36px 32px; background:#faf9fe; min-height:100vh; }
        .ch-tabs { display:flex; gap:6px; margin-bottom:20px; }
        .ch-tab { padding:8px 16px; border-radius:20px; border:1.5px solid #e8e4f8; font-size:12px; font-weight:800; cursor:pointer; transition:all 0.18s; background:#fff; color:#888; }
        .ch-tab.active { background:linear-gradient(135deg,#4caf50,#2e7d32); color:#fff; border-color:transparent; }
        .ch-search { padding:10px 14px; border:1.5px solid #e8e4f8; border-radius:12px; font-size:13px; font-family:'Nunito',sans-serif; font-weight:600; background:#fff; width:240px; }
        .ch-search:focus { outline:none; border-color:#4caf50; }
        .ch-table { width:100%; border-collapse:collapse; }
        .ch-table th { font-size:11px; font-weight:800; color:#aaa; text-transform:uppercase; letter-spacing:0.5px; padding:0 16px 12px; text-align:left; border-bottom:2px solid #f0eeff; }
        .ch-table td { padding:14px 16px; border-bottom:1px solid #f5f3ff; font-size:13px; font-weight:600; color:#2d2640; vertical-align:middle; }
        .ch-table tr:last-child td { border-bottom:none; }
        .ch-table tr:hover td { background:#faf9fe; cursor:pointer; }
        .ch-init { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:900; color:#fff; flex-shrink:0; }
        .ch-badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:900; }
        .ch-empty { padding:40px; text-align:center; color:#ccc; font-weight:700; }
        .ch-view-btn { padding:6px 14px; background:#f0eeff; color:#6b5fc7; border:none; border-radius:8px; font-size:12px; font-weight:800; cursor:pointer; font-family:'Nunito',sans-serif; text-decoration:none; }
        @media(max-width:768px) { .ch { padding:20px 14px; } .ch-search { width:100%; } }
      `}</style>

      <div className="ch">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#2d2640", margin: "0 0 4px" }}>Children</h1>
          <p style={{ fontSize: 13, color: "#aaa", margin: 0, fontWeight: 600 }}>{children.length} enrolled · {early} Early Learners · {growing} Growing Readers</p>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
          <div className="ch-tabs">
            {[
              { key: "all", label: `All (${children.length})` },
              { key: "early-learners", label: `Early Learners (${early})` },
              { key: "growing-readers", label: `Growing Readers (${growing})` },
            ].map(t => (
              <button key={t.key} className={`ch-tab${tab === t.key ? " active" : ""}`} onClick={() => setTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>
          <input className="ch-search" placeholder="Search name or school…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #f0eeff", overflow: "hidden", boxShadow: "0 2px 16px rgba(175,167,231,0.08)" }}>
          {loading ? (
            <div className="ch-empty">Loading…</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="ch-table">
                <thead>
                  <tr><th>Child</th><th>Age</th><th>School</th><th>Parent Email</th><th>Group</th><th>Sessions</th><th></th></tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} className="ch-empty">No children found</td></tr>
                  ) : filtered.map(c => {
                    const gc  = GC[c.bookClub?.group] || { bg: "#f0eeff", color: "#6b5fc7", dot: "#afa7e7", label: "—" };
                    const ini = c.name?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";
                    return (
                      <tr key={c._id} onClick={() => window.location.href = `/facilitator/children/${c._id}`}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div className="ch-init" style={{ background: gc.color }}>{ini}</div>
                            <div>
                              <div style={{ fontWeight: 800 }}>{c.name}</div>
                              <div style={{ fontSize: 11, color: "#bbb", fontWeight: 600 }}>{c.bookClub?.childName || ""}</div>
                            </div>
                          </div>
                        </td>
                        <td>{c.bookClub?.childAge ? `${c.bookClub.childAge} yrs` : "—"}</td>
                        <td>{c.bookClub?.school || "—"}</td>
                        <td style={{ color: "#888" }}>{c.email}</td>
                        <td>
                          <span className="ch-badge" style={{ background: gc.bg, color: gc.color }}>{gc.label}</span>
                        </td>
                        <td style={{ fontWeight: 800, color: "#2d2640" }}>
                          {c.bookClub?.sessionsAttended?.length || 0}
                        </td>
                        <td>
                          <Link to={`/facilitator/children/${c._id}`} className="ch-view-btn" onClick={e => e.stopPropagation()}>
                            View →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </FacilitatorLayout>
  );
}
