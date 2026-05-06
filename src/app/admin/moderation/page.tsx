"use client";
// src/app/admin/moderation/page.tsx

import { useEffect, useState, Suspense } from "react";
import { api } from "@/lib/axios";
import { useAdminAuth, hasPermission } from "@/lib/useAdminAuth";
import { adminTheme as t } from "../theme";
import { useAdminSelection } from "../useAdminSelection";

interface Report { id: string; targetType: string; targetId: string; reason: string; description: string | null; status: string; priority: string; createdAt: string; reporter: { id: string; firstName: string; lastName: string; email: string }; assignedTo: { id: string; firstName: string; lastName: string } | null; }
interface Stats { byStatus: { pending: number; inReview: number; resolved: number; dismissed: number; escalated: number }; total: number; }
interface Club { id: string; name: string; description: string | null; category: string; isPrivate: boolean; status: string; rejectionReason: string | null; createdAt: string; createdBy: { id: string; firstName: string; lastName: string; email: string }; _count: { members: number; events: number; joinRequests: number }; }
interface Event { id: string; title: string; description: string | null; startDate: string; endDate: string | null; isPublic: boolean; createdAt: string; createdBy: { id: string; firstName: string; lastName: string } | null; club: { id: string; name: string } | null; }
interface Listing { id: string; title: string; price: number; category: string; condition: string; status: string; views: number; createdAt: string; seller: { id: string; firstName: string; lastName: string; email: string }; }

//3-bucket color system 

const critical = { color: "#CC0033", bg: "#fff5f5", border: "#f5c6cb" };
const active   = { color: "#111111", bg: "#f0f0f0", border: "#d8d8d8" };
const neutral  = { color: "#888888", bg: "#f7f7f7", border: "#e0e0e0" };

const priorityStyle = (p: string) => p === "URGENT" ? critical : p === "HIGH" ? active : neutral;
const clubStatusStyle = (s: string) => s === "rejected" ? critical : s === "approved" ? neutral : active;
const listingStatusStyle = (s: string) => s === "deleted" ? critical : s === "active" ? active : neutral;

// Tab

function Tab({ label, active: isActive, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: "7px 16px", fontSize: "13px", fontFamily: t.font, cursor: "pointer",
      borderRadius: "6px 6px 0 0",
      border: `1px solid ${isActive ? t.border : "transparent"}`,
      borderBottom: isActive ? `1px solid ${t.bgCard}` : `1px solid ${t.border}`,
      background: isActive ? t.bgCard : "transparent",
      color: isActive ? t.textPrimary : t.textMuted,
      fontWeight: isActive ? 500 : 400,
      marginBottom: "-1px", position: "relative" as const,
    }}>
      {label}
    </button>
  );
}

// Report

