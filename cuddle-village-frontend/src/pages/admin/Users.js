import React, { useEffect, useState } from "react";
import API from "../../services/api";
import AdminLayout from "../../components/AdminLayout";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    setDeletingId(id);
    try {
      await API.delete(`/admin/users/${id}`);
      await fetchUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  const admins = users.filter((u) => u.role === "admin").length;
  const customers = users.filter((u) => u.role !== "admin").length;

  const getRoleStyle = (role) =>
    role === "admin"
      ? { bg: "#f0edff", color: "#8b7fd4", border: "#e8e4f8", dot: "#afa7e7" }
      : { bg: "#edfaf4", color: "#1a7a4a", border: "#34c77b55", dot: "#34c77b" };

  const getInitials = (name) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?";

  const avatarColors = [
    ["#f0edff", "#8b7fd4"], ["#edfaf4", "#1a7a4a"], ["#eff8ff", "#1a6fa8"],
    ["#fff8ec", "#d48a0a"], ["#f3fae8", "#5a8a1a"], ["#fff3f3", "#c0392b"],
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .users-wrap * { font-family: 'Nunito', sans-serif; }

        .users-table-row { transition: background 0.15s; }
        .users-table-row:hover { background: #f5f2ff !important; }

        .btn-delete {
          border: none; border-radius: 8px; padding: 7px 14px;
          font-size: 12px; font-weight: 800; cursor: pointer;
          font-family: 'Nunito', sans-serif; transition: all 0.2s;
          white-space: nowrap; background: #fff3f3; color: #c0392b;
          border: 1.5px solid #e8a0a055;
        }
        .btn-delete:hover:not(:disabled) { background: #e87070; color: #fff; transform: translateY(-1px); }
        .btn-delete:disabled { opacity: 0.5; cursor: not-allowed; }

        .search-input {
          padding: 11px 16px 11px 40px; border: 1.5px solid #e8e4f8;
          border-radius: 12px; font-size: 14px; color: #2d2640;
          font-family: 'Nunito', sans-serif; font-weight: 600;
          background: #faf9fe; transition: all 0.2s; width: 240px;
        }
        .search-input:focus {
          outline: none; border-color: #afa7e7; background: #fff;
          box-shadow: 0 0 0 3px rgba(175,167,231,0.12);
        }
        .search-input::placeholder { color: #ccc; }

        .stat-mini {
          background: #fff; border-radius: 16px; padding: 20px 24px;
          border: 1.5px solid #f0edff; box-shadow: 0 4px 16px rgba(175,167,231,0.1);
          display: flex; align-items: center; gap: 14px;
        }
        .stat-mini-icon {
          width: 42px; height: 42px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; flex-shrink: 0;
        }

        /* ── Mobile card view ── */
        .user-card {
          background: #fff; border-radius: 16px; padding: 18px 20px;
          border: 1.5px solid #f0edff; box-shadow: 0 2px 12px rgba(175,167,231,0.08);
          display: flex; align-items: center; gap: 14px;
        }

        @media (max-width: 768px) {
          .users-table-wrap { display: none !important; }
          .users-cards-wrap { display: flex !important; }
          .stats-mini-grid { grid-template-columns: 1fr 1fr !important; }
          .users-toolbar { flex-direction: column !important; align-items: stretch !important; gap: 12px !important; }
          .search-input { width: 100% !important; box-sizing: border-box; }
        }
        @media (min-width: 769px) {
          .users-cards-wrap { display: none !important; }
        }
      `}</style>

      <AdminLayout>
        <div className="users-wrap">

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "#f0edff", border: "1.5px solid #e8e4f8",
              borderRadius: 20, padding: "6px 14px",
              fontSize: 12, fontWeight: 700, color: "#8b7fd4",
              marginBottom: 10, letterSpacing: "0.5px",
            }}>
              👥 User Management
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: "#2d2640", margin: "0 0 6px" }}>
              All Users
            </h1>
            <p style={{ fontSize: 14, color: "#888", margin: 0, fontWeight: 600 }}>
              Manage your store's registered users
            </p>
          </div>

          {/* Mini stats */}
          <div className="stats-mini-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 16, marginBottom: 28,
          }}>
            {[
              { icon: "👥", label: "Total Users",  value: users.length,  bg: "#f0edff", color: "#8b7fd4" },
              { icon: "🛡️", label: "Admins",       value: admins,        bg: "#fff8ec", color: "#d48a0a" },
              { icon: "🛒", label: "Customers",    value: customers,     bg: "#edfaf4", color: "#1a7a4a" },
            ].map((s) => (
              <div className="stat-mini" key={s.label}>
                <div className="stat-mini-icon" style={{ background: s.bg }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Table card */}
          <div style={{
            background: "#fff", borderRadius: 20,
            border: "1.5px solid #f0edff",
            boxShadow: "0 4px 20px rgba(175,167,231,0.1)",
            overflow: "hidden",
          }}>
            {/* Toolbar */}
            <div className="users-toolbar" style={{
              padding: "20px 24px", borderBottom: "1.5px solid #f0edff",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
            }}>
              <div style={{ position: "relative", flex: 1, maxWidth: 300 }}>
                <span style={{
                  position: "absolute", left: 14, top: "50%",
                  transform: "translateY(-50%)", fontSize: 15, pointerEvents: "none",
                }}>🔍</span>
                <input
                  className="search-input"
                  style={{ width: "100%", boxSizing: "border-box" }}
                  placeholder="Search users…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <span style={{
                background: "#f0edff", color: "#8b7fd4", fontSize: 12, fontWeight: 700,
                padding: "5px 12px", borderRadius: 20, border: "1.5px solid #e8e4f8",
                whiteSpace: "nowrap", flexShrink: 0,
              }}>
                {filtered.length} total
              </span>
            </div>

            {loading ? (
              <div style={{ padding: 60, textAlign: "center", color: "#afa7e7", fontWeight: 700 }}>
                Loading users…
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 60, textAlign: "center", color: "#bbb", fontWeight: 700 }}>
                {search ? "No users match your search" : "No users found"}
              </div>
            ) : (
              <>
                {/* ── Desktop table ── */}
                <div className="users-table-wrap">
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#faf9fe" }}>
                        {["User", "Email", "Role", "Actions"].map((h) => (
                          <th key={h} style={{
                            padding: "12px 20px", textAlign: "left", fontSize: 11,
                            fontWeight: 800, color: "#aaa", textTransform: "uppercase",
                            letterSpacing: "0.8px", borderBottom: "1.5px solid #f0edff",
                            whiteSpace: "nowrap",
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((u, i) => {
                        const role = getRoleStyle(u.role);
                        const [avatarBg, avatarColor] = avatarColors[i % avatarColors.length];
                        return (
                          <tr key={u._id} className="users-table-row"
                            style={{ background: i % 2 === 0 ? "#fff" : "#fdfcff" }}>
                            <td style={{ padding: "14px 20px", borderBottom: "1px solid #f5f3ff" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{
                                  width: 38, height: 38, borderRadius: "50%",
                                  background: avatarBg, color: avatarColor,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: 13, fontWeight: 900, flexShrink: 0,
                                  border: `1.5px solid ${avatarColor}33`,
                                }}>
                                  {getInitials(u.name)}
                                </div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: "#2d2640" }}>
                                  {u.name || "—"}
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 600, color: "#666", borderBottom: "1px solid #f5f3ff" }}>
                              {u.email}
                            </td>
                            <td style={{ padding: "14px 20px", borderBottom: "1px solid #f5f3ff" }}>
                              <span style={{
                                display: "inline-flex", alignItems: "center", gap: 6,
                                background: role.bg, color: role.color,
                                border: `1.5px solid ${role.border}`,
                                borderRadius: 20, padding: "5px 12px",
                                fontSize: 12, fontWeight: 800,
                              }}>
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: role.dot, display: "inline-block" }} />
                                {u.role?.charAt(0).toUpperCase() + u.role?.slice(1)}
                              </span>
                            </td>
                            <td style={{ padding: "14px 20px", borderBottom: "1px solid #f5f3ff" }}>
                              <button
                                className="btn-delete"
                                disabled={deletingId === u._id}
                                onClick={() => deleteUser(u._id)}
                              >
                                🗑️ Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ── Mobile cards ── */}
                <div className="users-cards-wrap" style={{ flexDirection: "column", gap: 12, padding: 16 }}>
                  {filtered.map((u, i) => {
                    const role = getRoleStyle(u.role);
                    const [avatarBg, avatarColor] = avatarColors[i % avatarColors.length];
                    return (
                      <div className="user-card" key={u._id}>
                        <div style={{
                          width: 44, height: 44, borderRadius: "50%",
                          background: avatarBg, color: avatarColor,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 15, fontWeight: 900, flexShrink: 0,
                          border: `1.5px solid ${avatarColor}33`,
                        }}>
                          {getInitials(u.name)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: "#2d2640", marginBottom: 2 }}>
                            {u.name || "—"}
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#aaa", marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {u.email}
                          </div>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            background: role.bg, color: role.color,
                            border: `1.5px solid ${role.border}`,
                            borderRadius: 20, padding: "3px 10px",
                            fontSize: 11, fontWeight: 800,
                          }}>
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: role.dot, display: "inline-block" }} />
                            {u.role?.charAt(0).toUpperCase() + u.role?.slice(1)}
                          </span>
                        </div>
                        <button
                          className="btn-delete"
                          disabled={deletingId === u._id}
                          onClick={() => deleteUser(u._id)}
                          style={{ flexShrink: 0 }}
                        >
                          🗑️
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

        </div>
      </AdminLayout>
    </>
  );
}

export default Users;