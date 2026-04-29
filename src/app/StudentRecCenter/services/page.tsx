// src/app/StudentRecCenter/services/page.tsx
// Sidebar nav + main content column layout.
// Deep-link: ?section=<serviceId> auto-scrolls on mount.
"use client";

import * as React from "react";
import { Box, Container } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Header from "@/components/StudentRecCenter/srcHeader";
import DashboardSidebar from "@/components/dashboard/sidebar";
import SrcStatusBadge from "@/components/StudentRecCenter/SrcStatusBadge";
import ServicesHero from "@/components/StudentRecCenter/Services/ServicesHero";
import ServicesNav from "@/components/StudentRecCenter/Services/ServicesNav";
import ServicesSearch from "@/components/StudentRecCenter/Services/ServicesSearch";
import ServiceModule from "@/components/StudentRecCenter/Services/ServiceModule";
import { SERVICES } from "@/components/StudentRecCenter/Services/ServicesData";
import type { ServiceId } from "@/components/StudentRecCenter/Services/ServicesData";

export default function ServicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sidebarWidth, setSidebarWidth] = React.useState(220);
  const [search, setSearch] = React.useState("");
  const [activeSection, setActiveSection] = React.useState<ServiceId | null>(null);

  // ── Deep-link scroll ──────────────────────────────────────────────────────
  React.useEffect(() => {
    const section = searchParams.get("section") as ServiceId | null;
    if (!section) return;
    const timer = setTimeout(() => {
      document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 320);
    return () => clearTimeout(timer);
  }, [searchParams]);

  // ── IntersectionObserver: highlight sidebar item ──────────────────────────
  React.useEffect(() => {
    const obs: IntersectionObserver[] = [];
    SERVICES.forEach((svc) => {
      const el = document.getElementById(svc.id);
      if (!el) return;
      const o = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(svc.id); },
        { rootMargin: "-28% 0px -60% 0px", threshold: 0 }
      );
      o.observe(el);
      obs.push(o);
    });
    return () => obs.forEach((o) => o.disconnect());
  }, []);

  // ── Search filter ─────────────────────────────────────────────────────────
  const q = search.trim().toLowerCase();
  const filtered = React.useMemo(() => {
    if (!q) return SERVICES;
    return SERVICES.filter((s) =>
      [
        s.title, s.tagline, s.description,
        ...(s.bullets ?? []),
        ...(s.rentalItems?.map((r) => r.name) ?? []),
        ...(s.trainers?.flatMap((t) => [t.name, t.role, ...t.specialties]) ?? []),
        ...(s.spaces?.flatMap((sp) => [sp.name, ...sp.activities, ...sp.features]) ?? []),
      ].join(" ").toLowerCase().includes(q)
    );
  }, [q]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* ── Sidebar ── */}
      <DashboardSidebar
        onLogout={() => router.push("/login")}
        onWidthChange={setSidebarWidth}
      />

      {/* ── Main content ── */}
      <Box
        sx={{
          ml: `${sidebarWidth}px`,
          flex: 1,
          minWidth: 0,
          transition: "margin-left 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <Header value="/StudentRecCenter/services" />

        {/* Hero */}
        <Container maxWidth="xl">
          {/* Live open/closed status in hero area */}
          <Box sx={{ pt: 2, pb: 0.5, display: "flex", justifyContent: "flex-end" }}>
            <SrcStatusBadge />
          </Box>
          <ServicesHero />
        </Container>

        {/* Body: sidebar + content */}
        <Container maxWidth="xl" sx={{ pb: 10 }}>
          <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>

            {/* Services sidebar nav (hidden on mobile) */}
            <ServicesNav activeSection={activeSection} />

            {/* Main content column */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Search */}
              <Box sx={{ mb: 1 }}>
                <ServicesSearch search={search} onChange={setSearch} resultCount={filtered.length} />
              </Box>

              {/* Modules */}
              {filtered.map((svc) => (
                <ServiceModule key={svc.id} service={svc} />
              ))}

              {filtered.length === 0 && (
                <Box sx={{ textAlign: "center", py: 10, color: "rgba(255,255,255,0.25)", fontSize: 15 }}>
                  No services match &ldquo;{search}&rdquo;
                </Box>
              )}
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
