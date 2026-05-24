import React, { useEffect, useState } from "react";
import API from "../../services/api";
import AdminLayout from "../../components/AdminLayout";

const GROUP_OPTS = ["early-learners", "growing-readers"];
const CONTENT_TYPES = ["book", "activity", "milestone"];

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: "10px 20px", border: "none", borderRadius: 10, cursor: "pointer",
      fontFamily: "Nunito, sans-serif", fontSize: 13, fontWeight: 800,
      background: active ? "linear-gradient(135deg,#C3B1E1,#afa7e7)" : "#f0eeff",
      color: active ? "#fff" : "#8b7fd4", transition: "all 0.2s",
    }}>{children}</button>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

const INPUT = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e8e4f8", fontSize: 13, fontFamily: "Nunito, sans-serif", fontWeight: 600, background: "#faf9fe", boxSizing: "border-box" };
const SELECT = { ...INPUT, cursor: "pointer" };
const CARD  = { background: "#fff", borderRadius: 18, padding: "24px", border: "1.5px solid #f0eeff", boxShadow: "0 2px 12px rgba(175,167,231,0.08)", marginBottom: 16 };
const BTN_PRIMARY = { padding: "10px 20px", background: "linear-gradient(135deg,#C3B1E1,#afa7e7)", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "Nunito, sans-serif" };
const BTN_DANGER  = { padding: "6px 14px", background: "#fff3f3", color: "#c0392b", border: "none", borderRadius: 8, fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: "Nunito, sans-serif" };
const BTN_OUTLINE = { padding: "6px 14px", background: "#f0eeff", color: "#8b7fd4", border: "none", borderRadius: 8, fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: "Nunito, sans-serif" };

