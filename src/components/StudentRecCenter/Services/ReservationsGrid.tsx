"use client";

// @/components/StudentRecCenter/Services/ReservationsGrid.tsx

import * as React from "react";
import { Box, Typography, Chip, Collapse, IconButton } from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import type { ReservationSpace } from "./ServicesData";

const ACTIVITY_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6",
  "#06b6d4", "#f43f5e", "#84cc16",
];

function SpaceCard({ space }: { space: ReservationSpace }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Box
      sx={{
        borderRadius: "16px",
        overflow: "hidden",
        bgcolor: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          borderColor: "rgba(255,255,255,0.22)",
          boxShadow: "0 8px 28px rgba(0,0,0,0.4)",
        },
      }}
    >
      {/* Header row */}
      <Box
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-label={`${space.name} — ${open ? "collapse" : "expand"} details`}
        sx={{
          p: 2,
          pb: 1.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          cursor: "pointer",
        }}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen((v) => !v); } }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ color: "white", fontWeight: 900, fontSize: 15, lineHeight: 1.2 }}>
            {space.name}
          </Typography>
          {space.floor && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, mt: 0.4 }}>
              <PlaceRoundedIcon aria-hidden="true" sx={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }} />
              <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>{space.floor}</Typography>
            </Box>
          )}
          {space.capacity && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, mt: 0.2 }}>
              <PeopleRoundedIcon aria-hidden="true" sx={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }} />
              <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>{space.capacity}</Typography>
            </Box>
          )}
        </Box>
        <IconButton
          aria-hidden="true"
          tabIndex={-1}
          size="small"
          sx={{
            color: "rgba(255,255,255,0.45)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.28s ease",
            mt: -0.5,
          }}
        >
          <ExpandMoreRoundedIcon aria-hidden="true" />
        </IconButton>
      </Box>

      {/* Activity chips always visible */}
      <Box sx={{ px: 2, pb: open ? 0 : 1.5, display: "flex", flexWrap: "wrap", gap: 0.6 }}>
        {space.activities.map((a, i) => (
          <Chip
            key={a}
            label={a}
            size="small"
            sx={{
              height: 20,
              fontSize: 10,
              fontWeight: 800,
              bgcolor: `${ACTIVITY_COLORS[i % ACTIVITY_COLORS.length]}22`,
              color: ACTIVITY_COLORS[i % ACTIVITY_COLORS.length],
              border: `1px solid ${ACTIVITY_COLORS[i % ACTIVITY_COLORS.length]}44`,
              "& .MuiChip-label": { px: 0.9 },
            }}
          />
        ))}
      </Box>

      {/* Expanded features */}
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box
          sx={{
            mx: 2,
            mb: 2,
            mt: 1.2,
            p: 1.4,
            borderRadius: "10px",
            bgcolor: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Typography
            sx={{ color: "rgba(255,255,255,0.40)", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", mb: 0.8 }}
          >
            Features
          </Typography>
          {space.features.map((f) => (
            <Box key={f} sx={{ display: "flex", alignItems: "flex-start", gap: 0.8, mb: 0.4 }}>
              <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.35)", mt: 0.7, flexShrink: 0 }} />
              <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: 12, lineHeight: 1.55 }}>{f}</Typography>
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}

interface Props { spaces: ReservationSpace[] }

export default function ReservationsGrid({ spaces }: Props) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
        gap: 1.5,
      }}
    >
      {spaces.map((s) => <SpaceCard key={s.name} space={s} />)}
    </Box>
  );
}
