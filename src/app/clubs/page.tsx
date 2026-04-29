"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import * as React from "react";
import { Box } from "@mui/material";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/sidebar";
import { CLUBS } from "@/components/clubs/temp(mockdata)/clubs.data";

const ClubsUI = dynamic(() => import("@/components/clubs/ClubsUI"), { ssr: false });

export default function ClubsPage() {
  const router = useRouter();
  const [sidebarWidth, setSidebarWidth] = React.useState(220);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <DashboardSidebar
        onLogout={() => router.push("/login")}
        onWidthChange={setSidebarWidth}
      />
      <Box sx={{
        ml: `${sidebarWidth}px`,
        flex: 1, minWidth: 0, minHeight: "100vh",
        transition: "margin-left 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        <Suspense fallback={null}>
          <ClubsUI clubs={CLUBS} mode="hub" />
        </Suspense>
      </Box>
    </Box>
  );
}
