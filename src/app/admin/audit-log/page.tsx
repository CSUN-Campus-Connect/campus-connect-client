// src/app/admin/audit-log/page.tsx
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";

interface AuditEntry {
  id: string;
  action: string;
  target: string | null;
  metadata: any;
  ipAddress: string | null;
  createdAt: string;
  actor: { id: string; firstName: string; lastName: string; email: string };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");

  const fetchLogs = async (page = 1, action = actionFilter) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params: any = { page, limit: 50 };
      if (action) params.action = action;
      const res = await api.get("/api/v1/admin/audit-log", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setLogs(res.data.logs);
      setPagination(res.data.pagination);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(1, actionFilter);
  };

  return (
    <div>
      <h1 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "4px" }}>audit log</h1>
      <p style={{ fontSize: "13px", color: "#666", marginBottom: "32px" }}>every privileged action on the platform</p>

      <form onSubmit={handleFilter} style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        <input
          type="text"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          placeholder="filter by action (e.g. role:assigned, moderation)..."
          style={{
            padding: "6px 12px",
            background: "#111",
            border: "1px solid #222",
            color: "#e5e5e5",
            fontFamily: "inherit",
            fontSize: "13px",
            width: "360px",
            outline: "none",
          }}
        />
        <button type="submit" style={{
          padding: "6px 16px",
          background: "#1a1a1a",
          border: "1px solid #333",
          color: "#999",
          fontFamily: "inherit",
          fontSize: "13px",
          cursor: "pointer",
        }}>
          filter
        </button>
        {actionFilter && (
          <button type="button" onClick={() => { setActionFilter(""); fetchLogs(1, ""); }} style={{
            padding: "6px 12px",
            background: "transparent",
            border: "1px solid #222",
            color: "#555",
            fontFamily: "inherit",
            fontSize: "13px",
            cursor: "pointer",
          }}>
            clear
          </button>
        )}
      </form>

      {loading ? (
        <div style={{ color: "#444", fontSize: "13px" }}>loading...</div>
      ) : logs.length === 0 ? (
        <div style={{ color: "#444", fontSize: "13px", textAlign: "center", padding: "40px 0" }}>
          no audit entries found
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {logs.map((log) => (
              <div key={log.id} style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "10px 16px",
                borderBottom: "1px solid #111",
                fontSize: "13px",
              }}>
                <span style={{ color: "#444", fontSize: "11px", minWidth: "150px", whiteSpace: "nowrap" }}>
                  {new Date(log.createdAt).toLocaleString()}
                </span>
                <span style={{ color: "#999", minWidth: "140px" }}>
                  {log.actor.firstName} {log.actor.lastName}
                </span>
                <span style={{
                  fontSize: "11px",
                  padding: "2px 8px",
                  border: "1px solid #331111",
                  color: "#cc0000",
                }}>
                  {log.action}
                </span>
                {log.target && (
                  <span style={{ color: "#555", fontSize: "12px" }}>{log.target}</span>
                )}
              </div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div style={{ display: "flex", gap: "8px", marginTop: "24px", justifyContent: "center" }}>
              {Array.from({ length: Math.min(pagination.pages, 10) }, (_, i) => (
                <button
                  key={i}
                  onClick={() => fetchLogs(i + 1)}
                  style={{
                    padding: "4px 10px",
                    background: pagination.page === i + 1 ? "#1a1a1a" : "transparent",
                    border: "1px solid #222",
                    color: pagination.page === i + 1 ? "#e5e5e5" : "#555",
                    fontFamily: "inherit",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}