"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAnnouncement } from "@/contexts/AnnouncementContext";

// Map severity to visual style
function getSeverityStyle(severity: string | null) {
  switch (severity) {
    case "CRITICAL_RED":
      return {
        bg: "#CC0033",
        label: "🚨 CRITICAL ALERT",
      };
    case "CRITICAL_BLUE":
      return {
        bg: "#1E40AF",
        label: "ℹ️ ALERT UPDATE",
      };
    case "ALL_CLEAR_GREEN":
      return {
        bg: "#16A34A",
        label: "✅ ALL CLEAR",
      };
    default:
      return {
        bg: "#555",
        label: "ALERT",
      };
  }
}

export default function AnnouncementBanner() {
  const { activeAnnouncement, dismiss, dismissed } = useAnnouncement();

  const shouldShow = activeAnnouncement && !dismissed;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          key={activeAnnouncement.id}
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            background: getSeverityStyle(activeAnnouncement.severity).bg,
            color: "#fff",
            padding: "14px 20px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            fontFamily: "'Sora', 'DM Sans', sans-serif",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "flex",
              alignItems: "flex-start",
              gap: "16px",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "1.2px",
                  opacity: 0.9,
                  marginBottom: "4px",
                }}
              >
                {getSeverityStyle(activeAnnouncement.severity).label}
                {activeAnnouncement.testMode && " · TEST"}
              </div>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  lineHeight: 1.3,
                  marginBottom: "4px",
                }}
              >
                {activeAnnouncement.title}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  lineHeight: 1.5,
                  opacity: 0.95,
                }}
              >
                {activeAnnouncement.body}
              </div>
              {activeAnnouncement.location && (
                <div
                  style={{
                    fontSize: "12px",
                    marginTop: "6px",
                    opacity: 0.9,
                  }}
                >
                  📍 {activeAnnouncement.location}
                </div>
              )}
            </div>

            <button
              onClick={dismiss}
              aria-label="Dismiss announcement"
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                border: "none",
                color: "#fff",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: "16px",
                lineHeight: "1",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)")}
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}