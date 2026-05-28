import React, { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import API from "../../services/api";
import AdminLayout from "../../components/AdminLayout";
import ConfirmModal from "../../components/ConfirmModal";
import useToast from "../../hooks/useToast";
import Toast from "../../components/Toast";
import { SkeletonTable } from "../../components/Skeleton";
import Pagination from "../../components/Pagination";
import usePagination from "../../hooks/usePagination";

const TIER_COLORS = {
  Bronze:   { color: "#b8860b", bg: "#fffbeb" },
  Silver:   { color: "#555",    bg: "#f5f5f5" },
  Gold:     { color: "#d4a017", bg: "#fff9eb" },
  Platinum: { color: "#6b5fc7", bg: "#f5f2ff" },
};

const ROLE_COLORS = {
  admin:       { color: "#8b7fd4", bg: "#f0eeff" },
  facilitator: { color: "#1a7a4a", bg: "#edfaf4" },
  user:        { color: "#555",    bg: "#f5f5f5" },
};

const EMPTY_CREATE = { name: "", email: "", password: "", role: "user", phone: "" };

function Users() {
  const { toasts, toast, dismissToast } = useToast();
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, userId: null, userName: "" });

  // Create user modal
  const [createOpen, setCreateOpen]   = useState(false);
  const [createForm, setCreateForm]   = useState(EMPTY_CREATE);
  const [creating, setCreating]       = useState(false);
  const [showPw, setShowPw]           = useState(false);

  useEffect(() => {
    API.get("/admin/users")
      .then(res => setUsers(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    const prev = users.find(u => u._id === userId)?.role;
    setUsers(us => us.map(u => u._id === userId ? { ...u, role: newRole } : u));
    try {
      await API.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success(`Role updated to ${newRole}.`);
    } catch (err) {
      setUsers(us => us.map(u => u._id === userId ? { ...u, role: prev } : u));
      toast.error(err.response?.data?.message || "Failed to update role.");
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await API.delete(`/admin/users/${deleteConfirm.userId}`);
      setUsers(prev => prev.filter(u => u._id !== deleteConfirm.userId));
      toast.success("User deleted.");
    } catch (err) {
      toast.error("Failed to delete user.");
    } finally {
      setDeleteConfirm({ open: false, userId: null, userName: "" });
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await API.post("/admin/users", createForm);
      const newUser = { ...res.data.user, loyaltyPoints: 0, loyaltyTier: "Bronze" };
      setUsers(prev => [newUser, ...prev]);
      toast.success(`Account created for ${newUser.name}.`);
      setCreateForm(EMPTY_CREATE);
      setCreateOpen(false);
      setShowPw(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create user.");
    } finally {
      setCreating(false);
    }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const { page, setPage, totalPages, pageItems } = usePagination(filtered, 10);

  return (
    <>
      <Toast toasts={toasts} onDismiss={dismissToast} />
      <AdminLayout>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
          .users-wrap * { font-family: 'Nunito', sans-serif; }
          .users-table { width: 100%; border-collapse: collapse; }
          .users-table th { font-size: 11px; font-weight: 800; color: #aaa; text-transform: uppercase; letter-spacing: 0.5px; padding: 0 16px 12px; text-align: left; border-bottom: 2px solid #f0eeff; }
          .users-table td { padding: 14px 16px; border-bottom: 1px solid #f5f3ff; font-size: 14px; font-weight: 600; color: #2d2640; vertical-align: middle; }
          .users-table tr:last-child td { border-bottom: none; }
          .users-table tr:hover td { background: #faf9fe; }
          .tier-pill { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 900; }
          .delete-btn { padding: 6px 14px; border-radius: 10px; border: none; background: #fff3f3; color: #c0392b; font-size: 12px; font-weight: 800; cursor: pointer; font-family: 'Nunito', sans-serif; transition: background 0.2s; }
          .delete-btn:hover { background: #fde8e8; }

          .role-select {
            padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 900;
            border: 1.5px solid #e8e4f8; cursor: pointer; font-family: 'Nunito', sans-serif;
            transition: all 0.2s; background: #f5f5f5; appearance: none; -webkit-appearance: none;
            padding-right: 20px;
          }
          .role-select:focus { outline: none; border-color: #afa7e7; }

          .create-user-btn {
            padding: 10px 18px; background: linear-gradient(135deg,#C3B1E1,#afa7e7);
            color: #fff; border: none; border-radius: 12px; font-size: 13px;
            font-weight: 800; cursor: pointer; font-family: 'Nunito', sans-serif;
            transition: all 0.2s; white-space: nowrap;
          }
          .create-user-btn:hover { opacity: 0.9; transform: translateY(-1px); }

          /* Create User Modal */
          .cu-backdrop {
            position: fixed; inset: 0; background: rgba(0,0,0,0.4);
            z-index: 200; display: flex; align-items: center; justify-content: center;
            padding: 20px;
          }
          .cu-modal {
            background: #fff; border-radius: 20px; padding: 32px;
            width: 100%; max-width: 440px;
            box-shadow: 0 24px 60px rgba(45,38,64,0.25);
            animation: cuSlide 0.22s ease;
          }
          @keyframes cuSlide { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          .cu-title { font-size: 20px; font-weight: 900; color: #2d2640; margin: 0 0 20px; }
          .cu-field { margin-bottom: 14px; }
          .cu-label { display: block; font-size: 11px; font-weight: 800; color: #888; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; }
          .cu-input {
            width: 100%; padding: 11px 14px; border: 1.5px solid #e8e4f8; border-radius: 12px;
            font-size: 14px; font-family: 'Nunito', sans-serif; font-weight: 600;
            color: #2d2640; background: #faf9fe; box-sizing: border-box; transition: all 0.2s;
          }
          .cu-input:focus { outline: none; border-color: #afa7e7; background: #fff; box-shadow: 0 0 0 3px rgba(175,167,231,0.12); }
          .cu-input::placeholder { color: #ccc; }
          .cu-pw-wrap { position: relative; }
          .cu-pw-wrap .cu-input { padding-right: 44px; }
          .cu-eye { position: absolute; right: 13px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #bbb; padding: 0; display: flex; align-items: center; }
          .cu-eye:hover { color: #8b7fd4; }
          .cu-actions { display: flex; gap: 10px; margin-top: 20px; }
          .cu-submit {
            flex: 1; padding: 12px; background: linear-gradient(135deg,#C3B1E1,#afa7e7);
            color: #fff; border: none; border-radius: 12px; font-size: 14px;
            font-weight: 800; cursor: pointer; font-family: 'Nunito', sans-serif; transition: opacity 0.2s;
          }
          .cu-submit:disabled { opacity: 0.65; cursor: not-allowed; }
          .cu-cancel {
            flex: 1; padding: 12px; background: #f5f3ff; color: #8b7fd4;
            border: 1.5px solid #e8e4f8; border-radius: 12px; font-size: 14px;
            font-weight: 800; cursor: pointer; font-family: 'Nunito', sans-serif;
          }
          .cu-cancel:hover { background: #ede9f8; }
        `}</style>

        <div className="users-wrap">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: "#2d2640", margin: "0 0 4px" }}>Users</h1>
              <p style={{ fontSize: 13, color: "#aaa", margin: 0, fontWeight: 600 }}>{users.length} registered accounts</p>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <input
                placeholder="Search name or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ padding: "10px 14px", borderRadius: 12, border: "1.5px solid #e8e4f8", fontSize: 13, fontFamily: "Nunito, sans-serif", fontWeight: 600, background: "#faf9fe", width: 220 }}
              />
              <button className="create-user-btn" onClick={() => setCreateOpen(true)}>
                ➕ Create User
              </button>
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 4px 20px rgba(175,167,231,0.1)", border: "1.5px solid #f0eeff", overflow: "hidden" }}>
            {loading ? (
              <table className="users-table"><tbody><SkeletonTable rows={6} cols={6} /></tbody></table>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Points</th>
                      <th>Tier</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map(u => {
                      const tc = TIER_COLORS[u.loyaltyTier] || TIER_COLORS.Bronze;
                      const rc = ROLE_COLORS[u.role] || ROLE_COLORS.user;
                      return (
                        <tr key={u._id}>
                          <td style={{ fontWeight: 700 }}>{u.name || "—"}</td>
                          <td style={{ color: "#888" }}>{u.email}</td>
                          <td>
                            <select
                              className="role-select"
                              value={u.role}
                              onChange={e => handleRoleChange(u._id, e.target.value)}
                              style={{ background: rc.bg, color: rc.color, borderColor: rc.bg }}
                            >
                              <option value="user">user</option>
                              <option value="facilitator">facilitator</option>
                              <option value="admin">admin</option>
                            </select>
                          </td>
                          <td style={{ fontWeight: 800, color: "#2d2640" }}>
                            {(u.loyaltyPoints || 0).toLocaleString()}
                          </td>
                          <td>
                            <span className="tier-pill" style={{ background: tc.bg, color: tc.color }}>
                              {u.loyaltyTier || "Bronze"}
                            </span>
                          </td>
                          <td>
                            <button
                              className="delete-btn"
                              onClick={() => setDeleteConfirm({ open: true, userId: u._id, userName: u.name || u.email })}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {pageItems.length === 0 && (
                      <tr><td colSpan={6} style={{ textAlign: "center", color: "#aaa", padding: 32 }}>No users found</td></tr>
                    )}
                  </tbody>
                </table>
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </div>
            )}
          </div>
        </div>
      </AdminLayout>

      {/* Create User Modal */}
      {createOpen && (
        <div className="cu-backdrop" onClick={e => { if (e.target === e.currentTarget) { setCreateOpen(false); setCreateForm(EMPTY_CREATE); } }}>
          <div className="cu-modal" role="dialog" aria-modal="true">
            <div className="cu-title">Create New Account</div>
            <form onSubmit={handleCreateSubmit}>
              <div className="cu-field">
                <label className="cu-label">Full Name</label>
                <input className="cu-input" placeholder="Jane Doe" value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="cu-field">
                <label className="cu-label">Email Address</label>
                <input className="cu-input" type="email" placeholder="jane@example.com" value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="cu-field">
                <label className="cu-label">Password</label>
                <div className="cu-pw-wrap">
                  <input className="cu-input" type={showPw ? "text" : "password"} placeholder="Min 8 characters" value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} required minLength={8} />
                  <button type="button" className="cu-eye" onClick={() => setShowPw(p => !p)} tabIndex={-1}>
                    {showPw ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                  </button>
                </div>
              </div>
              <div className="cu-field">
                <label className="cu-label">Role</label>
                <select className="cu-input" value={createForm.role} onChange={e => setCreateForm(f => ({ ...f, role: e.target.value }))} style={{ cursor: "pointer" }}>
                  <option value="user">Customer (user)</option>
                  <option value="facilitator">Facilitator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="cu-field">
                <label className="cu-label">Phone (optional)</label>
                <input className="cu-input" placeholder="07XX XXX XXX" value={createForm.phone} onChange={e => setCreateForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="cu-actions">
                <button type="button" className="cu-cancel" onClick={() => { setCreateOpen(false); setCreateForm(EMPTY_CREATE); setShowPw(false); }}>Cancel</button>
                <button type="submit" className="cu-submit" disabled={creating}>{creating ? "Creating…" : "Create Account"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirm.open}
        title="Delete User?"
        message={`"${deleteConfirm.userName}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete User"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, userId: null, userName: "" })}
        danger
      />
    </>
  );
}

export default Users;
