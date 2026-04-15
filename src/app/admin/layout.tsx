"use client";

import { useRouter } from "next/navigation";
import { useAdminAuth, hasPermission, hasAnyPermission } from "@/lib/useAdminAuth";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  permissions: string[];
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin", permissions: [], icon: "⊞" },
  { label: "Users", href: "/admin/users", permissions: ["users:read"], icon: "⊡" },
  { label: "Roles", href: "/admin/roles", permissions: ["roles:read"], icon: "⊙" },
  { label: "Moderation", href: "/admin/moderation", permissions: ["moderation:read"], icon: "⊘" },
  { label: "Clubs", href: "/admin/clubs", permissions: ["clubs:read"], icon: "⊕" },
  { label: "Marketplace", href: "/admin/marketplace", permissions: ["marketplace:read"], icon: "⊛" },
  { label: "Events", href: "/admin/events", permissions: ["events:read"], icon: "⊜" },
  { label: "Security", href: "/admin/security", permissions: ["security:view_cases"], icon: "⊗" },
  { label: "Analytics", href: "/admin/analytics", permissions: ["analytics:view"], icon: "⊠" },
  { label: "Bug Reports", href: "/admin/bugs", permissions: ["bugs:read"], icon: "⊟" },
  { label: "Audit Log", href: "/admin/audit-log", permissions: ["system:audit_log"], icon: "⊞" },
  { label: "Settings", href: "/admin/settings", permissions: ["system:config"], icon: "⊚" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, permissions, roles, loading, authorized, error } = useAdminAuth();

  if (loading) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        color: "#666",
        fontFamily: "monospace",
        fontSize: "14px",
      }}>
        verifying access...
      </div>
    );
  }

  if (!authorized) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        color: "#e5e5e5",
        fontFamily: "monospace",
        gap: "16px",
      }}>
        <div style={{ fontSize: "48px", fontWeight: 700, color: "#cc0000" }}>403</div>
        <div style={{ fontSize: "14px", color: "#666" }}>
          {error || "you don't have admin access"}
        </div>
        <button
          onClick={() => router.push("/")}
          style={{
            marginTop: "24px",
            padding: "8px 24px",
            background: "transparent",
            border: "1px solid #333",
            color: "#999",
            fontFamily: "monospace",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          back to app
        </button>
      </div>
    );
  }

  const visibleNav = NAV_ITEMS.filter(
    (item) => item.permissions.length === 0 || hasAnyPermission(permissions, item.permissions)
  );

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: "#0a0a0a",
      color: "#e5e5e5",
      fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
    }}>
      {/* Sidebar */}
      <aside style={{
        width: "240px",
        borderRight: "1px solid #1a1a1a",
        padding: "24px 0",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        height: "100vh",
        overflow: "auto",
      }}>
        {/* Logo */}
        <div style={{ padding: "0 20px", marginBottom: "32px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "2px", color: "#cc0000", fontWeight: 600 }}>
            CAMPUSCONNECT
          </div>
          <div style={{ fontSize: "11px", color: "#444", marginTop: "2px" }}>
            admin portal
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1 }}>
          {visibleNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 20px",
                  fontSize: "13px",
                  color: isActive ? "#e5e5e5" : "#666",
                  background: isActive ? "#1a1a1a" : "transparent",
                  borderLeft: isActive ? "2px solid #cc0000" : "2px solid transparent",
                  textDecoration: "none",
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: "14px", opacity: isActive ? 1 : 0.5 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div style={{
          padding: "16px 20px",
          borderTop: "1px solid #1a1a1a",
          fontSize: "12px",
        }}>
          <div style={{ color: "#999" }}>{user?.firstName} {user?.lastName}</div>
          <div style={{ color: "#444", marginTop: "2px" }}>{roles[0]?.name || "Admin"}</div>
          <button
            onClick={() => router.push("/")}
            style={{
              marginTop: "12px",
              padding: "4px 0",
              background: "none",
              border: "none",
              color: "#555",
              fontFamily: "inherit",
              fontSize: "11px",
              cursor: "pointer",
            }}
          >
            ← back to app
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        flex: 1,
        marginLeft: "240px",
        padding: "32px 40px",
        minHeight: "100vh",
      }}>
        {children}
      </main>
    </div>
  );
}