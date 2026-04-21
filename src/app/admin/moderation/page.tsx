"use client";
// src/app/admin/moderation/page.tsx
import { useEffect, useState, Suspense } from "react";
import { api } from "@/lib/axios";
import { useAdminAuth, hasPermission } from "@/lib/useAdminAuth";
import { adminTheme as t } from "../theme";
import { useAdminSelection } from "../useAdminSelection";

interface Report { id: string; targetType: string; targetId: string; reason: string; description: string | null; status: string; priority: string; createdAt: string; reporter: { id: string; firstName: string; lastName: string; email: string }; assignedTo: { id: string; firstName: string; lastName: string } | null; }
interface Stats { byStatus: { pending: number; inReview: number; resolved: number; dismissed: number; escalated: number }; total: number; }

const STATUS_MAP: Record<string, { color: string; bg: string; border: string }> = {
  PENDING: { color: "#b08800", bg: "#fef9ec", border: "#f0dca0" }, IN_REVIEW: { color: "#3b7dd8", bg: "#f0f5ff", border: "#b3d1ff" },
  RESOLVED: { color: "#2d8a4e", bg: "#f0faf4", border: "#c3e6cb" }, DISMISSED: { color: "#888", bg: "#f5f5f5", border: "#e0e0e0" },
  ESCALATED: { color: "#c94150", bg: "#fef2f3", border: "#f5c6cb" },
};
const PRIORITY_MAP: Record<string, { color: string; bg: string; border: string }> = {
  LOW: { color: "#888", bg: "#f5f5f5", border: "#e0e0e0" }, NORMAL: { color: "#666", bg: "#f5f5f5", border: "#e0e0e0" },
  HIGH: { color: "#b08800", bg: "#fef9ec", border: "#f0dca0" }, URGENT: { color: "#c94150", bg: "#fef2f3", border: "#f5c6cb" },
};

