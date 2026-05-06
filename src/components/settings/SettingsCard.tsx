"use client";

import Box from "@mui/material/Box";

export function SettingsCard({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: (t) => `1px solid ${t.palette.divider}`,
        borderRadius: "14px",
        boxShadow: (t) =>
          t.palette.mode === "dark"
            ? "0 1px 2px rgba(0,0,0,0.3)"
            : "0 1px 2px rgba(15, 23, 42, 0.04)",
        overflow: "hidden",
        mb: 2,
      }}
    >
      {children}
    </Box>
  );
}
