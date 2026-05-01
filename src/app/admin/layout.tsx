"use client";
// src/app/admin/layout.tsx

import { useRouter } from "next/navigation";
import { useAdminAuth, hasAnyPermission } from "@/lib/useAdminAuth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  permissions: string[];
  group: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",  href: "/admin",            permissions: [],                     group: "overview" },
  { label: "Analytics",  href: "/admin/analytics",  permissions: ["analytics:view"],     group: "overview" },
  { label: "Audit Log",  href: "/admin/audit-log",  permissions: ["system:audit_log"],   group: "overview" },

  { label: "Users",      href: "/admin/users",       permissions: ["users:read"],         group: "manage" },
  { label: "Roles",      href: "/admin/roles",       permissions: ["roles:read"],         group: "manage" },

  { label: "Moderation", href: "/admin/moderation",  permissions: ["moderation:read"],    group: "safety" },
  { label: "Security",   href: "/admin/security",    permissions: ["security:view_cases"], group: "safety" },
  { label: "Alerts",     href: "/admin/announcements", permissions: [],                   group: "safety" },

  { label: "Bug Reports", href: "/admin/bugs",       permissions: ["bugs:read"],          group: "content" },

  { label: "Settings",   href: "/admin/settings",    permissions: ["system:config"],      group: "system" },
];

const GROUP_LABELS: Record<string, string> = {
  overview: "Overview",
  manage:   "Manage",
  safety:   "Safety",
  content:  "Content",
  system:   "System",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, permissions, roles, loading, authorized, error } = useAdminAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div style={{
        height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#fafafa", color: "#999", fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", fontSize: "14px",
      }}>
        verifying access...
      </div>
    );
  }

  if (!authorized) {
    return (
      <div style={{
        height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: "#fafafa", color: "#1a1a1a", fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", gap: "12px",
      }}>
        <div style={{ fontSize: "56px", fontWeight: 700, color: "#d4545e" }}>403</div>
        <div style={{ fontSize: "14px", color: "#999" }}>{error || "you don't have admin access"}</div>
        <button onClick={() => router.push("/")} style={{
          marginTop: "20px", padding: "8px 28px", background: "#fff", border: "1px solid #e0e0e0",
          borderRadius: "6px", color: "#666", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", cursor: "pointer",
        }}>back to app</button>
      </div>
    );
  }

  const visibleNav = NAV_ITEMS.filter(
    (item) => item.permissions.length === 0 || hasAnyPermission(permissions, item.permissions)
  );

  const groups = [...new Set(visibleNav.map((n) => n.group))];

  const currentPage = NAV_ITEMS.find(
    (item) => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');
      `}</style>
      <div style={{
        minHeight: "100vh", background: "#fafafa", color: "#1a1a1a",
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      }}>
        {/* Top bar */}
        <header style={{
          background: "#fff", borderBottom: "1px solid #f0f0f0",
          position: "sticky", top: 0, zIndex: 50,
        }}>
          {/* Primary bar */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "0 28px", height: "52px",
          }}>
            {/* Logo + page title */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Link href="/admin" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "6px",
                  background: "linear-gradient(135deg, #c94150, #e8848c)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: "13px", fontWeight: 700,
                }}>
                  CC
                </div>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a", letterSpacing: "-0.3px" }}>
                  CampusConnect
                </span>
              </Link>
              {currentPage && (
                <>
                  <span style={{ color: "#e0e0e0", fontSize: "18px", fontWeight: 300 }}>/</span>
                  <span style={{ fontSize: "13px", color: "#888", fontWeight: 400 }}>
                    {currentPage.label}
                  </span>
                </>
              )}
            </div>

            {/* Right side */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <button onClick={() => router.push("/")} style={{
                padding: "5px 14px", background: "#fafafa", border: "1px solid #e0e0e0",
                borderRadius: "5px", color: "#888", fontFamily: "'DM Sans', sans-serif",
                fontSize: "12px", cursor: "pointer",
              }}>
                ← app
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "30px", height: "30px", borderRadius: "50%",
                  background: "#fef2f3", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#c94150", fontSize: "12px", fontWeight: 600,
                }}>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "#1a1a1a", fontWeight: 500 }}>{user?.firstName} {user?.lastName}</div>
                  <div style={{ fontSize: "10px", color: "#bbb" }}>{roles[0]?.name || "Admin"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation bar */}
          <div style={{
            display: "flex", alignItems: "center", gap: "4px",
            padding: "0 28px", height: "38px",
            borderTop: "1px solid #f8f8f8",
            overflowX: "auto",
          }}>
            {groups.map((group, gi) => (
              <div key={group} style={{ display: "flex", alignItems: "center" }}>
                {gi > 0 && (
                  <div style={{ width: "1px", height: "16px", background: "#f0f0f0", margin: "0 8px" }} />
                )}
                {visibleNav.filter((n) => n.group === group).map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                  return (
                    <Link key={item.href} href={item.href} style={{
                      padding: "6px 12px", fontSize: "12px", fontWeight: isActive ? 500 : 400,
                      color: isActive ? "#c94150" : "#888",
                      background: isActive ? "#fef2f3" : "transparent",
                      borderRadius: "4px", textDecoration: "none",
                      transition: "all 0.1s",
                    }}>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </header>

        {/* Main content */}
        <main style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "28px 36px",
          minHeight: "calc(100vh - 90px)",
        }}>
          {children}
        </main>
      </div>
    </>
  );
}