"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  location: string | null;
  source: string | null;
  isPublic: boolean;
  createdAt: string;
  createdBy: { id: string; firstName: string; lastName: string } | null;
  club: { id: string; name: string } | null;
}

export default function EventsAdminPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchEvents = async (q = search) => {
    setLoading(true);
    try {
      const params: any = { limit: 30 };
      if (q) params.search = q;
      const res = await api.get("/api/v1/admin/events", { headers, params });
      setEvents(res.data.events);
      setTotal(res.data.pagination.total);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEvents(search);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete event "${title}"?`)) return;
    try {
      await api.delete(`/api/v1/admin/events/${id}`, { headers });
      fetchEvents();
    } catch {}
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "4px" }}>events</h1>
          <p style={{ fontSize: "13px", color: "#666" }}>{total} total</p>
        </div>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px" }}>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="search events..."
            style={{ padding: "6px 12px", background: "#111", border: "1px solid #222", color: "#e5e5e5", fontFamily: "inherit", fontSize: "13px", width: "240px", outline: "none" }} />
          <button type="submit" style={{ padding: "6px 16px", background: "#1a1a1a", border: "1px solid #333", color: "#999", fontFamily: "inherit", fontSize: "13px", cursor: "pointer" }}>search</button>
        </form>
      </div>

      {loading ? (
        <div style={{ color: "#444", fontSize: "13px" }}>loading...</div>
      ) : events.length === 0 ? (
        <div style={{ color: "#444", fontSize: "13px", textAlign: "center", padding: "40px 0" }}>no events found</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {events.map((e) => {
            const isPast = new Date(e.endDate) < new Date();
            return (
              <div key={e.id} style={{ padding: "12px 16px", border: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center", opacity: isPast ? 0.5 : 1 }}>
                <div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                    {e.source && <span style={{ fontSize: "10px", padding: "2px 6px", border: "1px solid #222", color: "#888" }}>{e.source}</span>}
                    {e.club && <span style={{ fontSize: "10px", padding: "2px 6px", border: "1px solid #222", color: "#666" }}>{e.club.name}</span>}
                    {isPast && <span style={{ fontSize: "10px", color: "#444" }}>past</span>}
                  </div>
                  <div style={{ fontSize: "14px", color: "#e5e5e5", marginBottom: "2px" }}>{e.title}</div>
                  <div style={{ fontSize: "12px", color: "#555" }}>
                    {formatDate(e.startDate)} — {formatDate(e.endDate)}
                    {e.location && <span> · {e.location}</span>}
                  </div>
                </div>
                <button onClick={() => handleDelete(e.id, e.title)} style={{ background: "none", border: "1px solid #331111", color: "#cc0000", fontFamily: "inherit", fontSize: "11px", padding: "3px 8px", cursor: "pointer" }}>delete</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}