"use client";
// src/app/admin/security/page.tsx

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { useAdminAuth, hasPermission } from "@/lib/useAdminAuth";

interface SecurityCase {
  id: string;
  caseNumber: string;
  title: string;
  reportType: string;
  urgency: string;
  status: string;
  assignedDepartment: string;
  location: string | null;
  createdAt: string;
  isAnonymous: boolean;
  reporter: { id: string; firstName: string; lastName: string; email: string } | null;
  assignedTo: { id: string; firstName: string; lastName: string } | null;
}

interface CaseDetail extends SecurityCase {
  description: string;
  incidentDate: string;
  reporterRelationship: string;
  cleryGeography: string | null;
  internalNotes: string | null;
  resolutionSummary: string | null;
  resolvedAt: string | null;
  messages: any[];
  statusHistory: any[];
  involvedParties: any[];
  evidence: any[];
  childReports: any[];
}

interface Stats {
  total: number;
  byStatus: Record<string, number>;
  byDepartment: Record<string, number>;
  byUrgency: Record<string, number>;
}

const URGENCY_COLORS: Record<string, string> = {
  CRITICAL: "#cc0000",
  HIGH: "#b08800",
  MEDIUM: "#2d6da3",
  LOW: "#555",
  TIME_SENSITIVE: "#8b5cf6",
};

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "#b08800",
  ACKNOWLEDGED: "#2d6da3",
  UNDER_REVIEW: "#2d6da3",
  INVESTIGATION: "#8b5cf6",
  ESCALATED: "#cc0000",
  PENDING_RESOLUTION: "#b08800",
  RESOLVED: "#2d8a4e",
  CLOSED: "#555",
  REOPENED: "#cc0000",
};

const DEPT_LABELS: Record<string, string> = {
  DPS: "Police Services",
  OEC: "Equity & Compliance",
  OSCED: "Student Conduct",
  HOUSING: "Housing",
  UCS: "Counseling Services",
  PARKING: "Parking & Transport",
  PHYSICAL_PLANT: "Facilities",
};

