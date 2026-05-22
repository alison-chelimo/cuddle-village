import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../services/api";
import FacilitatorLayout from "../../components/FacilitatorLayout";

const GC = {
  "early-learners":  { bg: "#edfaf4", color: "#1a7a4a", label: "Early Learners" },
  "growing-readers": { bg: "#f0eeff", color: "#6b5fc7", label: "Growing Readers" },
};

export default function ChildProfile() {
  const { id } = useParams();
  const [child,   setChild]   = useState(null);
  const [notes,   setNotes]   = useState([]);
  const [newNote, setNewNote] = useState("");
  const [saving,  setSaving]  = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get(`/portal/admin/enrolled/${id}`),
      API.get(`/portal/admin/children/${id}/notes`),
    ])
      .then(([cRes, nRes]) => { setChild(cRes.data); setNotes(nRes.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSaving(true);
    try {
      const res = await API.post(`/portal/admin/children/${id}/notes`, { content: newNote });
      setNotes(prev => [res.data, ...prev]);
      setNewNote("");
    } catch {}
    setSaving(false);
  };

  if (loading) return <FacilitatorLayout><div style={{ padding: 40, textAlign: "center", color: "#aaa", fontFamily: "Nunito, sans-serif", fontWeight: 700 }}>Loading…</div></FacilitatorLayout>;
  if (!child)  return <FacilitatorLayout><div style={{ padding: 40, textAlign: "center", color: "#aaa", fontFamily: "Nunito, sans-serif" }}>Child not found.</div></FacilitatorLayout>;

  const gc  = GC[child.bookClub?.group] || { bg: "#f0eeff", color: "#6b5fc7", label: "—" };
  const ini = child.name?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";
  const sessions = child.bookClub?.sessionsAttended || [];

  return (
    <FacilitatorLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .cp * { font-family:'Nunito',sans-serif; }
        .cp { padding:36px 32px; background:#faf9fe; min-height:100vh; }
        .cp-back { display:inline-flex; align-items:center; gap:6px; background:#fff; border:1.5px solid #e8e4f8; border-radius:10px; padding:8px 14px; font-size:12px; font-weight:800; color:#888; text-decoration:none; margin-bottom:20px; transition:all 0.15s; }
        .cp-back:hover { background:#f0eeff; color:#6b5fc7; }
        .cp-card { background:#fff; border-radius:18px; border:1.5px solid #f0eeff; padding:24px; box-shadow:0 2px 14px rgba(175,167,231,0.08); margin-bottom:20px; }
        .cp-card-title { font-size:13px; font-weight:900; color:#2d2640; margin:0 0 16px; padding-bottom:10px; border-bottom:1.5px solid #f0eeff; }
        .cp-avatar { width:64px; height:64px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:900; color:#fff; flex-shrink:0; }
        .cp-badge  { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:900; }
        .cp-info-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px 20px; }
        .cp-info-item label { font-size:10px; font-weight:800; color:#aaa; text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:3px; }
        .cp-info-item span  { font-size:13px; font-weight:700; color:#2d2640; }
        .cp-session-pill { display:inline-flex; align-items:center; gap:6px; background:#faf9fe; border:1.5px solid #f0eeff; border-radius:10px; padding:8px 12px; font-size:12px; font-weight:800; color:#2d2640; margin:0 6px 6px 0; }
        .cp-skill-pill { display:inline-block; background:#edfaf4; color:#1a7a4a; border-radius:20px; padding:3px 10px; font-size:11px; font-weight:900; margin:0 4px 4px 0; }
        .cp-book-row { display:flex; align-items:center; gap:8px; padding:8px 0; border-bottom:1px solid #f5f3ff; font-size:13px; font-weight:700; color:#2d2640; }
        .cp-book-row:last-child { border-bottom:none; }
        .cp-note-row { padding:12px 0; border-bottom:1px solid #f5f3ff; }
        .cp-note-row:last-child { border-bottom:none; }
        .cp-note-content { font-size:13px; font-weight:600; color:#444; line-height:1.6; }
        .cp-note-meta    { font-size:11px; color:#bbb; font-weight:600; margin-top:4px; }
        .cp-note-input   { width:100%; padding:10px 14px; border:1.5px solid #e8e4f8; border-radius:12px; font-size:13px; font-family:'Nunito',sans-serif; font-weight:600; resize:vertical; min-height:80px; box-sizing:border-box; transition:all 0.2s; background:#faf9fe; }
        .cp-note-input:focus { outline:none; border-color:#4caf50; background:#fff; }
        .cp-note-btn { padding:10px 20px; background:linear-gradient(135deg,#4caf50,#2e7d32); color:#fff; border:none; border-radius:10px; font-size:13px; font-weight:800; cursor:pointer; font-family:'Nunito',sans-serif; margin-top:8px; }
        .cp-note-btn:disabled { opacity:0.6; cursor:not-allowed; }
        @media(max-width:600px) { .cp { padding:20px 14px; } .cp-info-grid { grid-template-columns:1fr; } }
      `}</style>

      <div className="cp">
        <Link to="/facilitator/children" className="cp-back">← Back to Children</Link>

        {/* Profile header */}
        <div className="cp-card">
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div className="cp-avatar" style={{ background: gc.color }}>{ini}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#2d2640", marginBottom: 4 }}>{child.name}</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span className="cp-badge" style={{ background: gc.bg, color: gc.color }}>{gc.label}</span>
                <span style={{ fontSize: 12, color: "#aaa", fontWeight: 600 }}>
                  Enrolled {new Date(child.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>

          <div className="cp-info-grid">
            {[
              { label: "Child's Name",  val: child.bookClub?.childName || child.name },
              { label: "Age",           val: child.bookClub?.childAge ? `${child.bookClub.childAge} years` : "—" },
              { label: "School",        val: child.bookClub?.school || "—" },
              { label: "Parent Email",  val: child.email || "—" },
              { label: "Phone",         val: child.phone || "—" },
              { label: "Allergies",     val: child.bookClub?.allergies || "None" },
              { label: "Special Needs", val: child.bookClub?.specialNeeds || "None" },
              { label: "Sessions Attended", val: sessions.length },
            ].map(item => (
              <div className="cp-info-item" key={item.label}>
                <label>{item.label}</label>
                <span>{item.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance timeline */}
        <div className="cp-card">
          <div className="cp-card-title">📅 Sessions Attended ({sessions.length})</div>
          {sessions.length === 0 ? (
            <div style={{ color: "#bbb", fontWeight: 600, fontSize: 13 }}>No sessions attended yet.</div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {sessions.slice().reverse().map(s => (
                <div key={s._id} className="cp-session-pill">
                  <span style={{ fontSize: 10 }}>📅</span>
                  {new Date(s.date).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                  {s.title ? ` — ${s.title}` : ""}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Skills */}
        {(child.bookClub?.skills?.length > 0) && (
          <div className="cp-card">
            <div className="cp-card-title">🌟 Skills Achieved</div>
            <div>
              {child.bookClub.skills.map((s, i) => (
                <span key={i} className="cp-skill-pill">{s.name}</span>
              ))}
            </div>
          </div>
        )}

        {/* Books read */}
        {(child.bookClub?.booksRead?.length > 0) && (
          <div className="cp-card">
            <div className="cp-card-title">📚 Books Read</div>
            {child.bookClub.booksRead.map((b, i) => (
              <div key={i} className="cp-book-row">
                📖 {b.title}
                {b.completedAt && <span style={{ fontSize: 11, color: "#bbb", marginLeft: "auto", fontWeight: 600 }}>{new Date(b.completedAt).toLocaleDateString("en-KE", { month: "short", year: "numeric" })}</span>}
              </div>
            ))}
          </div>
        )}

        {/* Progress notes */}
        <div className="cp-card">
          <div className="cp-card-title">📝 Progress Notes</div>
          <form onSubmit={handleAddNote} style={{ marginBottom: 20 }}>
            <textarea
              className="cp-note-input"
              placeholder="Add a progress note for this child…"
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
            />
            <button type="submit" className="cp-note-btn" disabled={saving || !newNote.trim()}>
              {saving ? "Saving…" : "Add Note"}
            </button>
          </form>
          {notes.length === 0 ? (
            <div style={{ color: "#bbb", fontWeight: 600, fontSize: 13 }}>No notes yet.</div>
          ) : notes.map(n => (
            <div key={n._id} className="cp-note-row">
              <div className="cp-note-content">{n.content}</div>
              <div className="cp-note-meta">
                {n.createdBy?.name || "Facilitator"} · {new Date(n.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </FacilitatorLayout>
  );
}
