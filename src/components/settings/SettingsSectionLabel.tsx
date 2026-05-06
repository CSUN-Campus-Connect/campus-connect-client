"use client";

import Typography from "@mui/material/Typography";

export function SettingsSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        mb: 1,
        mt: 0.25,
        px: 0.5,
        fontSize: "0.6875rem",
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "text.secondary",
        lineHeight: 1.4,
      }}
    >
      {children}
    </Typography>
  );
}
