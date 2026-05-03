"use client";
// src/app/security/reports/[id]/page.tsx

import * as React from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/axios";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, Clock, ShieldCheck, CheckCircle2,
  XCircle, AlertCircle, ChevronRight,
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
      <div className="text-[14px] font-medium text-[#111]">{value}</div>
    </div>
  );
}

export default function CaseDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  React.useEffect(() => {
    if (!id) return;
    api.get(`/api/v1/security/reports/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setReport(res.data))
      .catch(() => setError("Could not load this report. It may not exist or you may not have access."))
      .finally(() => setLoading(false));
  }, [id]);

  /*  Loading  */
  if (loading) {
    return (
      <div className="flex flex-col gap-5 animate-pulse">
        <div className="h-4 w-32" style={{ background: "#f0f0f0" }} />
        <div className="h-8 w-64" style={{ background: "#f0f0f0" }} />
        <div className="h-[1px] w-full" style={{ background: "#eee" }} />
        <div className="grid grid-cols-2 gap-5">
          {[...Array(4)].map((_, i) => <div key={i} className="h-12" style={{ background: "#f5f5f5" }} />)}
        </div>
      </div>
    );
  }

  /* Error  */
  if (error) {
    return (
      <div>
        <button onClick={() => router.push("/security/reports")}
          className="group flex items-center gap-1.5 text-[13px] font-light mb-8 transition-colors hover:text-[#111]"
          style={{ color: GRAY }}>
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
          My Reports
        </button>
        <div className="flex items-start gap-2 px-4 py-3 text-[13px]"
          style={{ background: "#fff0f3", border: "1px solid #fca5a5", color: "#9b0025" }}>
          <AlertCircle size={14} className="mt-0.5 shrink-0" />{error}
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: smooth }}
    >
      {/* Breadcrumb + back */}
      <div className="flex items-center gap-2 mb-8">
        <button
          onClick={() => router.push("/security/reports")}
          className="group flex items-center gap-1.5 text-[13px] font-light transition-colors hover:text-[#111]"
          style={{ color: GRAY }}
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
          My Reports
        </button>
        <ChevronRight size={12} style={{ color: "#ddd" }} />
        <span className="text-[13px] font-light" style={{ color: GRAY }}>{report.caseNumber}</span>
      </div>

      {/* Red rule */}
      <div className="h-[3px] mb-8" style={{ background: RED }} />

      {/* Header */}
      <div className="flex items-start justify-between gap-6 mb-10">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: GRAY }}>
            Case Number
          </div>
          <h2 className="text-[2rem] font-extrabold tracking-tight leading-none text-[#111] mb-3">
            {report.caseNumber}
          </h2>
          <h3 className="text-[1.1rem] font-semibold text-[#111]">{report.title}</h3>
        </div>
        <StatusBadge status={report.status} />
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-6 pb-8 mb-8 border-b border-[#eee]">
        <MetaRow
          label="Report Type"
          value={report.reportType?.replace(/_/g, " ") ?? "—"}
        />
        <MetaRow
          label="Department"
          value={report.department || report.assignedDepartment || "—"}
        />
        <MetaRow
          label="Incident Date"
          value={new Date(report.incidentDate).toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        />
        <MetaRow
          label="Date Filed"
          value={new Date(report.createdAt).toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        />
        {report.location && <MetaRow label="Location" value={report.location} />}
      </div>

      {/* Description */}
      {report.description && (
        <div className="mb-8 pb-8 border-b border-[#eee]">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] mb-3" style={{ color: GRAY }}>Description</div>
          <p className="text-[14px] font-light leading-relaxed text-[#111] whitespace-pre-wrap px-5 py-4"
            style={{ background: "#FAFAF7", border: "1px solid #eee" }}>
            {report.description}
          </p>
        </div>
      )}

      {/* Resolution */}
      {report.resolution && (
        <div className="mb-8 pb-8 border-b border-[#eee]">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={13} color="#166534" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "#166534" }}>
              Resolution
            </span>
          </div>
          <p className="text-[14px] font-light leading-relaxed"
            style={{ color: "#166534", background: "#f0faf4", border: "1px solid #86efac", padding: "1rem 1.25rem" }}>
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
                  key={m.id ?? i}
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
                        month: "short", day: "numeric",
                        hour: "2-digit", minute: "2-digit",
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
  );
}