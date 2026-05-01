"use client";
// src/app/admin/users/[id]/page.tsx

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { useAdminAuth, hasPermission } from "@/lib/useAdminAuth";
import { adminTheme as t } from "../../theme";

interface UserDetail {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  isVerified: boolean;
  profilePicture: string | null;
  bio: string | null;
  city: string | null;
  createdAt: string;
  lastActiveAt: string | null;
  roles: { id: string; name: string; departmentScope: string | null; grantedAt: string; expiresAt: string | null }[];
  violations: { id: string; type: string; reason: string; isActive: boolean; createdAt: string; expiresAt: string | null }[];
  _count: { Post: number; clubMemberships: number; marketplaceListings: number };
  student: any;
  faculty: any;
  alumni: any;
}

interface Role { id: string; name: string; }

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { permissions } = useAdminAuth();

  const [user, setUser] = useState<UserDetail | null>(null);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // action state
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [reportNote, setReportNote] = useState("");
  const [roleToAssign, setRoleToAssign] = useState("");
  const [activePanel, setActivePanel] = useState<"email" | "ban" | "report" | "role" | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchUser = async () => {
    setLoading(true);
    setError(false);
    try {
      const [userRes, rolesRes] = await Promise.all([
        api.get(`/api/v1/admin/users/${id}`, { headers }),
        api.get("/api/v1/admin/roles", { headers }),
      ]);
      setUser(userRes.data);
      setAllRoles(rolesRes.data);
    } catch {
      setError(true);
    }
    setLoading(false);
  };

  useEffect(() => { fetchUser(); }, [id]);

  const showFeedback = (type: "success" | "error", msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleEmail = async () => {
    if (!emailSubject || !emailBody) return;
    setSaving(true);
    try {
      // opens user's email client — adjust if you have a server-side email endpoint
      window.location.href = `mailto:${user?.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      setEmailSubject("");
      setEmailBody("");
      setActivePanel(null);
      showFeedback("success", "email client opened");
    } catch {
      showFeedback("error", "failed to send email");
    }
    setSaving(false);
  };

  const handleBan = async () => {
    if (!banReason) return;
    setSaving(true);
    try {
      await api.post(`/api/v1/admin/users/${id}/suspend`, {
        reason: banReason,
        duration: banDuration ? parseInt(banDuration) : undefined,
      }, { headers });
      setBanReason("");
      setBanDuration("");
      setActivePanel(null);
      showFeedback("success", "user suspended");
      fetchUser();
    } catch {
      showFeedback("error", "failed to suspend user");
    }
    setSaving(false);
  };

  const handleUnsuspend = async () => {
    if (!confirm("Lift all active suspensions for this user?")) return;
    try {
      await api.delete(`/api/v1/admin/users/${id}/suspend`, { headers });
      showFeedback("success", "suspensions lifted");
      fetchUser();
    } catch {
      showFeedback("error", "failed to lift suspension");
    }
  };

  const handleReport = async () => {
    if (!reportReason) return;
    setSaving(true);
    try {
      await api.post("/api/v1/moderation/reports", {
        targetType: "USER",
        targetId: id,
        reason: reportReason,
        description: reportNote,
      }, { headers });
      setReportReason("");
      setReportNote("");
      setActivePanel(null);
      showFeedback("success", "report filed and sent to moderation queue");
    } catch {
      showFeedback("error", "failed to file report");
    }
    setSaving(false);
  };

  const handleAssignRole = async () => {
    if (!roleToAssign) return;
    setSaving(true);
    try {
      await api.post(`/api/v1/admin/users/${id}/roles`, { roleId: roleToAssign }, { headers });
      setRoleToAssign("");
      setActivePanel(null);
      showFeedback("success", "role assigned");
      fetchUser();
    } catch (err: any) {
      showFeedback("error", err?.response?.data?.error || "failed to assign role");
    }
    setSaving(false);
  };

  const handleRevokeRole = async (roleId: string, roleName: string) => {
    if (!confirm(`Revoke role "${roleName}" from this user?`)) return;
    try {
      await api.delete(`/api/v1/admin/users/${id}/roles/${roleId}`, { headers });
      showFeedback("success", `role ${roleName} revoked`);
      fetchUser();
    } catch {
      showFeedback("error", "failed to revoke role");
    }
  };

  if (loading) return <div style={{ color: t.textLight, fontSize: "13px" }}>loading...</div>;
  if (error || !user) return <div style={{ color: t.error, fontSize: "13px" }}>user not found</div>;

  const activeViolation = user.violations.find((v) => v.isActive);
  const assignableRoles = allRoles.filter((r) => !user.roles.some((ur) => ur.id === r.id));

  return (
    <div>
      {/* back */}
      <button onClick={() => router.back()} style={{ ...t.btnSecondary, fontFamily: t.font, fontSize: "12px", marginBottom: "20px" }}>
        ← back to users
      </button>

      {/* feedback toast */}
      {feedback && (
        <div style={{
          position: "fixed", bottom: "24px", right: "24px", zIndex: 100,
          padding: "10px 18px", borderRadius: "6px", fontSize: "13px",
          background: feedback.type === "success" ? t.successBg : t.errorBg,
          border: `1px solid ${feedback.type === "success" ? t.successBorder : t.errorBorder}`,
          color: feedback.type === "success" ? t.success : t.error,
        }}>
          {feedback.msg}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px", alignItems: "start" }}>

        {/* left — user info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* header card */}
          <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "8px", padding: "20px" }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "16px" }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "50%",
                background: t.accentBg, display: "flex", alignItems: "center", justifyContent: "center",
                color: t.accent, fontSize: "16px", fontWeight: 600, flexShrink: 0,
              }}>
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div>
                <div style={{ fontSize: "18px", fontWeight: 600, color: t.textPrimary }}>{user.firstName} {user.lastName}</div>
                <div style={{ fontSize: "13px", color: t.textMuted }}>{user.email}</div>
              </div>
              {activeViolation && (
                <span style={{ ...t.badge(t.error, t.errorBg, t.errorBorder), marginLeft: "auto" }}>
                  {activeViolation.type === "PERMANENT_BAN" ? "banned" : "suspended"}
                </span>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "16px" }}>
              <StatMini label="posts" value={user._count.Post} />
              <StatMini label="clubs" value={user._count.clubMemberships} />
              <StatMini label="listings" value={user._count.marketplaceListings} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <InfoRow label="type" value={user.userType} />
              <InfoRow label="verified" value={user.isVerified ? "yes" : "no"} />
              <InfoRow label="joined" value={new Date(user.createdAt).toLocaleDateString()} />
              {user.lastActiveAt && <InfoRow label="last active" value={new Date(user.lastActiveAt).toLocaleString()} />}
              {user.city && <InfoRow label="city" value={user.city} />}
              {user.bio && <InfoRow label="bio" value={user.bio} />}
            </div>
          </div>

          {/* roles */}
          <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "8px", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ fontSize: "11px", color: t.textLight, fontWeight: 500, letterSpacing: "0.5px" }}>ROLES</div>
              {hasPermission(permissions, "roles:write") && (
                <button onClick={() => setActivePanel(activePanel === "role" ? null : "role")} style={{ ...t.btnSecondary, fontSize: "11px", fontFamily: t.font }}>+ assign role</button>
              )}
            </div>
            {activePanel === "role" && (
              <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                <select value={roleToAssign} onChange={(e) => setRoleToAssign(e.target.value)} style={{ ...t.select, flex: 1, fontFamily: t.font }}>
                  <option value="">select role...</option>
                  {assignableRoles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <button onClick={handleAssignRole} disabled={!roleToAssign || saving} style={{ ...t.btnPrimary, fontFamily: t.font, opacity: saving ? 0.6 : 1 }}>assign</button>
                <button onClick={() => setActivePanel(null)} style={{ ...t.btnSecondary, fontFamily: t.font }}>cancel</button>
              </div>
            )}
            {user.roles.length === 0 ? (
              <div style={{ fontSize: "13px", color: t.textLight }}>no roles assigned</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {user.roles.map((r) => (
                  <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: t.bgAccent, borderRadius: "5px" }}>
                    <div>
                      <span style={{ fontSize: "13px", color: t.accent, fontWeight: 500 }}>{r.name}</span>
                      {r.departmentScope && <span style={{ fontSize: "11px", color: t.textMuted, marginLeft: "8px" }}>{r.departmentScope}</span>}
                      <div style={{ fontSize: "10px", color: t.textLight, marginTop: "2px" }}>granted {new Date(r.grantedAt).toLocaleDateString()}{r.expiresAt ? ` · expires ${new Date(r.expiresAt).toLocaleDateString()}` : ""}</div>
                    </div>
                    {hasPermission(permissions, "roles:write") && (
                      <button onClick={() => handleRevokeRole(r.id, r.name)} style={{ ...t.btnDanger, fontFamily: t.font, fontSize: "10px" }}>revoke</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* violations */}
          {user.violations.length > 0 && (
            <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "8px", padding: "20px" }}>
              <div style={{ fontSize: "11px", color: t.textLight, fontWeight: 500, letterSpacing: "0.5px", marginBottom: "12px" }}>VIOLATION HISTORY</div>
              {user.violations.map((v) => (
                <div key={v.id} style={{ padding: "10px 12px", borderLeft: `3px solid ${v.isActive ? t.error : t.borderDark}`, marginBottom: "8px", background: v.isActive ? t.errorBg : t.bgHover, borderRadius: "0 4px 4px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 500, color: v.isActive ? t.error : t.textMuted }}>{v.type.replace(/_/g, " ").toLowerCase()}</span>
                    <span style={{ fontSize: "10px", color: t.textLight }}>{new Date(v.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ fontSize: "12px", color: t.textSecondary }}>{v.reason}</div>
                  {v.expiresAt && <div style={{ fontSize: "10px", color: t.textLight, marginTop: "2px" }}>expires {new Date(v.expiresAt).toLocaleDateString()}</div>}
                </div>
              ))}
              {activeViolation && hasPermission(permissions, "users:ban") && (
                <button onClick={handleUnsuspend} style={{ ...t.btnSuccess, fontFamily: t.font, marginTop: "4px" }}>lift suspension</button>
              )}
            </div>
          )}
        </div>

        {/* right — action panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ fontSize: "11px", color: t.textLight, fontWeight: 500, letterSpacing: "0.5px", marginBottom: "2px" }}>ACTIONS</div>

          {/* email */}
          <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "8px", overflow: "hidden" }}>
            <button onClick={() => setActivePanel(activePanel === "email" ? null : "email")} style={{
              width: "100%", padding: "12px 16px", textAlign: "left", background: "none", border: "none",
              fontSize: "13px", color: t.textPrimary, fontFamily: t.font, cursor: "pointer", fontWeight: 500,
            }}>
              ✉ email student
            </button>
            {activePanel === "email" && (
              <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${t.border}` }}>
                <input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="subject" style={{ ...t.input, width: "100%", fontFamily: t.font, marginTop: "12px", marginBottom: "8px" }} />
                <textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} placeholder="message..." style={{ ...t.input, width: "100%", fontFamily: t.font, minHeight: "80px", resize: "vertical" as const, marginBottom: "8px" }} />
                <button onClick={handleEmail} disabled={!emailSubject || !emailBody} style={{ ...t.btnPrimary, fontFamily: t.font, width: "100%", opacity: (!emailSubject || !emailBody) ? 0.5 : 1 }}>open in mail</button>
              </div>
            )}
          </div>

          {/* file report */}
          <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "8px", overflow: "hidden" }}>
            <button onClick={() => setActivePanel(activePanel === "report" ? null : "report")} style={{
              width: "100%", padding: "12px 16px", textAlign: "left", background: "none", border: "none",
              fontSize: "13px", color: t.textPrimary, fontFamily: t.font, cursor: "pointer", fontWeight: 500,
            }}>
              ⚑ file report
            </button>
            {activePanel === "report" && (
              <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${t.border}` }}>
                <select value={reportReason} onChange={(e) => setReportReason(e.target.value)} style={{ ...t.select, width: "100%", fontFamily: t.font, marginTop: "12px", marginBottom: "8px" }}>
                  <option value="">select reason...</option>
                  <option value="HARASSMENT">harassment</option>
                  <option value="SPAM">spam</option>
                  <option value="INAPPROPRIATE_CONTENT">inappropriate content</option>
                  <option value="IMPERSONATION">impersonation</option>
                  <option value="POLICY_VIOLATION">policy violation</option>
                  <option value="OTHER">other</option>
                </select>
                <textarea value={reportNote} onChange={(e) => setReportNote(e.target.value)} placeholder="additional notes..." style={{ ...t.input, width: "100%", fontFamily: t.font, minHeight: "60px", resize: "vertical" as const, marginBottom: "8px" }} />
                <button onClick={handleReport} disabled={!reportReason || saving} style={{ ...t.btnWarning, fontFamily: t.font, width: "100%", opacity: (!reportReason || saving) ? 0.5 : 1 }}>
                  {saving ? "filing..." : "file report"}
                </button>
              </div>
            )}
          </div>

          {/* ban */}
          {hasPermission(permissions, "users:ban") && (
            <div style={{ background: t.bgCard, border: `1px solid ${activePanel === "ban" ? t.errorBorder : t.border}`, borderRadius: "8px", overflow: "hidden" }}>
              <button onClick={() => setActivePanel(activePanel === "ban" ? null : "ban")} style={{
                width: "100%", padding: "12px 16px", textAlign: "left", background: "none", border: "none",
                fontSize: "13px", color: t.error, fontFamily: t.font, cursor: "pointer", fontWeight: 500,
              }}>
                ⊘ {activeViolation ? "update suspension" : "ban user"}
              </button>
              {activePanel === "ban" && (
                <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${t.errorBorder}` }}>
                  <textarea value={banReason} onChange={(e) => setBanReason(e.target.value)} placeholder="reason for suspension..." style={{ ...t.input, width: "100%", fontFamily: t.font, minHeight: "60px", resize: "vertical" as const, marginTop: "12px", marginBottom: "8px" }} />
                  <input type="number" value={banDuration} onChange={(e) => setBanDuration(e.target.value)} placeholder="duration in days (leave empty for permanent)" style={{ ...t.input, width: "100%", fontFamily: t.font, marginBottom: "8px" }} />
                  <button onClick={handleBan} disabled={!banReason || saving} style={{ ...t.btnDanger, fontFamily: t.font, width: "100%", opacity: (!banReason || saving) ? 0.5 : 1 }}>
                    {saving ? "suspending..." : banDuration ? `suspend for ${banDuration} days` : "ban permanently"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: "12px", fontSize: "13px", marginBottom: "4px" }}>
      <span style={{ color: t.textMuted, minWidth: "90px" }}>{label}</span>
      <span style={{ color: t.textPrimary }}>{value}</span>
    </div>
  );
}

function StatMini({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: t.bgHover, borderRadius: "6px", padding: "10px 12px", textAlign: "center" }}>
      <div style={{ fontSize: "20px", fontWeight: 600, color: t.textPrimary }}>{value}</div>
      <div style={{ fontSize: "11px", color: t.textMuted }}>{label}</div>
    </div>
  );
}