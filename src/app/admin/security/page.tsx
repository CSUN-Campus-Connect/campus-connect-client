"use client";
// src/app/admin/security/page.tsx
import { useEffect, useState, Suspense } from "react";
import { api } from "@/lib/axios";
import { useAdminAuth, hasPermission } from "@/lib/useAdminAuth";
import { adminTheme as t } from "../theme";
import { useAdminSelection } from "../useAdminSelection";

interface SecurityCase {
  id: string; caseNumber: string; title: string; reportType: string; urgency: string; status: string;
  assignedDepartment: string; location: string | null; createdAt: string; isAnonymous: boolean;
  reporter: { id: string; firstName: string; lastName: string; email: string } | null;
  assignedTo: { id: string; firstName: string; lastName: string } | null;
}

interface CaseDetail extends SecurityCase {
  description: string; incidentDate: string; reporterRelationship: string; cleryGeography: string | null;
  internalNotes: string | null; resolutionSummary: string | null; resolvedAt: string | null;
  messages: any[]; statusHistory: any[]; involvedParties: any[]; evidence: any[]; childReports: any[];
}

interface Stats { total: number; byStatus: Record<string, number>; byDepartment: Record<string, number>; byUrgency: Record<string, number>; }

const TIMELINE_STAGES = ["Open", "Investigating", "Resolving", "Closed"] as const;
type Stage = typeof TIMELINE_STAGES[number];

const STATUS_TO_STAGE: Record<string, Stage> = {
  SUBMITTED:          "Open",
  ACKNOWLEDGED:       "Open",
  REOPENED:           "Open",
  UNDER_REVIEW:       "Investigating",
  INVESTIGATION:      "Investigating",
  ESCALATED:          "Investigating",
  PENDING_RESOLUTION: "Resolving",
  RESOLVED:           "Resolving",
  CLOSED:             "Closed",
};

const OPEN_STATUSES = ["SUBMITTED", "ACKNOWLEDGED", "UNDER_REVIEW", "INVESTIGATION", "ESCALATED", "PENDING_RESOLUTION", "REOPENED"];

const URGENCY_MAP: Record<string, { color: string; bg: string; border: string }> = {
  CRITICAL:       { color: "#c94150", bg: "#fef2f3", border: "#f5c6cb" },
  TIME_SENSITIVE: { color: "#c94150", bg: "#fef2f3", border: "#f5c6cb" },
  HIGH:           { color: "#b08800", bg: "#fef9ec", border: "#f0dca0" },
  MEDIUM:         { color: "#3b7dd8", bg: "#f0f5ff", border: "#b3d1ff" },
  LOW:            { color: "#888",    bg: "#f5f5f5", border: "#e0e0e0" },
};

const STATUS_MAP: Record<string, { color: string; bg: string; border: string }> = {
  SUBMITTED:          { color: "#b08800", bg: "#fef9ec", border: "#f0dca0" },
  ACKNOWLEDGED:       { color: "#b08800", bg: "#fef9ec", border: "#f0dca0" },
  REOPENED:           { color: "#b08800", bg: "#fef9ec", border: "#f0dca0" },
  UNDER_REVIEW:       { color: "#3b7dd8", bg: "#f0f5ff", border: "#b3d1ff" },
  INVESTIGATION:      { color: "#3b7dd8", bg: "#f0f5ff", border: "#b3d1ff" },
  ESCALATED:          { color: "#3b7dd8", bg: "#f0f5ff", border: "#b3d1ff" },
  PENDING_RESOLUTION: { color: "#888",    bg: "#f5f5f5", border: "#e0e0e0" },
  RESOLVED:           { color: "#888",    bg: "#f5f5f5", border: "#e0e0e0" },
  CLOSED:             { color: "#2d8a4e", bg: "#f0faf4", border: "#c3e6cb" },
};

const DEPT_LABELS: Record<string, string> = {
  DPS: "Police Services", OEC: "Equity & Compliance", OSCED: "Student Conduct",
  HOUSING: "Housing", UCS: "Counseling Services", PARKING: "Parking & Transport", PHYSICAL_PLANT: "Facilities",
};

