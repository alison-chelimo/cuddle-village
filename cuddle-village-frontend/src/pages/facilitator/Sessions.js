import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import FacilitatorLayout from "../../components/FacilitatorLayout";

const GC = {
  "early-learners":  { bg: "#edfaf4", color: "#1a7a4a", label: "Early Learners" },
  "growing-readers": { bg: "#f0eeff", color: "#6b5fc7", label: "Growing Readers" },
};

const EMPTY = { group: "early-learners", date: "", title: "", bookTitle: "", bookAuthor: "", activityDescription: "", facilitatorNotes: "" };

export default function Sessions() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [groupFilter, setGroup] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);

  const load = () => API.get("/portal/admin/sessions").then(r => setSessions(r.data || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await API.post("/portal/admin/sessions", form);
      setSessions(prev => [res.data, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
      setForm(EMPTY);
      setShowForm(false);
      navigate(`/facilitator/sessions/${res.data._id}`);
    } catch {}
    setSaving(false);
  };

  const displayed = (groupFilter ? sessions.filter(s => s.group === groupFilter) : sessions)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const now = new Date();
  const upcoming = displayed.filter(s => new Date(s.date) >= now);
  const past     = displayed.filter(s => new Date(s.date) <  now);

  return (
    <FacilitatorLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .ss * { font-family:'Nunito',sans-serif; }
        .ss { padding:36px 32px; background:#faf9fe; min-height:100vh; }
        .ss-tab { padding:7px 14px; border-radius:20px; border:1.5px solid #e8e4f8; font-size:12px; font-weight:800; cursor:pointer; background:#fff; color:#888; transition:all 0.18s; }
        .ss-tab.active { background:linear-gradient(135deg,#4caf50,#2e7d32); color:#fff; border-color:transparent; }
        .ss-new-btn { padding:10px 18px; background:linear-gradient(135deg,#4caf50,#2e7d32); color:#fff; border:none; border-radius:12px; font-size:13px; font-weight:800; cursor:pointer; font-family:'Nunito',sans-serif; }
        .ss-card { background:#fff; border-radius:16px; border:1.5px solid #f0eeff; overflow:hidden; margin-bottom:20px; }
        .ss-card-head { padding:12px 18px; font-size:12px; font-weight:900; color:#aaa; text-transform:uppercase; letter-spacing:0.5px; border-bottom:1.5px solid #f0eeff; background:#faf9fe; }
        .ss-row { padding:14px 18px; border-bottom:1px solid #f5f3ff; display:flex; align-items:center; gap:12px; cursor:pointer; transition:background 0.15s; text-decoration:none; color:inherit; }
        .ss-row:last-child { border-bottom:none; }
        .ss-row:hover { background:#f5f3ff; }
        .ss-date  { font-size:12px; font-weight:900; color:#6b5fc7; min-width:68px; }
        .ss-title { font-size:14px; font-weight:800; color:#2d2640; }
        .ss-sub   { font-size:12px; color:#aaa; font-weight:600; }
        .ss-gbadge { padding:2px 8px; border-radius:20px; font-size:10px; font-weight:900; margin-left:auto; flex-shrink:0; }
        .ss-att   { font-size:12px; font-weight:800; color:#1a7a4a; background:#edfaf4; padding:2px 8px; border-radius:20px; flex-shrink:0; }
        .ss-empty { padding:28px; text-align:center; color:#ccc; font-weight:700; font-size:13px; }

        /* Form */
        .ss-form-wrap { background:#fff; border-radius:18px; border:1.5px solid #f0eeff; padding:24px; margin-bottom:24px; box-shadow:0 2px 14px rgba(175,167,231,0.08); }
        .ss-form-title { font-size:16px; font-weight:900; color:#2d2640; margin:0 0 18px; }
        .ss-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .ss-label { display:block; font-size:11px; font-weight:800; color:#888; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:5px; }
        .ss-input, .ss-select, .ss-textarea {
          width:100%; padding:10px 12px; border:1.5px solid #e8e4f8; border-radius:10px;
          font-size:13px; font-family:'Nunito',sans-serif; font-weight:600; background:#faf9fe;
          box-sizing:border-box; transition:all 0.2s;
        }
        .ss-input:focus, .ss-select:focus, .ss-textarea:focus { outline:none; border-color:#4caf50; background:#fff; }
        .ss-textarea { min-height:70px; resize:vertical; }
        .ss-form-actions { display:flex; gap:10px; margin-top:16px; }
        .ss-submit { padding:10px 24px; background:linear-gradient(135deg,#4caf50,#2e7d32); color:#fff; border:none; border-radius:10px; font-size:13px; font-weight:800; cursor:pointer; font-family:'Nunito',sans-serif; }
        .ss-cancel { padding:10px 20px; background:#f5f3ff; color:#6b5fc7; border:1.5px solid #e8e4f8; border-radius:10px; font-size:13px; font-weight:800; cursor:pointer; font-family:'Nunito',sans-serif; }
        @media(max-width:768px) { .ss { padding:20px 14px; } .ss-form-grid { grid-template-columns:1fr; } }
      `}</style>

      <div className="ss">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "#2d2640", margin: "0 0 4px" }}>Sessions</h1>
            <p style={{ fontSize: 13, color: "#aaa", margin: 0, fontWeight: 600 }}>{sessions.length} total · {upcoming.length} upcoming</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[{ key: "", label: "All" }, { key: "early-learners", label: "Early Learners" }, { key: "growing-readers", label: "Growing Readers" }].map(t => (
              <button key={t.key} className={`ss-tab${groupFilter === t.key ? " active" : ""}`} onClick={() => setGroup(t.key)}>{t.label}</button>
            ))}
            <button className="ss-new-btn" onClick={() => setShowForm(f => !f)}>
              {showForm ? "✕ Cancel" : "➕ New Session"}
            </button>
          </div>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="ss-form-wrap">
            <div className="ss-form-title">New Session</div>
            <form onSubmit={handleCreate}>
              <div className="ss-form-grid">
                <div>
                  <label className="ss-label">Group *</label>
                  <select className="ss-select" value={form.group} onChange={e => setForm(f => ({ ...f, group: e.target.value }))} required>
                    <option value="early-learners">Early Learners</option>
                    <option value="growing-readers">Growing Readers</option>
                  </select>
                </div>
                <div>
                  <label className="ss-label">Date *</label>
                  <input className="ss-input" type="datetime-local" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                </div>
                <div>
                  <label className="ss-label">Session Title</label>
                  <input className="ss-input" placeholder="e.g. Week 3 — Reading Circle" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div>
                  <label className="ss-label">Book Title</label>
                  <input className="ss-input" placeholder="e.g. Anansi the Spider" value={form.bookTitle} onChange={e => setForm(f => ({ ...f, bookTitle: e.target.value }))} />
                </div>
                <div>
                  <label className="ss-label">Book Author</label>
                  <input className="ss-input" placeholder="Author name" value={form.bookAuthor} onChange={e => setForm(f => ({ ...f, bookAuthor: e.target.value }))} />
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <label className="ss-label">Activity Description</label>
                <textarea className="ss-textarea" placeholder="What activities are planned?" value={form.activityDescription} onChange={e => setForm(f => ({ ...f, activityDescription: e.target.value }))} />
              </div>
              <div style={{ marginTop: 14 }}>
                <label className="ss-label">Facilitator Notes</label>
                <textarea className="ss-textarea" placeholder="Private notes…" value={form.facilitatorNotes} onChange={e => setForm(f => ({ ...f, facilitatorNotes: e.target.value }))} />
              </div>
              <div className="ss-form-actions">
                <button type="button" className="ss-cancel" onClick={() => { setShowForm(false); setForm(EMPTY); }}>Cancel</button>
                <button type="submit" className="ss-submit" disabled={saving}>{saving ? "Creating…" : "Create Session"}</button>
              </div>
            </form>
          </div>
        )}

        {loading ? <div className="ss-empty">Loading…</div> : (
          <>
            {/* Upcoming */}
            <div className="ss-card">
              <div className="ss-card-head">📅 Upcoming ({upcoming.length})</div>
              {upcoming.length === 0 ? <div className="ss-empty">No upcoming sessions</div> : upcoming.map(s => {
                const gc = GC[s.group] || { bg: "#f0eeff", color: "#6b5fc7", label: s.group };
                return (
                  <Link to={`/facilitator/sessions/${s._id}`} key={s._id} className="ss-row">
                    <div className="ss-date">{new Date(s.date).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}</div>
                    <div>
                      <div className="ss-title">{s.title || "Untitled Session"}</div>
                      {s.bookTitle && <div className="ss-sub">📖 {s.bookTitle}</div>}
                    </div>
                    <span className="ss-gbadge" style={{ background: gc.bg, color: gc.color }}>{gc.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Past */}
            <div className="ss-card">
              <div className="ss-card-head">🗓 Past Sessions ({past.length})</div>
              {past.length === 0 ? <div className="ss-empty">No past sessions</div> : past.map(s => {
                const gc = GC[s.group] || { bg: "#f0eeff", color: "#6b5fc7", label: s.group };
                return (
                  <Link to={`/facilitator/sessions/${s._id}`} key={s._id} className="ss-row">
                    <div className="ss-date">{new Date(s.date).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}</div>
                    <div>
                      <div className="ss-title">{s.title || "Untitled Session"}</div>
                      {s.bookTitle && <div className="ss-sub">📖 {s.bookTitle}</div>}
                    </div>
                    <span className="ss-att">{s.attendees?.length || 0} attended</span>
                    <span className="ss-gbadge" style={{ background: gc.bg, color: gc.color }}>{gc.label}</span>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </FacilitatorLayout>
  );
}