function ModerationContent() {
  const { permissions } = useAdminAuth();
  const { selectedId, select } = useAdminSelection();
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionNote, setActionNote] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchQueue = async (status?: string) => {
    setLoading(true);
    try {
      const params: any = { limit: 50 }; if (status) params.status = status;
      const [queueRes, statsRes] = await Promise.all([api.get("/api/v1/moderation/queue", { headers, params }), api.get("/api/v1/moderation/stats", { headers })]);
      setReports(queueRes.data.reports); setStats(statsRes.data);
    } catch {} setLoading(false);
  };

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    try { const res = await api.get(`/api/v1/moderation/reports/${id}`, { headers }); setSelectedReport(res.data); } catch {}
    setDetailLoading(false);
  };

  useEffect(() => { fetchQueue(); }, []);
  useEffect(() => { if (selectedId) openDetail(selectedId); else setSelectedReport(null); }, [selectedId]);

  const handleFilter = (status: string) => { const f = filter === status ? "" : status; setFilter(f); fetchQueue(f || undefined); };
  const claimReport = async (id: string) => { try { await api.patch(`/api/v1/moderation/reports/${id}/claim`, {}, { headers }); openDetail(id); fetchQueue(filter || undefined); } catch {} };
  const takeAction = async (id: string, action: string) => {
    if (!actionNote && action !== "REPORT_DISMISSED" && action !== "NOTE_ADDED") { if (!confirm(`Take action "${action.replace(/_/g, " ").toLowerCase()}" without a note?`)) return; }
    try { await api.post(`/api/v1/moderation/reports/${id}/action`, { action, note: actionNote }, { headers }); setActionNote(""); openDetail(id); fetchQueue(filter || undefined); } catch {}
  };

  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: 600, color: t.textPrimary, marginBottom: "4px" }}>Moderation</h1>
      <p style={{ fontSize: "13px", color: t.textMuted, marginBottom: "24px" }}>content report queue</p>

      {stats && (
        <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
          {Object.entries(stats.byStatus).map(([key, count]) => {
            const statusKey = key.toUpperCase().replace("INREVIEW", "IN_REVIEW");
            const sm = STATUS_MAP[statusKey] || STATUS_MAP.PENDING;
            return (
              <button key={key} onClick={() => handleFilter(statusKey)} style={{
                padding: "8px 16px", fontSize: "12px", fontFamily: t.font, cursor: "pointer", borderRadius: "6px",
                display: "flex", gap: "8px", alignItems: "center",
                background: filter === statusKey ? sm.bg : t.bgCard, border: `1px solid ${filter === statusKey ? sm.border : t.border}`, color: sm.color,
              }}><span style={{ fontSize: "16px", fontWeight: 600 }}>{count}</span>{key.replace(/([A-Z])/g, " $1").toLowerCase().trim()}</button>
            );
          })}
        </div>
      )}

      <div style={{ display: "flex", gap: "20px" }}>
        <div style={{ flex: selectedReport ? "0 0 50%" : "1" }}>
          {loading ? <div style={{ color: t.textLight, fontSize: "13px" }}>loading...</div> : reports.length === 0 ? (
            <div style={{ color: t.textLight, fontSize: "13px", padding: "40px 0", textAlign: "center" }}>{filter ? `no ${filter.toLowerCase().replace("_", " ")} reports` : "no reports in queue"}</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {reports.map((r) => {
                const sm = STATUS_MAP[r.status] || STATUS_MAP.PENDING;
                const pm = PRIORITY_MAP[r.priority] || PRIORITY_MAP.NORMAL;
                return (
                  <div key={r.id} onClick={() => select(r.id)} style={{
                    padding: "12px 16px", background: selectedReport?.id === r.id ? t.bgAccent : t.bgCard,
                    border: `1px solid ${selectedReport?.id === r.id ? t.accentBorder : t.border}`, borderRadius: "6px", cursor: "pointer",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <div>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "4px" }}>
                        <span style={t.badge(pm.color, pm.bg, pm.border)}>{r.priority}</span>
                        <span style={t.badge(sm.color, sm.bg, sm.border)}>{r.status.replace("_", " ")}</span>
                        <span style={{ fontSize: "12px", color: t.textMuted }}>{r.targetType.toLowerCase().replace("_", " ")}</span>
                      </div>
                      <div style={{ fontSize: "13px", color: t.textPrimary, fontWeight: 500 }}>
                        {r.reason.replace(/_/g, " ").toLowerCase()}
                        {r.description && <span style={{ color: t.textMuted, fontWeight: 400 }}> — {r.description.slice(0, 60)}{r.description.length > 60 ? "..." : ""}</span>}
                      </div>
                    </div>
                    <div style={{ fontSize: "11px", color: t.textLight, textAlign: "right", whiteSpace: "nowrap" }}>
                      <div>{r.reporter.firstName} {r.reporter.lastName}</div>
                      <div>{new Date(r.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {selectedReport && (
          <div style={{ flex: "0 0 48%", background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "8px", padding: "20px", maxHeight: "80vh", overflow: "auto" }}>
            {detailLoading ? <div style={{ color: t.textLight, fontSize: "13px" }}>loading...</div> : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                  <div>
                    <div style={{ fontSize: "11px", color: t.textLight, fontWeight: 500, letterSpacing: "0.5px", marginBottom: "4px" }}>REPORT DETAIL</div>
                    <div style={{ fontSize: "10px", color: t.textLight }}>{selectedReport.id}</div>
                  </div>
                  <button onClick={() => select(null)} style={{ background: "none", border: "none", color: t.textLight, cursor: "pointer", fontFamily: t.font, fontSize: "16px" }}>✕</button>
                </div>

                <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
                  <span style={t.badge((STATUS_MAP[selectedReport.status] || STATUS_MAP.PENDING).color, (STATUS_MAP[selectedReport.status] || STATUS_MAP.PENDING).bg, (STATUS_MAP[selectedReport.status] || STATUS_MAP.PENDING).border)}>{selectedReport.status.replace("_", " ")}</span>
                  <span style={t.badge((PRIORITY_MAP[selectedReport.priority] || PRIORITY_MAP.NORMAL).color, (PRIORITY_MAP[selectedReport.priority] || PRIORITY_MAP.NORMAL).bg, (PRIORITY_MAP[selectedReport.priority] || PRIORITY_MAP.NORMAL).border)}>{selectedReport.priority}</span>
                  {selectedReport.otherReportsOnTarget > 0 && <span style={t.badge(t.error, t.errorBg, t.errorBorder)}>{selectedReport.otherReportsOnTarget} other report{selectedReport.otherReportsOnTarget > 1 ? "s" : ""}</span>}
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <InfoRow label="type" value={selectedReport.targetType.toLowerCase().replace("_", " ")} />
                  <InfoRow label="reason" value={selectedReport.reason.replace(/_/g, " ").toLowerCase()} />
                  <InfoRow label="reported by" value={`${selectedReport.reporter.firstName} ${selectedReport.reporter.lastName}`} />
                  <InfoRow label="date" value={new Date(selectedReport.createdAt).toLocaleString()} />
                  {selectedReport.assignedTo && <InfoRow label="assigned to" value={`${selectedReport.assignedTo.firstName} ${selectedReport.assignedTo.lastName}`} />}
                  {selectedReport.description && <div style={{ marginTop: "12px", padding: "10px 12px", background: t.bgInput, border: `1px solid ${t.border}`, borderRadius: "6px", fontSize: "13px", color: t.textSecondary }}>{selectedReport.description}</div>}
                </div>

                {selectedReport.targetContent && (
                  <div style={{ marginBottom: "20px" }}>
                    <div style={{ fontSize: "11px", color: t.textLight, fontWeight: 500, letterSpacing: "0.5px", marginBottom: "8px" }}>REPORTED CONTENT</div>
                    <div style={{ padding: "12px", background: t.bgInput, border: `1px solid ${t.border}`, borderRadius: "6px", fontSize: "13px" }}>
                      <pre style={{ whiteSpace: "pre-wrap", color: t.textSecondary, fontFamily: t.font, margin: 0 }}>{JSON.stringify(selectedReport.targetContent, null, 2)}</pre>
                    </div>
                  </div>
                )}

                {selectedReport.actions?.length > 0 && (
                  <div style={{ marginBottom: "20px" }}>
                    <div style={{ fontSize: "11px", color: t.textLight, fontWeight: 500, letterSpacing: "0.5px", marginBottom: "8px" }}>ACTION HISTORY</div>
                    {selectedReport.actions.map((a: any) => (
                      <div key={a.id} style={{ padding: "8px 12px", borderLeft: `2px solid ${t.accentBorder}`, marginBottom: "6px", fontSize: "12px" }}>
                        <span style={{ color: t.accent, fontWeight: 500 }}>{a.action.replace(/_/g, " ").toLowerCase()}</span>
                        <span style={{ color: t.textMuted }}> by {a.moderator.firstName} {a.moderator.lastName}</span>
                        <span style={{ color: t.textLight }}> — {new Date(a.createdAt).toLocaleString()}</span>
                        {a.note && <div style={{ color: t.textSecondary, marginTop: "4px" }}>{a.note}</div>}
                      </div>
                    ))}
                  </div>
                )}

                {hasPermission(permissions, "moderation:action") && selectedReport.status !== "RESOLVED" && selectedReport.status !== "DISMISSED" && (
                  <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: "16px" }}>
                    <div style={{ fontSize: "11px", color: t.textLight, fontWeight: 500, letterSpacing: "0.5px", marginBottom: "10px" }}>TAKE ACTION</div>
                    {!selectedReport.assignedTo && <button onClick={() => claimReport(selectedReport.id)} style={{ ...t.btnPrimary, fontFamily: t.font, marginBottom: "12px", background: t.info }}>claim report</button>}
                    <textarea value={actionNote} onChange={(e) => setActionNote(e.target.value)} placeholder="add a note explaining the action taken..." style={{ ...t.input, width: "100%", resize: "vertical" as const, minHeight: "70px", fontFamily: t.font, marginBottom: "10px" }} />
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      <button onClick={() => takeAction(selectedReport.id, "CONTENT_REMOVED")} style={{ ...t.btnDanger, fontFamily: t.font }}>remove content</button>
                      <button onClick={() => takeAction(selectedReport.id, "USER_WARNED")} style={{ ...t.btnWarning, fontFamily: t.font }}>warn user</button>
                      <button onClick={() => takeAction(selectedReport.id, "USER_SUSPENDED")} style={{ ...t.btnDanger, fontFamily: t.font }}>suspend user</button>
                      <button onClick={() => takeAction(selectedReport.id, "REPORT_DISMISSED")} style={{ ...t.btnSecondary, fontFamily: t.font }}>dismiss</button>
                      <button onClick={() => takeAction(selectedReport.id, "REPORT_ESCALATED")} style={{ ...t.btnDanger, fontFamily: t.font, background: t.errorBg }}>escalate</button>
                      <button onClick={() => takeAction(selectedReport.id, "NOTE_ADDED")} style={{ ...t.btnSecondary, fontFamily: t.font }}>add note only</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (<div style={{ display: "flex", gap: "12px", fontSize: "13px", marginBottom: "6px" }}><span style={{ color: "#999", minWidth: "100px" }}>{label}</span><span style={{ color: "#1a1a1a" }}>{value}</span></div>);
}

export default function ModerationPage() {
  return <Suspense fallback={<div style={{ color: "#bbb", fontSize: "13px" }}>loading...</div>}><ModerationContent /></Suspense>;
}