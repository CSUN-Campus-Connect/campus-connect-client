"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { useAdminAuth, hasPermission } from "@/lib/useAdminAuth";

interface Analytics {
  users: { total: number; newThisMonth: number; newThisWeek: number; byType: Record<string, number> };
  content: { posts: number; clubs: number; events: number };
  marketplace: { totalListings: number; activeListings: number };
}

export default function AdminDashboard() {
  const { permissions } = useAdminAuth();
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasPermission(permissions, "analytics:view")) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    api.get("/api/v1/admin/analytics/overview", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [permissions]);

  return (
    <div>
      <h1 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "8px" }}>
        dashboard
      </h1>
      <p style={{ fontSize: "13px", color: "#666", marginBottom: "40px" }}>
        platform overview
      </p>

      {loading ? (
        <div style={{ color: "#444", fontSize: "13px" }}>loading...</div>
      ) : !data ? (
        <div style={{ color: "#444", fontSize: "13px" }}>
          {hasPermission(permissions, "analytics:view")
            ? "failed to load analytics"
            : "you don't have analytics permissions"}
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            marginBottom: "40px",
          }}>
            <StatCard label="total users" value={data.users.total} />
            <StatCard label="new this week" value={data.users.newThisWeek} accent />
            <StatCard label="new this month" value={data.users.newThisMonth} />
            <StatCard label="total posts" value={data.content.posts} />
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
            marginBottom: "40px",
          }}>
            <StatCard label="clubs" value={data.content.clubs} />
            <StatCard label="events" value={data.content.events} />
            <StatCard label="active listings" value={data.marketplace.activeListings} />
          </div>

          {/* User breakdown */}
          <div style={{
            border: "1px solid #1a1a1a",
            padding: "20px",
            marginBottom: "24px",
          }}>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "16px", letterSpacing: "1px" }}>
              USERS BY TYPE
            </div>
            <div style={{ display: "flex", gap: "32px" }}>
              {Object.entries(data.users.byType).map(([type, count]) => (
                <div key={type}>
                  <div style={{ fontSize: "24px", fontWeight: 600 }}>{count}</div>
                  <div style={{ fontSize: "12px", color: "#666" }}>{type}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
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