"use client";

import Box from "@mui/material/Box";

export function SettingsCard({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        background: "#fff",
        border: "1px solid #E2E5EC",
        borderRadius: "14px",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
        overflow: "hidden",
        mb: 2,
      }}
    >
      {children}
    </Box>
  );
}
