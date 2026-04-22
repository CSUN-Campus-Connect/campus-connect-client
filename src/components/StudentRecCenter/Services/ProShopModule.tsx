"use client";

// @/components/StudentRecCenter/Services/ProShopModule.tsx
// Equipment shown in a frosted-glass panel as a clean categorized list.

import * as React from "react";
import { Box, Typography } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import type { ServiceModule } from "./ServicesData";

interface Props { service: ServiceModule }

export default function ProShopModule({ service }: Props) {
  const items = service.rentalItems ?? [];

  return (
    <Box
      sx={{
        borderRadius: "18px",
        border: "1px solid rgba(59,130,246,0.25)",
        bgcolor: "rgba(15,25,50,0.55)",
        backdropFilter: "blur(18px)",
        overflow: "hidden",
      }}
    >
      {/* Panel header */}
      <Box
        sx={{
          px: 2.5,
          py: 1.6,
          borderBottom: "1px solid rgba(59,130,246,0.18)",
          bgcolor: "rgba(59,130,246,0.10)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography sx={{ color: "white", fontWeight: 900, fontSize: 14 }}>
          Rental Equipment
        </Typography>
        <Typography
          sx={{
            color: "#93c5fd",
            fontSize: 11,
            fontWeight: 700,
            bgcolor: "rgba(59,130,246,0.18)",
            border: "1px solid rgba(59,130,246,0.32)",
            borderRadius: 999,
            px: 1.2,
            py: 0.3,
          }}
        >
          {items.length} items · Free to borrow
        </Typography>
      </Box>

      {/* Two-column list */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
          gap: 0,
        }}
      >
        {items.map((item, i) => (
          <Box
            key={item.name}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              px: 2.2,
              py: 1,
              borderBottom: i < items.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              transition: "background 0.15s ease",
              "&:hover": {
                bgcolor: "rgba(59,130,246,0.10)",
              },
            }}
          >
            <CheckCircleRoundedIcon aria-hidden="true" sx={{ fontSize: 14, color: "rgba(59,130,246,0.7)", flexShrink: 0 }} />
            <Typography sx={{ color: "rgba(255,255,255,0.80)", fontSize: 13, fontWeight: 500 }}>
              {item.name}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Footer note */}
      <Box
        sx={{
          px: 2.5,
          py: 1.4,
          borderTop: "1px solid rgba(59,130,246,0.15)",
          bgcolor: "rgba(59,130,246,0.06)",
        }}
      >
        <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
          Stop by the <Box component="span" sx={{ color: "#93c5fd", fontWeight: 700 }}>SRC Front Desk</Box> with your CSUN ID to check out any item.
          Return when done.
        </Typography>
      </Box>
    </Box>
  );
}
