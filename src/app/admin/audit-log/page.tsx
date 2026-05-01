"use client";
// src/app/admin/audit-log/page.tsx

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { adminTheme as t } from "../theme";

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
  const [error, setError] = useState(false);
  const [actionFilter, setActionFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    setError(false);
    try {
      const token = localStorage.getItem("token");
      const params: any = { page, limit: 50 };
      if (actionFilter) params.action = actionFilter;
      if (nameFilter) params.name = nameFilter;
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;
      const res = await api.get("/api/v1/admin/audit-log", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setLogs(res.data.logs);
      setPagination(res.data.pagination);
    } catch {
      setError(true);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(1);
  };

  const handleClear = () => {
    setActionFilter("");
    setNameFilter("");
    setDateFrom("");
    setDateTo("");
    setTimeout(() => fetchLogs(1), 0);
  };

  const hasActiveFilters = actionFilter || nameFilter || dateFrom || dateTo;

  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: 600, color: t.textPrimary, marginBottom: "4px" }}>Audit Log</h1>
      <p style={{ fontSize: "13px", color: t.textMuted, marginBottom: "24px" }}>every privileged action on the platform</p>

      <form onSubmit={handleFilter} style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            placeholder="filter by name..."
            style={{ ...t.input, width: "180px", fontFamily: t.font }}
          />
          <input
            type="text"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            placeholder="filter by action..."
            style={{ ...t.input, width: "200px", fontFamily: t.font }}
          />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{ ...t.input, fontFamily: t.font, fontSize: "12px" }}
          />
          <span style={{ fontSize: "12px", color: t.textMuted }}>to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={{ ...t.input, fontFamily: t.font, fontSize: "12px" }}
          />
          <button type="submit" style={{ ...t.btnPrimary, fontFamily: t.font }}>filter</button>
          {hasActiveFilters && (
            <button type="button" onClick={handleClear} style={{ ...t.btnSecondary, fontFamily: t.font }}>clear</button>
          )}
        </div>
      </form>

      {loading ? (
        <div style={{ color: t.textLight, fontSize: "13px" }}>loading...</div>
      ) : error ? (
        <div style={{ color: t.error, fontSize: "13px" }}>failed to load audit log</div>
      ) : logs.length === 0 ? (
        <div style={{ color: t.textLight, fontSize: "13px", textAlign: "center", padding: "40px 0" }}>
          no audit entries found
        </div>
      ) : (
        <>
          <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "8px", overflow: "hidden" }}>
            {logs.map((log, i) => (
              <div key={log.id} style={{
                display: "flex", alignItems: "center", gap: "16px",
                padding: "10px 16px", fontSize: "13px",
                borderBottom: i < logs.length - 1 ? `1px solid ${t.border}` : "none",
              }}>
                <span style={{ color: t.textLight, fontSize: "11px", minWidth: "150px", whiteSpace: "nowrap" }}>
                  {new Date(log.createdAt).toLocaleString()}
                </span>
                <span style={{ color: t.textSecondary, minWidth: "140px", fontSize: "12px" }}>
                  {log.actor.firstName} {log.actor.lastName}
                </span>
                <span style={t.badge(t.accent, t.accentBg, t.accentBorder)}>
                  {log.action}
                </span>
                {log.target && (
                  <span style={{ color: t.textMuted, fontSize: "12px" }}>{log.target}</span>
                )}
                {log.ipAddress && (
                  <span style={{ color: t.textLight, fontSize: "11px", marginLeft: "auto" }}>{log.ipAddress}</span>
                )}
              </div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div style={{ display: "flex", gap: "6px", marginTop: "20px", justifyContent: "center" }}>
              {Array.from({ length: Math.min(pagination.pages, 10) }, (_, i) => (
                <button
                  key={i}
                  onClick={() => fetchLogs(i + 1)}
                  style={{
                    padding: "4px 10px", borderRadius: "4px", fontSize: "12px",
                    cursor: "pointer", fontFamily: t.font,
                    background: pagination.page === i + 1 ? t.accent : t.bgCard,
                    border: `1px solid ${pagination.page === i + 1 ? t.accent : t.borderDark}`,
                    color: pagination.page === i + 1 ? "#fff" : t.textMuted,
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