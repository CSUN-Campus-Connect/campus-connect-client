"use client";

// @/components/StudentRecCenter/Services/ServicesNav.tsx
// Vertical sidebar navigation — styled to match the Sport Clubs category pill bar aesthetic.

import * as React from "react";
import { Box, Typography } from "@mui/material";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded";
import SelfImprovementRoundedIcon from "@mui/icons-material/SelfImprovementRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import DryRoundedIcon from "@mui/icons-material/DryRounded";
import AccessibleRoundedIcon from "@mui/icons-material/AccessibleRounded";
import type { ServiceId } from "./ServicesData";

const NAV_ITEMS: { id: ServiceId; label: string; icon: React.ReactNode; color: string }[] = [
  { id: "pro-shop",           label: "Pro Shop",           icon: <StorefrontRoundedIcon sx={{ fontSize: 16 }} />,       color: "#3b82f6" },
  { id: "personal-training",  label: "Personal Training",  icon: <FitnessCenterRoundedIcon sx={{ fontSize: 16 }} />,    color: "#ef4444" },
  { id: "recovery",           label: "Recovery",           icon: <SelfImprovementRoundedIcon sx={{ fontSize: 16 }} />,  color: "#10b981" },
  { id: "private-instruction",label: "Private Instruction",icon: <SchoolRoundedIcon sx={{ fontSize: 16 }} />,           color: "#8b5cf6" },
  { id: "cpr-firstaid",       label: "CPR & First Aid",    icon: <FavoriteRoundedIcon sx={{ fontSize: 16 }} />,         color: "#f43f5e" },
  { id: "reservations",       label: "Reservations",       icon: <EventAvailableRoundedIcon sx={{ fontSize: 16 }} />,   color: "#f59e0b" },
  { id: "lockers",            label: "Lockers",            icon: <LockRoundedIcon sx={{ fontSize: 16 }} />,             color: "#94a3b8" },
  { id: "towels",             label: "Towels",             icon: <DryRoundedIcon sx={{ fontSize: 16 }} />,              color: "#06b6d4" },
  { id: "accessibility",      label: "Accessibility",      icon: <AccessibleRoundedIcon sx={{ fontSize: 16 }} />,       color: "#84cc16" },
];

interface Props {
  activeSection: ServiceId | null;
}

export default function ServicesNav({ activeSection }: Props) {
  const scrollTo = (id: ServiceId) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Box
      component="nav"
      sx={{
        position: "sticky",
        top: 72,
        height: "fit-content",
        width: 200,
        flexShrink: 0,
        display: { xs: "none", lg: "flex" },
        flexDirection: "column",
        gap: 0.5,
        p: 1.5,
        borderRadius: "18px",
        bgcolor: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
        backdropFilter: "blur(20px)",
      }}
    >
      <Typography
        sx={{
          color: "rgba(255,255,255,0.30)",
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: 2,
          textTransform: "uppercase",
          px: 1,
          mb: 0.5,
        }}
      >
        Services
      </Typography>

      {NAV_ITEMS.map((item) => {
        const isActive = activeSection === item.id;
        return (
          <Box
            key={item.id}
            component="button"
            onClick={() => scrollTo(item.id)}
            aria-current={isActive ? "true" : undefined}
            aria-label={item.label}
            sx={{
              all: "unset",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              px: 1.4,
              py: 1,
              borderRadius: "12px",
              fontSize: 12,
              fontWeight: 700,
              transition: "all 0.18s ease",
              ...(isActive
                ? {
                    bgcolor: item.color,
                    color: "white",
                    boxShadow: `0 3px 12px ${item.color}55`,
                  }
                : {
                    bgcolor: "transparent",
                    color: "rgba(255,255,255,0.60)",
                    "&:hover": {
                      bgcolor: `${item.color}22`,
                      color: "white",
                    },
                  }),
            }}
          >
            <Box
              aria-hidden="true"
              sx={{
                display: "flex",
                alignItems: "center",
                color: isActive ? "white" : item.color,
                flexShrink: 0,
              }}
            >
              {item.icon}
            </Box>
            {item.label}
          </Box>
        );
      })}
    </Box>
  );
}
