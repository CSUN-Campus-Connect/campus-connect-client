"use client";
// src/app/security/layout.tsx

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import DashboardSidebar from "@/components/dashboard/sidebar";

const drawerWidth = 220;
const smooth: [number, number, number, number] = [0.16, 1, 0.3, 1];
const RED = "#CC0033";
const GRAY = "#767676";

const TABS = [
  { label: "Report",     href: "/security" },
  { label: "My Reports", href: "/security/reports" },
  { label: "Track",      href: "/security/track" },
];

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = React.useCallback(() => {
    localStorage.clear();
    router.push("/");
  }, [router]);

  // active tab: /security/reports/[id] should highlight My Reports
  const activeHref = TABS.map(t => t.href)
    .filter(h => pathname === h || pathname.startsWith(h + "/"))
    .sort((a, b) => b.length - a.length)[0] ?? "/security";

  return (
    <div className="flex bg-white min-h-screen text-[#111] selection:bg-[#CC0033] selection:text-white">
      <DashboardSidebar drawerWidth={drawerWidth} onLogout={handleLogout} />

      <main
        className="flex-1 px-8 md:px-12 py-10"
        style={{ width: `calc(100% - ${drawerWidth}px)` }}
      >
        <div className="max-w-3xl mx-auto">

          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: smooth }}
            className="mb-10"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-[2px]" style={{ background: RED }} />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: RED }}>
                Campus Safety
              </span>
            </div>
            <h1 className="text-[2.5rem] font-extrabold tracking-tight leading-none text-[#111] mb-1">
              Report &amp; Track
            </h1>
            <p className="text-[13px] font-light leading-relaxed" style={{ color: GRAY }}>
              Submit an incident, follow up on your cases, or track an anonymous report.
            </p>
          </motion.div>

          {/* Tab nav */}
          <div className="flex border-b border-[#eee] mb-10">
            {TABS.map((tab) => {
              const isActive = activeHref === tab.href;
              return (
                <button
                  key={tab.href}
                  onClick={() => router.push(tab.href)}
                  className="relative px-5 py-3 text-[13px] font-light transition-colors"
                  style={{ color: isActive ? "#111" : GRAY }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="security-tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-[2px]"
                      style={{ background: RED }}
                      transition={{ duration: 0.3, ease: smooth }}
                    />
                  )}
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Page content */}
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: smooth }}
          >
            {children}
          </motion.div>

        </div>
      </main>
    </div>
  );
}