"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/useAdminAuth";
import {
  getAnnouncementDetail,
  getAnnouncementTimeline,
  getDeliveryStats,
  transitionAnnouncement,
  endAnnouncement,
  canSendCritical,
  type Announcement,
  type TimelineNode,
  type DeliveryStats,
  type AnnouncementSeverity,
  type AnnouncementChannel,
} from "@/lib/announcement.api";

export default function AnnouncementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { user } = useAdminAuth();
  const userCanSend = canSendCritical(user?.email);

  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [timeline, setTimeline] = useState<TimelineNode[]>([]);
  const [stats, setStats] = useState<DeliveryStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Transition modal state
  const [showTransition, setShowTransition] = useState(false);
  const [transitionTitle, setTransitionTitle] = useState("");
  const [transitionBody, setTransitionBody] = useState("");
  const [transitionExpiresMin, setTransitionExpiresMin] = useState<number | null>(null);

  // End modal state
  const [showEnd, setShowEnd] = useState(false);
  const [endReason, setEndReason] = useState("");

  const loadAll = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [a, t, s] = await Promise.all([
        getAnnouncementDetail(id),
        getAnnouncementTimeline(id),
        getDeliveryStats(id),
      ]);
      setAnnouncement(a);
      setTimeline(t.timeline);
      setStats(s.stats);
    } catch (err: any) {
      setError(err.message || "Failed to load announcement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleTransition = async (targetSeverity: AnnouncementSeverity) => {
    if (!announcement) return;
    setActionLoading(true);
    try {
      const next = await transitionAnnouncement(announcement.id, {
        targetSeverity,
        title: transitionTitle || announcement.title,
        body: transitionBody || announcement.body,
        channels: announcement.channels,
        expiresInMinutes: targetSeverity === "ALL_CLEAR_GREEN" ? transitionExpiresMin : null,
      });
      setShowTransition(false);
      router.push(`/admin/announcements/${next.id}`);
    } catch (err: any) {
      setError(err.message || "Transition failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEnd = async () => {
    if (!announcement) return;
    setActionLoading(true);
    try {
      await endAnnouncement(announcement.id, endReason || undefined);
      setShowEnd(false);
      await loadAll();
    } catch (err: any) {
      setError(err.message || "End failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div style={{ color: "#999", fontSize: "13px" }}>Loading...</div>;
  if (error && !announcement)
    return (
      <div style={{ color: "#c94150", fontSize: "13px", padding: "16px", background: "#fef2f3", borderRadius: "6px" }}>
        {error}
      </div>
    );
  if (!announcement) return null;

  const severityMeta = getSeverityMeta(announcement.severity, announcement.isActive);
  const canTransition = announcement.isActive && announcement.severity !== "ALL_CLEAR_GREEN";
  const nextSeverity: AnnouncementSeverity | null =
    announcement.severity === "CRITICAL_RED"
      ? "CRITICAL_BLUE"
      : announcement.severity === "CRITICAL_BLUE"
        ? "ALL_CLEAR_GREEN"
        : null;

  return (
    <div style={{ maxWidth: "800px" }}>
      <Link
        href="/admin/announcements"
        style={{ fontSize: "12px", color: "#888", textDecoration: "none", display: "inline-block", marginBottom: "12px" }}
      >
        ← Back to alerts
      </Link>

      {/* Header */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #f0f0f0",
          borderRadius: "10px",
          padding: "24px",
          marginBottom: "20px",
          borderLeft: `4px solid ${severityMeta.color}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 600,
              color: severityMeta.color,
              background: severityMeta.bg,
              padding: "3px 8px",
              borderRadius: "3px",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            {severityMeta.label}
          </span>
          {announcement.testMode && (
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                color: "#92400e",
                background: "#fffbeb",
                padding: "3px 8px",
                borderRadius: "3px",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              Test
            </span>
          )}
          {!announcement.isActive && (
            <span style={{ fontSize: "11px", color: "#888" }}>
              Ended {announcement.endedAt && new Date(announcement.endedAt).toLocaleString()}
            </span>
          )}
        </div>

        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#1a1a1a", margin: 0, letterSpacing: "-0.3px" }}>
          {announcement.title}
        </h1>
        <p style={{ fontSize: "14px", color: "#444", marginTop: "10px", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
          {announcement.body}
        </p>

        {announcement.location && (
          <div style={{ fontSize: "12px", color: "#888", marginTop: "10px" }}>📍 {announcement.location}</div>
        )}

        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "16px",
            paddingTop: "16px",
            borderTop: "1px solid #f5f5f5",
            fontSize: "11px",
            color: "#888",
            flexWrap: "wrap",
          }}
        >
          <div>
            <strong style={{ color: "#555" }}>Sent by:</strong>{" "}
            {announcement.author ? `${announcement.author.firstName} ${announcement.author.lastName}` : "—"}
          </div>
          <div>
            <strong style={{ color: "#555" }}>Sent at:</strong> {new Date(announcement.createdAt).toLocaleString()}
          </div>
          <div>
            <strong style={{ color: "#555" }}>Channels:</strong> {announcement.channels.join(", ")}
          </div>
        </div>
      </div>

      {/* Only whitelisted operators see action buttons */}
      {announcement.isActive && userCanSend && (
        <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
          {canTransition && nextSeverity && (
            <button
              onClick={() => {
                setTransitionTitle(announcement.title);
                setTransitionBody(announcement.body);
                setShowTransition(true);
              }}
              style={{
                padding: "10px 18px",
                fontSize: "13px",
                fontWeight: 500,
                color: "#fff",
                background: nextSeverity === "CRITICAL_BLUE" ? "#1E40AF" : "#16A34A",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Transition to {nextSeverity === "CRITICAL_BLUE" ? "Update (blue)" : "All Clear (green)"}
            </button>
          )}
          <button
            onClick={() => setShowEnd(true)}
            style={{
              padding: "10px 18px",
              fontSize: "13px",
              color: "#c94150",
              background: "#fff",
              border: "1px solid #c94150",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            End alert
          </button>
        </div>
      )}

      {/* Per-channel delivery stats */}
      {Object.keys(stats).length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "11px", color: "#bbb", fontWeight: 500, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "10px" }}>
            Delivery stats
          </div>
          <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: "8px", overflow: "hidden" }}>
            {(Object.keys(stats) as AnnouncementChannel[]).map((channel, i, arr) => (
              <div
                key={channel}
                style={{
                  display: "flex",
                  gap: "12px",
                  padding: "14px 20px",
                  alignItems: "center",
                  borderBottom: i === arr.length - 1 ? "none" : "1px solid #f5f5f5",
                }}
              >
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#555", width: "80px", flexShrink: 0 }}>
                  {channel}
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", flex: 1 }}>
                  {Object.entries(stats[channel]).map(([status, count]) => (
                    <span
                      key={status}
                      style={{
                        fontSize: "11px",
                        fontWeight: 500,
                        color: statusColor(status),
                        background: statusBg(status),
                        padding: "3px 8px",
                        borderRadius: "3px",
                      }}
                    >
                      {status}: {count}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RED → BLUE → GREEN chain */}
      {timeline.length > 1 && (
        <div>
          <div style={{ fontSize: "11px", color: "#bbb", fontWeight: 500, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "10px" }}>
            Alert chain
          </div>
          <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: "8px", padding: "16px 20px" }}>
            {timeline.map((node, i) => {
              const nodeMeta = getSeverityMeta(node.severity, true);
              const isCurrent = node.id === announcement.id;
              return (
                <Link
                  key={node.id}
                  href={`/admin/announcements/${node.id}`}
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                    padding: "10px 0",
                    textDecoration: "none",
                    borderBottom: i === timeline.length - 1 ? "none" : "1px solid #f5f5f5",
                  }}
                >
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: nodeMeta.color,
                      marginTop: "5px",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", color: "#1a1a1a", fontWeight: isCurrent ? 600 : 400 }}>
                      {node.title}
                      {isCurrent && <span style={{ fontSize: "10px", color: "#c94150", marginLeft: "8px" }}>· current</span>}
                    </div>
                    <div style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>
                      {nodeMeta.label} · {new Date(node.createdAt).toLocaleString()}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Transition modal */}
      {showTransition && nextSeverity && (
        <Modal onClose={() => !actionLoading && setShowTransition(false)}>
          <div style={{ fontSize: "11px", color: nextSeverity === "CRITICAL_BLUE" ? "#1E40AF" : "#16A34A", fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "8px" }}>
            {nextSeverity === "CRITICAL_BLUE" ? "Update alert" : "All clear"}
          </div>
          <h2 style={{ fontSize: "18px", fontWeight: 600, margin: 0, color: "#1a1a1a" }}>
            Transition to {nextSeverity === "CRITICAL_BLUE" ? "blue" : "green"}
          </h2>
          <p style={{ fontSize: "12px", color: "#666", marginTop: "8px", lineHeight: 1.5 }}>
            {nextSeverity === "CRITICAL_BLUE"
              ? "Update the message to reflect a contained situation. Students will see the banner change from red to blue."
              : "All-clear resolves the emergency. Choose how long the green banner stays visible before auto-expiring."}
          </p>

          <div style={{ marginTop: "16px" }}>
            <FieldLabel>Title</FieldLabel>
            <input
              type="text"
              value={transitionTitle}
              onChange={(e) => setTransitionTitle(e.target.value)}
              style={inputStyle}
            />

            <FieldLabel style={{ marginTop: "14px" }}>Message</FieldLabel>
            <textarea
              value={transitionBody}
              onChange={(e) => setTransitionBody(e.target.value)}
              rows={4}
              style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }}
            />

            {nextSeverity === "ALL_CLEAR_GREEN" && (
              <>
                <FieldLabel style={{ marginTop: "14px" }}>Banner expires in</FieldLabel>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {[
                    { label: "1 hour", val: 60 },
                    { label: "4 hours", val: 240 },
                    { label: "12 hours", val: 720 },
                    { label: "24 hours", val: 1440 },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setTransitionExpiresMin(preset.val)}
                      style={{
                        padding: "6px 12px",
                        fontSize: "12px",
                        color: transitionExpiresMin === preset.val ? "#16A34A" : "#888",
                        background: transitionExpiresMin === preset.val ? "#f0fdf4" : "#fafafa",
                        border: `1px solid ${transitionExpiresMin === preset.val ? "#bbf7d0" : "#f0f0f0"}`,
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "22px" }}>
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => setShowTransition(false)}
              style={{ padding: "8px 16px", fontSize: "13px", color: "#888", background: "#fff", border: "1px solid #e5e5e5", borderRadius: "6px", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => handleTransition(nextSeverity)}
              style={{
                padding: "8px 20px",
                fontSize: "13px",
                fontWeight: 500,
                color: "#fff",
                background: nextSeverity === "CRITICAL_BLUE" ? "#1E40AF" : "#16A34A",
                border: "none",
                borderRadius: "6px",
                cursor: actionLoading ? "not-allowed" : "pointer",
              }}
            >
              {actionLoading ? "Working..." : `Transition to ${nextSeverity === "CRITICAL_BLUE" ? "blue" : "green"}`}
            </button>
          </div>
        </Modal>
      )}

      {/* End modal */}
      {showEnd && (
        <Modal onClose={() => !actionLoading && setShowEnd(false)}>
          <div style={{ fontSize: "11px", color: "#c94150", fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "8px" }}>
            End alert
          </div>
          <h2 style={{ fontSize: "18px", fontWeight: 600, margin: 0, color: "#1a1a1a" }}>
            Stop this alert immediately?
          </h2>
          <p style={{ fontSize: "12px", color: "#666", marginTop: "8px", lineHeight: 1.5 }}>
            This removes the banner from everyone's screen and cancels any pending deliveries. No new notifications will be sent.
          </p>

          <div style={{ marginTop: "16px" }}>
            <FieldLabel>Reason (optional)</FieldLabel>
            <input
              type="text"
              value={endReason}
              onChange={(e) => setEndReason(e.target.value)}
              placeholder="Issue resolved, false alarm, etc."
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "22px" }}>
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => setShowEnd(false)}
              style={{ padding: "8px 16px", fontSize: "13px", color: "#888", background: "#fff", border: "1px solid #e5e5e5", borderRadius: "6px", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleEnd}
              style={{
                padding: "8px 20px",
                fontSize: "13px",
                fontWeight: 500,
                color: "#fff",
                background: "#c94150",
                border: "none",
                borderRadius: "6px",
                cursor: actionLoading ? "not-allowed" : "pointer",
              }}
            >
              {actionLoading ? "Ending..." : "End alert"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Helpers

function getSeverityMeta(severity: string | null, isActive: boolean): { label: string; color: string; bg: string } {
  if (!isActive) return { label: "Ended", color: "#999", bg: "#f5f5f5" };
  switch (severity) {
    case "CRITICAL_RED": return { label: "Critical", color: "#c94150", bg: "#fef2f3" };
    case "CRITICAL_BLUE": return { label: "Update", color: "#1E40AF", bg: "#eff6ff" };
    case "ALL_CLEAR_GREEN": return { label: "All Clear", color: "#16A34A", bg: "#f0fdf4" };
    default: return { label: "Info", color: "#888", bg: "#f5f5f5" };
  }
}

function statusColor(status: string): string {
  switch (status) {
    case "DELIVERED": return "#16A34A";
    case "SENT": return "#1E40AF";
    case "FAILED":
    case "PERMANENT_FAIL": return "#c94150";
    case "SKIPPED": return "#888";
    case "PENDING": return "#D97706";
    default: return "#888";
  }
}

function statusBg(status: string): string {
  switch (status) {
    case "DELIVERED": return "#f0fdf4";
    case "SENT": return "#eff6ff";
    case "FAILED":
    case "PERMANENT_FAIL": return "#fef2f3";
    case "SKIPPED": return "#f5f5f5";
    case "PENDING": return "#fffbeb";
    default: return "#f5f5f5";
  }
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "10px",
          padding: "28px",
          maxWidth: "480px",
          width: "100%",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: "13px",
  fontFamily: "inherit",
  color: "#1a1a1a",
  background: "#fff",
  border: "1px solid #e5e5e5",
  borderRadius: "6px",
  boxSizing: "border-box",
  outline: "none",
};

function FieldLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <label
      style={{
        display: "block",
        fontSize: "12px",
        fontWeight: 500,
        color: "#555",
        marginBottom: "6px",
        ...style,
      }}
    >
      {children}
    </label>
  );
}