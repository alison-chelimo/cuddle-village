import React, { useEffect, useState } from "react";
import API from "../../services/api";
import AdminLayout from "../../components/AdminLayout";

const TIER_COLORS = {
  Bronze:   { color: "#b8860b", bg: "#fffbeb" },
  Silver:   { color: "#555",    bg: "#f5f5f5" },
  Gold:     { color: "#d4a017", bg: "#fff9eb" },
  Platinum: { color: "#6b5fc7", bg: "#f5f2ff" },
};

function Users() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    API.get("/admin/users")
      .then(res => setUsers(res.data))
      .finally(() => setLoading(false));
  }, []);

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    await API.delete(`/admin/users/${id}`);
    setUsers(prev => prev.filter(u => u._id !== id));
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
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
        .role-pill { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 900; }
        .delete-btn { padding: 6px 14px; border-radius: 10px; border: none; background: #fff3f3; color: #c0392b; font-size: 12px; font-weight: 800; cursor: pointer; font-family: 'Nunito', sans-serif; transition: background 0.2s; }
        .delete-btn:hover { background: #fde8e8; }
      `}</style>

      <div className="users-wrap">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "#2d2640", margin: "0 0 4px" }}>Users</h1>
            <p style={{ fontSize: 13, color: "#aaa", margin: 0, fontWeight: 600 }}>{users.length} registered accounts</p>
          </div>
          <input
            placeholder="Search name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: "10px 14px", borderRadius: 12, border: "1.5px solid #e8e4f8", fontSize: 13, fontFamily: "Nunito, sans-serif", fontWeight: 600, background: "#faf9fe", width: 220 }}
          />
        </div>

        <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 4px 20px rgba(175,167,231,0.1)", border: "1.5px solid #f0eeff", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#aaa", fontWeight: 700 }}>Loading users…</div>
          ) : (
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
                {filtered.map(u => {
                  const tc = TIER_COLORS[u.loyaltyTier] || TIER_COLORS.Bronze;
                  return (
                    <tr key={u._id}>
                      <td style={{ fontWeight: 700 }}>{u.name || "—"}</td>
                      <td style={{ color: "#888" }}>{u.email}</td>
                      <td>
                        <span className="role-pill" style={{
                          background: u.role === "admin" ? "#f0eeff" : "#f3fae8",
                          color:      u.role === "admin" ? "#8b7fd4" : "#3a7d44",
                        }}>
                          {u.role}
                        </span>
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
                        <button className="delete-btn" onClick={() => deleteUser(u._id)}>Delete</button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: "center", color: "#aaa", padding: 32 }}>No users found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default Users;
