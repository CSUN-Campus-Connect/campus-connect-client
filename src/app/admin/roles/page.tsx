// ============================================================================
// FILE: src/app/admin/roles/page.tsx
// ============================================================================
// Copy everything below until the next FILE marker

"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { adminTheme as t } from "../theme";

interface Role { id: string; name: string; description: string | null; isSystem: boolean; permissions: string[]; userCount: number; createdAt: string; }

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchRoles = async () => {
    try { const res = await api.get("/api/v1/admin/roles", { headers }); setRoles(res.data); } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchRoles(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete role "${name}"?`)) return;
    try { await api.delete(`/api/v1/admin/roles/${id}`, { headers }); fetchRoles(); } catch {}
  };

  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: 600, color: t.textPrimary, marginBottom: "4px" }}>Roles</h1>
      <p style={{ fontSize: "13px", color: t.textMuted, marginBottom: "28px" }}>{roles.length} configured</p>
      {loading ? <div style={{ color: t.textLight, fontSize: "13px" }}>loading...</div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {roles.map((r) => (
            <div key={r.id} style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "8px", padding: "14px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ fontSize: "14px", fontWeight: 500, color: t.textPrimary }}>{r.name}</span>
                    {r.isSystem && <span style={t.badge(t.info, t.infoBg, t.infoBorder)}>system</span>}
                    <span style={{ fontSize: "11px", color: t.textLight }}>{r.userCount} users</span>
                  </div>
                  {r.description && <div style={{ fontSize: "12px", color: t.textMuted, marginTop: "2px" }}>{r.description}</div>}
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button onClick={() => setExpanded(expanded === r.id ? null : r.id)} style={{ ...t.btnSecondary, fontSize: "11px", fontFamily: t.font }}>{expanded === r.id ? "hide" : "permissions"}</button>
                  {!r.isSystem && <button onClick={() => handleDelete(r.id, r.name)} style={{ ...t.btnDanger, fontFamily: t.font }}>delete</button>}
                </div>
              </div>
              {expanded === r.id && (
                <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {r.permissions.map((p) => (<span key={p} style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "3px", background: t.bgAccent, color: t.accent, border: `1px solid ${t.accentBorder}` }}>{p}</span>))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}