export default function SecurityAdminPage() {
  const { permissions } = useAdminAuth();
  const [cases, setCases] = useState<SecurityCase[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selected, setSelected] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [messageText, setMessageText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [statusNote, setStatusNote] = useState("");
  const [tab, setTab] = useState<"detail" | "evidence" | "messages" | "history" | "parties">("detail");
  const [enlargedEvidence, setEnlargedEvidence] = useState<string | null>(null);



  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchCases = async (status?: string, dept?: string) => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
      if (status) params.status = status;
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

  useEffect(() => { fetchCases(); }, []);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setTab("detail");
    try {
      const res = await api.get(`/api/v1/security/cases/${id}`, { headers });
      setSelected(res.data);
    } catch {}
    setDetailLoading(false);
  };

  const updateStatus = async (status: string) => {
    if (!selected) return;
    try {
      await api.patch(`/api/v1/security/cases/${selected.id}/status`, { status, note: statusNote }, { headers });
      setStatusNote("");
      openDetail(selected.id);
      fetchCases(statusFilter || undefined, deptFilter || undefined);
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

  const handleStatusFilter = (s: string) => {
    const next = statusFilter === s ? "" : s;
    setStatusFilter(next);
    fetchCases(next || undefined, deptFilter || undefined);
  };

  const handleDeptFilter = (d: string) => {
    const next = deptFilter === d ? "" : d;
    setDeptFilter(next);
    fetchCases(statusFilter || undefined, next || undefined);
  };

  return (
    <div>
      <h1 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "4px" }}>security</h1>
      <p style={{ fontSize: "13px", color: "#666", marginBottom: "24px" }}>campus security case management</p>

      {/* Stats */}
      {stats && (
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
          {Object.entries(stats.byStatus).map(([key, count]) => (
            <button key={key} onClick={() => handleStatusFilter(key)}
              style={{
                padding: "6px 14px", fontSize: "12px", fontFamily: "inherit", cursor: "pointer",
                background: statusFilter === key ? "#1a1a1a" : "transparent",
                border: "1px solid #1a1a1a",
                color: STATUS_COLORS[key] || "#666",
              }}>
              <span style={{ fontWeight: 600, marginRight: "6px" }}>{count}</span>
              {key.replace(/_/g, " ").toLowerCase()}
            </button>
          ))}
        </div>
      )}

      {/* Department filter */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
        {Object.entries(DEPT_LABELS).map(([key, label]) => (
          <button key={key} onClick={() => handleDeptFilter(key)}
            style={{
              padding: "4px 10px", fontSize: "11px", fontFamily: "inherit", cursor: "pointer",
              background: deptFilter === key ? "#1a1a1a" : "transparent",
              border: "1px solid #111",
              color: deptFilter === key ? "#e5e5e5" : "#555",
            }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: "24px" }}>
        {/* Case list */}
        <div style={{ flex: selected ? "0 0 45%" : "1" }}>
          {loading ? (
            <div style={{ color: "#444", fontSize: "13px" }}>loading...</div>
          ) : cases.length === 0 ? (
            <div style={{ color: "#444", fontSize: "13px", textAlign: "center", padding: "40px 0" }}>
              no cases found
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {cases.map((c) => (
                <div key={c.id} onClick={() => openDetail(c.id)}
                  style={{
                    padding: "12px 16px", border: "1px solid #1a1a1a", cursor: "pointer",
                    background: selected?.id === c.id ? "#111" : "transparent",
                  }}>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "4px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "11px", color: "#444", fontFamily: "inherit" }}>{c.caseNumber}</span>
                    <span style={{ fontSize: "10px", padding: "2px 6px", border: `1px solid ${URGENCY_COLORS[c.urgency] || "#333"}`, color: URGENCY_COLORS[c.urgency] || "#666" }}>{c.urgency}</span>
                    <span style={{ fontSize: "10px", padding: "2px 6px", border: `1px solid ${STATUS_COLORS[c.status] || "#333"}`, color: STATUS_COLORS[c.status] || "#666" }}>{c.status.replace(/_/g, " ")}</span>
                    <span style={{ fontSize: "10px", padding: "2px 6px", border: "1px solid #222", color: "#666" }}>{DEPT_LABELS[c.assignedDepartment] || c.assignedDepartment}</span>
                  </div>
                  <div style={{ fontSize: "13px", color: "#ccc" }}>{c.title}</div>
                  <div style={{ fontSize: "11px", color: "#444", marginTop: "4px" }}>
                    {c.isAnonymous ? "anonymous" : c.reporter ? `${c.reporter.firstName} ${c.reporter.lastName}` : "unknown"}
                    {" · "}{c.reportType.replace(/_/g, " ").toLowerCase()}
                    {" · "}{new Date(c.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ flex: "0 0 53%", border: "1px solid #1a1a1a", maxHeight: "85vh", overflow: "auto" }}>
            {detailLoading ? (
              <div style={{ padding: "20px", color: "#444", fontSize: "13px" }}>loading...</div>
            ) : (
              <>
                {/* Header */}
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: "12px", color: "#555" }}>{selected.caseNumber}</div>
                    <div style={{ fontSize: "16px", fontWeight: 600, color: "#e5e5e5", marginTop: "4px" }}>{selected.title}</div>
                  </div>
                  <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "16px", fontFamily: "inherit" }}>✕</button>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", borderBottom: "1px solid #1a1a1a" }}>
                    {(["detail", "evidence", "messages", "history", "parties"] as const).map((t) => (
                    <button key={t} onClick={() => setTab(t)}
                      style={{
                        padding: "8px 16px", fontSize: "12px", fontFamily: "inherit", cursor: "pointer",
                        background: "transparent", border: "none", borderBottom: tab === t ? "2px solid #cc0000" : "2px solid transparent",
                        color: tab === t ? "#e5e5e5" : "#555",
                      }}>
                      {t}
                    </button>
                  ))}
                </div>

                <div style={{ padding: "16px 20px" }}>
                  {/* DETAIL TAB */}
                  {tab === "detail" && (
                    <>
                      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "11px", padding: "3px 8px", border: `1px solid ${URGENCY_COLORS[selected.urgency]}`, color: URGENCY_COLORS[selected.urgency] }}>{selected.urgency}</span>
                        <span style={{ fontSize: "11px", padding: "3px 8px", border: `1px solid ${STATUS_COLORS[selected.status]}`, color: STATUS_COLORS[selected.status] }}>{selected.status.replace(/_/g, " ")}</span>
                        <span style={{ fontSize: "11px", padding: "3px 8px", border: "1px solid #222", color: "#888" }}>{DEPT_LABELS[selected.assignedDepartment]}</span>
                        <span style={{ fontSize: "11px", padding: "3px 8px", border: "1px solid #222", color: "#888" }}>{selected.reportType.replace(/_/g, " ").toLowerCase()}</span>
                      </div>

                      <InfoRow label="reporter" value={selected.isAnonymous ? "anonymous" : selected.reporter ? `${selected.reporter.firstName} ${selected.reporter.lastName} (${selected.reporter.email})` : "unknown"} />
                      <InfoRow label="relationship" value={selected.reporterRelationship.toLowerCase()} />
                      <InfoRow label="incident date" value={new Date(selected.incidentDate).toLocaleString()} />
                      <InfoRow label="submitted" value={new Date(selected.createdAt).toLocaleString()} />
                      {selected.location && <InfoRow label="location" value={selected.location} />}
                      {selected.cleryGeography && <InfoRow label="clery geography" value={selected.cleryGeography.replace(/_/g, " ").toLowerCase()} />}
                      {selected.assignedTo && <InfoRow label="assigned to" value={`${selected.assignedTo.firstName} ${selected.assignedTo.lastName}`} />}

                      <div style={{ marginTop: "16px", padding: "12px", background: "#0d0d0d", border: "1px solid #1a1a1a", fontSize: "13px", color: "#999", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                        {selected.description}
                      </div>

                      {selected.resolutionSummary && (
                        <div style={{ marginTop: "12px" }}>
                          <div style={{ fontSize: "11px", color: "#555", letterSpacing: "1px", marginBottom: "4px" }}>RESOLUTION</div>
                          <div style={{ padding: "10px", background: "#0d0d0d", border: "1px solid #1a1a1a", fontSize: "12px", color: "#888" }}>{selected.resolutionSummary}</div>
                        </div>
                      )}

                      {/* Status controls */}
                      {hasPermission(permissions, "security:investigate") && (
                        <div style={{ marginTop: "20px", borderTop: "1px solid #1a1a1a", paddingTop: "16px" }}>
                          <div style={{ fontSize: "11px", color: "#555", letterSpacing: "1px", marginBottom: "8px" }}>UPDATE STATUS</div>
                          <input type="text" value={statusNote} onChange={(e) => setStatusNote(e.target.value)} placeholder="note (optional)..."
                            style={{ width: "100%", padding: "6px 12px", background: "#0d0d0d", border: "1px solid #1a1a1a", color: "#ccc", fontFamily: "inherit", fontSize: "12px", marginBottom: "8px", outline: "none" }} />
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {["ACKNOWLEDGED", "UNDER_REVIEW", "INVESTIGATION", "ESCALATED", "PENDING_RESOLUTION", "RESOLVED", "CLOSED", "REOPENED"].map((s) => (
                              s !== selected.status && (
                                <button key={s} onClick={() => updateStatus(s)}
                                  style={{ padding: "4px 10px", background: "transparent", border: `1px solid ${STATUS_COLORS[s] || "#333"}`, color: STATUS_COLORS[s] || "#666", fontFamily: "inherit", fontSize: "10px", cursor: "pointer" }}>
                                  {s.replace(/_/g, " ").toLowerCase()}
                                </button>
                              )
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {/* EVIDENCE TAB */}
                  {tab === "evidence" && (
                    <>
                      {selected.evidence.length === 0 ? (
                        <div style={{ color: "#444", fontSize: "13px", textAlign: "center", padding: "20px 0" }}>no evidence uploaded</div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          {selected.evidence.map((e: any) => {
                            const isImage = e.fileType.startsWith("image/");
                            const isEnlarged = enlargedEvidence === e.id;
                            return (
                              <div key={e.id} style={{ border: "1px solid #1a1a1a", overflow: "hidden" }}>
                                {isImage && (
                                  <div
                                    onClick={() => setEnlargedEvidence(isEnlarged ? null : e.id)}
                                    style={{ cursor: "pointer", background: "#0a0a0a", display: "flex", justifyContent: "center", padding: "8px" }}
                                  >
                                    <img
                                      src={e.fileUrl}
                                      alt={e.fileName}
                                      style={{
                                        maxWidth: isEnlarged ? "100%" : "200px",
                                        maxHeight: isEnlarged ? "none" : "140px",
                                        objectFit: isEnlarged ? "contain" : "cover",
                                        transition: "all 0.2s ease",
                                      }}
                                    />
                                  </div>
                                )}
                                {!isImage && (
                                  <div style={{ padding: "16px", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <a href={e.fileUrl} target="_blank" rel="noopener noreferrer"
                                      style={{ fontSize: "12px", padding: "6px 16px", border: "1px solid #333", color: "#999", textDecoration: "none" }}>
                                      open {e.fileType.split("/")[1]}
                                    </a>
                                  </div>
                                )}
                                <div style={{ padding: "10px 12px" }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ fontSize: "12px", color: "#ccc" }}>{e.fileName}</div>
                                    <div style={{ fontSize: "10px", color: "#555" }}>{(e.fileSizeBytes / 1024).toFixed(1)} KB</div>
                                  </div>
                                  {e.description && (
                                    <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>{e.description}</div>
                                  )}
                                  <div style={{ fontSize: "10px", color: "#333", marginTop: "6px", fontFamily: "inherit" }}>
                                    sha256: {e.checksumSha256}
                                  </div>
                                  <div style={{ fontSize: "10px", color: "#444", marginTop: "2px" }}>
                                    {new Date(e.uploadedAt).toLocaleString()}
                                    {e.isRedacted && <span style={{ color: "#cc0000", marginLeft: "8px" }}>REDACTED</span>}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                  {/* MESSAGES TAB */}
                  {tab === "messages" && (
                    <>
                      {selected.messages.length === 0 ? (
                        <div style={{ color: "#444", fontSize: "13px", textAlign: "center", padding: "20px 0" }}>no messages</div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                          {selected.messages.map((m: any) => (
                            <div key={m.id} style={{
                              padding: "10px 12px",
                              background: m.isInternal ? "#1a1000" : "#0d0d0d",
                              border: `1px solid ${m.isInternal ? "#332200" : "#1a1a1a"}`,
                              borderLeft: `3px solid ${m.senderRole === "REPORTER" ? "#2d6da3" : m.isInternal ? "#b08800" : "#2d8a4e"}`,
                            }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                <span style={{ fontSize: "11px", color: m.senderRole === "REPORTER" ? "#2d6da3" : "#2d8a4e" }}>
                                  {m.senderRole.toLowerCase()}{m.isInternal ? " (internal)" : ""}
                                </span>
                                <span style={{ fontSize: "10px", color: "#444" }}>{new Date(m.createdAt).toLocaleString()}</span>
                              </div>
                              <div style={{ fontSize: "13px", color: "#ccc" }}>{m.content}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {hasPermission(permissions, "security:investigate") && (
                        <div>
                          <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="type a message..."
                            style={{ width: "100%", padding: "8px 12px", background: "#0d0d0d", border: "1px solid #1a1a1a", color: "#ccc", fontFamily: "inherit", fontSize: "12px", resize: "vertical", minHeight: "60px", outline: "none", marginBottom: "8px" }} />
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <label style={{ fontSize: "11px", color: "#555", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                              <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} />
                              internal only (not visible to reporter)
                            </label>
                            <button onClick={sendMessage} style={{ padding: "5px 16px", background: "#1a1a1a", border: "1px solid #333", color: "#999", fontFamily: "inherit", fontSize: "12px", cursor: "pointer" }}>send</button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* HISTORY TAB */}
                  {tab === "history" && (
                    <>
                      {selected.statusHistory.length === 0 ? (
                        <div style={{ color: "#444", fontSize: "13px", textAlign: "center", padding: "20px 0" }}>no history</div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {selected.statusHistory.map((h: any) => (
                            <div key={h.id} style={{ padding: "8px 12px", borderLeft: "2px solid #333", fontSize: "12px" }}>
                              <span style={{ color: STATUS_COLORS[h.newStatus] || "#666" }}>{h.previousStatus}</span>
                              <span style={{ color: "#444" }}> → </span>
                              <span style={{ color: STATUS_COLORS[h.newStatus] || "#666" }}>{h.newStatus}</span>
                              <span style={{ color: "#333" }}> · {new Date(h.createdAt).toLocaleString()}</span>
                              {h.note && <div style={{ color: "#666", marginTop: "2px" }}>{h.note}</div>}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* PARTIES TAB */}
                  {tab === "parties" && (
                    <>
                      {selected.involvedParties.length === 0 ? (
                        <div style={{ color: "#444", fontSize: "13px", textAlign: "center", padding: "20px 0" }}>no involved parties recorded</div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {selected.involvedParties.map((p: any) => (
                            <div key={p.id} style={{ padding: "10px 12px", border: "1px solid #1a1a1a", fontSize: "13px" }}>
                              {p.name && <div style={{ color: "#e5e5e5", marginBottom: "2px" }}>{p.name}</div>}
                              {p.description && <div style={{ color: "#888" }}>{p.description}</div>}
                              {p.affiliation && <div style={{ color: "#555", fontSize: "12px" }}>affiliation: {p.affiliation}</div>}
                              {p.relationToReporter && <div style={{ color: "#555", fontSize: "12px" }}>relation: {p.relationToReporter}</div>}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
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
      <span style={{ color: "#555", minWidth: "120px" }}>{label}</span>
      <span style={{ color: "#ccc" }}>{value}</span>
    </div>
  );
}