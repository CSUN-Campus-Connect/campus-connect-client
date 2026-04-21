"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAdminAuth } from "@/lib/useAdminAuth";
import {
  createCriticalAnnouncement,
  canSendCritical,
  type AnnouncementChannel,
  type CreateCriticalPayload,
} from "@/lib/announcement.api";

const CONFIRMATION_PHRASE = "SEND CRITICAL";

export default function NewAnnouncementPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAdminAuth();
  const userCanSend = canSendCritical(user?.email);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [location, setLocation] = useState("");
  const [channels, setChannels] = useState<AnnouncementChannel[]>(["BANNER"]);
  const [testMode, setTestMode] = useState(true);

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Block non-whitelisted users with a friendly message
  if (authLoading) {
    return <div style={{ color: "#999", fontSize: "13px" }}>Loading...</div>;
  }

  if (!userCanSend) {
    return (
      <div style={{ maxWidth: "500px", margin: "60px auto", textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#1a1a1a", margin: 0 }}>
          Not authorized
        </h1>
        <p style={{ fontSize: "13px", color: "#888", marginTop: "10px", lineHeight: 1.5 }}>
          Sending critical alerts is restricted to authorized operators.
          Contact Ivan or the team lead if you need access.
        </p>
        <Link
          href="/admin/announcements"
          style={{
            display: "inline-block",
            marginTop: "20px",
            padding: "8px 20px",
            fontSize: "13px",
            color: "#888",
            background: "#fff",
            border: "1px solid #e5e5e5",
            borderRadius: "6px",
            textDecoration: "none",
          }}
        >
          ← Back to alerts
        </Link>
      </div>
    );
  }

  const toggleChannel = (channel: AnnouncementChannel) => {
    setChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel],
    );
  };

  const validForm = title.trim().length > 0 && body.trim().length > 0 && channels.length > 0;

  const handleSend = async () => {
    if (confirmationInput !== CONFIRMATION_PHRASE) {
      setError(`You must type exactly "${CONFIRMATION_PHRASE}" to confirm`);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload: CreateCriticalPayload = {
        title: title.trim(),
        body: body.trim(),
        location: location.trim() || null,
        channels,
        testMode,
        confirmation: confirmationInput,
      };
      const created = await createCriticalAnnouncement(payload);
      router.push(`/admin/announcements/${created.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to send alert");
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "720px" }}>
      <Link
        href="/admin/announcements"
        style={{
          fontSize: "12px",
          color: "#888",
          textDecoration: "none",
          display: "inline-block",
          marginBottom: "12px",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#c94150")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
      >
        ← Back to alerts
      </Link>

      <div style={{ marginBottom: "32px" }}>
        <div style={{ fontSize: "11px", color: "#bbb", fontWeight: 500, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "6px" }}>
          New Alert
        </div>
        <h1 style={{ fontSize: "26px", fontWeight: 600, color: "#1a1a1a", margin: 0, letterSpacing: "-0.5px" }}>
          Send Critical Alert
        </h1>
        <p style={{ fontSize: "13px", color: "#888", marginTop: "8px", maxWidth: "500px", lineHeight: 1.5 }}>
          This broadcasts a CRITICAL_RED alert to the entire campus. Make sure the information is accurate before sending.
        </p>
      </div>

      {/* Reminder about test mode */}
      {testMode && (
        <div
          style={{
            background: "#fffbeb",
            border: "1px solid #fef3c7",
            borderRadius: "6px",
            padding: "12px 16px",
            marginBottom: "24px",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#92400e" }}>
            Test mode enabled
          </div>
          <div style={{ fontSize: "11px", color: "#a16207", marginTop: "2px" }}>
            Email, SMS, and push only go to whitelisted accounts. Banner still broadcasts to all connected users.
          </div>
        </div>
      )}

      {/* Form card */}
      <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: "8px", padding: "24px", marginBottom: "24px" }}>
        <FieldLabel>Title</FieldLabel>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Active shooter reported in Oviatt Library"
          maxLength={140}
          style={inputStyle}
        />
        <FieldHint>{title.length}/140 characters</FieldHint>

        <FieldLabel style={{ marginTop: "20px" }}>Message</FieldLabel>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Shelter in place immediately. Lock doors, stay away from windows. Do not attempt to leave the building. Await further instructions from DPS."
          rows={5}
          maxLength={500}
          style={{ ...inputStyle, resize: "vertical", minHeight: "100px" }}
        />
        <FieldHint>{body.length}/500 characters</FieldHint>

        <FieldLabel style={{ marginTop: "20px" }}>Location (optional)</FieldLabel>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Oviatt Library"
          maxLength={100}
          style={inputStyle}
        />

        <FieldLabel style={{ marginTop: "24px" }}>Delivery channels</FieldLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
          {(["BANNER", "PUSH", "EMAIL", "SMS"] as AnnouncementChannel[]).map((channel) => {
            const active = channels.includes(channel);
            return (
              <button
                key={channel}
                type="button"
                onClick={() => toggleChannel(channel)}
                style={{
                  padding: "8px 14px",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: active ? "#c94150" : "#888",
                  background: active ? "#fef2f3" : "#fafafa",
                  border: `1px solid ${active ? "#fecaca" : "#f0f0f0"}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "all 0.1s",
                }}
              >
                {channel}
              </button>
            );
          })}
        </div>
        <FieldHint>Select at least one channel.</FieldHint>

        <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #f5f5f5" }}>
          <label style={{ display: "flex", gap: "10px", alignItems: "flex-start", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={testMode}
              onChange={(e) => setTestMode(e.target.checked)}
              style={{ marginTop: "2px" }}
            />
            <div>
              <div style={{ fontSize: "13px", fontWeight: 500, color: "#1a1a1a" }}>Test mode</div>
              <div style={{ fontSize: "11px", color: "#888", marginTop: "2px", lineHeight: 1.5 }}>
                Keep enabled unless this is a real emergency. In test mode, only whitelisted accounts receive email/SMS/push.
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Live preview of what students will see */}
      {validForm && (
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "11px", color: "#bbb", fontWeight: 500, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "10px" }}>
            Preview — what students will see
          </div>
          <div
            style={{
              background: "#c94150",
              color: "#fff",
              padding: "16px 20px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(201, 65, 80, 0.2)",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "1px", opacity: 0.9, marginBottom: "6px" }}>
              🚨 CRITICAL ALERT{testMode ? " · TEST" : ""}
            </div>
            <div style={{ fontSize: "16px", fontWeight: 600, lineHeight: 1.3, marginBottom: "6px" }}>
              {title || "(title)"}
            </div>
            <div style={{ fontSize: "13px", lineHeight: 1.5, opacity: 0.95 }}>{body || "(message)"}</div>
            {location && (
              <div style={{ fontSize: "12px", marginTop: "10px", opacity: 0.9 }}>
                📍 {location}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <Link
          href="/admin/announcements"
          style={{
            padding: "10px 20px",
            fontSize: "13px",
            color: "#888",
            background: "#fff",
            border: "1px solid #e5e5e5",
            borderRadius: "6px",
            textDecoration: "none",
          }}
        >
          Cancel
        </Link>
        <button
          type="button"
          disabled={!validForm}
          onClick={() => setShowConfirm(true)}
          style={{
            padding: "10px 20px",
            fontSize: "13px",
            fontWeight: 500,
            color: "#fff",
            background: validForm ? "#c94150" : "#e5e5e5",
            border: "none",
            borderRadius: "6px",
            cursor: validForm ? "pointer" : "not-allowed",
          }}
        >
          Review & send
        </button>
      </div>

      {/* Typed-confirmation modal */}
      {showConfirm && (
        <div
          onClick={() => !submitting && setShowConfirm(false)}
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
            <div style={{ fontSize: "11px", color: "#c94150", fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "8px" }}>
              Final Confirmation
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#1a1a1a", margin: 0 }}>
              {testMode ? "Send test alert?" : "Send critical alert?"}
            </h2>
            <p style={{ fontSize: "13px", color: "#666", marginTop: "10px", lineHeight: 1.5 }}>
              {testMode
                ? "This will broadcast to all connected clients (for the banner) but only whitelisted accounts will receive email/SMS/push."
                : "This will notify the entire CSUN campus across the selected channels. This action cannot be undone — alerts can only be transitioned or ended."}
            </p>

            <div style={{ marginTop: "20px" }}>
              <FieldLabel>
                Type <strong>{CONFIRMATION_PHRASE}</strong> to confirm:
              </FieldLabel>
              <input
                type="text"
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                placeholder={CONFIRMATION_PHRASE}
                autoFocus
                style={{
                  ...inputStyle,
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                }}
              />
            </div>

            {error && (
              <div style={{ marginTop: "14px", fontSize: "12px", color: "#c94150", background: "#fef2f3", padding: "10px", borderRadius: "6px" }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "22px" }}>
              <button
                type="button"
                disabled={submitting}
                onClick={() => setShowConfirm(false)}
                style={{
                  padding: "8px 16px",
                  fontSize: "13px",
                  color: "#888",
                  background: "#fff",
                  border: "1px solid #e5e5e5",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting || confirmationInput !== CONFIRMATION_PHRASE}
                onClick={handleSend}
                style={{
                  padding: "8px 20px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#fff",
                  background: confirmationInput === CONFIRMATION_PHRASE ? "#c94150" : "#e5e5e5",
                  border: "none",
                  borderRadius: "6px",
                  cursor: confirmationInput === CONFIRMATION_PHRASE && !submitting ? "pointer" : "not-allowed",
                }}
              >
                {submitting ? "Sending..." : testMode ? "Send test" : "Send alert"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Shared bits

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

function FieldHint({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>{children}</div>;
}