"use client";
// src/app/admin/bugs/page.tsx
import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { adminTheme as t } from "../theme";

interface BugReport { id: string; title: string; category: string; severity: string; reportStatus: string; description: string; steps: string | null; browser: string | null; assignedToId: string | null; assignedTo: { id: string; firstName: string; lastName: string } | null; createdAt: string; user: { id: string; firstName: string; lastName: string; email: string } | null; }

const SEV: Record<string, { color: string; bg: string; border: string }> = { critical: { color: "#c94150", bg: "#fef2f3", border: "#f5c6cb" }, high: { color: "#b08800", bg: "#fef9ec", border: "#f0dca0" }, medium: { color: "#3b7dd8", bg: "#f0f5ff", border: "#b3d1ff" }, low: { color: "#888", bg: "#f5f5f5", border: "#e0e0e0" } };
const STAT: Record<string, { color: string; bg: string; border: string }> = { open: { color: "#b08800", bg: "#fef9ec", border: "#f0dca0" }, in_progress: { color: "#3b7dd8", bg: "#f0f5ff", border: "#b3d1ff" }, resolved: { color: "#2d8a4e", bg: "#f0faf4", border: "#c3e6cb" }, closed: { color: "#888", bg: "#f5f5f5", border: "#e0e0e0" } };

export default function BugReportsPage() {
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<BugReport | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchBugs = async () => { setLoading(true); try { const res = await api.get("/api/v1/admin/bugs", { headers }); setBugs(res.data); } catch {} setLoading(false); };
  useEffect(() => { fetchBugs(); }, []);

  const updateStatus = async (id: string, reportStatus: string) => {
    try { const res = await api.patch(`/api/v1/admin/bugs/${id}`, { reportStatus }, { headers }); setBugs(bugs.map((b) => b.id === id ? res.data : b)); if (selected?.id === id) setSelected(res.data); } catch {}
  };

  const filtered = statusFilter ? bugs.filter((b) => b.reportStatus === statusFilter) : bugs;

  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: 600, color: t.textPrimary, marginBottom: "4px" }}>Bug Reports</h1>
      <p style={{ fontSize: "13px", color: t.textMuted, marginBottom: "20px" }}>{bugs.length} submitted</p>

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {["", "open", "in_progress", "resolved", "closed"].map((s) => {
          const st = STAT[s];
          return (<button key={s} onClick={() => setStatusFilter(s)} style={{ padding: "5px 14px", fontSize: "12px", fontFamily: t.font, cursor: "pointer", borderRadius: "5px", background: statusFilter === s ? (st?.bg || t.bgCard) : t.bgCard, border: `1px solid ${statusFilter === s ? (st?.border || t.borderDark) : t.border}`, color: st?.color || t.textMuted }}>{s ? s.replace(/_/g, " ") : "all"}</button>);
        })}
      </div>

      {loading ? <div style={{ color: t.textLight, fontSize: "13px" }}>loading...</div> : filtered.length === 0 ? <div style={{ color: t.textLight, fontSize: "13px", textAlign: "center", padding: "40px 0" }}>no bug reports</div> : (
        <div style={{ display: "flex", gap: "20px" }}>
          <div style={{ flex: selected ? "0 0 50%" : "1" }}>
            {filtered.map((bug) => {
              const sv = SEV[bug.severity] || SEV.low;
              const st = STAT[bug.reportStatus] || STAT.open;
              return (
                <div key={bug.id} onClick={() => setSelected(bug)} style={{ padding: "12px 16px", background: selected?.id === bug.id ? t.bgAccent : t.bgCard, border: `1px solid ${selected?.id === bug.id ? t.accentBorder : t.border}`, borderRadius: "6px", cursor: "pointer", marginBottom: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "4px" }}>
                        <span style={t.badge(sv.color, sv.bg, sv.border)}>{bug.severity}</span>
                        <span style={t.badge(t.textMuted, t.bgCard, t.borderDark)}>{bug.category}</span>
                        <span style={t.badge(st.color, st.bg, st.border)}>{bug.reportStatus.replace(/_/g, " ")}</span>
                      </div>
                      <div style={{ fontSize: "13px", color: t.textPrimary, fontWeight: 500 }}>{bug.title}</div>
                    </div>
                    <div style={{ fontSize: "11px", color: t.textLight, textAlign: "right" }}>
                      {bug.user && <div>{bug.user.firstName} {bug.user.lastName}</div>}
                      <div>{new Date(bug.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {selected && (
            <div style={{ flex: "0 0 48%", background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "8px", padding: "20px", maxHeight: "80vh", overflow: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", color: t.textLight, fontWeight: 500, letterSpacing: "0.5px" }}>BUG DETAIL</div>
                <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: t.textLight, cursor: "pointer", fontFamily: t.font, fontSize: "16px" }}>✕</button>
              </div>
              <div style={{ fontSize: "16px", fontWeight: 600, color: t.textPrimary, marginBottom: "12px" }}>{selected.title}</div>
              <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
                <span style={t.badge((SEV[selected.severity] || SEV.low).color, (SEV[selected.severity] || SEV.low).bg, (SEV[selected.severity] || SEV.low).border)}>{selected.severity}</span>
                <span style={t.badge(t.textMuted, t.bgCard, t.borderDark)}>{selected.category}</span>
                <span style={t.badge((STAT[selected.reportStatus] || STAT.open).color, (STAT[selected.reportStatus] || STAT.open).bg, (STAT[selected.reportStatus] || STAT.open).border)}>{selected.reportStatus.replace(/_/g, " ")}</span>
              </div>
              <div style={{ fontSize: "13px", color: t.textSecondary, marginBottom: "16px", lineHeight: "1.6" }}>{selected.description}</div>
              {selected.steps && (<div style={{ marginBottom: "16px" }}><div style={{ fontSize: "11px", color: t.textLight, fontWeight: 500, letterSpacing: "0.5px", marginBottom: "6px" }}>STEPS TO REPRODUCE</div><div style={{ padding: "10px", background: t.bgInput, border: `1px solid ${t.border}`, borderRadius: "6px", fontSize: "12px", color: t.textSecondary, whiteSpace: "pre-wrap" }}>{selected.steps}</div></div>)}
              {selected.browser && <div style={{ fontSize: "12px", color: t.textMuted }}>browser: {selected.browser}</div>}
              {selected.user && <div style={{ fontSize: "12px", color: t.textMuted, marginTop: "4px" }}>reported by: {selected.user.firstName} {selected.user.lastName} ({selected.user.email})</div>}
              {selected.assignedTo && <div style={{ fontSize: "12px", color: t.textMuted, marginTop: "4px" }}>assigned to: {selected.assignedTo.firstName} {selected.assignedTo.lastName}</div>}
              <div style={{ fontSize: "12px", color: t.textLight, marginTop: "4px" }}>submitted: {new Date(selected.createdAt).toLocaleString()}</div>
              <div style={{ marginTop: "20px", borderTop: `1px solid ${t.border}`, paddingTop: "16px" }}>
                <div style={{ fontSize: "11px", color: t.textLight, fontWeight: 500, letterSpacing: "0.5px", marginBottom: "8px" }}>UPDATE STATUS</div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {["open", "in_progress", "resolved", "closed"].map((s) => { const st = STAT[s] || STAT.open; return s !== selected.reportStatus && (<button key={s} onClick={() => updateStatus(selected.id, s)} style={{ ...t.badge(st.color, st.bg, st.border), cursor: "pointer", padding: "4px 10px", fontFamily: t.font, fontSize: "11px" }}>{s.replace(/_/g, " ")}</button>); })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}