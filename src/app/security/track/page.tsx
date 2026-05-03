"use client";
// src/app/security/track/page.tsx

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/axios";
import {
  ArrowRight, ShieldCheck, Clock, CheckCircle2,
  XCircle, AlertCircle, Search,
} from "lucide-react";

const smooth: [number, number, number, number] = [0.16, 1, 0.3, 1];
const RED = "#CC0033";
const GRAY = "#767676";

const STATUS_META: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  SUBMITTED:          { label: "Submitted",          color: "#92650a", bg: "#fef9ec", border: "#f0c842", icon: <Clock size={13} /> },
  ACKNOWLEDGED:       { label: "Acknowledged",       color: "#1250a0", bg: "#eff4ff", border: "#93b4f0", icon: <ShieldCheck size={13} /> },
  UNDER_REVIEW:       { label: "Under Review",       color: "#1250a0", bg: "#eff4ff", border: "#93b4f0", icon: <ShieldCheck size={13} /> },
  INVESTIGATION:      { label: "Investigation",      color: "#5b21b6", bg: "#f5f0ff", border: "#c4b5fd", icon: <AlertCircle size={13} /> },
  ESCALATED:          { label: "Escalated",          color: "#9b0025", bg: "#fff0f3", border: "#fca5a5", icon: <AlertCircle size={13} /> },
  PENDING_RESOLUTION: { label: "Pending Resolution", color: "#92650a", bg: "#fef9ec", border: "#f0c842", icon: <Clock size={13} /> },
  RESOLVED:           { label: "Resolved",           color: "#166534", bg: "#f0faf4", border: "#86efac", icon: <CheckCircle2 size={13} /> },
  CLOSED:             { label: "Closed",             color: "#4b5563", bg: "#f5f5f5", border: "#d1d5db", icon: <XCircle size={13} /> },
  REOPENED:           { label: "Reopened",           color: "#9b0025", bg: "#fff0f3", border: "#fca5a5", icon: <AlertCircle size={13} /> },
  "Submitted":        { label: "Submitted",   color: "#92650a", bg: "#fef9ec", border: "#f0c842", icon: <Clock size={13} /> },
  "In Progress":      { label: "In Progress", color: "#1250a0", bg: "#eff4ff", border: "#93b4f0", icon: <ShieldCheck size={13} /> },
  "Resolved":         { label: "Resolved",    color: "#166534", bg: "#f0faf4", border: "#86efac", icon: <CheckCircle2 size={13} /> },
  "Closed":           { label: "Closed",      color: "#4b5563", bg: "#f5f5f5", border: "#d1d5db", icon: <XCircle size={13} /> },
};

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? { label: status, color: "#4b5563", bg: "#f5f5f5", border: "#d1d5db", icon: <Clock size={13} /> };
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold tracking-wide"
      style={{ color: m.color, background: m.bg, border: `1px solid ${m.border}`, borderRadius: 0 }}>
      {m.icon}
      {m.label.toUpperCase()}
    </span>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-1.5" style={{ color: GRAY }}>{label}</div>
      <div className="text-[14px] font-medium text-[#111] capitalize">{value.toLowerCase()}</div>
    </div>
  );
}

export default function TrackPage() {
  const [token, setToken] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [report, setReport] = React.useState<any>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    setLoading(true); setError(""); setReport(null);
    try {
      const res = await api.get(`/api/v1/security/reports/track/${token.trim()}`);
      setReport(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Invalid tracking token. Please check and try again.");
    }
    setLoading(false);
  };

  return (
    <>
      {/* Intro blurb */}
      <div className="mb-8">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-2" style={{ color: GRAY }}>
          Anonymous Reports
        </div>
        <p className="text-[13px] font-light leading-relaxed max-w-sm" style={{ color: GRAY }}>
          Paste the token you saved when you filed anonymously. Your identity stays protected — always.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleTrack}>
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] mb-2" style={{ color: GRAY }}>
          Tracking Token
        </div>
        <div className="relative mb-3">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#bbb" }}>
            <Search size={15} />
          </div>
          <input
            type="text"
            value={token}
            onChange={e => setToken(e.target.value)}
            placeholder="Paste your tracking token…"
            className="w-full pl-11 pr-4 py-3 text-[13px] font-light bg-[#FAFAF7] text-[#111] placeholder:text-[#bbb] focus:outline-none transition-colors duration-200"
            style={{ fontFamily: "'Sora', sans-serif", borderRadius: 0, border: "1px solid #e5e5e5" }}
            onFocus={e => (e.currentTarget.style.borderColor = RED)}
            onBlur={e => (e.currentTarget.style.borderColor = "#e5e5e5")}
          />
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-start gap-2 px-4 py-3 mb-3 text-[13px]"
                style={{ background: "#fff0f3", border: "1px solid #fca5a5", color: "#9b0025" }}>
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={loading || !token.trim()}
          className="group flex items-center gap-2 px-6 py-3 text-[13px] font-semibold text-white disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: RED, borderRadius: 0 }}
        >
          {loading ? "Searching…" : "Track Report"}
          {!loading && <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />}
        </button>
      </form>

      {/* Result */}
      <AnimatePresence>
        {report && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: smooth }}
            className="mt-12"
          >
            <div className="h-[3px] mb-8" style={{ background: RED }} />

            {/* Case header */}
            <div className="flex items-start justify-between gap-6 mb-10">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: GRAY }}>Case Number</div>
                <div className="text-[2rem] font-extrabold tracking-tight leading-none text-[#111]">{report.caseNumber}</div>
              </div>
              <StatusBadge status={report.status} />
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-6 pb-8 mb-8 border-b border-[#eee]">
              <MetaRow label="Report Type" value={report.reportType?.replace(/_/g, " ") ?? "—"} />
              <MetaRow label="Department"  value={report.department ?? "—"} />
              <MetaRow
                label="Date Filed"
                value={new Date(report.submittedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              />
            </div>

            {/* Resolution */}
            {report.resolution && (
              <div className="mb-8 pb-8 border-b border-[#eee]">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={13} color="#166534" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "#166534" }}>Resolution</span>
                </div>
                <p className="text-[14px] font-light leading-relaxed px-5 py-4"
                  style={{ background: "#f0faf4", border: "1px solid #86efac", color: "#166534" }}>
                  {report.resolution}
                </p>
              </div>
            )}

            {/* Messages */}
            {report.messages?.length > 0 && (
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] mb-5" style={{ color: GRAY }}>
                  Messages · {report.messages.length}
                </div>
                <div className="flex flex-col gap-2">
                  {report.messages.map((m: any, i: number) => {
                    const isStaff = m.senderRole !== "REPORTER";
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: isStaff ? -8 : 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35, delay: i * 0.05, ease: smooth }}
                        className="px-5 py-4"
                        style={{
                          background: isStaff ? "#eff4ff" : "#FAFAF7",
                          borderLeft: `3px solid ${isStaff ? "#1565c0" : "#ddd"}`,
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-semibold uppercase tracking-widest"
                            style={{ color: isStaff ? "#1250a0" : GRAY }}>
                            {isStaff ? "Staff" : "You"}
                          </span>
                          <span className="text-[11px] font-light" style={{ color: GRAY }}>
                            {new Date(m.createdAt).toLocaleDateString("en-US", {
                              month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-[13px] font-light leading-relaxed text-[#111]">{m.content}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}