// ── Tab 1: Enrolled Children ─────────────────────────────────────────────────
function EnrolledTab() {
  const [children, setChildren]     = useState([]);
  const [groupFilter, setGroup]     = useState("");
  const [notesModal, setNotesModal] = useState(null); // { user, notes, skills, booksRead }
  const [saving, setSaving]         = useState(false);

  useEffect(() => {
    API.get("/portal/admin/enrolled").then(r => setChildren(r.data)).catch(() => {});
  }, []);

  const filtered = groupFilter ? children.filter(c => c.bookClub?.group === groupFilter) : children;

  const openNotes = (u) => setNotesModal({
    userId: u._id,
    name: u.name,
    notes:     u.bookClub?.notes    || "",
    skills:    (u.bookClub?.skills || []).map(s => s.name).join(", "),
    booksRead: (u.bookClub?.booksRead || []).map(b => b.title).join(", "),
  });

  const saveNotes = async () => {
    setSaving(true);
    try {
      const skillsArr    = notesModal.skills.split(",").map(s => s.trim()).filter(Boolean).map(name => ({ name }));
      const booksArr     = notesModal.booksRead.split(",").map(t => t.trim()).filter(Boolean).map(title => ({ title }));
      await API.put(`/portal/admin/children/${notesModal.userId}`, { notes: notesModal.notes, skills: skillsArr, booksRead: booksArr });
      setChildren(prev => prev.map(c => c._id === notesModal.userId
        ? { ...c, bookClub: { ...c.bookClub, notes: notesModal.notes, skills: skillsArr, booksRead: booksArr } }
        : c
      ));
      setNotesModal(null);
    } catch { /* silent */ }
    setSaving(false);
  };

  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => setGroup("")}   style={{ ...BTN_OUTLINE, background: !groupFilter ? "#afa7e7" : "#f0eeff", color: !groupFilter ? "#fff" : "#8b7fd4" }}>All</button>
        <button onClick={() => setGroup("early-learners")}   style={{ ...BTN_OUTLINE, background: groupFilter === "early-learners"   ? "#afa7e7" : "#f0eeff", color: groupFilter === "early-learners"   ? "#fff" : "#8b7fd4" }}>Early Learners</button>
        <button onClick={() => setGroup("growing-readers")}  style={{ ...BTN_OUTLINE, background: groupFilter === "growing-readers"  ? "#afa7e7" : "#f0eeff", color: groupFilter === "growing-readers"  ? "#fff" : "#8b7fd4" }}>Growing Readers</button>
        <span style={{ marginLeft: "auto", fontSize: 13, fontWeight: 700, color: "#aaa", display: "flex", alignItems: "center" }}>{filtered.length} child{filtered.length !== 1 ? "ren" : ""}</span>
      </div>

      <div style={CARD}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ fontSize: 11, fontWeight: 800, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              <th style={{ padding: "0 12px 12px", textAlign: "left", borderBottom: "2px solid #f0eeff" }}>Child</th>
              <th style={{ padding: "0 12px 12px", textAlign: "left", borderBottom: "2px solid #f0eeff" }}>Parent</th>
              <th style={{ padding: "0 12px 12px", textAlign: "left", borderBottom: "2px solid #f0eeff" }}>Group</th>
              <th style={{ padding: "0 12px 12px", textAlign: "left", borderBottom: "2px solid #f0eeff" }}>Sessions</th>
              <th style={{ padding: "0 12px 12px", borderBottom: "2px solid #f0eeff" }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u._id} style={{ fontSize: 13, fontWeight: 600 }}>
                <td style={{ padding: "13px 12px", borderBottom: "1px solid #f5f3ff" }}>
                  <div style={{ fontWeight: 800, color: "#2d2640" }}>{u.bookClub?.childName || "—"}</div>
                  <div style={{ fontSize: 11, color: "#aaa" }}>Age {u.bookClub?.childAge || "?"} · {u.bookClub?.schedule || "—"}</div>
                </td>
                <td style={{ padding: "13px 12px", borderBottom: "1px solid #f5f3ff", color: "#555" }}>{u.name}<br /><span style={{ fontSize: 11, color: "#aaa" }}>{u.email}</span></td>
                <td style={{ padding: "13px 12px", borderBottom: "1px solid #f5f3ff" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 20, background: u.bookClub?.group === "early-learners" ? "#fffbeb" : "#f0f6ff", color: u.bookClub?.group === "early-learners" ? "#b8860b" : "#1a6fa8" }}>
                    {u.bookClub?.group || "—"}
                  </span>
                </td>
                <td style={{ padding: "13px 12px", borderBottom: "1px solid #f5f3ff", fontWeight: 800, color: "#2d2640" }}>{u.bookClub?.sessionsAttended?.length || 0}</td>
                <td style={{ padding: "13px 12px", borderBottom: "1px solid #f5f3ff" }}>
                  <button style={BTN_OUTLINE} onClick={() => openNotes(u)}>Notes</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: "#aaa", fontWeight: 700 }}>No enrolled children</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Notes modal */}
      {notesModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <h3 style={{ margin: "0 0 20px", fontFamily: "Nunito", fontWeight: 900, color: "#2d2640" }}>Update: {notesModal.name}</h3>
            <Field label="Facilitator Note">
              <textarea value={notesModal.notes} onChange={e => setNotesModal(m => ({ ...m, notes: e.target.value }))} rows={3} style={{ ...INPUT, resize: "vertical" }} placeholder="Enter a note visible to the parent…" />
            </Field>
            <Field label="Skills (comma-separated)">
              <input value={notesModal.skills} onChange={e => setNotesModal(m => ({ ...m, skills: e.target.value }))} style={INPUT} placeholder="e.g. Reading Fluency, Comprehension" />
            </Field>
            <Field label="Books Read (comma-separated titles)">
              <input value={notesModal.booksRead} onChange={e => setNotesModal(m => ({ ...m, booksRead: e.target.value }))} style={INPUT} placeholder="e.g. Charlotte's Web, Matilda" />
            </Field>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button style={BTN_PRIMARY} onClick={saveNotes} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
              <button style={BTN_OUTLINE} onClick={() => setNotesModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Tab 2: Sessions ──────────────────────────────────────────────────────────
function SessionsTab() {
  const [sessions,    setSessions]    = useState([]);
  const [enrolled,    setEnrolled]    = useState([]);
  const [showForm,    setShowForm]    = useState(false);
  const [attendModal, setAttendModal] = useState(null);
  const [form, setForm] = useState({ date: "", group: "early-learners", title: "", bookTitle: "", bookAuthor: "", activityDescription: "", facilitatorNotes: "" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    API.get("/portal/admin/sessions").then(r => setSessions(r.data)).catch(() => {});
    API.get("/portal/admin/enrolled").then(r => setEnrolled(r.data)).catch(() => {});
  };
  useEffect(load, []);

  const createSession = async () => {
    setSaving(true);
    try { await API.post("/portal/admin/sessions", form); load(); setShowForm(false); setForm({ date: "", group: "early-learners", title: "", bookTitle: "", bookAuthor: "", activityDescription: "", facilitatorNotes: "" }); }
    catch { /* silent */ }
    setSaving(false);
  };

  const toggleAttend = async (sessionId, userId, attended) => {
    await API.post(`/portal/admin/sessions/${sessionId}/attendance`, { userId, attended });
    load();
  };

  const groupChildren = (group) => enrolled.filter(u => u.bookClub?.group === group);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button style={BTN_PRIMARY} onClick={() => setShowForm(f => !f)}>
          {showForm ? "Cancel" : "+ New Session"}
        </button>
      </div>

      {showForm && (
        <div style={{ ...CARD, borderColor: "#afa7e7" }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: "#2d2640", marginBottom: 16 }}>New Session</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Date"><input type="datetime-local" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={INPUT} /></Field>
            <Field label="Group"><select value={form.group} onChange={e => setForm(f => ({ ...f, group: e.target.value }))} style={SELECT}>{GROUP_OPTS.map(g => <option key={g} value={g}>{g}</option>)}</select></Field>
            <Field label="Session Title"><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={INPUT} placeholder="e.g. Week 3 – Caterpillar" /></Field>
            <Field label="Book Title"><input value={form.bookTitle} onChange={e => setForm(f => ({ ...f, bookTitle: e.target.value }))} style={INPUT} placeholder="Book title" /></Field>
            <Field label="Author"><input value={form.bookAuthor} onChange={e => setForm(f => ({ ...f, bookAuthor: e.target.value }))} style={INPUT} placeholder="Author name" /></Field>
          </div>
          <Field label="Activity Description">
            <textarea value={form.activityDescription} onChange={e => setForm(f => ({ ...f, activityDescription: e.target.value }))} rows={2} style={{ ...INPUT, resize: "vertical" }} />
          </Field>
          <Field label="Facilitator Notes">
            <textarea value={form.facilitatorNotes} onChange={e => setForm(f => ({ ...f, facilitatorNotes: e.target.value }))} rows={2} style={{ ...INPUT, resize: "vertical" }} />
          </Field>
          <button style={BTN_PRIMARY} onClick={createSession} disabled={saving}>{saving ? "Creating…" : "Create Session"}</button>
        </div>
      )}

      {sessions.map(s => (
        <div style={CARD} key={s._id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div>
              <div style={{ fontWeight: 900, color: "#2d2640", fontSize: 15 }}>{s.title || "Session"}</div>
              <div style={{ fontSize: 12, color: "#aaa", fontWeight: 600, marginTop: 2 }}>
                {new Date(s.date).toLocaleDateString("en-KE", { weekday: "short", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                {" · "}
                <span style={{ color: s.group === "early-learners" ? "#b8860b" : "#1a6fa8" }}>{s.group}</span>
              </div>
              {s.bookTitle && <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>📖 {s.bookTitle}{s.bookAuthor ? ` — ${s.bookAuthor}` : ""}</div>}
            </div>
            <button style={BTN_OUTLINE} onClick={() => setAttendModal(s)}>
              Attendance ({s.attendees?.length || 0})
            </button>
          </div>
        </div>
      ))}

      {sessions.length === 0 && (
        <div style={{ ...CARD, textAlign: "center", color: "#aaa", padding: 40 }}>No sessions yet. Create one above.</div>
      )}

      {/* Attendance modal */}
      {attendModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth: 480, maxHeight: "80vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <h3 style={{ margin: "0 0 6px", fontFamily: "Nunito", fontWeight: 900, color: "#2d2640" }}>Attendance</h3>
            <div style={{ fontSize: 13, color: "#aaa", fontWeight: 600, marginBottom: 20 }}>{attendModal.title || "Session"} · {attendModal.group}</div>
            {groupChildren(attendModal.group).map(u => {
              const attended = attendModal.attendees?.some(a => (a._id || a).toString() === u._id.toString());
              return (
                <div key={u._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f5f3ff" }}>
                  <div>
                    <div style={{ fontWeight: 800, color: "#2d2640", fontSize: 14 }}>{u.bookClub?.childName || u.name}</div>
                    <div style={{ fontSize: 11, color: "#aaa" }}>{u.name}</div>
                  </div>
                  <button
                    onClick={async () => { await toggleAttend(attendModal._id, u._id, !attended); setAttendModal(prev => ({ ...prev, attendees: attended ? (prev.attendees || []).filter(a => (a._id || a).toString() !== u._id.toString()) : [...(prev.attendees || []), { _id: u._id }] })); }}
                    style={{ padding: "7px 16px", borderRadius: 10, border: "none", fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: "Nunito, sans-serif", background: attended ? "#f0fdf4" : "#f0eeff", color: attended ? "#16a34a" : "#8b7fd4" }}
                  >
                    {attended ? "✓ Present" : "Mark Present"}
                  </button>
                </div>
              );
            })}
            {groupChildren(attendModal.group).length === 0 && <p style={{ color: "#aaa", fontSize: 13 }}>No enrolled children in this group.</p>}
            <button style={{ ...BTN_OUTLINE, marginTop: 20 }} onClick={() => setAttendModal(null)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}

// ── Tab 3: Hub Content ───────────────────────────────────────────────────────
function HubContentTab() {
  const [items,   setItems]   = useState([]);
  const [showForm, setForm]   = useState(false);
  const [editItem, setEdit]   = useState(null);
  const [form, setFormData]   = useState({ group: "early-learners", contentType: "book", title: "", author: "", emoji: "", tag: "", description: "", weekLabel: "", order: 0 });
  const [saving, setSaving]   = useState(false);

  const load = () => API.get("/portal/admin/hub-content").then(r => setItems(r.data)).catch(() => {});
  useEffect(load, []);

  const openAdd  = () => { setEdit(null); setFormData({ group: "early-learners", contentType: "book", title: "", author: "", emoji: "", tag: "", description: "", weekLabel: "", order: 0 }); setForm(true); };
  const openEdit = (item) => { setEdit(item); setFormData({ ...item }); setForm(true); };

  const save = async () => {
    setSaving(true);
    try {
      if (editItem) await API.put(`/portal/admin/hub-content/${editItem._id}`, form);
      else          await API.post("/portal/admin/hub-content", form);
      load(); setForm(false);
    } catch { /* silent */ }
    setSaving(false);
  };

  const deactivate = async (id) => {
    await API.delete(`/portal/admin/hub-content/${id}`);
    setItems(prev => prev.filter(i => i._id !== id));
  };

  const f = (label, field, type = "text", opts = null) => (
    <Field label={label}>
      {opts
        ? <select value={form[field]} onChange={e => setFormData(d => ({ ...d, [field]: e.target.value }))} style={SELECT}>{opts.map(o => <option key={o} value={o}>{o}</option>)}</select>
        : <input type={type} value={form[field]} onChange={e => setFormData(d => ({ ...d, [field]: e.target.value }))} style={INPUT} />
      }
    </Field>
  );

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button style={BTN_PRIMARY} onClick={openAdd}>+ Add Content</button>
      </div>

      {showForm && (
        <div style={{ ...CARD, borderColor: "#afa7e7" }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: "#2d2640", marginBottom: 16 }}>{editItem ? "Edit Content" : "New Content"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {f("Group", "group", "text", GROUP_OPTS)}
            {f("Type", "contentType", "text", CONTENT_TYPES)}
            {f("Title", "title")}
            {f("Author (books)", "author")}
            {f("Emoji", "emoji")}
            {f("Tag", "tag")}
            {f("Week Label (milestones)", "weekLabel")}
            {f("Order", "order", "number")}
          </div>
          <Field label="Description">
            <textarea value={form.description} onChange={e => setFormData(d => ({ ...d, description: e.target.value }))} rows={2} style={{ ...INPUT, resize: "vertical" }} />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={BTN_PRIMARY} onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
            <button style={BTN_OUTLINE} onClick={() => setForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {["early-learners", "growing-readers"].map(group => {
        const groupItems = items.filter(i => i.group === group);
        if (!groupItems.length) return null;
        return (
          <div key={group} style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: group === "early-learners" ? "#b8860b" : "#1a6fa8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>
              {group === "early-learners" ? "🟡 Early Learners" : "🔵 Growing Readers"}
            </div>
            {groupItems.map(item => (
              <div key={item._id} style={{ ...CARD, display: "flex", alignItems: "center", gap: 12, padding: "14px 18px" }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{item.emoji || (item.contentType === "book" ? "📚" : item.contentType === "activity" ? "🎨" : "📍")}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, color: "#2d2640", fontSize: 14 }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: "#aaa", fontWeight: 600 }}>{item.contentType}{item.weekLabel ? ` · ${item.weekLabel}` : ""}{item.tag ? ` · ${item.tag}` : ""}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button style={BTN_OUTLINE} onClick={() => openEdit(item)}>Edit</button>
                  <button style={BTN_DANGER}  onClick={() => deactivate(item._id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {items.length === 0 && (
        <div style={{ ...CARD, textAlign: "center", color: "#aaa", padding: 40 }}>No hub content yet. Add items above.</div>
      )}
    </>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function BookClubAdmin({ noLayout = false }) {
  const [tab, setTab] = useState("children");

  const content = (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .bca-wrap * { font-family: 'Nunito', sans-serif; }
      `}</style>

      <div className="bca-wrap" style={noLayout ? { padding: "32px 24px", background: "#faf9fe", minHeight: "100vh" } : {}}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#2d2640", margin: "0 0 4px" }}>Book Club</h1>
          <p style={{ fontSize: 13, color: "#aaa", margin: 0, fontWeight: 600 }}>Manage enrolled children, sessions, and hub content</p>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          <TabBtn active={tab === "children"} onClick={() => setTab("children")}>👶 Enrolled Children</TabBtn>
          <TabBtn active={tab === "sessions"} onClick={() => setTab("sessions")}>📅 Sessions</TabBtn>
          <TabBtn active={tab === "content"}  onClick={() => setTab("content")}>📚 Hub Content</TabBtn>
        </div>

        {tab === "children" && <EnrolledTab />}
        {tab === "sessions" && <SessionsTab />}
        {tab === "content"  && <HubContentTab />}
      </div>
    </>
  );

  return noLayout ? content : <AdminLayout>{content}</AdminLayout>;
}
