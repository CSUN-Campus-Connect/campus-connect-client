// src/app/StudentRecCenter/Schedule/page.tsx
"use client";

import * as React from "react";
import { Box, Container, Typography, Chip } from "@mui/material";
import { useRouter } from "next/navigation";
import Header from "@/components/StudentRecCenter/srcHeader";
import WeeklySchedule from "@/components/StudentRecCenter/Schedule/WeeklySchedule";
import EventsBanner from "@/components/StudentRecCenter/Schedule/EventsBanner";
import DashboardSidebar from "@/components/dashboard/sidebar";
import SrcStatusBadge from "@/components/StudentRecCenter/SrcStatusBadge";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";

export default function SchedulePage() {
  const router = useRouter();
  const [sidebarWidth, setSidebarWidth] = React.useState(220);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", position: "relative" }}>
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
        <Header value="/StudentRecCenter/Schedule" />

        <Container maxWidth="xl" sx={{ pt: 3, pb: 8 }}>
          {/* Page header */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.75 }}>
              <Box
                sx={{
                  width: 42, height: 42, borderRadius: 2.5,
                  bgcolor: "rgba(168,5,50,0.3)", border: "1.5px solid rgba(168,5,50,0.5)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <FitnessCenterIcon sx={{ fontSize: 22, color: "#ffb3c1" }} />
              </Box>
              <Box>
                <Typography
                  variant="overline"
                  sx={{ color: "rgba(255,255,255,0.45)", letterSpacing: 3, fontWeight: 700, lineHeight: 1 }}
                >
                  Student Recreation Center
                </Typography>
                <Typography variant="h4" fontWeight={900} sx={{ color: "#fff", letterSpacing: -0.5, lineHeight: 1.1 }}>
                  Group Classes & Events Schedule
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1, flexWrap: "wrap" }}>
              <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", maxWidth: 560 }}>
                Browse the weekly class schedule, view availability, and add sessions directly to your personal events calendar.
              </Typography>
              <SrcStatusBadge />
            </Box>
          </Box>

          {/* Live SRC events from CSUN ICS feed */}
          <Box
            sx={{
              mb: 4, p: 3, borderRadius: 4,
              bgcolor: "rgba(255,255,255,0.07)",
              border: "1.5px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(12px)",
            }}
          >
            <EventsBanner />
          </Box>

          {/* Weekly Schedule */}
          <Box
            sx={{
              p: { xs: 2, md: 3 }, borderRadius: 4,
              bgcolor: "rgba(255,255,255,0.05)",
              border: "1.5px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5, flexWrap: "wrap", gap: 1 }}>
              <Box>
                <Typography
                  variant="overline"
                  sx={{ color: "rgba(255,255,255,0.4)", letterSpacing: 3, fontWeight: 700, display: "block" }}
                >
                  Schedule
                </Typography>
                <Typography variant="h6" fontWeight={800} sx={{ color: "#fff" }}>
                  Weekly Class Schedule
                </Typography>
              </Box>
              <Chip
                label="Click any class to register"
                size="small"
                sx={{
                  fontSize: 11, fontWeight: 600,
                  bgcolor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  "& .MuiChip-label": { px: 1.25 },
                }}
              />
            </Box>
            <WeeklySchedule />
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
