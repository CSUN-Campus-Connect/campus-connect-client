"use client";

import * as React from "react";
import { Box } from "@mui/material";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/sidebar";
import AcademicsView from "@/components/academics/AcademicsView";

export default function AcademicsPage() {
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
        <AcademicsView />
      </Box>
    </Box>
  );
}
