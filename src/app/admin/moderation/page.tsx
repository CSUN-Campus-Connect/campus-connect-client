"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { useAdminAuth, hasPermission } from "@/lib/useAdminAuth";

interface Report {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  description: string | null;
  status: string;
  priority: string;
  createdAt: string;
  reporter: { id: string; firstName: string; lastName: string; email: string };
  assignedTo: { id: string; firstName: string; lastName: string } | null;
}

interface Stats {
  byStatus: { pending: number; inReview: number; resolved: number; dismissed: number; escalated: number };
  total: number;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#b08800",
  IN_REVIEW: "#2d6da3",
  RESOLVED: "#2d8a4e",
  DISMISSED: "#555",
  ESCALATED: "#cc0000",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "#444",
  NORMAL: "#666",
  HIGH: "#b08800",
  URGENT: "#cc0000",
};

export default function ModerationPage() {
  const { permissions } = useAdminAuth();
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
      const params: any = { limit: 50 };
      if (status) params.status = status;
      const [queueRes, statsRes] = await Promise.all([
        api.get("/api/v1/moderation/queue", { headers, params }),
        api.get("/api/v1/moderation/stats", { headers }),
      ]);
      setReports(queueRes.data.reports);
      setStats(statsRes.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchQueue(); }, []);

  const handleFilter = (status: string) => {
    const newFilter = filter === status ? "" : status;
    setFilter(newFilter);
    fetchQueue(newFilter || undefined);
  };

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/api/v1/moderation/reports/${id}`, { headers });
      setSelectedReport(res.data);
    } catch {}
    setDetailLoading(false);
  };

  const claimReport = async (id: string) => {
    try {
      await api.patch(`/api/v1/moderation/reports/${id}/claim`, {}, { headers });
      openDetail(id);
      fetchQueue(filter || undefined);
    } catch {}
  };

  const takeAction = async (id: string, action: string) => {
    try {
      await api.post(`/api/v1/moderation/reports/${id}/action`, { action, note: actionNote }, { headers });
      setActionNote("");
      openDetail(id);
      fetchQueue(filter || undefined);
    } catch {}
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/api/v1/moderation/reports/${id}/status`, { status }, { headers });
      openDetail(id);
      fetchQueue(filter || undefined);
    } catch {}
  };

  return (
    <div>
      <h1 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "4px" }}>moderation</h1>
      <p style={{ fontSize: "13px", color: "#666", marginBottom: "32px" }}>content report queue</p>

      {/* Stats bar */}
      {stats && (
        <div style={{ display: "flex", gap: "12px", marginBottom: "28px" }}>
          {Object.entries(stats.byStatus).map(([key, count]) => (
            <button
              key={key}
              onClick={() => handleFilter(key.toUpperCase().replace("INREVIEW", "IN_REVIEW"))}
              style={{
                padding: "8px 16px",
                background: filter === key.toUpperCase().replace("INREVIEW", "IN_REVIEW") ? "#1a1a1a" : "transparent",
                border: "1px solid #1a1a1a",
                color: STATUS_COLORS[key.toUpperCase().replace("INREVIEW", "IN_REVIEW")] || "#666",
                fontFamily: "inherit",
                fontSize: "12px",
                cursor: "pointer",
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "16px", fontWeight: 600 }}>{count}</span>
              {key.replace(/([A-Z])/g, " $1").toLowerCase().trim()}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: "24px" }}>
        {/* Queue list */}
        <div style={{ flex: selectedReport ? "0 0 50%" : "1" }}>
          {loading ? (
            <div style={{ color: "#444", fontSize: "13px" }}>loading...</div>
          ) : reports.length === 0 ? (
            <div style={{ color: "#444", fontSize: "13px", padding: "40px 0", textAlign: "center" }}>
              {filter ? `no ${filter.toLowerCase()} reports` : "no reports in queue"}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {reports.map((r) => (
                <div
                  key={r.id}
                  onClick={() => openDetail(r.id)}
                  style={{
                    padding: "12px 16px",
                    border: "1px solid #1a1a1a",
                    background: selectedReport?.id === r.id ? "#111" : "transparent",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{
                        fontSize: "10px",
                        padding: "2px 6px",
                        border: `1px solid ${PRIORITY_COLORS[r.priority] || "#333"}`,
                        color: PRIORITY_COLORS[r.priority] || "#666",
                      }}>
                        {r.priority}
                      </span>
                      <span style={{
                        fontSize: "10px",
                        padding: "2px 6px",
                        border: `1px solid ${STATUS_COLORS[r.status] || "#333"}`,
                        color: STATUS_COLORS[r.status] || "#666",
                      }}>
                        {r.status.replace("_", " ")}
                      </span>
                      <span style={{ fontSize: "12px", color: "#888" }}>
                        {r.targetType.toLowerCase().replace("_", " ")}
                      </span>
                    </div>
                    <div style={{ fontSize: "13px", color: "#ccc" }}>
                      {r.reason.replace(/_/g, " ").toLowerCase()}
                      {r.description && (
                        <span style={{ color: "#555" }}> — {r.description.slice(0, 60)}{r.description.length > 60 ? "..." : ""}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: "11px", color: "#444", textAlign: "right", whiteSpace: "nowrap" }}>
                    <div>{r.reporter.firstName} {r.reporter.lastName}</div>
                    <div>{new Date(r.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedReport && (
          <div style={{
            flex: "0 0 48%",
            border: "1px solid #1a1a1a",
            padding: "20px",
            maxHeight: "80vh",
            overflow: "auto",
          }}>
            {detailLoading ? (
              <div style={{ color: "#444", fontSize: "13px" }}>loading...</div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                  <div>
                    <div style={{ fontSize: "11px", color: "#555", letterSpacing: "1px", marginBottom: "4px" }}>
                      REPORT DETAIL
                    </div>
                    <div style={{ fontSize: "10px", color: "#333" }}>{selectedReport.id}</div>
                  </div>
                  <button
                    onClick={() => setSelectedReport(null)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#555",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: "16px",
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* Status & priority */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                  <span style={{
                    fontSize: "11px",
                    padding: "3px 8px",
                    border: `1px solid ${STATUS_COLORS[selectedReport.status]}`,
                    color: STATUS_COLORS[selectedReport.status],
                  }}>
                    {selectedReport.status.replace("_", " ")}
                  </span>
                  <span style={{
                    fontSize: "11px",
                    padding: "3px 8px",
                    border: `1px solid ${PRIORITY_COLORS[selectedReport.priority]}`,
                    color: PRIORITY_COLORS[selectedReport.priority],
                  }}>
                    {selectedReport.priority}
                  </span>
                  {selectedReport.otherReportsOnTarget > 0 && (
                    <span style={{
                      fontSize: "11px",
                      padding: "3px 8px",
                      border: "1px solid #663333",
                      color: "#cc0000",
                    }}>
                      {selectedReport.otherReportsOnTarget} other report{selectedReport.otherReportsOnTarget > 1 ? "s" : ""} on this content
                    </span>
                  )}
                </div>

                {/* Report info */}
                <div style={{ marginBottom: "20px" }}>
                  <InfoRow label="type" value={selectedReport.targetType.toLowerCase().replace("_", " ")} />
                  <InfoRow label="reason" value={selectedReport.reason.replace(/_/g, " ").toLowerCase()} />
                  <InfoRow label="reported by" value={`${selectedReport.reporter.firstName} ${selectedReport.reporter.lastName}`} />
                  <InfoRow label="date" value={new Date(selectedReport.createdAt).toLocaleString()} />
                  {selectedReport.assignedTo && (
                    <InfoRow label="assigned to" value={`${selectedReport.assignedTo.firstName} ${selectedReport.assignedTo.lastName}`} />
                  )}
                  {selectedReport.description && (
                    <div style={{ marginTop: "12px", padding: "10px", background: "#0d0d0d", border: "1px solid #1a1a1a", fontSize: "13px", color: "#999" }}>
                      {selectedReport.description}
                    </div>
                  )}
                </div>

                {/* Reported content */}
                {selectedReport.targetContent && (
                  <div style={{ marginBottom: "20px" }}>
                    <div style={{ fontSize: "11px", color: "#555", letterSpacing: "1px", marginBottom: "8px" }}>
                      REPORTED CONTENT
                    </div>
                    <div style={{ padding: "12px", background: "#0d0d0d", border: "1px solid #1a1a1a", fontSize: "13px" }}>
                      <pre style={{ whiteSpace: "pre-wrap", color: "#ccc", fontFamily: "inherit", margin: 0 }}>
                        {JSON.stringify(selectedReport.targetContent, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Action history */}
                {selectedReport.actions?.length > 0 && (
                  <div style={{ marginBottom: "20px" }}>
                    <div style={{ fontSize: "11px", color: "#555", letterSpacing: "1px", marginBottom: "8px" }}>
                      ACTION HISTORY
                    </div>
                    {selectedReport.actions.map((a: any) => (
                      <div key={a.id} style={{ padding: "8px 12px", borderLeft: "2px solid #333", marginBottom: "6px", fontSize: "12px" }}>
                        <span style={{ color: "#cc0000" }}>{a.action.replace(/_/g, " ").toLowerCase()}</span>
                        <span style={{ color: "#444" }}> by {a.moderator.firstName} {a.moderator.lastName}</span>
                        <span style={{ color: "#333" }}> — {new Date(a.createdAt).toLocaleString()}</span>
                        {a.note && <div style={{ color: "#666", marginTop: "4px" }}>{a.note}</div>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                {hasPermission(permissions, "moderation:action") && selectedReport.status !== "RESOLVED" && selectedReport.status !== "DISMISSED" && (
                  <div>
                    <div style={{ fontSize: "11px", color: "#555", letterSpacing: "1px", marginBottom: "8px" }}>
                      TAKE ACTION
                    </div>

                    {!selectedReport.assignedTo && (
                      <button onClick={() => claimReport(selectedReport.id)} style={actionBtnStyle("#2d6da3")}>
                        claim report
                      </button>
                    )}

                    <textarea
                      value={actionNote}
                      onChange={(e) => setActionNote(e.target.value)}
                      placeholder="add a note (optional)..."
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        background: "#0d0d0d",
                        border: "1px solid #1a1a1a",
                        color: "#ccc",
                        fontFamily: "inherit",
                        fontSize: "12px",
                        resize: "vertical",
                        minHeight: "60px",
                        marginBottom: "8px",
                        outline: "none",
                      }}
                    />

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      <button onClick={() => takeAction(selectedReport.id, "CONTENT_REMOVED")} style={actionBtnStyle("#cc0000")}>
                        remove content
                      </button>
                      <button onClick={() => takeAction(selectedReport.id, "USER_WARNED")} style={actionBtnStyle("#b08800")}>
                        warn user
                      </button>
                      <button onClick={() => takeAction(selectedReport.id, "USER_SUSPENDED")} style={actionBtnStyle("#cc0000")}>
                        suspend user
                      </button>
                      <button onClick={() => takeAction(selectedReport.id, "REPORT_DISMISSED")} style={actionBtnStyle("#555")}>
                        dismiss
                      </button>
                      <button onClick={() => takeAction(selectedReport.id, "REPORT_ESCALATED")} style={actionBtnStyle("#663333")}>
                        escalate
                      </button>
                      <button onClick={() => takeAction(selectedReport.id, "NOTE_ADDED")} style={actionBtnStyle("#444")}>
                        add note only
                      </button>
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
  return (
    <div style={{ display: "flex", gap: "12px", fontSize: "13px", marginBottom: "6px" }}>
      <span style={{ color: "#555", minWidth: "100px" }}>{label}</span>
      <span style={{ color: "#ccc" }}>{value}</span>
    </div>
  );
}

const actionBtnStyle = (color: string): React.CSSProperties => ({
  padding: "5px 12px",
  background: "transparent",
  border: `1px solid ${color}`,
  color,
  fontFamily: "inherit",
  fontSize: "11px",
  cursor: "pointer",
});