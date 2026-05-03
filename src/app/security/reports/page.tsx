"use client";
// src/app/security/reports/page.tsx

import * as React from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock, ShieldCheck, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

const smooth: [number, number, number, number] = [0.16, 1, 0.3, 1];
const RED = "#CC0033";
const GRAY = "#767676";

const STATUS_META: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  SUBMITTED:          { label: "Submitted",          color: "#92650a", bg: "#fef9ec", border: "#f0c842", icon: <Clock size={11} /> },
  ACKNOWLEDGED:       { label: "Acknowledged",       color: "#1250a0", bg: "#eff4ff", border: "#93b4f0", icon: <ShieldCheck size={11} /> },
  UNDER_REVIEW:       { label: "Under Review",       color: "#1250a0", bg: "#eff4ff", border: "#93b4f0", icon: <ShieldCheck size={11} /> },
  INVESTIGATION:      { label: "Investigation",      color: "#5b21b6", bg: "#f5f0ff", border: "#c4b5fd", icon: <AlertCircle size={11} /> },
  ESCALATED:          { label: "Escalated",          color: "#9b0025", bg: "#fff0f3", border: "#fca5a5", icon: <AlertCircle size={11} /> },
  PENDING_RESOLUTION: { label: "Pending Resolution", color: "#92650a", bg: "#fef9ec", border: "#f0c842", icon: <Clock size={11} /> },
  RESOLVED:           { label: "Resolved",           color: "#166534", bg: "#f0faf4", border: "#86efac", icon: <CheckCircle2 size={11} /> },
  CLOSED:             { label: "Closed",             color: "#4b5563", bg: "#f5f5f5", border: "#d1d5db", icon: <XCircle size={11} /> },
  REOPENED:           { label: "Reopened",           color: "#9b0025", bg: "#fff0f3", border: "#fca5a5", icon: <AlertCircle size={11} /> },
  "Submitted":        { label: "Submitted",   color: "#92650a", bg: "#fef9ec", border: "#f0c842", icon: <Clock size={11} /> },
  "In Progress":      { label: "In Progress", color: "#1250a0", bg: "#eff4ff", border: "#93b4f0", icon: <ShieldCheck size={11} /> },
  "Resolved":         { label: "Resolved",    color: "#166534", bg: "#f0faf4", border: "#86efac", icon: <CheckCircle2 size={11} /> },
  "Closed":           { label: "Closed",      color: "#4b5563", bg: "#f5f5f5", border: "#d1d5db", icon: <XCircle size={11} /> },
};

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? { label: status, color: "#4b5563", bg: "#f5f5f5", border: "#d1d5db", icon: <Clock size={11} /> };
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold tracking-wide"
      style={{ color: m.color, background: m.bg, border: `1px solid ${m.border}`, borderRadius: 0 }}>
      {m.icon}
      {m.label.toUpperCase()}
    </span>
  );
}

export default function MyReportsPage() {
  const router = useRouter();
  const [reports, setReports] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  React.useEffect(() => {
    api.get("/api/v1/security/reports/mine", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setReports(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 animate-pulse" style={{ background: "#f5f5f5", border: "1px solid #eee" }} />
        ))}
      </div>
    );
  }

  if (!reports.length) {
    return (
      <div className="py-24 text-center">
        <div className="h-[2px] w-12 mx-auto mb-8" style={{ background: RED }} />
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: GRAY }}>
          No reports yet
        </div>
        <p className="text-[14px] font-light max-w-xs mx-auto leading-relaxed" style={{ color: GRAY }}>
          Reports you submit will appear here with live status updates.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: smooth }}
    >
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-5" style={{ color: GRAY }}>
        {reports.length} {reports.length === 1 ? "Report" : "Reports"}
      </div>

      <div className="flex flex-col gap-2">
        {reports.map((r: any, i: number) => (
          <motion.button
            key={r.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.04, ease: smooth }}
            onClick={() => router.push(`/security/reports/${r.id}`)}
            className="group w-full text-left px-5 py-4 transition-all"
            style={{ border: "1px solid #e5e5e5", background: "#FAFAF7" }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = RED;
              e.currentTarget.style.background = "#fff5f7";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "#e5e5e5";
              e.currentTarget.style.background = "#FAFAF7";
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* case + type row */}
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: GRAY }}>
                    {r.caseNumber}
                  </span>
                  <span className="text-[10px] font-light" style={{ color: GRAY }}>·</span>
                  <span className="text-[10px] font-light capitalize" style={{ color: GRAY }}>
                    {r.reportType.replace(/_/g, " ").toLowerCase()}
                  </span>
                </div>

                {/* title */}
                <div className="text-[14px] font-semibold text-[#111] mb-1 truncate">{r.title}</div>

                {/* date */}
                <div className="text-[11px] font-light" style={{ color: GRAY }}>
                  Filed {new Date(r.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </div>
              </div>

              {/* right side */}
              <div className="flex flex-col items-end gap-3 flex-shrink-0">
                <StatusBadge status={r.status} />
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-1"
                  style={{ color: GRAY }}
                />
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}