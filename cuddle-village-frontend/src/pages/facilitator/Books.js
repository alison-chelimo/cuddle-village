import React, { useEffect, useState } from "react";
import API from "../../services/api";
import FacilitatorLayout from "../../components/FacilitatorLayout";

const GROUPS = [
  { key: "early-learners",  label: "Early Learners",  bg: "#edfaf4", color: "#1a7a4a" },
  { key: "growing-readers", label: "Growing Readers", bg: "#f0eeff", color: "#6b5fc7" },
];

const EMPTY_FORM = { group: "early-learners", title: "", author: "", tag: "current" };

export default function Books() {
  const [items,    setItems]   = useState([]);
  const [loading,  setLoading] = useState(true);
  const [form,     setForm]    = useState(EMPTY_FORM);
  const [showForm, setShow]    = useState(false);
  const [saving,   setSaving]  = useState(false);

  const load = () =>
    API.get("/portal/admin/hub-content")
      .then(r => setItems((r.data || []).filter(h => h.contentType === "book")))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await API.post("/portal/admin/hub-content", {
        group: form.group, contentType: "book",
        title: form.title, author: form.author,
        tag: form.tag, isActive: true,
      });
      setItems(prev => [...prev, res.data]);
      setForm(EMPTY_FORM);
      setShow(false);
    } catch {}
    setSaving(false);
  };

  const toggleStatus = async (item) => {
    const newTag = item.tag === "current" ? "completed" : "current";
    try {
      await API.put(`/portal/admin/hub-content/${item._id}`, { tag: newTag });
      setItems(prev => prev.map(i => i._id === item._id ? { ...i, tag: newTag } : i));
    } catch {}
  };

  const deactivate = async (item) => {
    try {
      await API.delete(`/portal/admin/hub-content/${item._id}`);
      setItems(prev => prev.filter(i => i._id !== item._id));
    } catch {}
  };

  return (
    <FacilitatorLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .bk * { font-family:'Nunito',sans-serif; }
        .bk { padding:36px 32px; background:#faf9fe; min-height:100vh; }
        .bk-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px; }
        .bk-col-title { font-size:13px; font-weight:900; color:#2d2640; margin:0 0 12px; display:flex; align-items:center; gap:8px; }
        .bk-card { background:#fff; border-radius:16px; border:1.5px solid #f0eeff; overflow:hidden; }
        .bk-card-head { padding:12px 16px; font-size:11px; font-weight:800; color:#aaa; text-transform:uppercase; letter-spacing:0.5px; border-bottom:1.5px solid #f0eeff; background:#faf9fe; }
        .bk-row { padding:13px 16px; border-bottom:1px solid #f5f3ff; display:flex; align-items:center; gap:10px; }
        .bk-row:last-child { border-bottom:none; }
        .bk-title { font-size:13px; font-weight:800; color:#2d2640; }
        .bk-author { font-size:11px; color:#aaa; font-weight:600; }
        .bk-tag { padding:2px 8px; border-radius:20px; font-size:10px; font-weight:900; flex-shrink:0; cursor:pointer; transition:all 0.15s; }
        .bk-remove { background:none; border:none; cursor:pointer; color:#e87070; font-size:14px; padding:0 2px; flex-shrink:0; opacity:0.6; }
        .bk-remove:hover { opacity:1; }
        .bk-empty { padding:24px; text-align:center; color:#ccc; font-weight:700; font-size:13px; }

        /* Add form */
        .bk-form { background:#fff; border-radius:16px; border:1.5px solid #f0eeff; padding:22px; margin-bottom:20px; }
        .bk-form-title { font-size:16px; font-weight:900; color:#2d2640; margin:0 0 16px; }
        .bk-form-row { display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:12px; }
        .bk-label { display:block; font-size:10px; font-weight:800; color:#888; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px; }
        .bk-input, .bk-select { width:100%; padding:9px 12px; border:1.5px solid #e8e4f8; border-radius:10px; font-size:13px; font-family:'Nunito',sans-serif; font-weight:600; background:#faf9fe; box-sizing:border-box; transition:all 0.2s; }
        .bk-input:focus, .bk-select:focus { outline:none; border-color:#4caf50; background:#fff; }
        .bk-add-btn { padding:10px 20px; background:linear-gradient(135deg,#4caf50,#2e7d32); color:#fff; border:none; border-radius:10px; font-size:13px; font-weight:800; cursor:pointer; font-family:'Nunito',sans-serif; align-self:flex-end; }
        .bk-new-btn { padding:10px 18px; background:linear-gradient(135deg,#4caf50,#2e7d32); color:#fff; border:none; border-radius:12px; font-size:13px; font-weight:800; cursor:pointer; font-family:'Nunito',sans-serif; }
        @media(max-width:768px) { .bk { padding:20px 14px; } .bk-grid { grid-template-columns:1fr; } .bk-form-row { grid-template-columns:1fr 1fr; } }
        @media(max-width:480px) { .bk-form-row { grid-template-columns:1fr; } }
      `}</style>

      <div className="bk">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "#2d2640", margin: "0 0 4px" }}>Books</h1>
            <p style={{ fontSize: 13, color: "#aaa", margin: 0, fontWeight: 600 }}>{items.length} books across both groups</p>
          </div>
          <button className="bk-new-btn" onClick={() => setShow(f => !f)}>{showForm ? "✕ Cancel" : "➕ Add Book"}</button>
        </div>

        {showForm && (
          <div className="bk-form">
            <div className="bk-form-title">Add New Book</div>
            <form onSubmit={handleAdd}>
              <div className="bk-form-row">
                <div>
                  <label className="bk-label">Title *</label>
                  <input className="bk-input" placeholder="Book title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                </div>
                <div>
                  <label className="bk-label">Author</label>
                  <input className="bk-input" placeholder="Author name" value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} />
                </div>
                <div>
                  <label className="bk-label">Group *</label>
                  <select className="bk-select" value={form.group} onChange={e => setForm(f => ({ ...f, group: e.target.value }))}>
                    <option value="early-learners">Early Learners</option>
                    <option value="growing-readers">Growing Readers</option>
                  </select>
                </div>
                <div>
                  <label className="bk-label">Status</label>
                  <select className="bk-select" value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}>
                    <option value="current">Current</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
                <button type="submit" className="bk-add-btn" disabled={saving}>{saving ? "Adding…" : "Add Book"}</button>
              </div>
            </form>
          </div>
        )}

        <div className="bk-grid">
          {GROUPS.map(g => {
            const groupBooks  = items.filter(b => b.group === g.key);
            const current     = groupBooks.filter(b => b.tag !== "completed");
            const completed   = groupBooks.filter(b => b.tag === "completed");
            return (
              <div key={g.key}>
                <div className="bk-col-title">
                  <span style={{ background: g.bg, color: g.color, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 900 }}>{g.label}</span>
                  <span style={{ fontSize: 12, color: "#aaa", fontWeight: 600 }}>{groupBooks.length} books</span>
                </div>
                <div className="bk-card">
                  {current.length > 0 && <div className="bk-card-head">📖 Current</div>}
                  {current.map(b => (
                    <div key={b._id} className="bk-row">
                      <div style={{ flex: 1 }}>
                        <div className="bk-title">{b.title}</div>
                        {b.author && <div className="bk-author">{b.author}</div>}
                      </div>
                      <span
                        className="bk-tag"
                        style={{ background: g.bg, color: g.color }}
                        onClick={() => toggleStatus(b)}
                        title="Click to mark as completed"
                      >current</span>
                      <button className="bk-remove" onClick={() => deactivate(b)} title="Remove">✕</button>
                    </div>
                  ))}
                  {completed.length > 0 && <div className="bk-card-head">✅ Completed</div>}
                  {completed.map(b => (
                    <div key={b._id} className="bk-row" style={{ opacity: 0.7 }}>
                      <div style={{ flex: 1 }}>
                        <div className="bk-title" style={{ textDecoration: "line-through" }}>{b.title}</div>
                        {b.author && <div className="bk-author">{b.author}</div>}
                      </div>
                      <span
                        className="bk-tag"
                        style={{ background: "#f5f5f5", color: "#888" }}
                        onClick={() => toggleStatus(b)}
                        title="Click to mark as current"
                      >done</span>
                      <button className="bk-remove" onClick={() => deactivate(b)} title="Remove">✕</button>
                    </div>
                  ))}
                  {groupBooks.length === 0 && <div className="bk-empty">No books added yet</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </FacilitatorLayout>
  );
}
