"use client";
// src/app/admin/marketplace/page.tsx
import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { adminTheme as t } from "../theme";

interface Listing { id: string; title: string; price: number; category: string; condition: string; status: string; views: number; createdAt: string; seller: { id: string; firstName: string; lastName: string; email: string }; }

const STATUS_MAP: Record<string, { color: string; bg: string; border: string }> = {
  active: { color: "#2d8a4e", bg: "#f0faf4", border: "#c3e6cb" },
  sold: { color: "#3b7dd8", bg: "#f0f5ff", border: "#b3d1ff" },
  inactive: { color: "#b08800", bg: "#fef9ec", border: "#f0dca0" },
  deleted: { color: "#c94150", bg: "#fef2f3", border: "#f5c6cb" },
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
    try { const params: any = { limit: 30 }; if (q) params.search = q; if (status) params.status = status; const res = await api.get("/api/v1/admin/marketplace", { headers, params }); setListings(res.data.listings); setTotal(res.data.pagination.total); } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchListings(); }, []);
  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchListings(search, statusFilter); };
  const handleDelist = async (id: string, title: string) => { const reason = prompt(`Delist "${title}"?\n\nReason:`); if (reason === null) return; try { await api.patch(`/api/v1/admin/marketplace/${id}/delist`, { reason }, { headers }); fetchListings(); } catch {} };
  const handleRemove = async (id: string, title: string) => { const reason = prompt(`Remove "${title}"?\n\nReason:`); if (reason === null) return; try { await api.delete(`/api/v1/admin/marketplace/${id}`, { headers, data: { reason } }); fetchListings(); } catch {} };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 600, color: t.textPrimary, marginBottom: "4px" }}>Marketplace</h1>
          <p style={{ fontSize: "13px", color: t.textMuted }}>{total} listings</p>
        </div>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px" }}>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="search listings..." style={{ ...t.input, width: "220px", fontFamily: t.font }} />
          <button type="submit" style={{ ...t.btnSecondary, fontFamily: t.font }}>search</button>
        </form>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {["", "active", "sold", "inactive", "deleted"].map((s) => {
          const sm = STATUS_MAP[s];
          return (<button key={s} onClick={() => { setStatusFilter(s); fetchListings(search, s); }} style={{ padding: "5px 14px", fontSize: "12px", fontFamily: t.font, cursor: "pointer", borderRadius: "5px", background: statusFilter === s ? (sm?.bg || t.bgCard) : t.bgCard, border: `1px solid ${statusFilter === s ? (sm?.border || t.borderDark) : t.border}`, color: sm?.color || t.textMuted }}>{s || "all"}</button>);
        })}
      </div>

      {loading ? <div style={{ color: t.textLight, fontSize: "13px" }}>loading...</div> : listings.length === 0 ? <div style={{ color: t.textLight, fontSize: "13px", textAlign: "center", padding: "40px 0" }}>no listings found</div> : (
        <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "8px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead><tr><th style={t.thStyle}>title</th><th style={t.thStyle}>price</th><th style={t.thStyle}>category</th><th style={t.thStyle}>status</th><th style={t.thStyle}>views</th><th style={t.thStyle}>seller</th><th style={t.thStyle}>posted</th><th style={t.thStyle}></th></tr></thead>
            <tbody>
              {listings.map((l) => {
                const sm = STATUS_MAP[l.status] || { color: t.textMuted, bg: t.bgCard, border: t.borderDark };
                return (
                  <tr key={l.id}>
                    <td style={{ ...t.tdStyle, color: t.textPrimary, fontWeight: 500 }}>{l.title}</td>
                    <td style={{ ...t.tdStyle, color: t.textMuted }}>${l.price.toFixed(2)}</td>
                    <td style={t.tdStyle}><span style={t.badge(t.textSecondary, t.bgCard, t.borderDark)}>{l.category}</span></td>
                    <td style={t.tdStyle}><span style={t.badge(sm.color, sm.bg, sm.border)}>{l.status}</span></td>
                    <td style={{ ...t.tdStyle, color: t.textLight }}>{l.views}</td>
                    <td style={{ ...t.tdStyle, color: t.textMuted }}>{l.seller.firstName} {l.seller.lastName}</td>
                    <td style={{ ...t.tdStyle, color: t.textLight }}>{new Date(l.createdAt).toLocaleDateString()}</td>
                    <td style={{ ...t.tdStyle, whiteSpace: "nowrap" }}>
                      {l.status === "active" && (<><button onClick={() => handleDelist(l.id, l.title)} style={{ ...t.btnWarning, fontFamily: t.font, marginRight: "4px" }}>delist</button><button onClick={() => handleRemove(l.id, l.title)} style={{ ...t.btnDanger, fontFamily: t.font }}>remove</button></>)}
                      {l.status === "inactive" && (<button onClick={() => handleRemove(l.id, l.title)} style={{ ...t.btnDanger, fontFamily: t.font }}>remove</button>)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}