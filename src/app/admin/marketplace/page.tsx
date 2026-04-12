"use client";
// src/app/admin/marketplace/page.tsx

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";

interface Listing {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  status: string;
  views: number;
  createdAt: string;
  seller: { id: string; firstName: string; lastName: string; email: string };
}

const STATUS_COLORS: Record<string, string> = {
  active: "#2d8a4e",
  sold: "#2d6da3",
  inactive: "#b08800",
  deleted: "#cc0000",
};

export default function MarketplaceAdminPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchListings = async (q = search, status = statusFilter) => {
    setLoading(true);
    try {
      const params: any = { limit: 30 };
      if (q) params.search = q;
      if (status) params.status = status;
      const res = await api.get("/api/v1/admin/marketplace", { headers, params });
      setListings(res.data.listings);
      setTotal(res.data.pagination.total);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchListings(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings(search, statusFilter);
  };

  const handleDelist = async (id: string, title: string) => {
    const reason = prompt(`Delist "${title}"?\n\nEnter a reason (the seller will be notified to fix and relist):`);
    if (reason === null) return;
    try {
      await api.patch(`/api/v1/admin/marketplace/${id}/delist`, { reason }, { headers });
      fetchListings();
    } catch {}
  };

  const handleRemove = async (id: string, title: string) => {
    const reason = prompt(`Remove "${title}"?\n\nEnter a reason (the seller will be notified):`);
    if (reason === null) return;
    try {
      await api.delete(`/api/v1/admin/marketplace/${id}`, { headers, data: { reason } });
      fetchListings();
    } catch {}
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "4px" }}>marketplace</h1>
          <p style={{ fontSize: "13px", color: "#666" }}>{total} listings</p>
        </div>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px" }}>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="search listings..."
            style={{ padding: "6px 12px", background: "#111", border: "1px solid #222", color: "#e5e5e5", fontFamily: "inherit", fontSize: "13px", width: "220px", outline: "none" }} />
          <button type="submit" style={{ padding: "6px 16px", background: "#1a1a1a", border: "1px solid #333", color: "#999", fontFamily: "inherit", fontSize: "13px", cursor: "pointer" }}>search</button>
        </form>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {["", "active", "sold", "inactive", "deleted"].map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); fetchListings(search, s); }}
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
      ) : listings.length === 0 ? (
        <div style={{ color: "#444", fontSize: "13px", textAlign: "center", padding: "40px 0" }}>no listings found</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
              <th style={thStyle}>title</th>
              <th style={thStyle}>price</th>
              <th style={thStyle}>category</th>
              <th style={thStyle}>status</th>
              <th style={thStyle}>views</th>
              <th style={thStyle}>seller</th>
              <th style={thStyle}>posted</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => (
              <tr key={l.id} style={{ borderBottom: "1px solid #111" }}>
                <td style={{ ...tdStyle, color: "#e5e5e5" }}>{l.title}</td>
                <td style={{ ...tdStyle, color: "#999" }}>${l.price.toFixed(2)}</td>
                <td style={tdStyle}><span style={{ fontSize: "11px", padding: "2px 8px", border: "1px solid #222", color: "#888" }}>{l.category}</span></td>
                <td style={tdStyle}><span style={{ fontSize: "11px", padding: "2px 8px", border: `1px solid ${STATUS_COLORS[l.status] || "#333"}`, color: STATUS_COLORS[l.status] || "#666" }}>{l.status}</span></td>
                <td style={{ ...tdStyle, color: "#555" }}>{l.views}</td>
                <td style={{ ...tdStyle, color: "#666" }}>{l.seller.firstName} {l.seller.lastName}</td>
                <td style={{ ...tdStyle, color: "#555" }}>{new Date(l.createdAt).toLocaleDateString()}</td>
                <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                  {l.status === "active" && (
                    <>
                      <button onClick={() => handleDelist(l.id, l.title)} style={{ background: "none", border: "1px solid #332200", color: "#b08800", fontFamily: "inherit", fontSize: "11px", padding: "3px 8px", cursor: "pointer", marginRight: "4px" }}>delist</button>
                      <button onClick={() => handleRemove(l.id, l.title)} style={{ background: "none", border: "1px solid #331111", color: "#cc0000", fontFamily: "inherit", fontSize: "11px", padding: "3px 8px", cursor: "pointer" }}>remove</button>
                    </>
                  )}
                  {l.status === "inactive" && (
                    <button onClick={() => handleRemove(l.id, l.title)} style={{ background: "none", border: "1px solid #331111", color: "#cc0000", fontFamily: "inherit", fontSize: "11px", padding: "3px 8px", cursor: "pointer" }}>remove</button>
                  )}
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