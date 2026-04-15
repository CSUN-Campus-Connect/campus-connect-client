"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export function SettingsPageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography sx={{ fontSize: 26, fontWeight: 900, color: "#111827", letterSpacing: "-0.02em" }}>{title}</Typography>
      {subtitle ? (
        <Typography sx={{ color: "#6B7280", mt: 0.5, fontSize: 16, maxWidth: 720, lineHeight: 1.55 }}>{subtitle}</Typography>
      ) : null}
    </Box>
  );
}
