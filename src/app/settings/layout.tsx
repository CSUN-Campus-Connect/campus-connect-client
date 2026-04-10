"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Typography from "@mui/material/Typography";
import SettingsMenu from "./SettingsMenu";
import { settingsPageBg } from "@/components/settings";

const red = "#B11226";
const darkRed = "#7A0A0A";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Shared settings header / back navigation for all settings subpages */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1100,
          height: 56,
          display: "flex",
          alignItems: "center",
          background: darkRed,
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Box
          sx={{
            width: "100%",
            px: { xs: 2, sm: 2.5, md: 3 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <IconButton
              onClick={() => router.push("/dashboard")}
              size="small"
              aria-label="Back to dashboard"
              sx={{
                border: "1px solid #E5E7EB",
                backgroundColor: "#fff",
                "&:hover": { backgroundColor: "#F9FAFB" },
              }}
            >
              <ArrowBackIcon fontSize="small" sx={{ color: red }} />
            </IconButton>

            {/* Mobile page label so the header does not feel empty on small screens */}
            <Typography
              sx={{
                display: { xs: "block", md: "none" },
                fontSize: 18,
                fontWeight: 700,
                color: "#FFFFFF",
                lineHeight: 1,
              }}
            >
              Settings
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Two-column settings shell: stacked on mobile, sidebar + content on desktop 
      TODO: Improve mobile settings navigation in a future UI pass.*/}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "280px minmax(0, 1fr)" },
          minHeight: "calc(100vh - 56px)",
        }}
      >
        {/* Persistent settings navigation for desktop layouts; stacked section on mobile */}
        <Box
          sx={{
            bgcolor: "background.paper",
            borderRight: { xs: "none", md: (t) => `1px solid ${t.palette.divider}` },
            borderBottom: { xs: (t) => `1px solid ${t.palette.divider}`, md: "none" },
            px: { xs: 2, sm: 2.5, md: 2.5 },
            py: { xs: 2, md: 2.5 },
            position: { md: "sticky" },
            top: { md: 56 },
            height: { md: "calc(100vh - 56px)" },
            overflowY: { md: "auto" },
          }}
        >
          {/* Desktop-only section label for the settings navigation area */}
          <Typography
            sx={{
              display: { xs: "none", md: "block" },
              fontSize: 24,
              fontWeight: 700,
              color: "text.primary",
              mb: 2,
              px: 0.5,
              lineHeight: 1.2,
            }}
          >
            Settings
          </Typography>

          <SettingsMenu variant="sidebar" />
        </Box>

        {/* Main content slot for each settings page (account, privacy, security, notifications, appearance, support) */}
        <Box
          sx={{
            px: { xs: 2, sm: 2.5, md: 4 },
            py: { xs: 2.5, md: 3.5 },
            backgroundColor: (t) =>
              t.palette.mode === "dark" ? "#13151c" : settingsPageBg,
            minHeight: { md: "calc(100vh - 56px)" },
          }}
        >
          <Box sx={{ maxWidth: 1100, width: "100%" }}>{children}</Box>
        </Box>
      </Box>
    </Box>
  );
}