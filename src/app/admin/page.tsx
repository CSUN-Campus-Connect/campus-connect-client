"use client";
// src/app/admin/page.tsx

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";

interface Analytics {
  users: { total: number; newThisMonth: number; newThisWeek: number; byType: Record<string, number> };
  content: { posts: number; clubs: number; events: number };
  marketplace: { totalListings: number; activeListings: number };
}

export default function AdminDashboard() {
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

  if (loading) return <div style={{ color: "#bbb", fontSize: "13px" }}>loading...</div>;
  if (!data) return <div style={{ color: "#bbb", fontSize: "13px" }}>failed to load</div>;

  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#1a1a1a", marginBottom: "4px" }}>Dashboard</h1>
      <p style={{ fontSize: "13px", color: "#999", marginBottom: "28px" }}>platform overview</p>

      <div style={{ fontSize: "11px", color: "#bbb", fontWeight: 500, letterSpacing: "0.5px", marginBottom: "10px" }}>USERS</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "28px" }}>
        <StatCard label="total" value={data.users.total} />
        <StatCard label="new this week" value={data.users.newThisWeek} accent />
        <StatCard label="new this month" value={data.users.newThisMonth} />
        <StatCard label="user types" value={Object.keys(data.users.byType).length} />
      </div>

      <div style={{ fontSize: "11px", color: "#bbb", fontWeight: 500, letterSpacing: "0.5px", marginBottom: "10px" }}>CONTENT</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "28px" }}>
        <StatCard label="posts" value={data.content.posts} />
        <StatCard label="clubs" value={data.content.clubs} />
        <StatCard label="events" value={data.content.events} />
      </div>

      <div style={{ fontSize: "11px", color: "#bbb", fontWeight: 500, letterSpacing: "0.5px", marginBottom: "10px" }}>MARKETPLACE</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
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
      background: accent ? "#fef2f3" : "#fff",
      border: "1px solid #f0f0f0",
      borderRadius: "8px",
      padding: "16px 18px",
    }}>
      <div style={{ fontSize: "12px", color: "#999", marginBottom: "6px" }}>{label}</div>
      <div style={{
        fontSize: "26px",
        fontWeight: 600,
        color: accent ? "#c94150" : "#1a1a1a",
      }}>
        {value.toLocaleString()}
      </div>
    </div>
  );
}