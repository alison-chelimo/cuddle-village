import React, { useEffect, useState } from "react";
import API from "../../services/api";
import FacilitatorLayout from "../../components/FacilitatorLayout";

const EMPTY = { title: "", body: "", targetGroup: "all" };
const GROUP_OPTS = [
  { value: "all",             label: "All Groups" },
  { value: "early-learners",  label: "Early Learners" },
  { value: "growing-readers", label: "Growing Readers" },
];

export default function Announcements() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  setSaving]  = useState(false);
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    API.get("/portal/admin/announcements")
      .then(r => setItems(r.data || []))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await API.post("/portal/admin/announcements", form);
      setItems(prev => [res.data, ...prev]);
      setForm(EMPTY);
    } catch {}
    setSaving(false);
  };

  const markSent = async (item) => {
    setToggling(item._id);
    try {
      const res = await API.patch(`/portal/admin/announcements/${item._id}`, { status: "sent" });
      setItems(prev => prev.map(i => i._id === item._id ? res.data : i));
    } catch {}
    setToggling(null);
  };

  return (
    <FacilitatorLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .an * { font-family:'Nunito',sans-serif; }
        .an { padding:36px 32px; background:#faf9fe; min-height:100vh; }
        .an-layout { display:grid; grid-template-columns:1fr 1.4fr; gap:24px; }

        .an-form-card { background:#fff; border-radius:18px; border:1.5px solid #f0eeff; padding:24px; height:fit-content; box-shadow:0 2px 12px rgba(175,167,231,0.07); }
        .an-form-title { font-size:15px; font-weight:900; color:#2d2640; margin:0 0 18px; }
        .an-label { display:block; font-size:10px; font-weight:800; color:#888; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:5px; }
        .an-input, .an-select, .an-textarea {
          width:100%; padding:10px 12px; border:1.5px solid #e8e4f8; border-radius:10px;
          font-size:13px; font-family:'Nunito',sans-serif; font-weight:600; background:#faf9fe;
          box-sizing:border-box; transition:all 0.2s; margin-bottom:14px;
        }
        .an-input:focus, .an-select:focus, .an-textarea:focus { outline:none; border-color:#4caf50; background:#fff; }
        .an-textarea { min-height:100px; resize:vertical; }
        .an-submit { width:100%; padding:11px; background:linear-gradient(135deg,#4caf50,#2e7d32); color:#fff; border:none; border-radius:10px; font-size:13px; font-weight:800; cursor:pointer; font-family:'Nunito',sans-serif; }
        .an-submit:disabled { opacity:0.65; cursor:not-allowed; }

        .an-list-card { background:#fff; border-radius:18px; border:1.5px solid #f0eeff; overflow:hidden; box-shadow:0 2px 12px rgba(175,167,231,0.07); }
        .an-list-head { padding:14px 18px; border-bottom:1.5px solid #f0eeff; font-size:13px; font-weight:900; color:#2d2640; }
        .an-item { padding:16px 18px; border-bottom:1px solid #f5f3ff; }
        .an-item:last-child { border-bottom:none; }
        .an-item-top { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:6px; }
        .an-item-title { font-size:14px; font-weight:900; color:#2d2640; }
        .an-item-body { font-size:13px; color:#555; font-weight:600; line-height:1.6; margin-bottom:8px; }
        .an-item-meta { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .an-status-badge { display:inline-block; padding:2px 10px; border-radius:20px; font-size:11px; font-weight:900; }
        .an-group-badge  { display:inline-block; padding:2px 10px; border-radius:20px; font-size:11px; font-weight:900; }
        .an-date  { font-size:11px; color:#bbb; font-weight:600; }
        .an-mark-btn { padding:4px 12px; background:#f0eeff; color:#6b5fc7; border:1.5px solid #e8e4f8; border-radius:20px; font-size:11px; font-weight:800; cursor:pointer; font-family:'Nunito',sans-serif; flex-shrink:0; }
        .an-mark-btn:hover { background:#ede9f8; }
        .an-empty { padding:32px; text-align:center; color:#ccc; font-weight:700; }
        @media(max-width:768px) { .an { padding:20px 14px; } .an-layout { grid-template-columns:1fr; } }
      `}</style>

      <div className="an">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#2d2640", margin: "0 0 4px" }}>Announcements</h1>
          <p style={{ fontSize: 13, color: "#aaa", margin: 0, fontWeight: 600 }}>Draft and track announcements for parents</p>
        </div>

        <div className="an-layout">
          {/* Create form */}
          <div className="an-form-card">
            <div className="an-form-title">📢 New Announcement</div>
            <form onSubmit={handleCreate}>
              <div>
                <label className="an-label">Title *</label>
                <input className="an-input" placeholder="e.g. May Session Rescheduled" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div>
                <label className="an-label">Message *</label>
                <textarea className="an-textarea" placeholder="Write your announcement here…" value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} required />
              </div>
              <div>
                <label className="an-label">Target Group</label>
                <select className="an-select" value={form.targetGroup} onChange={e => setForm(f => ({ ...f, targetGroup: e.target.value }))}>
                  {GROUP_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <button type="submit" className="an-submit" disabled={saving}>{saving ? "Saving…" : "Save as Draft"}</button>
            </form>
          </div>

          {/* List */}
          <div className="an-list-card">
            <div className="an-list-head">All Announcements ({items.length})</div>
            {loading ? (
              <div className="an-empty">Loading…</div>
            ) : items.length === 0 ? (
              <div className="an-empty">No announcements yet</div>
            ) : items.map(item => {
              const groupLabel = GROUP_OPTS.find(o => o.value === item.targetGroup)?.label || item.targetGroup;
              return (
                <div key={item._id} className="an-item">
                  <div className="an-item-top">
                    <div className="an-item-title">{item.title}</div>
                    {item.status === "draft" && (
                      <button
                        className="an-mark-btn"
                        onClick={() => markSent(item)}
                        disabled={toggling === item._id}
                      >{toggling === item._id ? "…" : "Mark Sent"}</button>
                    )}
                  </div>
                  <div className="an-item-body">{item.body}</div>
                  <div className="an-item-meta">
                    <span className="an-status-badge" style={{
                      background: item.status === "sent" ? "#edfaf4" : "#fffbeb",
                      color:      item.status === "sent" ? "#1a7a4a" : "#b8860b",
                    }}>{item.status === "sent" ? "✓ Sent" : "Draft"}</span>
                    <span className="an-group-badge" style={{
                      background: item.targetGroup === "early-learners" ? "#edfaf4" : item.targetGroup === "growing-readers" ? "#f0eeff" : "#f5f5f5",
                      color:      item.targetGroup === "early-learners" ? "#1a7a4a" : item.targetGroup === "growing-readers" ? "#6b5fc7" : "#555",
                    }}>{groupLabel}</span>
                    <span className="an-date">{new Date(item.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </FacilitatorLayout>
  );
}
