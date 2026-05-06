"use client";
// src/app/admin/analytics/page.tsx

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { adminTheme as t } from "../theme";

interface Analytics {
  users: {
    total: number;
    verified: number;
    nonVerified: number;
    newInRange: number;
    newThisWeek: number;
    newThisMonth: number;
    byType: Record<string, number>;
  };
  content: { posts: number; clubs: number; events: number };
  marketplace: { totalListings: number; activeListings: number };
  range: { from: string; to: string };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchAnalytics = async (from?: string, to?: string) => {
    setLoading(true);
    setError(false);
    try {
      const token = localStorage.getItem("token");
      const params: any = {};
      if (from) params.from = from;
      if (to) params.to = to;
      const res = await api.get("/api/v1/admin/analytics/overview", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setData(res.data);
    } catch {
      setError(true);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAnalytics(); }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAnalytics(dateFrom, dateTo);
  };

  const handleClear = () => {
    setDateFrom("");
    setDateTo("");
    fetchAnalytics();
  };

  const hasFilter = dateFrom || dateTo;

  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: 600, color: t.textPrimary, marginBottom: "4px" }}>Analytics</h1>
      <p style={{ fontSize: "13px", color: t.textMuted, marginBottom: "20px" }}>platform metrics</p>

      {/* date filter */}
      <form onSubmit={handleFilter} style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "28px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "12px", color: t.textMuted }}>date range</span>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          style={{ ...t.input, fontSize: "12px", fontFamily: t.font }}
        />
        <span style={{ fontSize: "12px", color: t.textMuted }}>to</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          style={{ ...t.input, fontSize: "12px", fontFamily: t.font }}
        />
        <button type="submit" style={{ ...t.btnPrimary, fontFamily: t.font }}>apply</button>
        {hasFilter && (
          <button type="button" onClick={handleClear} style={{ ...t.btnSecondary, fontFamily: t.font }}>clear</button>
        )}
        {data?.range && (
          <span style={{ fontSize: "11px", color: t.textLight, marginLeft: "4px" }}>
            showing {new Date(data.range.from).toLocaleDateString()} — {new Date(data.range.to).toLocaleDateString()}
          </span>
        )}
      </form>

      {loading ? (
        <div style={{ color: t.textLight, fontSize: "13px" }}>loading...</div>
      ) : error ? (
        <div style={{ color: t.error, fontSize: "13px" }}>failed to load analytics</div>
      ) : !data ? null : (
        <>
          {/* users */}
          <div style={{ fontSize: "11px", color: t.textLight, fontWeight: 500, letterSpacing: "0.5px", marginBottom: "10px" }}>USERS</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "12px" }}>
            <StatCard label="total" value={data.users.total} />
            <StatCard label="new this week" value={data.users.newThisWeek} accent />
            <StatCard label={hasFilter ? "new in range" : "new this month"} value={data.users.newInRange} />
            <StatCard label="user types" value={Object.keys(data.users.byType).length} />
          </div>

          {/* verified vs non-verified */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "28px" }}>
            <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "8px", padding: "16px 18px" }}>
              <div style={{ fontSize: "12px", color: t.textMuted, marginBottom: "6px" }}>verified</div>
              <div style={{ fontSize: "26px", fontWeight: 600, color: t.success }}>{data.users.verified.toLocaleString()}</div>
              <div style={{ marginTop: "8px", height: "4px", background: t.border, borderRadius: "2px" }}>
                <div style={{
                  height: "4px", borderRadius: "2px", background: t.success,
                  width: `${data.users.total > 0 ? Math.round((data.users.verified / data.users.total) * 100) : 0}%`,
                  transition: "width 0.3s",
                }} />
              </div>
              <div style={{ fontSize: "11px", color: t.textLight, marginTop: "4px" }}>
                {data.users.total > 0 ? Math.round((data.users.verified / data.users.total) * 100) : 0}% of total
              </div>
            </div>
            <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "8px", padding: "16px 18px" }}>
              <div style={{ fontSize: "12px", color: t.textMuted, marginBottom: "6px" }}>not verified</div>
              <div style={{ fontSize: "26px", fontWeight: 600, color: t.warning }}>{data.users.nonVerified.toLocaleString()}</div>
              <div style={{ marginTop: "8px", height: "4px", background: t.border, borderRadius: "2px" }}>
                <div style={{
                  height: "4px", borderRadius: "2px", background: t.warningBorder,
                  width: `${data.users.total > 0 ? Math.round((data.users.nonVerified / data.users.total) * 100) : 0}%`,
                  transition: "width 0.3s",
                }} />
              </div>
              <div style={{ fontSize: "11px", color: t.textLight, marginTop: "4px" }}>
                {data.users.total > 0 ? Math.round((data.users.nonVerified / data.users.total) * 100) : 0}% of total
              </div>
            </div>
          </div>

          {/* breakdown by type */}
          <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "8px", padding: "16px 20px", marginBottom: "28px" }}>
            <div style={{ fontSize: "11px", color: t.textLight, fontWeight: 500, letterSpacing: "0.5px", marginBottom: "14px" }}>BREAKDOWN BY TYPE</div>
            <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
              {Object.entries(data.users.byType).map(([type, count]) => {
                const pct = data.users.total > 0 ? Math.round((count / data.users.total) * 100) : 0;
                return (
                  <div key={type}>
                    <div style={{ fontSize: "26px", fontWeight: 600, color: t.textPrimary }}>{count}</div>
                    <div style={{ fontSize: "12px", color: t.textSecondary, marginBottom: "6px" }}>{type}</div>
                    <div style={{ height: "3px", width: "80px", background: t.border, borderRadius: "2px" }}>
                      <div style={{ height: "3px", width: `${pct}%`, background: t.accent, borderRadius: "2px" }} />
                    </div>
                    <div style={{ fontSize: "11px", color: t.textLight, marginTop: "4px" }}>{pct}%</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* content */}
          <div style={{ fontSize: "11px", color: t.textLight, fontWeight: 500, letterSpacing: "0.5px", marginBottom: "10px" }}>CONTENT</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "28px" }}>
            <StatCard label="posts" value={data.content.posts} />
            <StatCard label="clubs" value={data.content.clubs} />
            <StatCard label="events" value={data.content.events} />
          </div>

          {/* marketplace */}
          <div style={{ fontSize: "11px", color: t.textLight, fontWeight: 500, letterSpacing: "0.5px", marginBottom: "10px" }}>MARKETPLACE</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
            <StatCard label="total listings" value={data.marketplace.totalListings} />
            <StatCard label="active listings" value={data.marketplace.activeListings} accent />
            <StatCard label="sold / inactive" value={data.marketplace.totalListings - data.marketplace.activeListings} />
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div style={{
      background: accent ? t.accentBg : t.bgCard,
      border: `1px solid ${accent ? t.accentBorder : t.border}`,
      borderRadius: "8px",
      padding: "16px 18px",
    }}>
      <div style={{ fontSize: "12px", color: t.textMuted, marginBottom: "6px" }}>{label}</div>
      <div style={{ fontSize: "26px", fontWeight: 600, color: accent ? t.accent : t.textPrimary }}>
        {value.toLocaleString()}
      </div>
    </div>
  );
}