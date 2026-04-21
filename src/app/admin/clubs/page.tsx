"use client";
// src/app/admin/clubs/page.tsx

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";

interface Club {
  id: string;
  name: string;
  description: string | null;
  category: string;
  isPrivate: boolean;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
  createdBy: { id: string; firstName: string; lastName: string; email: string };
  _count: { members: number; events: number; joinRequests: number };
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#b08800",
  approved: "#2d8a4e",
  rejected: "#cc0000",
};

export default function ClubsAdminPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchClubs = async (p = page, q = search) => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/admin/clubs", { headers, params: { page: p, limit: 20, search: q } });
      let filtered = res.data.clubs;
      if (statusFilter) {
        filtered = filtered.filter((c: Club) => c.status === statusFilter);
      }
      setClubs(filtered);
      setTotal(res.data.pagination.total);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchClubs(); }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchClubs(1, search);
  };

  const handleApprove = async (id: string, name: string) => {
    if (!confirm(`Approve club "${name}"? It will become visible to all students.`)) return;
    try {
      await api.patch(`/api/v1/admin/clubs/${id}/approve`, {}, { headers });
      fetchClubs();
    } catch {}
  };

  const handleReject = async (id: string, name: string) => {
    const reason = prompt(`Reject club "${name}"?\n\nEnter a reason (the creator will be notified):`);
    if (reason === null) return;
    try {
      await api.patch(`/api/v1/admin/clubs/${id}/reject`, { reason }, { headers });
      fetchClubs();
    } catch {}
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete club "${name}"? This removes all memberships and data permanently.`)) return;
    try {
      await api.delete(`/api/v1/admin/clubs/${id}`, { headers });
      fetchClubs();
    } catch {}
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "4px" }}>clubs</h1>
          <p style={{ fontSize: "13px", color: "#666" }}>{total} registered</p>
        </div>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px" }}>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="search clubs..."
            style={{ padding: "6px 12px", background: "#111", border: "1px solid #222", color: "#e5e5e5", fontFamily: "inherit", fontSize: "13px", width: "240px", outline: "none" }} />
          <button type="submit" style={{ padding: "6px 16px", background: "#1a1a1a", border: "1px solid #333", color: "#999", fontFamily: "inherit", fontSize: "13px", cursor: "pointer" }}>search</button>
        </form>
      </div>

      {/* Status filters */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {["", "pending", "approved", "rejected"].map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); }}
            style={{
              padding: "5px 14px", fontSize: "12px", fontFamily: "inherit", cursor: "pointer",
              background: statusFilter === s ? "#1a1a1a" : "transparent",
              border: "1px solid #1a1a1a",
              color: s ? (STATUS_COLORS[s] || "#666") : "#999",
            }}>
            {s || "all"}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: "#444", fontSize: "13px" }}>loading...</div>
      ) : clubs.length === 0 ? (
        <div style={{ color: "#444", fontSize: "13px", textAlign: "center", padding: "40px 0" }}>no clubs found</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
              <th style={thStyle}>name</th>
              <th style={thStyle}>category</th>
              <th style={thStyle}>status</th>
              <th style={thStyle}>members</th>
              <th style={thStyle}>created by</th>
              <th style={thStyle}>created</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {clubs.map((c) => (
              <tr key={c.id} style={{ borderBottom: "1px solid #111" }}>
                <td style={tdStyle}>
                  <span style={{ color: "#e5e5e5" }}>{c.name}</span>
                  {c.isPrivate && <span style={{ fontSize: "10px", color: "#555", marginLeft: "6px" }}>private</span>}
                </td>
                <td style={tdStyle}><span style={{ fontSize: "11px", padding: "2px 8px", border: "1px solid #222", color: "#888" }}>{c.category}</span></td>
                <td style={tdStyle}>
                  <span style={{ fontSize: "11px", padding: "2px 8px", border: `1px solid ${STATUS_COLORS[c.status] || "#333"}`, color: STATUS_COLORS[c.status] || "#666" }}>{c.status}</span>
                  {c.status === "rejected" && c.rejectionReason && (
                    <div style={{ fontSize: "10px", color: "#666", marginTop: "4px" }}>{c.rejectionReason}</div>
                  )}
                </td>
                <td style={{ ...tdStyle, color: "#999" }}>{c._count.members}</td>
                <td style={{ ...tdStyle, color: "#666" }}>{c.createdBy.firstName} {c.createdBy.lastName}</td>
                <td style={{ ...tdStyle, color: "#555" }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                  {c.status === "pending" && (
                    <>
                      <button onClick={() => handleApprove(c.id, c.name)} style={{ background: "none", border: "1px solid #1a3a1a", color: "#2d8a4e", fontFamily: "inherit", fontSize: "11px", padding: "3px 8px", cursor: "pointer", marginRight: "4px" }}>approve</button>
                      <button onClick={() => handleReject(c.id, c.name)} style={{ background: "none", border: "1px solid #331111", color: "#cc0000", fontFamily: "inherit", fontSize: "11px", padding: "3px 8px", cursor: "pointer", marginRight: "4px" }}>reject</button>
                    </>
                  )}
                  <button onClick={() => handleDelete(c.id, c.name)} style={{ background: "none", border: "1px solid #331111", color: "#cc0000", fontFamily: "inherit", fontSize: "11px", padding: "3px 8px", cursor: "pointer" }}>delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = { textAlign: "left", padding: "8px 12px", color: "#555", fontWeight: 500, fontSize: "11px", letterSpacing: "0.5px" };
const tdStyle: React.CSSProperties = { padding: "10px 12px" };