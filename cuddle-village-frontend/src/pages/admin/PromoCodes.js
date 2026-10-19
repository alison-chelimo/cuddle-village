import React, { useEffect, useState } from "react";
import API from "../../services/api";
import AdminLayout from "../../components/AdminLayout";
import ConfirmModal from "../../components/ConfirmModal";
import useToast from "../../hooks/useToast";
import Toast from "../../components/Toast";
import Pagination from "../../components/Pagination";
import usePagination from "../../hooks/usePagination";

const EMPTY = {
  code: "", description: "", discountType: "percentage",
  discountValue: "", minOrderAmount: "", maxUsage: "", expiresAt: "",
};

export default function PromoCodes() {
  const { toasts, toast, dismissToast } = useToast();
  const [codes,   setCodes]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  setSaving]  = useState(false);
  const [copied,  setCopied]  = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, code: "" });

  const load = () =>
    API.get("/admin/promo-codes")
      .then(r => setCodes(r.data || []))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.discountValue) return;
    setSaving(true);
    try {
      const res = await API.post("/admin/promo-codes", {
        ...form,
        code:           form.code.trim().toUpperCase(),
        discountValue:  Number(form.discountValue),
        minOrderAmount: Number(form.minOrderAmount) || 0,
        maxUsage:       Number(form.maxUsage) || 0,
        expiresAt:      form.expiresAt || null,
      });
      setCodes(prev => [res.data, ...prev]);
      setForm(EMPTY);
      toast.success(`Promo code "${res.data.code}" created.`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create promo code.");
    }
    setSaving(false);
  };

  const handleToggle = async (c) => {
    try {
      const res = await API.patch(`/admin/promo-codes/${c._id}`);
      setCodes(prev => prev.map(x => x._id === c._id ? res.data : x));
      toast.info(`"${c.code}" ${res.data.isActive ? "activated" : "deactivated"}.`);
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/admin/promo-codes/${deleteConfirm.id}`);
      setCodes(prev => prev.filter(c => c._id !== deleteConfirm.id));
      toast.success(`"${deleteConfirm.code}" deleted.`);
    } catch {
      toast.error("Failed to delete.");
    } finally {
      setDeleteConfirm({ open: false, id: null, code: "" });
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code);
      setTimeout(() => setCopied(null), 1800);
    });
  };

  const isExpired = (expiresAt) => expiresAt && new Date(expiresAt) < new Date();
  const active  = codes.filter(c => c.isActive && !isExpired(c.expiresAt)).length;
  const expired = codes.filter(c => isExpired(c.expiresAt)).length;
  const { page, setPage, totalPages, pageItems } = usePagination(codes, 10);

  return (
    <>
      <Toast toasts={toasts} onDismiss={dismissToast} />
      <AdminLayout>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
          .pc * { font-family:'Nunito',sans-serif; }
          .pc { max-width:100%; }

          /* stats */
          .pc-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:28px; }
          .pc-stat { background:#fff; border-radius:14px; padding:18px 20px; border:1.5px solid #f0eeff; box-shadow:0 2px 12px rgba(175,167,231,0.07); }
          .pc-stat-label { font-size:10px; font-weight:800; color:#aaa; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:5px; }
          .pc-stat-val   { font-size:26px; font-weight:900; }

          /* form card */
          .pc-form-card { background:#fff; border-radius:18px; border:1.5px solid #f0eeff; padding:24px; margin-bottom:24px; box-shadow:0 2px 14px rgba(175,167,231,0.08); }
          .pc-form-title { font-size:16px; font-weight:900; color:#2d2640; margin:0 0 18px; }
          .pc-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
          .pc-label { display:block; font-size:10px; font-weight:800; color:#888; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px; }
          .pc-input, .pc-select {
            width:100%; padding:10px 12px; border:1.5px solid #e8e4f8; border-radius:10px;
            font-size:13px; font-family:'Nunito',sans-serif; font-weight:600; background:#faf9fe;
            box-sizing:border-box; transition:all 0.2s;
          }
          .pc-input:focus, .pc-select:focus { outline:none; border-color:#afa7e7; background:#fff; }
          .pc-input::placeholder { color:#ccc; }
          .pc-input.code-input { text-transform:uppercase; letter-spacing:1px; font-weight:800; font-size:14px; }
          .pc-submit { padding:10px 24px; background:linear-gradient(135deg,#C3B1E1,#afa7e7); color:#fff; border:none; border-radius:10px; font-size:13px; font-weight:800; cursor:pointer; font-family:'Nunito',sans-serif; transition:opacity 0.2s; }
          .pc-submit:disabled { opacity:0.65; cursor:not-allowed; }

          /* table */
          .pc-table-card { background:#fff; border-radius:18px; border:1.5px solid #f0eeff; overflow:hidden; box-shadow:0 2px 14px rgba(175,167,231,0.08); }
          .pc-table { width:100%; border-collapse:collapse; }
          .pc-table th { font-size:10px; font-weight:800; color:#aaa; text-transform:uppercase; letter-spacing:0.5px; padding:0 16px 12px; text-align:left; border-bottom:2px solid #f0eeff; white-space:nowrap; }
          .pc-table td { padding:14px 16px; border-bottom:1px solid #f5f3ff; font-size:13px; font-weight:600; color:#2d2640; vertical-align:middle; }
          .pc-table tr:last-child td { border-bottom:none; }
          .pc-table tr:hover td { background:#faf9fe; }
          .pc-code-cell { display:flex; align-items:center; gap:8px; }
          .pc-code-text { font-weight:900; font-size:13px; font-family:monospace; letter-spacing:1px; color:#2d2640; }
          .pc-copy-btn { background:#f0eeff; border:none; border-radius:6px; padding:3px 8px; font-size:11px; font-weight:800; color:#8b7fd4; cursor:pointer; font-family:'Nunito',sans-serif; transition:all 0.15s; }
          .pc-copy-btn:hover { background:#ede9f8; }
          .pc-discount-badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:900; }
          .pc-status-toggle { padding:5px 12px; border-radius:20px; border:1.5px solid; font-size:11px; font-weight:800; cursor:pointer; font-family:'Nunito',sans-serif; transition:all 0.15s; }
          .pc-del-btn { padding:5px 12px; background:#fff3f3; color:#c0392b; border:none; border-radius:8px; font-size:11px; font-weight:800; cursor:pointer; font-family:'Nunito',sans-serif; }
          .pc-del-btn:hover { background:#fde8e8; }
          .pc-expired-badge { display:inline-block; padding:2px 8px; background:#fff3f3; color:#c0392b; border-radius:20px; font-size:10px; font-weight:900; }
          .pc-empty { padding:40px; text-align:center; color:#ccc; font-weight:700; }

          @media(max-width:900px) { .pc-grid { grid-template-columns:1fr 1fr; } .pc-stats { grid-template-columns:1fr 1fr; } }
          @media(max-width:600px) { .pc-grid { grid-template-columns:1fr; } .pc-stats { grid-template-columns:1fr; } }
        `}</style>

        <div className="pc">
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "#2d2640", margin: "0 0 4px" }}>Promo Codes</h1>
            <p style={{ fontSize: 13, color: "#aaa", margin: 0, fontWeight: 600 }}>Create and manage discount codes for customers</p>
          </div>

          {/* Stats */}
          <div className="pc-stats">
            {[
              { label: "Total Codes",    val: codes.length,   color: "#2d2640" },
              { label: "Active",         val: active,         color: "#1a7a4a" },
              { label: "Expired",        val: expired,        color: "#c0392b" },
            ].map(s => (
              <div className="pc-stat" key={s.label}>
                <div className="pc-stat-label">{s.label}</div>
                <div className="pc-stat-val" style={{ color: s.color }}>{loading ? "…" : s.val}</div>
              </div>
            ))}
          </div>

          {/* Create form */}
          <div className="pc-form-card">
            <div className="pc-form-title">➕ Create New Promo Code</div>
            <form onSubmit={handleCreate}>
              <div className="pc-grid">
                <div>
                  <label className="pc-label">Code *</label>
                  <input
                    className="pc-input code-input"
                    placeholder="e.g. CUDDLE20"
                    value={form.code}
                    onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase().replace(/\s/g, "") }))}
                    required
                  />
                </div>
                <div>
                  <label className="pc-label">Discount Type *</label>
                  <select className="pc-select" value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (KES)</option>
                  </select>
                </div>
                <div>
                  <label className="pc-label">Discount Value *</label>
                  <input
                    className="pc-input"
                    type="number"
                    min="1"
                    max={form.discountType === "percentage" ? 100 : undefined}
                    placeholder={form.discountType === "percentage" ? "e.g. 20 (= 20%)" : "e.g. 500 (KES)"}
                    value={form.discountValue}
                    onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="pc-label">Min Order (KES)</label>
                  <input
                    className="pc-input"
                    type="number"
                    min="0"
                    placeholder="0 = no minimum"
                    value={form.minOrderAmount}
                    onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="pc-label">Max Uses</label>
                  <input
                    className="pc-input"
                    type="number"
                    min="0"
                    placeholder="0 = unlimited"
                    value={form.maxUsage}
                    onChange={e => setForm(f => ({ ...f, maxUsage: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="pc-label">Expiry Date</label>
                  <input
                    className="pc-input"
                    type="date"
                    value={form.expiresAt}
                    onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <label className="pc-label">Description (optional)</label>
                <input
                  className="pc-input"
                  placeholder="e.g. 20% off for returning customers"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div style={{ marginTop: 14 }}>
                <button type="submit" className="pc-submit" disabled={saving || !form.code.trim() || !form.discountValue}>
                  {saving ? "Creating…" : "Create Promo Code"}
                </button>
              </div>
            </form>
          </div>

          {/* Codes table */}
          <div className="pc-table-card">
            {loading ? (
              <div className="pc-empty">Loading…</div>
            ) : codes.length === 0 ? (
              <div className="pc-empty">No promo codes yet. Create one above.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="pc-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Discount</th>
                      <th>Min Order</th>
                      <th>Usage</th>
                      <th>Expiry</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map(c => {
                      const exp = isExpired(c.expiresAt);
                      return (
                        <tr key={c._id}>
                          <td>
                            <div className="pc-code-cell">
                              <span className="pc-code-text">{c.code}</span>
                              <button className="pc-copy-btn" onClick={() => copyCode(c.code)}>
                                {copied === c.code ? "✅" : "Copy"}
                              </button>
                            </div>
                            {c.description && <div style={{ fontSize: 11, color: "#aaa", fontWeight: 600, marginTop: 2 }}>{c.description}</div>}
                          </td>
                          <td>
                            <span className="pc-discount-badge" style={{
                              background: c.discountType === "percentage" ? "#f0eeff" : "#edfaf4",
                              color:      c.discountType === "percentage" ? "#8b7fd4" : "#1a7a4a",
                            }}>
                              {c.discountType === "percentage" ? `${c.discountValue}%` : `KES ${c.discountValue.toLocaleString()}`}
                            </span>
                          </td>
                          <td style={{ color: "#888" }}>
                            {c.minOrderAmount > 0 ? `KES ${c.minOrderAmount.toLocaleString()}` : "—"}
                          </td>
                          <td>
                            <span style={{ fontWeight: 800, color: "#2d2640" }}>{c.usageCount}</span>
                            {c.maxUsage > 0 && <span style={{ color: "#aaa", fontWeight: 600 }}> / {c.maxUsage}</span>}
                            {c.maxUsage === 0 && <span style={{ color: "#aaa", fontSize: 11, fontWeight: 600 }}> (unlimited)</span>}
                          </td>
                          <td>
                            {exp ? (
                              <span className="pc-expired-badge">Expired</span>
                            ) : c.expiresAt ? (
                              <span style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>
                                {new Date(c.expiresAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                            ) : (
                              <span style={{ color: "#aaa", fontSize: 12 }}>No expiry</span>
                            )}
                          </td>
                          <td>
                            <button
                              className="pc-status-toggle"
                              style={{
                                background: c.isActive && !exp ? "#edfaf4" : "#fff3f3",
                                color:      c.isActive && !exp ? "#1a7a4a" : "#c0392b",
                                borderColor: c.isActive && !exp ? "#34c77b55" : "#e8a0a055",
                              }}
                              onClick={() => handleToggle(c)}
                            >
                              {c.isActive ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td>
                            <button className="pc-del-btn" onClick={() => setDeleteConfirm({ open: true, id: c._id, code: c.code })}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </div>
            )}
          </div>
        </div>
      </AdminLayout>

      <ConfirmModal
        isOpen={deleteConfirm.open}
        title="Delete Promo Code?"
        message={`"${deleteConfirm.code}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ open: false, id: null, code: "" })}
        danger
      />
    </>
  );
}
