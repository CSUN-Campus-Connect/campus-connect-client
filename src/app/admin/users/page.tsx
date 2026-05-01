"use client";
// src/app/admin/users/page.tsx

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { useAdminAuth, hasPermission } from "@/lib/useAdminAuth";
import Link from "next/link";
import { adminTheme as t } from "../theme";

interface UserRow {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  isVerified: boolean;
  createdAt: string;
  lastActiveAt: string | null;
  roles: { id: string; name: string; departmentScope: string | null }[];
}

interface Pagination { page: number; limit: number; total: number; pages: number; }

export default function UsersPage() {
  const { permissions } = useAdminAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [allUsers, setAllUsers] = useState<UserRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [actionMenu, setActionMenu] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchUsers = async (page = 1, q = search) => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/admin/users", { headers, params: { page, limit: 200, search: q } });
      setAllUsers(res.data.users);
      applyFilters(res.data.users, typeFilter, verifiedFilter, roleFilter, page);
    } catch {}
    setLoading(false);
  };

  const applyFilters = (source: UserRow[], type: string, verified: string, role: string, page = 1) => {
    let filtered = [...source];
    if (type) filtered = filtered.filter((u) => u.userType === type);
    if (verified === "yes") filtered = filtered.filter((u) => u.isVerified);
    else if (verified === "no") filtered = filtered.filter((u) => !u.isVerified);
    if (role === "has_role") filtered = filtered.filter((u) => u.roles.length > 0);
    else if (role === "no_role") filtered = filtered.filter((u) => u.roles.length === 0);
    else if (role) filtered = filtered.filter((u) => u.roles.some((r) => r.name === role));
    const total = filtered.length;
    const pages = Math.ceil(total / 20);
    const start = (page - 1) * 20;
    setUsers(filtered.slice(start, start + 20));
    setPagination({ page, limit: 20, total, pages });
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchUsers(1, search); };
  const handleTypeFilter = (val: string) => { setTypeFilter(val); applyFilters(allUsers, val, verifiedFilter, roleFilter, 1); };
  const handleVerifiedFilter = (val: string) => { setVerifiedFilter(val); applyFilters(allUsers, typeFilter, val, roleFilter, 1); };
  const handleRoleFilter = (val: string) => { setRoleFilter(val); applyFilters(allUsers, typeFilter, verifiedFilter, val, 1); };
  const clearFilters = () => { setTypeFilter(""); setVerifiedFilter(""); setRoleFilter(""); applyFilters(allUsers, "", "", "", 1); };

  const handleBan = async (u: UserRow) => {
    const reason = prompt(`Ban ${u.firstName} ${u.lastName}?\n\nEnter reason:`);
    if (reason === null) return;
    try {
      await api.post(`/api/v1/admin/users/${u.id}/suspend`, { reason }, { headers });
      fetchUsers();
    } catch {}
    setActionMenu(null);
  };

  const handleEmail = (u: UserRow) => {
    window.location.href = `mailto:${u.email}`;
    setActionMenu(null);
  };

  const hasActiveFilters = typeFilter || verifiedFilter || roleFilter;
  const uniqueRoles = Array.from(new Set(allUsers.flatMap((u) => u.roles.map((r) => r.name)))).sort();

  return (
    <div onClick={() => setActionMenu(null)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 600, color: t.textPrimary, marginBottom: "4px" }}>Users</h1>
          <p style={{ fontSize: "13px", color: t.textMuted }}>{pagination.total} {hasActiveFilters ? "filtered" : "registered"}</p>
        </div>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px" }}>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="search by name or email..."
            style={{ ...t.input, width: "260px", fontFamily: t.font }} />
          <button type="submit" style={{ ...t.btnSecondary, fontFamily: t.font }}>search</button>
        </form>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", alignItems: "center", flexWrap: "wrap" }}>
        <select value={typeFilter} onChange={(e) => handleTypeFilter(e.target.value)} style={{ ...t.select, fontFamily: t.font }}>
          <option value="">all types</option>
          <option value="student">student</option>
          <option value="faculty">faculty</option>
          <option value="alumni">alumni</option>
        </select>
        <select value={verifiedFilter} onChange={(e) => handleVerifiedFilter(e.target.value)} style={{ ...t.select, fontFamily: t.font }}>
          <option value="">all status</option>
          <option value="yes">verified</option>
          <option value="no">unverified</option>
        </select>
        <select value={roleFilter} onChange={(e) => handleRoleFilter(e.target.value)} style={{ ...t.select, fontFamily: t.font }}>
          <option value="">all roles</option>
          <option value="has_role">has any role</option>
          <option value="no_role">no role</option>
          {uniqueRoles.map((r) => (<option key={r} value={r}>{r}</option>))}
        </select>
        {hasActiveFilters && (
          <button onClick={clearFilters} style={{ ...t.btnSecondary, fontSize: "11px", fontFamily: t.font }}>clear</button>
        )}
      </div>

      {loading ? (
        <div style={{ color: t.textLight, fontSize: "13px" }}>loading...</div>
      ) : users.length === 0 ? (
        <div style={{ color: t.textLight, fontSize: "13px", textAlign: "center", padding: "40px 0" }}>no users found</div>
      ) : (
        <>
          <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "8px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr>
                  <th style={t.thStyle}>name</th>
                  <th style={t.thStyle}>email</th>
                  <th style={t.thStyle}>type</th>
                  <th style={t.thStyle}>roles</th>
                  <th style={t.thStyle}>verified</th>
                  <th style={t.thStyle}>joined</th>
                  <th style={t.thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: `1px solid ${t.border}` }}>
                    <td style={t.tdStyle}>
                      <Link href={`/admin/users/${u.id}`} style={{ color: t.textPrimary, textDecoration: "none", fontWeight: 500 }}>
                        {u.firstName} {u.lastName}
                      </Link>
                    </td>
                    <td style={{ ...t.tdStyle, color: t.textMuted }}>{u.email}</td>
                    <td style={t.tdStyle}>
                      <span style={t.badge(t.textSecondary, t.bgCard, t.borderDark)}>{u.userType}</span>
                    </td>
                    <td style={t.tdStyle}>
                      {u.roles.length > 0 ? u.roles.map((r) => (
                        <span key={r.id} style={{ ...t.badge(t.accent, t.accentBg, t.accentBorder), marginRight: "4px" }}>{r.name}</span>
                      )) : <span style={{ color: t.textLight }}>—</span>}
                    </td>
                    <td style={t.tdStyle}>
                      <span style={{ color: u.isVerified ? t.success : t.accentLight }}>{u.isVerified ? "yes" : "no"}</span>
                    </td>
                    <td style={{ ...t.tdStyle, color: t.textMuted }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td style={{ ...t.tdStyle, position: "relative" }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setActionMenu(actionMenu === u.id ? null : u.id)}
                        style={{ ...t.btnSecondary, fontFamily: t.font, fontSize: "11px", padding: "3px 10px" }}
                      >
                        actions ▾
                      </button>
                      {actionMenu === u.id && (
                        <div style={{
                          position: "absolute", right: 0, top: "100%", zIndex: 20,
                          background: t.bgCard, border: `1px solid ${t.border}`,
                          borderRadius: "6px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                          minWidth: "160px", overflow: "hidden",
                        }}>
                          <Link href={`/admin/users/${u.id}`} style={{ display: "block", padding: "9px 14px", fontSize: "12px", color: t.textPrimary, textDecoration: "none", borderBottom: `1px solid ${t.border}` }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = t.bgHover)}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                            view profile
                          </Link>
                          <button onClick={() => handleEmail(u)} style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 14px", fontSize: "12px", color: t.textPrimary, background: "none", border: "none", borderBottom: `1px solid ${t.border}`, cursor: "pointer", fontFamily: t.font }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = t.bgHover)}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                            send email
                          </button>
                          {hasPermission(permissions, "users:ban") && (
                            <button onClick={() => handleBan(u)} style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 14px", fontSize: "12px", color: t.error, background: "none", border: "none", cursor: "pointer", fontFamily: t.font }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = t.errorBg)}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                              ban user
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div style={{ display: "flex", gap: "6px", marginTop: "20px", justifyContent: "center" }}>
              {Array.from({ length: Math.min(pagination.pages, 10) }, (_, i) => (
                <button key={i} onClick={() => applyFilters(allUsers, typeFilter, verifiedFilter, roleFilter, i + 1)}
                  style={{
                    padding: "4px 10px", borderRadius: "4px", fontSize: "12px", cursor: "pointer", fontFamily: t.font,
                    background: pagination.page === i + 1 ? t.accent : t.bgCard,
                    border: `1px solid ${pagination.page === i + 1 ? t.accent : t.borderDark}`,
                    color: pagination.page === i + 1 ? "#fff" : t.textMuted,
                  }}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}