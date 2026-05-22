import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../services/api";
import FacilitatorLayout from "../../components/FacilitatorLayout";

const GC = {
  "early-learners":  { bg: "#edfaf4", color: "#1a7a4a", label: "Early Learners" },
  "growing-readers": { bg: "#f0eeff", color: "#6b5fc7", label: "Growing Readers" },
};

export default function SessionDetail() {
  const { id } = useParams();
  const [session,   setSession]   = useState(null);
  const [enrolled,  setEnrolled]  = useState([]);
  const [attendance, setAtt]      = useState({}); // { childId: bool }
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    API.get(`/portal/admin/sessions/${id}`)
      .then(sRes => {
        setSession(sRes.data);
        const attIds = new Set((sRes.data.attendees || []).map(a => a._id || a));
        return API.get(`/portal/admin/enrolled`).then(eRes => {
          const inGroup = (eRes.data || []).filter(c => c.bookClub?.group === sRes.data.group);
          setEnrolled(inGroup);
          const attMap = {};
          inGroup.forEach(c => { attMap[c._id] = attIds.has(c._id); });
          setAtt(attMap);
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const toggle = (childId) => setAtt(prev => ({ ...prev, [childId]: !prev[childId] }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const attendees = Object.entries(attendance).map(([userId, attended]) => ({ userId, attended }));
      await API.post(`/portal/admin/sessions/${id}/bulk-attendance`, { attendees });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      load();
    } catch {}
    setSaving(false);
  };

  if (loading) return <FacilitatorLayout><div style={{ padding: 40, textAlign: "center", color: "#aaa", fontFamily: "Nunito,sans-serif", fontWeight: 700 }}>Loading…</div></FacilitatorLayout>;
  if (!session) return <FacilitatorLayout><div style={{ padding: 40, textAlign: "center", color: "#aaa", fontFamily: "Nunito,sans-serif" }}>Session not found.</div></FacilitatorLayout>;

  const gc = GC[session.group] || { bg: "#f0eeff", color: "#6b5fc7", label: session.group };
  const presentCount = Object.values(attendance).filter(Boolean).length;

  return (
    <FacilitatorLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .sd * { font-family:'Nunito',sans-serif; }
        .sd { padding:36px 32px; background:#faf9fe; min-height:100vh; }
        .sd-back { display:inline-flex; align-items:center; gap:6px; background:#fff; border:1.5px solid #e8e4f8; border-radius:10px; padding:8px 14px; font-size:12px; font-weight:800; color:#888; text-decoration:none; margin-bottom:20px; transition:all 0.15s; }
        .sd-back:hover { background:#f0eeff; color:#6b5fc7; }
        .sd-info { background:#fff; border-radius:16px; border:1.5px solid #f0eeff; padding:22px; margin-bottom:20px; box-shadow:0 2px 12px rgba(175,167,231,0.07); }
        .sd-badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:900; }
        .sd-detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px 20px; margin-top:16px; }
        .sd-detail-item label { font-size:10px; font-weight:800; color:#aaa; text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:2px; }
        .sd-detail-item p { font-size:13px; font-weight:600; color:#444; margin:0; line-height:1.5; }
        .sd-att-card { background:#fff; border-radius:16px; border:1.5px solid #f0eeff; overflow:hidden; box-shadow:0 2px 12px rgba(175,167,231,0.07); }
        .sd-att-header { padding:14px 18px; border-bottom:1.5px solid #f0eeff; display:flex; align-items:center; justify-content:space-between; }
        .sd-att-title { font-size:15px; font-weight:900; color:#2d2640; }
        .sd-att-count { font-size:13px; color:#1a7a4a; font-weight:800; background:#edfaf4; padding:4px 12px; border-radius:20px; }
        .sd-child-row { padding:12px 18px; border-bottom:1px solid #f5f3ff; display:flex; align-items:center; gap:12px; cursor:pointer; transition:background 0.15s; }
        .sd-child-row:last-child { border-bottom:none; }
        .sd-child-row:hover { background:#faf9fe; }
        .sd-child-init { width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:900; color:#fff; flex-shrink:0; }
        .sd-child-name { font-size:13px; font-weight:800; color:#2d2640; }
        .sd-child-sub  { font-size:11px; color:#aaa; font-weight:600; }
        .sd-checkbox {
          width:20px; height:20px; border-radius:6px; border:2px solid #ddd;
          display:flex; align-items:center; justify-content:center; margin-left:auto;
          flex-shrink:0; transition:all 0.15s; background:#fff;
        }
        .sd-checkbox.checked { background:#4caf50; border-color:#4caf50; }
        .sd-save-btn { padding:12px 28px; background:linear-gradient(135deg,#4caf50,#2e7d32); color:#fff; border:none; border-radius:12px; font-size:14px; font-weight:800; cursor:pointer; font-family:'Nunito',sans-serif; margin-top:16px; transition:all 0.18s; }
        .sd-save-btn:disabled { opacity:0.65; cursor:not-allowed; }
        .sd-saved { display:inline-flex; align-items:center; gap:6px; background:#edfaf4; color:#1a7a4a; border-radius:10px; padding:8px 16px; font-size:13px; font-weight:800; margin-top:16px; }
        .sd-empty { padding:28px; text-align:center; color:#ccc; font-weight:700; font-size:13px; }
        @media(max-width:600px) { .sd { padding:20px 14px; } .sd-detail-grid { grid-template-columns:1fr; } }
      `}</style>

      <div className="sd">
        <Link to="/facilitator/sessions" className="sd-back">← Back to Sessions</Link>

        {/* Session info */}
        <div className="sd-info">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#2d2640", marginBottom: 6 }}>{session.title || "Session"}</div>
              <span className="sd-badge" style={{ background: gc.bg, color: gc.color }}>{gc.label}</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 900, color: gc.color }}>
              {new Date(session.date).toLocaleDateString("en-KE", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
          <div className="sd-detail-grid">
            {session.bookTitle && (
              <div className="sd-detail-item"><label>Book</label><p>📖 {session.bookTitle}{session.bookAuthor ? ` — ${session.bookAuthor}` : ""}</p></div>
            )}
            {session.activityDescription && (
              <div className="sd-detail-item"><label>Activity</label><p>{session.activityDescription}</p></div>
            )}
            {session.facilitatorNotes && (
              <div className="sd-detail-item" style={{ gridColumn: "1 / -1" }}><label>Facilitator Notes</label><p>{session.facilitatorNotes}</p></div>
            )}
          </div>
        </div>

        {/* Attendance */}
        <div className="sd-att-card">
          <div className="sd-att-header">
            <div className="sd-att-title">Attendance Checklist</div>
            <div className="sd-att-count">✓ {presentCount} / {enrolled.length} present</div>
          </div>
          {enrolled.length === 0 ? (
            <div className="sd-empty">No children enrolled in this group yet.</div>
          ) : enrolled.map(c => {
            const ini = c.name?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";
            const checked = !!attendance[c._id];
            return (
              <div key={c._id} className="sd-child-row" onClick={() => toggle(c._id)}>
                <div className="sd-child-init" style={{ background: checked ? "#4caf50" : "#ccc" }}>{ini}</div>
                <div>
                  <div className="sd-child-name">{c.name}</div>
                  <div className="sd-child-sub">{c.bookClub?.school || c.email}</div>
                </div>
                <div className={`sd-checkbox${checked ? " checked" : ""}`}>
                  {checked && <span style={{ color: "#fff", fontSize: 12, fontWeight: 900 }}>✓</span>}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="sd-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save Attendance"}
          </button>
          {saved && <div className="sd-saved">✅ Attendance saved!</div>}
        </div>
      </div>
    </FacilitatorLayout>
  );
}
