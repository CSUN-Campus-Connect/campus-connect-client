// src/app/admin/analytics/page.tsx
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";

interface Analytics {
  users: { total: number; newThisMonth: number; newThisWeek: number; byType: Record<string, number> };
  content: { posts: number; clubs: number; events: number };
  marketplace: { totalListings: number; activeListings: number };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    api.get("/api/v1/admin/analytics/overview", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: "#444", fontSize: "13px" }}>loading...</div>;
  if (!data) return <div style={{ color: "#444", fontSize: "13px" }}>failed to load analytics</div>;

  return (
    <div>
      <h1 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "4px" }}>analytics</h1>
      <p style={{ fontSize: "13px", color: "#666", marginBottom: "32px" }}>platform metrics</p>

      <div style={{ fontSize: "11px", color: "#555", letterSpacing: "1px", marginBottom: "12px" }}>USERS</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "32px" }}>
        <StatCard label="total" value={data.users.total} />
        <StatCard label="new this week" value={data.users.newThisWeek} accent />
        <StatCard label="new this month" value={data.users.newThisMonth} />
        <StatCard label="user types" value={Object.keys(data.users.byType).length} />
      </div>

      <div style={{
        border: "1px solid #1a1a1a",
        padding: "16px 20px",
        marginBottom: "32px",
      }}>
        <div style={{ fontSize: "11px", color: "#555", letterSpacing: "1px", marginBottom: "12px" }}>BREAKDOWN BY TYPE</div>
        <div style={{ display: "flex", gap: "40px" }}>
          {Object.entries(data.users.byType).map(([type, count]) => {
            const pct = data.users.total > 0 ? Math.round((count / data.users.total) * 100) : 0;
            return (
              <div key={type}>
                <div style={{ fontSize: "28px", fontWeight: 600 }}>{count}</div>
                <div style={{ fontSize: "12px", color: "#666" }}>{type}</div>
                <div style={{ marginTop: "8px", height: "3px", width: "80px", background: "#1a1a1a" }}>
                  <div style={{ height: "3px", width: `${pct}%`, background: "#cc0000" }} />
                </div>
                <div style={{ fontSize: "11px", color: "#444", marginTop: "4px" }}>{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ fontSize: "11px", color: "#555", letterSpacing: "1px", marginBottom: "12px" }}>CONTENT</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "32px" }}>
        <StatCard label="posts" value={data.content.posts} />
        <StatCard label="clubs" value={data.content.clubs} />
        <StatCard label="events" value={data.content.events} />
      </div>

      <div style={{ fontSize: "11px", color: "#555", letterSpacing: "1px", marginBottom: "12px" }}>MARKETPLACE</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "32px" }}>
        <StatCard label="total listings" value={data.marketplace.totalListings} />
        <StatCard label="active listings" value={data.marketplace.activeListings} />
        <StatCard label="sold/inactive" value={data.marketplace.totalListings - data.marketplace.activeListings} />
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div style={{
      border: "1px solid #1a1a1a",
      padding: "16px 20px",
      background: accent ? "#1a0000" : "transparent",
    }}>
      <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>{label}</div>
      <div style={{
        fontSize: "28px",
        fontWeight: 600,
        color: accent ? "#cc0000" : "#e5e5e5",
      }}>
        {value.toLocaleString()}
      </div>
    </div>
  );
}