function CaseTimeline({ status }: { status: string }) {
  const currentStage = STATUS_TO_STAGE[status] || "Open";
  const currentIndex = TIMELINE_STAGES.indexOf(currentStage);

  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
      {TIMELINE_STAGES.map((stage, i) => {
        const isDone = i < currentIndex;
        const isActive = i === currentIndex;
        return (
          <div key={stage} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
              <div style={{
                width: "10px", height: "10px", borderRadius: "50%", marginBottom: "4px",
                background: isDone ? t.success : isActive ? t.accent : t.borderDark,
              }} />
              <div style={{ fontSize: "10px", color: isActive ? t.accent : isDone ? t.success : t.textLight, fontWeight: isActive ? 600 : 400, textAlign: "center", whiteSpace: "nowrap" }}>
                {stage}
              </div>
            </div>
            {i < TIMELINE_STAGES.length - 1 && (
              <div style={{ height: "2px", flex: 1, background: isDone ? t.success : t.border, marginBottom: "14px", marginLeft: "-1px", marginRight: "-1px" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SecurityContent() {
  const { permissions } = useAdminAuth();
  const { selectedId, select } = useAdminSelection();
  const [cases, setCases] = useState<SecurityCase[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selected, setSelected] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showClosed, setShowClosed] = useState(false);
  const [deptFilter, setDeptFilter] = useState("");
  const [messageText, setMessageText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [statusNote, setStatusNote] = useState("");
  const [tab, setTab] = useState<"detail" | "evidence" | "messages" | "history" | "parties">("detail");
  const [enlargedEvidence, setEnlargedEvidence] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchCases = async (closed: boolean, dept: string) => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
      if (!closed) params.excludeStatus = "CLOSED,RESOLVED";
      if (dept) params.department = dept;
      const [caseRes, statsRes] = await Promise.all([
        api.get("/api/v1/security/cases", { headers, params }),
        api.get("/api/v1/security/stats", { headers }),
      ]);
      setCases(caseRes.data.cases);
      setStats(statsRes.data);
    } catch {}
    setLoading(false);
  };

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setTab("detail");
    try {
      const res = await api.get(`/api/v1/security/cases/${id}`, { headers });
      setSelected(res.data);
    } catch {}
    setDetailLoading(false);
  };

  useEffect(() => { fetchCases(false, ""); }, []);
  useEffect(() => { if (selectedId) openDetail(selectedId); else setSelected(null); }, [selectedId]);

  const updateStatus = async (status: string) => {
    if (!selected) return;
    try {
      await api.patch(`/api/v1/security/cases/${selected.id}/status`, { status, note: statusNote }, { headers });
      setStatusNote("");
      openDetail(selected.id);
      fetchCases(showClosed, deptFilter);
    } catch {}
  };

  const sendMessage = async () => {
    if (!selected || !messageText.trim()) return;
    try {
      await api.post(`/api/v1/security/cases/${selected.id}/messages`, { content: messageText, isInternal }, { headers });
      setMessageText("");
      openDetail(selected.id);
    } catch {}
  };

  const handleToggleClosed = () => {
    const next = !showClosed;
    setShowClosed(next);
    fetchCases(next, deptFilter);
  };

  const handleDeptFilter = (d: string) => {
    const next = deptFilter === d ? "" : d;
    setDeptFilter(next);
    fetchCases(showClosed, next);
  };

  const openCount = stats
    ? Object.entries(stats.byStatus).filter(([k]) => OPEN_STATUSES.includes(k)).reduce((s, [, v]) => s + v, 0)
    : 0;
  const closedCount = stats
    ? (stats.byStatus["CLOSED"] || 0) + (stats.byStatus["RESOLVED"] || 0)
    : 0;

  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: 600, color: t.textPrimary, marginBottom: "4px" }}>Security</h1>
      <p style={{ fontSize: "13px", color: t.textMuted, marginBottom: "20px" }}>campus security case management</p>

      <div style={{ display: "flex", gap: "8px", marginBottom: "14px", alignItems: "center", flexWrap: "wrap" }}>
        <button
          onClick={() => { if (showClosed) handleToggleClosed(); }}
          style={{
            padding: "6px 16px", fontSize: "12px", fontFamily: t.font, cursor: "pointer", borderRadius: "5px",
            background: !showClosed ? t.accentBg : t.bgCard,
            border: `1px solid ${!showClosed ? t.accentBorder : t.border}`,
            color: !showClosed ? t.accent : t.textMuted,
            fontWeight: !showClosed ? 500 : 400,
          }}>
          open <span style={{ marginLeft: "6px", fontSize: "11px", fontWeight: 600 }}>{openCount}</span>
        </button>
        <button
          onClick={() => { if (!showClosed) handleToggleClosed(); }}
          style={{
            padding: "6px 16px", fontSize: "12px", fontFamily: t.font, cursor: "pointer", borderRadius: "5px",
            background: showClosed ? t.bgHover : t.bgCard,
            border: `1px solid ${showClosed ? t.borderDark : t.border}`,
            color: showClosed ? t.textPrimary : t.textMuted,
            fontWeight: showClosed ? 500 : 400,
          }}>
          closed / resolved <span style={{ marginLeft: "6px", fontSize: "11px", fontWeight: 600 }}>{closedCount}</span>
        </button>

        <div style={{ width: "1px", height: "16px", background: t.border, margin: "0 4px" }} />

        {Object.entries(DEPT_LABELS).map(([key, label]) => (
          <button key={key} onClick={() => handleDeptFilter(key)} style={{
            padding: "4px 10px", fontSize: "11px", fontFamily: t.font, cursor: "pointer", borderRadius: "4px",
            background: deptFilter === key ? t.bgAccent : t.bgCard,
            border: `1px solid ${deptFilter === key ? t.accentBorder : t.border}`,
            color: deptFilter === key ? t.accent : t.textMuted,
          }}>{label}</button>
        ))}
      </div>

      <div style={{ display: "flex", gap: "20px" }}>
        <div style={{ flex: selected ? "0 0 45%" : "1" }}>
          {loading ? (
            <div style={{ color: t.textLight, fontSize: "13px" }}>loading...</div>
          ) : cases.length === 0 ? (
            <div style={{ color: t.textLight, fontSize: "13px", textAlign: "center", padding: "40px 0" }}>
              {showClosed ? "no closed cases" : "no open cases"}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {cases.map((c) => {
                const um = URGENCY_MAP[c.urgency] || URGENCY_MAP.MEDIUM;
                const stage = STATUS_TO_STAGE[c.status] || "Open";
                const stageIndex = TIMELINE_STAGES.indexOf(stage);
                return (
                  <div key={c.id} onClick={() => select(c.id)} style={{
                    padding: "12px 16px",
                    background: selected?.id === c.id ? t.bgAccent : t.bgCard,
                    border: `1px solid ${selected?.id === c.id ? t.accentBorder : t.border}`,
                    borderRadius: "6px", cursor: "pointer",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "10px", color: t.textLight }}>{c.caseNumber}</span>
                        <span style={t.badge(um.color, um.bg, um.border)}>{c.urgency}</span>
                        <span style={{ fontSize: "11px", color: t.textMuted }}>{DEPT_LABELS[c.assignedDepartment] || c.assignedDepartment}</span>
                      </div>
                      <span style={{ fontSize: "11px", color: t.textLight, whiteSpace: "nowrap" }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div style={{ fontSize: "13px", color: t.textPrimary, fontWeight: 500, marginBottom: "8px" }}>{c.title}</div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {TIMELINE_STAGES.map((s, i) => {
                        const isDone = i < stageIndex;
                        const isActive = i === stageIndex;
                        return (
                          <div key={s} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                              <div style={{ width: "7px", height: "7px", borderRadius: "50%", marginBottom: "2px", background: isDone ? t.success : isActive ? t.accent : t.border }} />
                              <div style={{ fontSize: "9px", color: isActive ? t.accent : isDone ? t.success : t.textLight, whiteSpace: "nowrap" }}>{s}</div>
                            </div>
                            {i < TIMELINE_STAGES.length - 1 && (
                              <div style={{ height: "1px", flex: 1, background: isDone ? t.success : t.border, marginBottom: "10px" }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ fontSize: "11px", color: t.textLight, marginTop: "6px" }}>
                      {c.isAnonymous ? "anonymous" : c.reporter ? `${c.reporter.firstName} ${c.reporter.lastName}` : "unknown"}
                      {" · "}{c.reportType.replace(/_/g, " ").toLowerCase()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {selected && (
          <div style={{ flex: "0 0 53%", background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "8px", maxHeight: "85vh", overflow: "auto" }}>
            {detailLoading ? (
              <div style={{ padding: "20px", color: t.textLight, fontSize: "13px" }}>loading...</div>
            ) : (
              <>
                <div style={{ padding: "16px 20px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: "11px", color: t.textLight }}>{selected.caseNumber}</div>
                    <div style={{ fontSize: "16px", fontWeight: 600, color: t.textPrimary, marginTop: "2px" }}>{selected.title}</div>
                  </div>
                  <button onClick={() => select(null)} style={{ background: "none", border: "none", color: t.textLight, cursor: "pointer", fontSize: "16px", fontFamily: t.font }}>✕</button>
                </div>

                <div style={{ padding: "16px 20px", borderBottom: `1px solid ${t.border}` }}>
                  <CaseTimeline status={selected.status} />
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <span style={t.badge((URGENCY_MAP[selected.urgency] || URGENCY_MAP.MEDIUM).color, (URGENCY_MAP[selected.urgency] || URGENCY_MAP.MEDIUM).bg, (URGENCY_MAP[selected.urgency] || URGENCY_MAP.MEDIUM).border)}>{selected.urgency}</span>
                    <span style={t.badge(t.textMuted, t.bgCard, t.borderDark)}>{selected.status.replace(/_/g, " ").toLowerCase()}</span>
                    <span style={t.badge(t.textMuted, t.bgCard, t.borderDark)}>{DEPT_LABELS[selected.assignedDepartment]}</span>
                    <span style={t.badge(t.textMuted, t.bgCard, t.borderDark)}>{selected.reportType.replace(/_/g, " ").toLowerCase()}</span>
                  </div>
                </div>

                <div style={{ display: "flex", borderBottom: `1px solid ${t.border}` }}>
                  {(["detail", "evidence", "messages", "history", "parties"] as const).map((tb) => (
                    <button key={tb} onClick={() => setTab(tb)} style={{
                      padding: "8px 14px", fontSize: "12px", fontFamily: t.font, cursor: "pointer",
                      background: "transparent", border: "none",
                      borderBottom: tab === tb ? `2px solid ${t.accent}` : "2px solid transparent",
                      color: tab === tb ? t.accent : t.textMuted,
                    }}>{tb}</button>
                  ))}
                </div>

                <div style={{ padding: "16px 20px" }}>
                  {tab === "detail" && (
                    <>
                      <InfoRow label="reporter" value={selected.isAnonymous ? "anonymous" : selected.reporter ? `${selected.reporter.firstName} ${selected.reporter.lastName} (${selected.reporter.email})` : "unknown"} />
                      <InfoRow label="relationship" value={selected.reporterRelationship.toLowerCase()} />
                      <InfoRow label="incident date" value={new Date(selected.incidentDate).toLocaleString()} />
                      <InfoRow label="submitted" value={new Date(selected.createdAt).toLocaleString()} />
                      {selected.location && <InfoRow label="location" value={selected.location} />}
                      {selected.cleryGeography && <InfoRow label="clery geography" value={selected.cleryGeography.replace(/_/g, " ").toLowerCase()} />}
                      {selected.assignedTo && <InfoRow label="assigned to" value={`${selected.assignedTo.firstName} ${selected.assignedTo.lastName}`} />}
                      <div style={{ marginTop: "14px", padding: "12px", background: t.bgInput, border: `1px solid ${t.border}`, borderRadius: "6px", fontSize: "13px", color: t.textSecondary, lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{selected.description}</div>
                      {selected.resolutionSummary && (
                        <div style={{ marginTop: "12px" }}>
                          <div style={{ fontSize: "11px", color: t.textLight, fontWeight: 500, letterSpacing: "0.5px", marginBottom: "4px" }}>RESOLUTION</div>
                          <div style={{ padding: "10px", background: t.successBg, border: `1px solid ${t.successBorder}`, borderRadius: "6px", fontSize: "12px", color: t.success }}>{selected.resolutionSummary}</div>
                        </div>
                      )}
                      {hasPermission(permissions, "security:investigate") && (
                        <div style={{ marginTop: "20px", borderTop: `1px solid ${t.border}`, paddingTop: "16px" }}>
                          <div style={{ fontSize: "11px", color: t.textLight, fontWeight: 500, letterSpacing: "0.5px", marginBottom: "8px" }}>MOVE CASE</div>
                          <input type="text" value={statusNote} onChange={(e) => setStatusNote(e.target.value)} placeholder="note (optional)..." style={{ ...t.input, width: "100%", fontFamily: t.font, marginBottom: "8px" }} />
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {["ACKNOWLEDGED", "UNDER_REVIEW", "INVESTIGATION", "ESCALATED", "PENDING_RESOLUTION", "RESOLVED", "CLOSED", "REOPENED"].map((s) => {
                              if (s === selected.status) return null;
                              const sm = STATUS_MAP[s] || STATUS_MAP.SUBMITTED;
                              return (
                                <button key={s} onClick={() => updateStatus(s)} style={{ ...t.badge(sm.color, sm.bg, sm.border), cursor: "pointer", padding: "4px 10px", fontFamily: t.font, fontSize: "11px" }}>
                                  {s.replace(/_/g, " ").toLowerCase()}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {tab === "evidence" && (
                    selected.evidence.length === 0 ? (
                      <div style={{ color: t.textLight, fontSize: "13px", textAlign: "center", padding: "20px 0" }}>no evidence uploaded</div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {selected.evidence.map((e: any) => {
                          const isImage = e.fileType.startsWith("image/");
                          const isEnlarged = enlargedEvidence === e.id;
                          return (
                            <div key={e.id} style={{ border: `1px solid ${t.border}`, borderRadius: "6px", overflow: "hidden" }}>
                              {isImage ? (
                                <div onClick={() => setEnlargedEvidence(isEnlarged ? null : e.id)} style={{ cursor: "pointer", background: t.bgInput, display: "flex", justifyContent: "center", padding: "8px" }}>
                                  <img src={e.fileUrl} alt={e.fileName} style={{ maxWidth: isEnlarged ? "100%" : "200px", maxHeight: isEnlarged ? "none" : "140px", objectFit: isEnlarged ? "contain" : "cover" }} />
                                </div>
                              ) : (
                                <div style={{ padding: "16px", background: t.bgInput, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <a href={e.fileUrl} target="_blank" rel="noopener noreferrer" style={{ ...t.btnSecondary, textDecoration: "none", fontFamily: t.font }}>open {e.fileType.split("/")[1]}</a>
                                </div>
                              )}
                              <div style={{ padding: "10px 12px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                  <div style={{ fontSize: "12px", color: t.textPrimary, fontWeight: 500 }}>{e.fileName}</div>
                                  <div style={{ fontSize: "10px", color: t.textLight }}>{(e.fileSizeBytes / 1024).toFixed(1)} KB</div>
                                </div>
                                {e.description && <div style={{ fontSize: "12px", color: t.textMuted, marginTop: "4px" }}>{e.description}</div>}
                                <div style={{ fontSize: "10px", color: t.textLight, marginTop: "4px" }}>sha256: {e.checksumSha256}</div>
                                <div style={{ fontSize: "10px", color: t.textLight, marginTop: "2px" }}>
                                  {new Date(e.uploadedAt).toLocaleString()}
                                  {e.isRedacted && <span style={{ color: t.error, marginLeft: "8px", fontWeight: 500 }}>REDACTED</span>}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )
                  )}

                  {tab === "messages" && (
                    <>
                      {selected.messages.length === 0 ? (
                        <div style={{ color: t.textLight, fontSize: "13px", textAlign: "center", padding: "20px 0" }}>no messages</div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                          {selected.messages.map((m: any) => (
                            <div key={m.id} style={{
                              padding: "10px 12px", borderRadius: "6px",
                              background: m.isInternal ? t.warningBg : t.bgInput,
                              border: `1px solid ${m.isInternal ? t.warningBorder : t.border}`,
                              borderLeft: `3px solid ${m.senderRole === "REPORTER" ? t.info : m.isInternal ? t.warning : t.success}`,
                            }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                <span style={{ fontSize: "11px", color: m.senderRole === "REPORTER" ? t.info : t.success, fontWeight: 500 }}>
                                  {m.senderRole.toLowerCase()}{m.isInternal ? " (internal)" : ""}
                                </span>
                                <span style={{ fontSize: "10px", color: t.textLight }}>{new Date(m.createdAt).toLocaleString()}</span>
                              </div>
                              <div style={{ fontSize: "13px", color: t.textPrimary }}>{m.content}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      {hasPermission(permissions, "security:investigate") && (
                        <div>
                          <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="type a message..." style={{ ...t.input, width: "100%", resize: "vertical" as const, minHeight: "60px", fontFamily: t.font, marginBottom: "8px" }} />
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <label style={{ fontSize: "11px", color: t.textMuted, display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                              <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} />internal only
                            </label>
                            <button onClick={sendMessage} style={{ ...t.btnPrimary, fontFamily: t.font }}>send</button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {tab === "history" && (
                    selected.statusHistory.length === 0 ? (
                      <div style={{ color: t.textLight, fontSize: "13px", textAlign: "center", padding: "20px 0" }}>no history</div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {selected.statusHistory.map((h: any) => {
                          const sm = STATUS_MAP[h.newStatus] || STATUS_MAP.SUBMITTED;
                          return (
                            <div key={h.id} style={{ padding: "8px 12px", borderLeft: `2px solid ${sm.border}`, fontSize: "12px" }}>
                              <span style={{ color: t.textMuted }}>{h.previousStatus?.replace(/_/g, " ").toLowerCase()}</span>
                              <span style={{ color: t.textLight }}> → </span>
                              <span style={{ color: sm.color, fontWeight: 500 }}>{h.newStatus.replace(/_/g, " ").toLowerCase()}</span>
                              <span style={{ color: t.textLight }}> · {new Date(h.createdAt).toLocaleString()}</span>
                              {h.note && <div style={{ color: t.textSecondary, marginTop: "2px" }}>{h.note}</div>}
                            </div>
                          );
                        })}
                      </div>
                    )
                  )}

                  {tab === "parties" && (
                    selected.involvedParties.length === 0 ? (
                      <div style={{ color: t.textLight, fontSize: "13px", textAlign: "center", padding: "20px 0" }}>no involved parties recorded</div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {selected.involvedParties.map((p: any) => (
                          <div key={p.id} style={{ padding: "10px 12px", border: `1px solid ${t.border}`, borderRadius: "6px", fontSize: "13px" }}>
                            {p.name && <div style={{ color: t.textPrimary, fontWeight: 500, marginBottom: "2px" }}>{p.name}</div>}
                            {p.description && <div style={{ color: t.textSecondary }}>{p.description}</div>}
                            {p.affiliation && <div style={{ color: t.textMuted, fontSize: "12px" }}>affiliation: {p.affiliation}</div>}
                            {p.relationToReporter && <div style={{ color: t.textMuted, fontSize: "12px" }}>relation: {p.relationToReporter}</div>}
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: "12px", fontSize: "13px", marginBottom: "6px" }}>
      <span style={{ color: t.textMuted, minWidth: "120px" }}>{label}</span>
      <span style={{ color: t.textPrimary }}>{value}</span>
    </div>
  );
}

export default function SecurityAdminPage() {
  return (
    <Suspense fallback={<div style={{ color: "#bbb", fontSize: "13px" }}>loading...</div>}>
      <SecurityContent />
    </Suspense>
  );
}