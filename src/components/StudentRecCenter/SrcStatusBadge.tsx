// src/components/StudentRecCenter/SrcStatusBadge.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Reusable pill badge showing whether the CSUN SRC is open right now.
// Uses real Spring 2026 hours from useSrcHours hook.
// Drop into any SRC page — no props required.
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import * as React from "react";
import { Chip, Tooltip } from "@mui/material";
import { useSrcStatus } from "@/components/StudentRecCenter/hooks/useSrcHours";

const COLOR_MAP = {
  green:  { bg: "rgba(34,197,94,0.25)",  text: "#bbf7d0", border: "rgba(187,247,208,0.4)" },
  yellow: { bg: "rgba(250,204,21,0.25)", text: "#fef08a", border: "rgba(254,240,138,0.4)" },
  red:    { bg: "rgba(239,68,68,0.22)",  text: "#fca5a5", border: "rgba(252,165,165,0.4)" },
};

type Props = { size?: "small" | "medium" };

export default function SrcStatusBadge({ size = "small" }: Props) {
  const status = useSrcStatus();
  const c = COLOR_MAP[status.color];
  const dot = status.color === "green" ? "●" : status.color === "yellow" ? "◐" : "○";

  return (
    <Tooltip title={`SRC · ${status.label}`} arrow placement="bottom">
      <Chip
        label={`${dot} ${status.isOpen ? "Facility Open" : "Facility Closed"}`}
        size={size}
        sx={{
          fontSize: size === "small" ? 11 : 13,
          fontWeight: 700,
          bgcolor: c.bg,
          color: c.text,
          border: `1px solid ${c.border}`,
          backdropFilter: "blur(8px)",
          cursor: "default",
          "& .MuiChip-label": { px: 1.25 },
          ...(status.isOpen && {
            animation: "pulse 2s infinite",
            "@keyframes pulse": {
              "0%,100%": { opacity: 1 },
              "50%": { opacity: 0.65 },
            },
          }),
        }}
      />
    </Tooltip>
  );
}
