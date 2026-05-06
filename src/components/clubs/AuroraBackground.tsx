"use client";

import * as React from "react";
import { Box } from "@mui/material";

export default function AuroraBackground({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        bgcolor: "#ffffff",

        /* Subtle red glow — top-left and bottom-right corners only */
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background: [
            "radial-gradient(ellipse 55% 40% at 0% 0%, rgba(210,30,50,0.09), transparent 70%)",
            "radial-gradient(ellipse 50% 35% at 100% 100%, rgba(200,20,40,0.07), transparent 70%)",
          ].join(","),
          animation: "gentlePulse 12s ease-in-out infinite alternate",
          pointerEvents: "none",
        },

        /* Single thin red streak — diagonal, barely visible */
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background:
            "radial-gradient(ellipse 120% 8% at 50% 50%, rgba(210,30,50,0.045), transparent 70%)",
          transform: "rotate(-8deg)",
          animation: "streakDrift 18s ease-in-out infinite alternate",
          pointerEvents: "none",
        },

        "@keyframes gentlePulse": {
          "0%":   { opacity: 0.7 },
          "50%":  { opacity: 1 },
          "100%": { opacity: 0.75 },
        },

        "@keyframes streakDrift": {
          "0%":   { transform: "rotate(-8deg) translateY(-2%)" },
          "50%":  { transform: "rotate(-6deg) translateY(2%)" },
          "100%": { transform: "rotate(-9deg) translateY(-1%)" },
        },

        "@keyframes dotPulse": {
          "0%, 100%": { transform: "scale(1)", opacity: 0.55 },
          "50%":      { transform: "scale(1.6)", opacity: 1 },
        },
      }}
    >
      <Box className="aurora-dot" />
      <Box sx={{ position: "relative", zIndex: 1 }}>{children}</Box>
    </Box>
  );
}
