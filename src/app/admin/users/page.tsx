"use client";
// src/app/admin/users/page.tsx

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { useAdminAuth, hasPermission } from "@/lib/useAdminAuth";
import Link from "next/link";

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

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

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

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchUsers = async (page = 1, q = search) => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/admin/users", {
        headers,
        params: { page, limit: 200, search: q },
      });
      setAllUsers(res.data.users);
      applyFilters(res.data.users, typeFilter, verifiedFilter, roleFilter, page);
    } catch {}
    setLoading(false);
  };

  const applyFilters = (source: UserRow[], type: string, verified: string, role: string, page = 1) => {
    let filtered = [...source];

    if (type) {
      filtered = filtered.filter((u) => u.userType === type);
    }
    if (verified === "yes") {
      filtered = filtered.filter((u) => u.isVerified);
    } else if (verified === "no") {
      filtered = filtered.filter((u) => !u.isVerified);
    }
    if (role === "has_role") {
      filtered = filtered.filter((u) => u.roles.length > 0);
    } else if (role === "no_role") {
      filtered = filtered.filter((u) => u.roles.length === 0);
    } else if (role) {
      filtered = filtered.filter((u) => u.roles.some((r) => r.name === role));
    }

    const total = filtered.length;
    const pages = Math.ceil(total / 20);
    const start = (page - 1) * 20;
    const paged = filtered.slice(start, start + 20);

    setUsers(paged);
    setPagination({ page, limit: 20, total, pages });
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1, search);
  };

  const handleTypeFilter = (val: string) => {
    setTypeFilter(val);
    applyFilters(allUsers, val, verifiedFilter, roleFilter, 1);
  };

  const handleVerifiedFilter = (val: string) => {
    setVerifiedFilter(val);
    applyFilters(allUsers, typeFilter, val, roleFilter, 1);
  };

  const handleRoleFilter = (val: string) => {
    setRoleFilter(val);
    applyFilters(allUsers, typeFilter, verifiedFilter, val, 1);
  };

  const clearFilters = () => {
    setTypeFilter("");
    setVerifiedFilter("");
    setRoleFilter("");
    applyFilters(allUsers, "", "", "", 1);
  };

  const hasActiveFilters = typeFilter || verifiedFilter || roleFilter;

  const uniqueRoles = Array.from(new Set(allUsers.flatMap((u) => u.roles.map((r) => r.name)))).sort();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "4px" }}>users</h1>
          <p style={{ fontSize: "13px", color: "#666" }}>{pagination.total} {hasActiveFilters ? "filtered" : "registered"}</p>
        </div>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search by name or email..."
            style={{
              padding: "6px 12px", background: "#111", border: "1px solid #222",
              color: "#e5e5e5", fontFamily: "inherit", fontSize: "13px", width: "280px", outline: "none",
            }}
          />
          <button type="submit" style={{
            padding: "6px 16px", background: "#1a1a1a", border: "1px solid #333",
            color: "#999", fontFamily: "inherit", fontSize: "13px", cursor: "pointer",
          }}>
            search
          </button>
        </form>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", alignItems: "center", flexWrap: "wrap" }}>
        <select value={typeFilter} onChange={(e) => handleTypeFilter(e.target.value)}
          style={selectStyle}>
          <option value="">all types</option>
          <option value="student">student</option>
          <option value="faculty">faculty</option>
          <option value="alumni">alumni</option>
        </select>

        <select value={verifiedFilter} onChange={(e) => handleVerifiedFilter(e.target.value)}
          style={selectStyle}>
          <option value="">all status</option>
          <option value="yes">verified</option>
          <option value="no">unverified</option>
        </select>

        <select value={roleFilter} onChange={(e) => handleRoleFilter(e.target.value)}
          style={selectStyle}>
          <option value="">all roles</option>
          <option value="has_role">has any role</option>
          <option value="no_role">no role</option>
          {uniqueRoles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button onClick={clearFilters} style={{
            padding: "5px 12px", background: "transparent", border: "1px solid #222",
            color: "#555", fontFamily: "inherit", fontSize: "12px", cursor: "pointer",
          }}>
            clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ color: "#444", fontSize: "13px" }}>loading...</div>
      ) : users.length === 0 ? (
        <div style={{ color: "#444", fontSize: "13px", textAlign: "center", padding: "40px 0" }}>
          no users found
        </div>
      ) : (
        <>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                <th style={thStyle}>name</th>
                <th style={thStyle}>email</th>
                <th style={thStyle}>type</th>
                <th style={thStyle}>roles</th>
                <th style={thStyle}>verified</th>
                <th style={thStyle}>joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: "1px solid #111" }}>
                  <td style={tdStyle}>
                    <Link href={`/admin/users/${u.id}`} style={{ color: "#e5e5e5", textDecoration: "none" }}>
                      {u.firstName} {u.lastName}
                    </Link>
                  </td>
                  <td style={{ ...tdStyle, color: "#666" }}>{u.email}</td>
                  <td style={tdStyle}>
                    <span style={{
                      fontSize: "11px", padding: "2px 8px",
                      border: "1px solid #222", color: "#888",
                    }}>
                      {u.userType}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    {u.roles.length > 0 ? u.roles.map((r) => (
                      <span key={r.id} style={{
                        fontSize: "11px", padding: "2px 8px",
                        border: "1px solid #331111", color: "#cc0000", marginRight: "4px",
                      }}>
                        {r.name}
                      </span>
                    )) : <span style={{ color: "#333" }}>—</span>}
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: u.isVerified ? "#2d8a4e" : "#663333" }}>
                      {u.isVerified ? "yes" : "no"}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, color: "#555" }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagination.pages > 1 && (
            <div style={{ display: "flex", gap: "8px", marginTop: "24px", justifyContent: "center" }}>
              {Array.from({ length: Math.min(pagination.pages, 10) }, (_, i) => (
                <button
                  key={i}
                  onClick={() => applyFilters(allUsers, typeFilter, verifiedFilter, roleFilter, i + 1)}
                  style={{
                    padding: "4px 10px",
                    background: pagination.page === i + 1 ? "#1a1a1a" : "transparent",
                    border: "1px solid #222",
                    color: pagination.page === i + 1 ? "#e5e5e5" : "#555",
                    fontFamily: "inherit", fontSize: "12px", cursor: "pointer",
                  }}
                >
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

const selectStyle: React.CSSProperties = {
  padding: "5px 10px",
  background: "#111",
  border: "1px solid #222",
  color: "#999",
  fontFamily: "inherit",
  fontSize: "12px",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 12px",
  color: "#555",
  fontWeight: 500,
  fontSize: "11px",
  letterSpacing: "0.5px",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 12px",
};