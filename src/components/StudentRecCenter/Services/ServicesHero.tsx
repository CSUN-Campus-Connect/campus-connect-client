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
      {/* Floating icon orbs */}
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
            bgcolor: `${o.color}22`,
            border: `1px solid ${o.color}44`,
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            justifyContent: "center",
            color: o.color,
            animation: `floatOrb 5s ease-in-out infinite alternate`,
            animationDelay: o.delay,
            backdropFilter: "blur(6px)",
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
          bgcolor: `${SRC_RED}33`,
          color: "#ffb3c1",
          border: `1px solid ${SRC_RED}66`,
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: 2,
          textTransform: "uppercase",
        }}
      />

      <Typography
        component="h1"
        sx={{
          fontSize: { xs: 38, sm: 56, md: 80 },
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: 1,
          color: "white",
          textShadow: `0 4px 40px ${SRC_RED}88`,
          fontFamily: "'Bebas Neue', 'Impact', 'Arial Black', sans-serif",
        }}
      >
        SRC Services
      </Typography>

      <Typography
        sx={{
          mt: 2.5,
          color: "rgba(255,255,255,0.58)",
          fontSize: { xs: 14, md: 17 },
          maxWidth: 500,
          mx: "auto",
          lineHeight: 1.7,
          fontWeight: 400,
        }}
      >
        One Facility, All the training, All the performance, All you need.
      </Typography>

      {/* Stats strip */}
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
              bgcolor: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.14)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Typography
              sx={{
                color: "white",
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
                color: "rgba(255,255,255,0.5)",
                fontSize: 10,
                fontWeight: 600,
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
