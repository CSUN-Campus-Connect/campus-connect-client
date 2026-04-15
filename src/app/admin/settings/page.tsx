"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";

interface Config {
  id: string;
  key: string;
  value: any;
  updatedBy: string | null;
  updatedAt: string;
}

interface Announcement {
  id: string;
  title: string;
  body: string;
  type: string;
  isActive: boolean;
  audience: string;
  startsAt: string;
  endsAt: string | null;
  createdAt: string;
  author: { id: string; firstName: string; lastName: string };
}

const TYPE_COLORS: Record<string, string> = {
  INFO: "#2d6da3",
  WARNING: "#b08800",
  CRITICAL: "#cc0000",
  MAINTENANCE: "#555",
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

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [configRes, annRes] = await Promise.all([
        api.get("/api/v1/admin/config", { headers }),
        api.get("/api/v1/admin/announcements", { headers }),
      ]);
      setConfigs(configRes.data);
      setAnnouncements(annRes.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAddConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey) return;
    try {
      let parsed;
      try { parsed = JSON.parse(newValue); } catch { parsed = newValue; }
      await api.post("/api/v1/admin/config", { key: newKey, value: parsed }, { headers });
      setNewKey("");
      setNewValue("");
      fetchAll();
    } catch {}
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annBody) return;
    try {
      await api.post("/api/v1/admin/announcements", { title: annTitle, body: annBody, type: annType }, { headers });
      setAnnTitle("");
      setAnnBody("");
      fetchAll();
    } catch {}
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await api.delete(`/api/v1/admin/announcements/${id}`, { headers });
      fetchAll();
    } catch {}
  };

  if (loading) return <div style={{ color: "#444", fontSize: "13px" }}>loading...</div>;

  return (
    <div>
      <h1 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "4px" }}>settings</h1>
      <p style={{ fontSize: "13px", color: "#666", marginBottom: "32px" }}>platform configuration</p>

      {/* System Config */}
      <div style={{ marginBottom: "40px" }}>
        <div style={{ fontSize: "11px", color: "#555", letterSpacing: "1px", marginBottom: "12px" }}>FEATURE FLAGS & CONFIG</div>

        {configs.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            {configs.map((c) => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: "1px solid #111", fontSize: "13px" }}>
                <div>
                  <span style={{ color: "#e5e5e5" }}>{c.key}</span>
                  <span style={{ color: "#555", marginLeft: "12px" }}>{JSON.stringify(c.value)}</span>
                </div>
                <span style={{ fontSize: "11px", color: "#333" }}>{new Date(c.updatedAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAddConfig} style={{ display: "flex", gap: "8px" }}>
          <input type="text" value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="key (e.g. maintenance_mode)"
            style={{ padding: "6px 12px", background: "#111", border: "1px solid #222", color: "#e5e5e5", fontFamily: "inherit", fontSize: "13px", width: "220px", outline: "none" }} />
          <input type="text" value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder='value (e.g. true, "hello", 42)'
            style={{ padding: "6px 12px", background: "#111", border: "1px solid #222", color: "#e5e5e5", fontFamily: "inherit", fontSize: "13px", width: "220px", outline: "none" }} />
          <button type="submit" style={{ padding: "6px 16px", background: "#1a1a1a", border: "1px solid #333", color: "#999", fontFamily: "inherit", fontSize: "13px", cursor: "pointer" }}>set</button>
        </form>
      </div>

      {/* Announcements */}
      <div>
        <div style={{ fontSize: "11px", color: "#555", letterSpacing: "1px", marginBottom: "12px" }}>ANNOUNCEMENTS</div>

        {announcements.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            {announcements.map((a) => (
              <div key={a.id} style={{ padding: "12px 16px", border: "1px solid #1a1a1a", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "10px", padding: "2px 6px", border: `1px solid ${TYPE_COLORS[a.type] || "#333"}`, color: TYPE_COLORS[a.type] || "#666" }}>{a.type}</span>
                    <span style={{ fontSize: "10px", padding: "2px 6px", border: "1px solid #222", color: "#666" }}>{a.audience}</span>
                    <span style={{ fontSize: "10px", color: a.isActive ? "#2d8a4e" : "#555" }}>{a.isActive ? "active" : "inactive"}</span>
                  </div>
                  <div style={{ fontSize: "14px", color: "#e5e5e5", marginBottom: "2px" }}>{a.title}</div>
                  <div style={{ fontSize: "12px", color: "#888" }}>{a.body}</div>
                  <div style={{ fontSize: "11px", color: "#444", marginTop: "4px" }}>by {a.author.firstName} {a.author.lastName} · {new Date(a.createdAt).toLocaleDateString()}</div>
                </div>
                <button onClick={() => handleDeleteAnnouncement(a.id)} style={{ background: "none", border: "1px solid #331111", color: "#cc0000", fontFamily: "inherit", fontSize: "11px", padding: "3px 8px", cursor: "pointer", whiteSpace: "nowrap" }}>delete</button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleCreateAnnouncement} style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "500px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <input type="text" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} placeholder="announcement title"
              style={{ flex: 1, padding: "6px 12px", background: "#111", border: "1px solid #222", color: "#e5e5e5", fontFamily: "inherit", fontSize: "13px", outline: "none" }} />
            <select value={annType} onChange={(e) => setAnnType(e.target.value)}
              style={{ padding: "6px 8px", background: "#111", border: "1px solid #222", color: "#999", fontFamily: "inherit", fontSize: "13px" }}>
              <option value="INFO">info</option>
              <option value="WARNING">warning</option>
              <option value="CRITICAL">critical</option>
              <option value="MAINTENANCE">maintenance</option>
            </select>
          </div>
          <textarea value={annBody} onChange={(e) => setAnnBody(e.target.value)} placeholder="announcement body..."
            style={{ padding: "8px 12px", background: "#111", border: "1px solid #222", color: "#e5e5e5", fontFamily: "inherit", fontSize: "13px", resize: "vertical", minHeight: "60px", outline: "none" }} />
          <button type="submit" style={{ padding: "6px 16px", background: "#1a1a1a", border: "1px solid #333", color: "#999", fontFamily: "inherit", fontSize: "13px", cursor: "pointer", alignSelf: "flex-start" }}>create announcement</button>
        </form>
      </div>
    </div>
  );
}