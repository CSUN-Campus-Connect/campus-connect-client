"use client";
// src/app/admin/bugs/page.tsx

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";

interface BugReport {
  id: string;
  title: string;
  category: string;
  severity: string;
  reportStatus: string;
  description: string;
  steps: string | null;
  browser: string | null;
  assignedToId: string | null;
  assignedTo: { id: string; firstName: string; lastName: string } | null;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; email: string } | null;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#cc0000",
  high: "#b08800",
  medium: "#2d6da3",
  low: "#555",
};

const STATUS_COLORS: Record<string, string> = {
  open: "#b08800",
  in_progress: "#2d6da3",
  resolved: "#2d8a4e",
  closed: "#555",
};

export default function BugReportsPage() {
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<BugReport | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchBugs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/admin/bugs", { headers });
      setBugs(res.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchBugs(); }, []);

  const updateStatus = async (id: string, reportStatus: string) => {
    try {
      const res = await api.patch(`/api/v1/admin/bugs/${id}`, { reportStatus }, { headers });
      setBugs(bugs.map((b) => b.id === id ? res.data : b));
      if (selected?.id === id) setSelected(res.data);
    } catch {}
  };

  const filtered = statusFilter ? bugs.filter((b) => b.reportStatus === statusFilter) : bugs;

  return (
    <div>
      <h1 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "4px" }}>bug reports</h1>
      <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px" }}>{bugs.length} submitted</p>

      {/* Status filters */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {["", "open", "in_progress", "resolved", "closed"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{
              padding: "5px 14px", fontSize: "12px", fontFamily: "inherit", cursor: "pointer",
              background: statusFilter === s ? "#1a1a1a" : "transparent",
              border: "1px solid #1a1a1a",
              color: s ? (STATUS_COLORS[s] || "#666") : "#999",
            }}>
            {s ? s.replace(/_/g, " ") : "all"}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: "#444", fontSize: "13px" }}>loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ color: "#444", fontSize: "13px", textAlign: "center", padding: "40px 0" }}>
          no bug reports
        </div>
      ) : (
        <div style={{ display: "flex", gap: "24px" }}>
          <div style={{ flex: selected ? "0 0 50%" : "1" }}>
            {filtered.map((bug) => (
              <div
                key={bug.id}
                onClick={() => setSelected(bug)}
                style={{
                  padding: "12px 16px",
                  border: "1px solid #1a1a1a",
                  background: selected?.id === bug.id ? "#111" : "transparent",
                  cursor: "pointer",
                  marginBottom: "4px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{
                        fontSize: "10px", padding: "2px 6px",
                        border: `1px solid ${SEVERITY_COLORS[bug.severity] || "#333"}`,
                        color: SEVERITY_COLORS[bug.severity] || "#666",
                      }}>
                        {bug.severity}
                      </span>
                      <span style={{ fontSize: "10px", padding: "2px 6px", border: "1px solid #222", color: "#666" }}>
                        {bug.category}
                      </span>
                      <span style={{
                        fontSize: "10px", padding: "2px 6px",
                        border: `1px solid ${STATUS_COLORS[bug.reportStatus] || "#333"}`,
                        color: STATUS_COLORS[bug.reportStatus] || "#666",
                      }}>
                        {bug.reportStatus.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div style={{ fontSize: "13px", color: "#ccc" }}>{bug.title}</div>
                  </div>
                  <div style={{ fontSize: "11px", color: "#444", textAlign: "right" }}>
                    {bug.user && <div>{bug.user.firstName} {bug.user.lastName}</div>}
                    <div>{new Date(bug.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selected && (
            <div style={{
              flex: "0 0 48%",
              border: "1px solid #1a1a1a",
              padding: "20px",
              maxHeight: "80vh",
              overflow: "auto",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", color: "#555", letterSpacing: "1px" }}>BUG DETAIL</div>
                <button onClick={() => setSelected(null)} style={{
                  background: "none", border: "none", color: "#555", cursor: "pointer", fontFamily: "inherit", fontSize: "16px",
                }}>✕</button>
              </div>

              <div style={{ fontSize: "16px", fontWeight: 600, color: "#e5e5e5", marginBottom: "12px" }}>
                {selected.title}
              </div>

              <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                <span style={{
                  fontSize: "11px", padding: "3px 8px",
                  border: `1px solid ${SEVERITY_COLORS[selected.severity] || "#333"}`,
                  color: SEVERITY_COLORS[selected.severity] || "#666",
                }}>
                  {selected.severity}
                </span>
                <span style={{ fontSize: "11px", padding: "3px 8px", border: "1px solid #222", color: "#666" }}>
                  {selected.category}
                </span>
                <span style={{
                  fontSize: "11px", padding: "3px 8px",
                  border: `1px solid ${STATUS_COLORS[selected.reportStatus] || "#333"}`,
                  color: STATUS_COLORS[selected.reportStatus] || "#666",
                }}>
                  {selected.reportStatus.replace(/_/g, " ")}
                </span>
              </div>

              <div style={{ fontSize: "13px", color: "#999", marginBottom: "16px", lineHeight: "1.6" }}>
                {selected.description}
              </div>

              {selected.steps && (
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "11px", color: "#555", letterSpacing: "1px", marginBottom: "6px" }}>
                    STEPS TO REPRODUCE
                  </div>
                  <div style={{
                    padding: "10px", background: "#0d0d0d", border: "1px solid #1a1a1a",
                    fontSize: "12px", color: "#888", whiteSpace: "pre-wrap",
                  }}>
                    {selected.steps}
                  </div>
                </div>
              )}

              {selected.browser && (
                <div style={{ fontSize: "12px", color: "#555" }}>browser: {selected.browser}</div>
              )}

              {selected.user && (
                <div style={{ fontSize: "12px", color: "#555", marginTop: "4px" }}>
                  reported by: {selected.user.firstName} {selected.user.lastName} ({selected.user.email})
                </div>
              )}

              {selected.assignedTo && (
                <div style={{ fontSize: "12px", color: "#555", marginTop: "4px" }}>
                  assigned to: {selected.assignedTo.firstName} {selected.assignedTo.lastName}
                </div>
              )}

              <div style={{ fontSize: "12px", color: "#444", marginTop: "4px" }}>
                submitted: {new Date(selected.createdAt).toLocaleString()}
              </div>

              {/* Status controls */}
              <div style={{ marginTop: "20px", borderTop: "1px solid #1a1a1a", paddingTop: "16px" }}>
                <div style={{ fontSize: "11px", color: "#555", letterSpacing: "1px", marginBottom: "8px" }}>UPDATE STATUS</div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {["open", "in_progress", "resolved", "closed"].map((s) => (
                    s !== selected.reportStatus && (
                      <button key={s} onClick={() => updateStatus(selected.id, s)}
                        style={{
                          padding: "4px 10px", background: "transparent",
                          border: `1px solid ${STATUS_COLORS[s] || "#333"}`,
                          color: STATUS_COLORS[s] || "#666",
                          fontFamily: "inherit", fontSize: "10px", cursor: "pointer",
                        }}>
                        {s.replace(/_/g, " ")}
                      </button>
                    )
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}