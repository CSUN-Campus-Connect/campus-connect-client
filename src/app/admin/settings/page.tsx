"use client";
// src/app/admin/settings/page.tsx
import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { adminTheme as t } from "../theme";

interface Config { id: string; key: string; value: any; updatedBy: string | null; updatedAt: string; }
interface Announcement { id: string; title: string; body: string; type: string; isActive: boolean; audience: string; startsAt: string; endsAt: string | null; createdAt: string; author: { id: string; firstName: string; lastName: string }; }

const TYPE_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  INFO: { color: "#3b7dd8", bg: "#f0f5ff", border: "#b3d1ff" },
  WARNING: { color: "#b08800", bg: "#fef9ec", border: "#f0dca0" },
  CRITICAL: { color: "#c94150", bg: "#fef2f3", border: "#f5c6cb" },
  MAINTENANCE: { color: "#888", bg: "#f5f5f5", border: "#e0e0e0" },
};

export default function SettingsAdminPage() {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");
  const [annType, setAnnType] = useState("INFO");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = async () => { setLoading(true); try { const [c, a] = await Promise.all([api.get("/api/v1/admin/config", { headers }), api.get("/api/v1/admin/announcements", { headers })]); setConfigs(c.data); setAnnouncements(a.data); } catch {} setLoading(false); };
  useEffect(() => { fetchAll(); }, []);

  const handleAddConfig = async (e: React.FormEvent) => { e.preventDefault(); if (!newKey) return; try { let parsed; try { parsed = JSON.parse(newValue); } catch { parsed = newValue; } await api.post("/api/v1/admin/config", { key: newKey, value: parsed }, { headers }); setNewKey(""); setNewValue(""); fetchAll(); } catch {} };
  const handleCreateAnn = async (e: React.FormEvent) => { e.preventDefault(); if (!annTitle || !annBody) return; try { await api.post("/api/v1/admin/announcements", { title: annTitle, body: annBody, type: annType }, { headers }); setAnnTitle(""); setAnnBody(""); fetchAll(); } catch {} };
  const handleDeleteAnn = async (id: string) => { try { await api.delete(`/api/v1/admin/announcements/${id}`, { headers }); fetchAll(); } catch {} };

  if (loading) return <div style={{ color: t.textLight, fontSize: "13px" }}>loading...</div>;

  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: 600, color: t.textPrimary, marginBottom: "4px" }}>Settings</h1>
      <p style={{ fontSize: "13px", color: t.textMuted, marginBottom: "28px" }}>platform configuration</p>

      <div style={{ marginBottom: "36px" }}>
        <div style={{ fontSize: "11px", color: t.textLight, fontWeight: 500, letterSpacing: "0.5px", marginBottom: "12px" }}>FEATURE FLAGS & CONFIG</div>
        {configs.length > 0 && (
          <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "8px", overflow: "hidden", marginBottom: "12px" }}>
            {configs.map((c) => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 18px", borderBottom: `1px solid ${t.border}`, fontSize: "13px" }}>
                <div><span style={{ color: t.textPrimary, fontWeight: 500 }}>{c.key}</span><span style={{ color: t.textMuted, marginLeft: "12px" }}>{JSON.stringify(c.value)}</span></div>
                <span style={{ fontSize: "11px", color: t.textLight }}>{new Date(c.updatedAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={handleAddConfig} style={{ display: "flex", gap: "8px" }}>
          <input type="text" value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="key" style={{ ...t.input, width: "200px", fontFamily: t.font }} />
          <input type="text" value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="value" style={{ ...t.input, width: "200px", fontFamily: t.font }} />
          <button type="submit" style={{ ...t.btnPrimary, fontFamily: t.font }}>set</button>
        </form>
      </div>

      <div>
        <div style={{ fontSize: "11px", color: t.textLight, fontWeight: 500, letterSpacing: "0.5px", marginBottom: "12px" }}>ANNOUNCEMENTS</div>
        {announcements.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            {announcements.map((a) => {
              const tc = TYPE_COLORS[a.type] || TYPE_COLORS.INFO;
              return (
                <div key={a.id} style={{ padding: "14px 18px", background: t.bgCard, border: `1px solid ${t.border}`, borderLeft: `3px solid ${tc.color}`, borderRadius: "6px", marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "4px" }}>
                      <span style={t.badge(tc.color, tc.bg, tc.border)}>{a.type}</span>
                      <span style={t.badge(t.textMuted, t.bgCard, t.borderDark)}>{a.audience}</span>
                    </div>
                    <div style={{ fontSize: "14px", color: t.textPrimary, fontWeight: 500, marginBottom: "2px" }}>{a.title}</div>
                    <div style={{ fontSize: "12px", color: t.textSecondary }}>{a.body}</div>
                    <div style={{ fontSize: "11px", color: t.textLight, marginTop: "6px" }}>by {a.author.firstName} {a.author.lastName} · {new Date(a.createdAt).toLocaleDateString()}</div>
                  </div>
                  <button onClick={() => handleDeleteAnn(a.id)} style={{ ...t.btnDanger, fontFamily: t.font, whiteSpace: "nowrap" }}>remove</button>
                </div>
              );
            })}
          </div>
        )}
        <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "8px", padding: "16px 18px" }}>
          <div style={{ fontSize: "12px", color: t.textSecondary, marginBottom: "12px" }}>Create announcement</div>
          <form onSubmit={handleCreateAnn} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <input type="text" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} placeholder="title" style={{ ...t.input, flex: 1, fontFamily: t.font }} />
              <select value={annType} onChange={(e) => setAnnType(e.target.value)} style={{ ...t.select, fontFamily: t.font }}>
                <option value="INFO">info</option><option value="WARNING">warning</option><option value="CRITICAL">critical</option><option value="MAINTENANCE">maintenance</option>
              </select>
            </div>
            <textarea value={annBody} onChange={(e) => setAnnBody(e.target.value)} placeholder="announcement body..." style={{ ...t.input, resize: "vertical" as const, minHeight: "60px", fontFamily: t.font }} />
            <button type="submit" style={{ ...t.btnPrimary, fontFamily: t.font, alignSelf: "flex-start" }}>publish</button>
          </form>
        </div>
      </div>
    </div>
  );
}