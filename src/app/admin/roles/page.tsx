"use client";
// src/app/admin/roles/page.tsx

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { adminTheme as t } from "../theme";

interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: string[];
  userCount: number;
  createdAt: string;
}

// all known permissions grouped by domain
const PERMISSION_GROUPS: Record<string, string[]> = {
  users:       ["users:read", "users:write", "users:delete", "users:ban"],
  roles:       ["roles:read", "roles:write", "roles:delete"],
  content:     ["posts:read", "posts:delete", "clubs:read", "clubs:write", "clubs:delete", "events:read", "events:write", "events:delete"],
  moderation:  ["moderation:read", "moderation:write", "moderation:resolve"],
  marketplace: ["marketplace:read", "marketplace:write", "marketplace:delete"],
  security:    ["security:view_cases", "security:manage_cases"],
  analytics:   ["analytics:view"],
  system:      ["system:config", "system:audit_log"],
  bugs:        ["bugs:read", "bugs:write"],
};

function PermissionPicker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (perms: string[]) => void;
}) {
  const toggle = (p: string) => {
    onChange(selected.includes(p) ? selected.filter((x) => x !== p) : [...selected, p]);
  };
  const toggleGroup = (perms: string[]) => {
    const allOn = perms.every((p) => selected.includes(p));
    onChange(allOn ? selected.filter((p) => !perms.includes(p)) : [...new Set([...selected, ...perms])]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {Object.entries(PERMISSION_GROUPS).map(([group, perms]) => {
        const allOn = perms.every((p) => selected.includes(p));
        const someOn = perms.some((p) => selected.includes(p));
        return (
          <div key={group}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <button
                type="button"
                onClick={() => toggleGroup(perms)}
                style={{
                  fontSize: "10px", padding: "1px 7px", borderRadius: "3px", cursor: "pointer",
                  fontFamily: t.font, border: `1px solid ${allOn ? t.accentBorder : t.borderDark}`,
                  background: allOn ? t.accentBg : someOn ? t.bgHover : t.bgCard,
                  color: allOn ? t.accent : t.textMuted,
                }}
              >
                {allOn ? "deselect all" : "select all"}
              </button>
              <span style={{ fontSize: "11px", color: t.textSecondary, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.4px" }}>{group}</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {perms.map((p) => {
                const on = selected.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => toggle(p)}
                    style={{
                      fontSize: "11px", padding: "3px 9px", borderRadius: "4px", cursor: "pointer",
                      fontFamily: t.font, transition: "all 0.1s",
                      background: on ? t.accentBg : t.bgHover,
                      border: `1px solid ${on ? t.accentBorder : t.border}`,
                      color: on ? t.accent : t.textMuted,
                    }}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RoleForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Role;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [permissions, setPermissions] = useState<string[]>(initial?.permissions || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { Authorization: `Bearer ${token}` };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("name is required"); return; }
    setSaving(true);
    setError("");
    try {
      if (initial) {
        await api.put(`/api/v1/admin/roles/${initial.id}`, { name, description, permissions }, { headers });
      } else {
        await api.post("/api/v1/admin/roles", { name, description, permissions }, { headers });
      }
      onSave();
    } catch (err: any) {
      setError(err?.response?.data?.error || "failed to save role");
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "8px", padding: "20px" }}>
      <div style={{ fontSize: "13px", fontWeight: 500, color: t.textPrimary, marginBottom: "16px" }}>
        {initial ? `editing: ${initial.name}` : "create new role"}
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "11px", color: t.textMuted, marginBottom: "4px" }}>name</div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. club_moderator"
            style={{ ...t.input, width: "100%", fontFamily: t.font }}
          />
        </div>
        <div style={{ flex: 2 }}>
          <div style={{ fontSize: "11px", color: t.textMuted, marginBottom: "4px" }}>description</div>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="what does this role do?"
            style={{ ...t.input, width: "100%", fontFamily: t.font }}
          />
        </div>
      </div>

      <div style={{ fontSize: "11px", color: t.textMuted, marginBottom: "8px" }}>
        permissions <span style={{ color: t.accent }}>({permissions.length} selected)</span>
      </div>
      <div style={{ background: t.bgInput, border: `1px solid ${t.border}`, borderRadius: "6px", padding: "12px", marginBottom: "14px" }}>
        <PermissionPicker selected={permissions} onChange={setPermissions} />
      </div>

      {error && <div style={{ fontSize: "12px", color: t.error, marginBottom: "10px" }}>{error}</div>}

      <div style={{ display: "flex", gap: "8px" }}>
        <button type="submit" disabled={saving} style={{ ...t.btnPrimary, fontFamily: t.font, opacity: saving ? 0.6 : 1 }}>
          {saving ? "saving..." : initial ? "save changes" : "create role"}
        </button>
        <button type="button" onClick={onCancel} style={{ ...t.btnSecondary, fontFamily: t.font }}>cancel</button>
      </div>
    </form>
  );
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editing, setEditing] = useState<Role | null>(null);
  const [creating, setCreating] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchRoles = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get("/api/v1/admin/roles", { headers });
      setRoles(res.data);
    } catch {
      setError(true);
    }
    setLoading(false);
  };

  useEffect(() => { fetchRoles(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete role "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/v1/admin/roles/${id}`, { headers });
      fetchRoles();
    } catch {}
  };

  const handleSave = () => {
    setEditing(null);
    setCreating(false);
    fetchRoles();
  };

  const systemRoles = roles.filter((r) => r.isSystem);
  const customRoles = roles.filter((r) => !r.isSystem);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 600, color: t.textPrimary, marginBottom: "4px" }}>Roles</h1>
          <p style={{ fontSize: "13px", color: t.textMuted }}>{roles.length} configured · {systemRoles.length} system · {customRoles.length} custom</p>
        </div>
        {!creating && !editing && (
          <button onClick={() => setCreating(true)} style={{ ...t.btnPrimary, fontFamily: t.font }}>
            + new role
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ color: t.textLight, fontSize: "13px" }}>loading...</div>
      ) : error ? (
        <div style={{ color: t.error, fontSize: "13px" }}>failed to load roles</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

          {/* create form */}
          {creating && (
            <RoleForm onSave={handleSave} onCancel={() => setCreating(false)} />
          )}

          {/* edit form */}
          {editing && (
            <RoleForm initial={editing} onSave={handleSave} onCancel={() => setEditing(null)} />
          )}

          {/* custom roles */}
          {customRoles.length > 0 && (
            <div>
              <div style={{ fontSize: "11px", color: t.textLight, fontWeight: 500, letterSpacing: "0.5px", marginBottom: "8px" }}>CUSTOM</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {customRoles.map((r) => (
                  <RoleCard
                    key={r.id}
                    role={r}
                    expanded={expanded === r.id}
                    onToggle={() => setExpanded(expanded === r.id ? null : r.id)}
                    onEdit={() => { setEditing(r); setCreating(false); }}
                    onDelete={() => handleDelete(r.id, r.name)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* system roles */}
          {systemRoles.length > 0 && (
            <div>
              <div style={{ fontSize: "11px", color: t.textLight, fontWeight: 500, letterSpacing: "0.5px", marginBottom: "8px", marginTop: customRoles.length > 0 ? "8px" : "0" }}>SYSTEM</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {systemRoles.map((r) => (
                  <RoleCard
                    key={r.id}
                    role={r}
                    expanded={expanded === r.id}
                    onToggle={() => setExpanded(expanded === r.id ? null : r.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RoleCard({
  role,
  expanded,
  onToggle,
  onEdit,
  onDelete,
}: {
  role: Role;
  expanded: boolean;
  onToggle: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div style={{
      background: t.bgCard,
      border: `1px solid ${t.border}`,
      borderRadius: "8px",
      padding: "14px 18px",
      opacity: role.isSystem ? 0.85 : 1,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "14px", fontWeight: 500, color: t.textPrimary }}>{role.name}</span>
            {role.isSystem && <span style={t.badge(t.info, t.infoBg, t.infoBorder)}>system</span>}
            <span style={{ fontSize: "11px", color: t.textLight }}>{role.userCount} {role.userCount === 1 ? "user" : "users"}</span>
            <span style={{ fontSize: "11px", color: t.textLight }}>· {role.permissions.length} permissions</span>
          </div>
          {role.description && (
            <div style={{ fontSize: "12px", color: t.textMuted, marginTop: "2px" }}>{role.description}</div>
          )}
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <button onClick={onToggle} style={{ ...t.btnSecondary, fontSize: "11px", fontFamily: t.font }}>
            {expanded ? "hide" : "permissions"}
          </button>
          {onEdit && (
            <button onClick={onEdit} style={{ ...t.btnSecondary, fontSize: "11px", fontFamily: t.font }}>edit</button>
          )}
          {onDelete && (
            <button onClick={onDelete} style={{ ...t.btnDanger, fontFamily: t.font }}>delete</button>
          )}
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: "12px", borderTop: `1px solid ${t.border}`, paddingTop: "12px" }}>
          {Object.entries(PERMISSION_GROUPS).map(([group, groupPerms]) => {
            const active = groupPerms.filter((p) => role.permissions.includes(p));
            if (active.length === 0) return null;
            return (
              <div key={group} style={{ marginBottom: "8px" }}>
                <div style={{ fontSize: "10px", color: t.textLight, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "4px" }}>{group}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {active.map((p) => (
                    <span key={p} style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "3px", background: t.accentBg, color: t.accent, border: `1px solid ${t.accentBorder}` }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}