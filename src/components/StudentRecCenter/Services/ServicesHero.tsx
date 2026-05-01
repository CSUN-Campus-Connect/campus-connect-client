"use client";

// @/components/StudentRecCenter/Services/ServicesHero.tsx

import * as React from "react";
import { Box, Typography, Chip } from "@mui/material";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded";
import SelfImprovementRoundedIcon from "@mui/icons-material/SelfImprovementRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";

const SRC_RED = "#A80532";
const orbs = [
  { icon: <FitnessCenterRoundedIcon />, top: "12%", left: "8%", delay: "0s", size: 48, color: "#ef4444" },
  { icon: <SelfImprovementRoundedIcon />, top: "22%", right: "10%", delay: "0.4s", size: 44, color: "#10b981" },
  { icon: <StorefrontRoundedIcon />, bottom: "28%", left: "5%", delay: "0.8s", size: 40, color: "#3b82f6" },
  { icon: <EventAvailableRoundedIcon />, bottom: "18%", right: "7%", delay: "1.2s", size: 44, color: "#f59e0b" },
  { icon: <FavoriteRoundedIcon />, top: "55%", left: "14%", delay: "0.6s", size: 36, color: "#f43f5e" },
  { icon: <LockRoundedIcon />, top: "45%", right: "16%", delay: "1.0s", size: 36, color: "#64748b" },
];

export default function ServicesHero() {
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        pt: { xs: 6, md: 10 },
        pb: { xs: 5, md: 8 },
        textAlign: "center",
        isolation: "isolate",
      }}
    >
      {/* Floating icon orbs — colors adjusted for white bg */}
      {orbs.map((o, i) => (
        <Box
          key={i}
          aria-hidden="true"
          sx={{
            position: "absolute",
            top: o.top,
            bottom: o.bottom,
            left: o.left,
            right: o.right,
            width: o.size,
            height: o.size,
            borderRadius: "50%",
            bgcolor: `${o.color}18`,
            border: `1.5px solid ${o.color}55`,
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            justifyContent: "center",
            color: o.color,
            animation: `floatOrb 5s ease-in-out infinite alternate`,
            animationDelay: o.delay,
            backdropFilter: "blur(4px)",
            "& svg": { fontSize: o.size * 0.45 },
            "@keyframes floatOrb": {
              "0%": { transform: "translateY(0px) rotate(0deg)" },
              "100%": { transform: "translateY(-14px) rotate(8deg)" },
            },
          }}
        >
          {o.icon}
        </Box>
      ))}

      {/* Title pill */}
      <Chip
        label="CSUN Student Recreation Center"
        size="small"
        sx={{
          mb: 2,
          bgcolor: `${SRC_RED}18`,
          color: SRC_RED,
          border: `1.5px solid ${SRC_RED}55`,
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: 2,
          textTransform: "uppercase",
        }}
      />

      {/* Main title — dark red text + white border/stroke for contrast */}
      <Typography
        component="h1"
        sx={{
          fontSize: { xs: 38, sm: 56, md: 80 },
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: 1,
          // Dark red fill with white text-stroke so it pops on the white bg
          color: SRC_RED,
          WebkitTextStroke: { xs: "1.5px rgba(255,255,255,0.7)", md: "2px rgba(255,255,255,0.7)" },
          paintOrder: "stroke fill",
          // Outer border effect via text-shadow stack
          textShadow: `
            -2px -2px 0 rgba(255,255,255,0.6),
             2px -2px 0 rgba(255,255,255,0.6),
            -2px  2px 0 rgba(255,255,255,0.6),
             2px  2px 0 rgba(255,255,255,0.6),
             0 0 40px ${SRC_RED}44
          `,
          fontFamily: "'Bebas Neue', 'Impact', 'Arial Black', sans-serif",
        }}
      >
        SRC Services
      </Typography>

      {/* Subtitle — dark red, readable on white */}
      <Typography
        sx={{
          mt: 2.5,
          color: `${SRC_RED}bb`,
          fontSize: { xs: 14, md: 17 },
          maxWidth: 500,
          mx: "auto",
          lineHeight: 1.7,
          fontWeight: 500,
        }}
      >
        One Facility, All the training, All the performance, All you need.
      </Typography>

      {/* Stats strip — dark red on white */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: { xs: 1, md: 2 },
          mt: 4,
        }}
      >
        {[
          { value: "9", label: "Service areas" },
          { value: "55 min", label: "PT sessions" },
          { value: "$70", label: "CPR cert" },
          { value: "Free", label: "Theragun recovery" },
          { value: "27+", label: "Rental items" },
        ].map((s) => (
          <Box
            key={s.label}
            sx={{
              px: { xs: 1.8, md: 2.4 },
              py: { xs: 0.9, md: 1.2 },
              borderRadius: "999px",
              bgcolor: `${SRC_RED}0d`,
              border: `1.5px solid ${SRC_RED}33`,
            }}
          >
            <Typography
              sx={{
                color: SRC_RED,
                fontWeight: 900,
                fontSize: { xs: 15, md: 18 },
                lineHeight: 1.1,
                textAlign: "center",
              }}
            >
              {s.value}
            </Typography>
            <Typography
              sx={{
                color: `${SRC_RED}88`,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 0.5,
                textAlign: "center",
                textTransform: "uppercase",
              }}
            >
              {s.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
