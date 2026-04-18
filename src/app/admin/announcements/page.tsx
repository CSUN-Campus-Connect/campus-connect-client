"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/lib/useAdminAuth";
import {
  listAnnouncements,
  canSendCritical,
  type Announcement,
} from "@/lib/announcement.api";

type FilterKey = "active" | "history" | "all";

export default function AnnouncementsListPage() {
  const { user } = useAdminAuth();
  const userCanSend = canSendCritical(user?.email);

  const [filter, setFilter] = useState<FilterKey>("all");
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listAnnouncements(filter, 1, 50)
      .then((res) => {
        if (cancelled) return;
        setItems(res.announcements);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Failed to load announcements");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [filter]);

  return (
    <div>
      {/* Page header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "32px",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: "11px", color: "#bbb", fontWeight: 500, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "6px" }}>
            Safety · Alerts
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 600, color: "#1a1a1a", margin: 0, letterSpacing: "-0.5px" }}>
            Emergency Alerts
          </h1>
          <p style={{ fontSize: "13px", color: "#888", marginTop: "6px", maxWidth: "460px", lineHeight: 1.5 }}>
            Send campus-wide critical alerts. Manage active alerts through their lifecycle from red to blue to all-clear.
          </p>
        </div>

        {userCanSend && (
          <Link
            href="/admin/announcements/new"
            style={{
              padding: "10px 20px",
              background: "#c94150",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 500,
              borderRadius: "6px",
              textDecoration: "none",
              transition: "background 0.1s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#b73847")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#c94150")}
          >
            New Alert
          </Link>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", borderBottom: "1px solid #f0f0f0", paddingBottom: "2px" }}>
        {(["all", "active", "history"] as FilterKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: "8px 16px",
              fontSize: "12px",
              fontWeight: filter === key ? 600 : 400,
              color: filter === key ? "#c94150" : "#888",
              background: "transparent",
              border: "none",
              borderBottom: filter === key ? "2px solid #c94150" : "2px solid transparent",
              marginBottom: "-1px",
              cursor: "pointer",
              transition: "color 0.1s",
            }}
          >
            {key === "all" ? "All" : key === "active" ? "Active" : "History"}
          </button>
        ))}
      </div>

      {/* Body */}
      {loading && (
        <div style={{ color: "#999", fontSize: "13px", padding: "40px 0", textAlign: "center" }}>
          Loading...
        </div>
      )}

      {error && (
        <div style={{ color: "#c94150", fontSize: "13px", padding: "16px", background: "#fef2f3", borderRadius: "6px" }}>
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#999",
            fontSize: "13px",
            background: "#fff",
            border: "1px solid #f0f0f0",
            borderRadius: "8px",
          }}
        >
          {filter === "active" ? "No active alerts." : "No alerts yet."}
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: "8px", overflow: "hidden" }}>
          {items.map((item, i) => (
            <AnnouncementRow key={item.id} item={item} isLast={i === items.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function AnnouncementRow({ item, isLast }: { item: Announcement; isLast: boolean }) {
  const severityMeta = getSeverityMeta(item.severity, item.isActive);
  const createdDate = new Date(item.createdAt);
  const dateStr = createdDate.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Link
      href={`/admin/announcements/${item.id}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "16px 20px",
        borderBottom: isLast ? "none" : "1px solid #f5f5f5",
        textDecoration: "none",
        color: "#1a1a1a",
        transition: "background 0.08s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* Vertical severity bar */}
      <div
        style={{
          width: "4px",
          height: "36px",
          background: severityMeta.color,
          borderRadius: "2px",
          flexShrink: 0,
        }}
      />

      {/* Title + tags + author line */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "14px", fontWeight: 500, color: "#1a1a1a" }}>
            {item.title}
          </span>

          {item.testMode && (
            <span
              style={{
                fontSize: "10px",
                fontWeight: 500,
                color: "#888",
                background: "#f5f5f5",
                padding: "2px 6px",
                borderRadius: "3px",
                letterSpacing: "0.3px",
                textTransform: "uppercase",
              }}
            >
              Test
            </span>
          )}

          <span
            style={{
              fontSize: "10px",
              fontWeight: 500,
              color: severityMeta.color,
              background: severityMeta.bg,
              padding: "2px 8px",
              borderRadius: "3px",
              letterSpacing: "0.3px",
              textTransform: "uppercase",
            }}
          >
            {severityMeta.label}
          </span>
        </div>
        <div style={{ fontSize: "12px", color: "#aaa", marginTop: "4px" }}>
          {item.author
            ? `${item.author.firstName} ${item.author.lastName} · ${dateStr}`
            : dateStr}
        </div>
      </div>

      {/* Channels */}
      <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
        {item.channels.map((ch) => (
          <span
            key={ch}
            style={{
              fontSize: "10px",
              fontWeight: 500,
              color: "#888",
              background: "#f8f8f8",
              padding: "2px 6px",
              borderRadius: "3px",
              letterSpacing: "0.3px",
            }}
          >
            {ch}
          </span>
        ))}
      </div>

      <div style={{ color: "#ccc", fontSize: "16px", fontWeight: 300, flexShrink: 0 }}>→</div>
    </Link>
  );
}

// Map severity + active state to a label, text color, background color
function getSeverityMeta(
  severity: string | null,
  isActive: boolean,
): { label: string; color: string; bg: string } {
  if (!isActive) {
    return { label: "Ended", color: "#999", bg: "#f5f5f5" };
  }
  switch (severity) {
    case "CRITICAL_RED":
      return { label: "Critical", color: "#c94150", bg: "#fef2f3" };
    case "CRITICAL_BLUE":
      return { label: "Update", color: "#1E40AF", bg: "#eff6ff" };
    case "ALL_CLEAR_GREEN":
      return { label: "All Clear", color: "#16A34A", bg: "#f0fdf4" };
    default:
      return { label: "Info", color: "#888", bg: "#f5f5f5" };
  }
}