function ReportsTab() {
  const { permissions } = useAdminAuth();
  const { selectedId, select } = useAdminSelection("reportId");
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
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

  const STATUS_LABELS: Record<string, string> = {
    pending: "pending", inReview: "in review", resolved: "resolved", dismissed: "dismissed", escalated: "escalated",
  };

  return (
    <div>
      {stats && (
        <div style={{ display: "flex", gap: "6px", marginBottom: "20px", flexWrap: "wrap" }}>
          {Object.entries(stats.byStatus).map(([key, count]) => {
            const statusKey = key.toUpperCase().replace("INREVIEW", "IN_REVIEW");
            const isActive = filter === statusKey;
            const isCrit = statusKey === "ESCALATED";
            return (
              <button key={key} onClick={() => handleFilter(statusKey)} style={{
                padding: "5px 14px", fontSize: "12px", fontFamily: t.font, cursor: "pointer", borderRadius: "5px",
                background: isActive ? (isCrit ? critical.bg : active.bg) : t.bgCard,
                border: `1px solid ${isActive ? (isCrit ? critical.border : active.border) : t.border}`,
                color: isActive ? (isCrit ? critical.color : active.color) : t.textMuted,
              }}>
                <span style={{ fontWeight: 600, marginRight: "5px" }}>{count}</span>
                {STATUS_LABELS[key] || key}
              </button>
            );
          })}
        </div>
      )}

      <div style={{ display: "flex", gap: "20px" }}>
        <div style={{ flex: selectedReport ? "0 0 50%" : "1" }}>
          {loading ? (
            <div style={{ color: t.textLight, fontSize: "13px" }}>loading...</div>
          ) : reports.length === 0 ? (
            <div style={{ color: t.textLight, fontSize: "13px", padding: "40px 0", textAlign: "center" }}>
              {filter ? `no ${filter.toLowerCase().replace("_", " ")} reports` : "no reports in queue"}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {reports.map((r) => {
                const ps = priorityStyle(r.priority);
                const isSelected = selectedReport?.id === r.id;
                return (
                  <div key={r.id} onClick={() => select(r.id)} style={{
                    padding: "11px 16px", cursor: "pointer", borderRadius: "6px",
                    background: isSelected ? t.bgAccent : t.bgCard,
                    border: `1px solid ${isSelected ? t.accentBorder : t.border}`,
                    borderLeft: `3px solid ${ps.color}`,
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "3px" }}>
                        <span style={{ fontSize: "11px", color: ps.color, fontWeight: 500 }}>{r.priority}</span>
                        <span style={{ fontSize: "11px", color: t.textMuted }}>{r.targetType.toLowerCase().replace("_", " ")}</span>
                        <span style={{ fontSize: "11px", color: t.textLight }}>{r.status.replace("_", " ").toLowerCase()}</span>
                      </div>
                      <div style={{ fontSize: "13px", color: t.textPrimary, fontWeight: 500 }}>
                        {r.reason.replace(/_/g, " ").toLowerCase()}
                        {r.description && <span style={{ color: t.textMuted, fontWeight: 400 }}> — {r.description.slice(0, 60)}{r.description.length > 60 ? "..." : ""}</span>}
                      </div>
                    </div>
                    <div style={{ fontSize: "11px", color: t.textLight, textAlign: "right", whiteSpace: "nowrap", marginLeft: "12px" }}>
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
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div style={{ fontSize: "11px", color: t.textLight, fontWeight: 500, letterSpacing: "0.5px" }}>REPORT DETAIL</div>
                  <button onClick={() => select(null)} style={{ background: "none", border: "none", color: t.textLight, cursor: "pointer", fontFamily: t.font, fontSize: "16px" }}>✕</button>
                </div>

                <div style={{ display: "flex", gap: "16px", marginBottom: "16px", fontSize: "12px" }}>
                  <span style={{ color: priorityStyle(selectedReport.priority).color, fontWeight: 500 }}>{selectedReport.priority}</span>
                  <span style={{ color: t.textMuted }}>{selectedReport.status.replace("_", " ").toLowerCase()}</span>
                  {selectedReport.otherReportsOnTarget > 0 && (
                    <span style={{ color: "#CC0033", fontWeight: 500 }}>{selectedReport.otherReportsOnTarget} other report{selectedReport.otherReportsOnTarget > 1 ? "s" : ""}</span>
                  )}
                </div>

                <InfoRow label="type" value={selectedReport.targetType.toLowerCase().replace("_", " ")} />
                <InfoRow label="reason" value={selectedReport.reason.replace(/_/g, " ").toLowerCase()} />
                <InfoRow label="reported by" value={`${selectedReport.reporter.firstName} ${selectedReport.reporter.lastName}`} />
                <InfoRow label="date" value={new Date(selectedReport.createdAt).toLocaleString()} />
                {selectedReport.assignedTo && <InfoRow label="assigned to" value={`${selectedReport.assignedTo.firstName} ${selectedReport.assignedTo.lastName}`} />}
                {selectedReport.description && (
                  <div style={{ marginTop: "10px", marginBottom: "16px", padding: "10px 12px", background: t.bgInput, border: `1px solid ${t.border}`, borderRadius: "6px", fontSize: "13px", color: t.textSecondary }}>
                    {selectedReport.description}
                  </div>
                )}
                {selectedReport.targetContent && (
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ fontSize: "11px", color: t.textLight, fontWeight: 500, letterSpacing: "0.5px", marginBottom: "8px" }}>REPORTED CONTENT</div>
                    <div style={{ padding: "12px", background: t.bgInput, border: `1px solid ${t.border}`, borderRadius: "6px" }}>
                      <pre style={{ whiteSpace: "pre-wrap", color: t.textSecondary, fontFamily: t.font, margin: 0, fontSize: "12px" }}>{JSON.stringify(selectedReport.targetContent, null, 2)}</pre>
                    </div>
                  </div>
                )}
                {selectedReport.actions?.length > 0 && (
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ fontSize: "11px", color: t.textLight, fontWeight: 500, letterSpacing: "0.5px", marginBottom: "8px" }}>ACTION HISTORY</div>
                    {selectedReport.actions.map((a: any) => (
                      <div key={a.id} style={{ padding: "8px 12px", borderLeft: `2px solid ${t.borderDark}`, marginBottom: "6px", fontSize: "12px" }}>
                        <span style={{ color: t.textPrimary, fontWeight: 500 }}>{a.action.replace(/_/g, " ").toLowerCase()}</span>
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
                    {!selectedReport.assignedTo && (
                      <button onClick={() => claimReport(selectedReport.id)} style={{ ...t.btnSecondary, fontFamily: t.font, marginBottom: "12px" }}>claim report</button>
                    )}
                    <textarea value={actionNote} onChange={(e) => setActionNote(e.target.value)} placeholder="add a note explaining the action taken..." style={{ ...t.input, width: "100%", resize: "vertical" as const, minHeight: "70px", fontFamily: t.font, marginBottom: "10px" }} />
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      <button onClick={() => takeAction(selectedReport.id, "CONTENT_REMOVED")} style={{ ...t.btnDanger, fontFamily: t.font }}>remove content</button>
                      <button onClick={() => takeAction(selectedReport.id, "USER_WARNED")} style={{ ...t.btnSecondary, fontFamily: t.font }}>warn user</button>
                      <button onClick={() => takeAction(selectedReport.id, "USER_SUSPENDED")} style={{ ...t.btnDanger, fontFamily: t.font }}>suspend user</button>
                      <button onClick={() => takeAction(selectedReport.id, "REPORT_DISMISSED")} style={{ ...t.btnSecondary, fontFamily: t.font }}>dismiss</button>
                      <button onClick={() => takeAction(selectedReport.id, "REPORT_ESCALATED")} style={{ ...t.btnDanger, fontFamily: t.font }}>escalate</button>
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

// Clubs

function ClubsTab() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchClubs = async (q = search, status = statusFilter) => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/admin/clubs", { headers, params: { limit: 50, search: q } });
      let filtered = res.data.clubs;
      if (status) filtered = filtered.filter((c: Club) => c.status === status);
      setClubs(filtered);
      setTotal(res.data.pagination.total);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchClubs(); }, []);

  const handleApprove = async (id: string, name: string) => {
    if (!confirm(`Approve club "${name}"?`)) return;
    try { await api.patch(`/api/v1/admin/clubs/${id}/approve`, {}, { headers }); fetchClubs(); } catch {}
  };
  const handleReject = async (id: string, name: string) => {
    const reason = prompt(`Reject "${name}"? Enter reason:`);
    if (reason === null) return;
    try { await api.patch(`/api/v1/admin/clubs/${id}/reject`, { reason }, { headers }); fetchClubs(); } catch {}
  };
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete club "${name}"? This cannot be undone.`)) return;
    try { await api.delete(`/api/v1/admin/clubs/${id}`, { headers }); fetchClubs(); } catch {}
  };

  return (
    <div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
        {["pending", "approved", "rejected", ""].map((s) => {
          const cs = clubStatusStyle(s || "neutral");
          const isActive = statusFilter === s;
          return (
            <button key={s} onClick={() => { setStatusFilter(s); fetchClubs(search, s); }} style={{
              padding: "5px 14px", fontSize: "12px", fontFamily: t.font, cursor: "pointer", borderRadius: "5px",
              background: isActive ? cs.bg : t.bgCard,
              border: `1px solid ${isActive ? cs.border : t.border}`,
              color: isActive ? cs.color : t.textMuted,
            }}>{s || "all"}</button>
          );
        })}
        <form onSubmit={(e) => { e.preventDefault(); fetchClubs(search, statusFilter); }} style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="search clubs..." style={{ ...t.input, width: "180px", fontFamily: t.font }} />
          <button type="submit" style={{ ...t.btnSecondary, fontFamily: t.font }}>search</button>
        </form>
      </div>

      {loading ? (
        <div style={{ color: t.textLight, fontSize: "13px" }}>loading...</div>
      ) : clubs.length === 0 ? (
        <div style={{ color: t.textLight, fontSize: "13px", textAlign: "center", padding: "40px 0" }}>no clubs found</div>
      ) : (
        <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "8px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr>
                <th style={t.thStyle}>name</th>
                <th style={t.thStyle}>category</th>
                <th style={t.thStyle}>status</th>
                <th style={t.thStyle}>members</th>
                <th style={t.thStyle}>created by</th>
                <th style={t.thStyle}>date</th>
                <th style={t.thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {clubs.map((c) => {
                const cs = clubStatusStyle(c.status);
                return (
                  <tr key={c.id} style={{ borderBottom: `1px solid ${t.border}` }}>
                    <td style={{ ...t.tdStyle, fontWeight: 500, color: t.textPrimary }}>
                      {c.name}
                      {c.isPrivate && <span style={{ fontSize: "10px", color: t.textLight, marginLeft: "6px" }}>private</span>}
                    </td>
                    <td style={{ ...t.tdStyle, color: t.textMuted }}>{c.category}</td>
                    <td style={{ ...t.tdStyle }}>
                      <span style={{ fontSize: "12px", color: cs.color, fontWeight: c.status === "rejected" ? 500 : 400 }}>{c.status}</span>
                      {c.status === "rejected" && c.rejectionReason && <div style={{ fontSize: "10px", color: t.textLight, marginTop: "2px" }}>{c.rejectionReason}</div>}
                    </td>
                    <td style={{ ...t.tdStyle, color: t.textMuted }}>{c._count.members}</td>
                    <td style={{ ...t.tdStyle, color: t.textMuted }}>{c.createdBy.firstName} {c.createdBy.lastName}</td>
                    <td style={{ ...t.tdStyle, color: t.textLight }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td style={{ ...t.tdStyle, whiteSpace: "nowrap" }}>
                      {c.status === "pending" && (
                        <>
                          <button onClick={() => handleApprove(c.id, c.name)} style={{ ...t.btnSecondary, fontFamily: t.font, marginRight: "4px" }}>approve</button>
                          <button onClick={() => handleReject(c.id, c.name)} style={{ ...t.btnDanger, fontFamily: t.font, marginRight: "4px" }}>reject</button>
                        </>
                      )}
                      <button onClick={() => handleDelete(c.id, c.name)} style={{ ...t.btnDanger, fontFamily: t.font }}>delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Events tab

function EventsTab() {
  const [events, setEvents] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchEvents = async (q = search) => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/admin/events", { headers, params: { limit: 50, search: q } });
      setEvents(res.data.events);
      setTotal(res.data.pagination.total);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDelist = async (id: string, title: string) => {
    const reason = prompt(`Delist "${title}"? Enter reason:`);
    if (reason === null) return;
    try { await api.patch(`/api/v1/admin/events/${id}/delist`, { reason }, { headers }); fetchEvents(); } catch {}
  };
  const handleDelete = async (id: string, title: string) => {
    const reason = prompt(`Delete "${title}"? Enter reason (creator will be notified):`);
    if (reason === null) return;
    try { await api.delete(`/api/v1/admin/events/${id}`, { headers, data: { reason } }); fetchEvents(); } catch {}
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <span style={{ fontSize: "13px", color: t.textMuted }}>{total} total events</span>
        <form onSubmit={(e) => { e.preventDefault(); fetchEvents(search); }} style={{ display: "flex", gap: "6px" }}>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="search events..." style={{ ...t.input, width: "200px", fontFamily: t.font }} />
          <button type="submit" style={{ ...t.btnSecondary, fontFamily: t.font }}>search</button>
        </form>
      </div>

      {loading ? (
        <div style={{ color: t.textLight, fontSize: "13px" }}>loading...</div>
      ) : events.length === 0 ? (
        <div style={{ color: t.textLight, fontSize: "13px", textAlign: "center", padding: "40px 0" }}>no events found</div>
      ) : (
        <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "8px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr>
                <th style={t.thStyle}>title</th>
                <th style={t.thStyle}>club</th>
                <th style={t.thStyle}>visibility</th>
                <th style={t.thStyle}>start date</th>
                <th style={t.thStyle}>created by</th>
                <th style={t.thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} style={{ borderBottom: `1px solid ${t.border}` }}>
                  <td style={{ ...t.tdStyle, fontWeight: 500, color: t.textPrimary }}>{e.title}</td>
                  <td style={{ ...t.tdStyle, color: t.textMuted }}>{e.club?.name || "—"}</td>
                  <td style={{ ...t.tdStyle, fontSize: "12px", color: e.isPublic ? t.textPrimary : t.textLight }}>
                    {e.isPublic ? "public" : "unlisted"}
                  </td>
                  <td style={{ ...t.tdStyle, color: t.textMuted }}>{new Date(e.startDate).toLocaleDateString()}</td>
                  <td style={{ ...t.tdStyle, color: t.textMuted }}>{e.createdBy ? `${e.createdBy.firstName} ${e.createdBy.lastName}` : "—"}</td>
                  <td style={{ ...t.tdStyle, whiteSpace: "nowrap" }}>
                    {e.isPublic && <button onClick={() => handleDelist(e.id, e.title)} style={{ ...t.btnSecondary, fontFamily: t.font, marginRight: "4px" }}>delist</button>}
                    <button onClick={() => handleDelete(e.id, e.title)} style={{ ...t.btnDanger, fontFamily: t.font }}>delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Marketplace tab

function MarketplaceTab() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchListings = async (q = search, status = statusFilter) => {
    setLoading(true);
    try {
      const params: any = { limit: 30 };
      if (q) params.search = q;
      if (status) params.status = status;
      const res = await api.get("/api/v1/admin/marketplace", { headers, params });
      setListings(res.data.listings);
      setTotal(res.data.pagination.total);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchListings(); }, []);

  const handleDelist = async (id: string, title: string) => {
    const reason = prompt(`Delist "${title}"? Enter reason:`);
    if (reason === null) return;
    try { await api.patch(`/api/v1/admin/marketplace/${id}/delist`, { reason }, { headers }); fetchListings(); } catch {}
  };
  const handleRemove = async (id: string, title: string) => {
    const reason = prompt(`Remove "${title}"? Enter reason:`);
    if (reason === null) return;
    try { await api.delete(`/api/v1/admin/marketplace/${id}`, { headers, data: { reason } }); fetchListings(); } catch {}
  };

  return (
    <div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
        {["", "active", "sold", "inactive", "deleted"].map((s) => {
          const ls = listingStatusStyle(s || "neutral");
          const isActive = statusFilter === s;
          return (
            <button key={s} onClick={() => { setStatusFilter(s); fetchListings(search, s); }} style={{
              padding: "5px 14px", fontSize: "12px", fontFamily: t.font, cursor: "pointer", borderRadius: "5px",
              background: isActive ? ls.bg : t.bgCard,
              border: `1px solid ${isActive ? ls.border : t.border}`,
              color: isActive ? ls.color : t.textMuted,
            }}>{s || "all"}</button>
          );
        })}
        <form onSubmit={(e) => { e.preventDefault(); fetchListings(search, statusFilter); }} style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="search listings..." style={{ ...t.input, width: "180px", fontFamily: t.font }} />
          <button type="submit" style={{ ...t.btnSecondary, fontFamily: t.font }}>search</button>
        </form>
      </div>

      {loading ? (
        <div style={{ color: t.textLight, fontSize: "13px" }}>loading...</div>
      ) : listings.length === 0 ? (
        <div style={{ color: t.textLight, fontSize: "13px", textAlign: "center", padding: "40px 0" }}>no listings found</div>
      ) : (
        <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "8px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr>
                <th style={t.thStyle}>title</th>
                <th style={t.thStyle}>price</th>
                <th style={t.thStyle}>category</th>
                <th style={t.thStyle}>status</th>
                <th style={t.thStyle}>views</th>
                <th style={t.thStyle}>seller</th>
                <th style={t.thStyle}>posted</th>
                <th style={t.thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => {
                const ls = listingStatusStyle(l.status);
                return (
                  <tr key={l.id} style={{ borderBottom: `1px solid ${t.border}` }}>
                    <td style={{ ...t.tdStyle, fontWeight: 500, color: t.textPrimary }}>{l.title}</td>
                    <td style={{ ...t.tdStyle, color: t.textMuted }}>${l.price.toFixed(2)}</td>
                    <td style={{ ...t.tdStyle, color: t.textMuted }}>{l.category}</td>
                    <td style={{ ...t.tdStyle, fontSize: "12px", color: ls.color, fontWeight: l.status === "deleted" ? 500 : 400 }}>{l.status}</td>
                    <td style={{ ...t.tdStyle, color: t.textLight }}>{l.views}</td>
                    <td style={{ ...t.tdStyle, color: t.textMuted }}>{l.seller.firstName} {l.seller.lastName}</td>
                    <td style={{ ...t.tdStyle, color: t.textLight }}>{new Date(l.createdAt).toLocaleDateString()}</td>
                    <td style={{ ...t.tdStyle, whiteSpace: "nowrap" }}>
                      {l.status === "active" && <button onClick={() => handleDelist(l.id, l.title)} style={{ ...t.btnSecondary, fontFamily: t.font, marginRight: "4px" }}>delist</button>}
                      {(l.status === "active" || l.status === "inactive") && <button onClick={() => handleRemove(l.id, l.title)} style={{ ...t.btnDanger, fontFamily: t.font }}>remove</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Shared

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: "12px", fontSize: "13px", marginBottom: "6px" }}>
      <span style={{ color: t.textMuted, minWidth: "100px" }}>{label}</span>
      <span style={{ color: t.textPrimary }}>{value}</span>
    </div>
  );
}

// Page

type TabKey = "reports" | "clubs" | "events" | "marketplace";

function ModerationContent() {
  const [activeTab, setActiveTab] = useState<TabKey>("reports");

  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: 600, color: t.textPrimary, marginBottom: "4px" }}>Moderation</h1>
      <p style={{ fontSize: "13px", color: t.textMuted, marginBottom: "20px" }}>reports, clubs, events, and marketplace</p>

      <div style={{ display: "flex", gap: "2px", borderBottom: `1px solid ${t.border}`, marginBottom: "24px" }}>
        <Tab label="Reports" active={activeTab === "reports"} onClick={() => setActiveTab("reports")} />
        <Tab label="Clubs" active={activeTab === "clubs"} onClick={() => setActiveTab("clubs")} />
        <Tab label="Events" active={activeTab === "events"} onClick={() => setActiveTab("events")} />
        <Tab label="Marketplace" active={activeTab === "marketplace"} onClick={() => setActiveTab("marketplace")} />
      </div>

      {activeTab === "reports"     && <ReportsTab />}
      {activeTab === "clubs"       && <ClubsTab />}
      {activeTab === "events"      && <EventsTab />}
      {activeTab === "marketplace" && <MarketplaceTab />}
    </div>
  );
}

export default function ModerationPage() {
  return (
    <Suspense fallback={<div style={{ color: "#bbb", fontSize: "13px" }}>loading...</div>}>
      <ModerationContent />
    </Suspense>
  );
}