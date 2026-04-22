"use client";

import * as React from "react";
import { Box, Typography, Chip } from "@mui/material";
import FormatQuoteRoundedIcon from "@mui/icons-material/FormatQuoteRounded";
import type { TrainerProfile } from "./ServicesData";

const CERT_COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#f43f5e", "#06b6d4"];
const AVATAR_SIZE = 80;
const OVERHANG = AVATAR_SIZE / 2;

function TrainerCard({ trainer }: { trainer: TrainerProfile }) {
  const [hovered, setHovered] = React.useState(false);
  const initials = trainer.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{ position: "relative", pt: `${OVERHANG + 8}px` }}
    >
      {/* Floating avatar */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: hovered ? "translateX(-50%) translateY(-4px)" : "translateX(-50%)",
          width: AVATAR_SIZE,
          height: AVATAR_SIZE,
          borderRadius: "50%",
          border: "3px solid rgba(255,255,255,0.22)",
          boxShadow: hovered ? "0 10px 28px rgba(255, 255, 255, 0.6)" : "0 6px 20px rgba(0,0,0,0.5)",
          overflow: "hidden",
          bgcolor: "rgba(168,5,50,0.4)",
          zIndex: 2,
          transition: "all 0.25s ease",
        }}
      >
        {trainer.imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={trainer.imageSrc}
            alt={trainer.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <Box sx={{ width: "100%", height: "100%", display: "grid", placeItems: "center" }}>
            <Typography sx={{ color: "#ffb3c1", fontWeight: 900, fontSize: 22 }}>{initials}</Typography>
          </Box>
        )}
      </Box>

      {/* Card body */}
      <Box
        sx={{
          position: "relative",
          borderRadius: "16px",
          overflow: "hidden",
          bgcolor: "rgba(255,255,255,0.08)",
          border: hovered ? "1px solid rgba(255,255,255,0.28)" : "1px solid rgba(255,255,255,0.13)",
          backdropFilter: "blur(12px)",
          boxShadow: hovered ? "0 12px 36px rgba(0,0,0,0.45)" : "none",
          transition: "all 0.25s ease",
        }}
      >
        <Box sx={{ pt: `${OVERHANG + 6}px`, px: 2, pb: 2, textAlign: "center" }}>
          <Typography sx={{ color: "white", fontWeight: 900, fontSize: 15, lineHeight: 1.2 }}>
            {trainer.name}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 600, mt: 0.3, mb: 1.5 }}>
            {trainer.role}
          </Typography>

          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", justifyContent: "center", mb: 1.4 }}>
            {trainer.certifications.slice(0, 2).map((cert, i) => (
              <Chip
                key={cert}
                label={cert}
                size="small"
                sx={{
                  fontSize: 9.5,
                  fontWeight: 800,
                  height: 18,
                  bgcolor: `${CERT_COLORS[i % CERT_COLORS.length]}22`,
                  color: CERT_COLORS[i % CERT_COLORS.length],
                  border: `1px solid ${CERT_COLORS[i % CERT_COLORS.length]}44`,
                  "& .MuiChip-label": { px: 0.8 },
                }}
              />
            ))}
          </Box>

          <Typography sx={{ color: "rgba(255,255,255,0.50)", fontSize: 11.5, lineHeight: 1.5, minHeight: 34 }}>
            {trainer.specialties.slice(0, 3).join(" · ")}
          </Typography>
        </Box>

        {/* Quote slides up on hover */}
        {trainer.quote && (
          <Box
            aria-hidden="true"
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              px: 2,
              py: 1.8,
              bgcolor: "rgba(145, 5, 36, 0.59)",
              backdropFilter: "blur(12px)",
              borderTop: "1px solid rgba(0, 0, 0, 0.1)",
              borderBottomLeftRadius: "16px",
              borderBottomRightRadius: "16px",
              transform: hovered ? "translateY(0)" : "translateY(100%)",
              transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            <FormatQuoteRoundedIcon aria-hidden="true" sx={{ color: "rgba(255,100,120,0.55)", fontSize: 20, mb: 0.4 }} />
            <Typography sx={{ color: "rgba(255,255,255,0.82)", fontSize: 11.5, fontStyle: "italic", lineHeight: 1.6 }}>
              {trainer.quote}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

interface Props { trainers: TrainerProfile[]; label?: string }

export default function TrainersGrid({ trainers, label = "Meet the Team" }: Props) {
  return (
    <Box sx={{ mt: 4 }}>
      <Typography sx={{ color: "rgba(255,255,255,0.40)", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", mb: 3 }}>
        {label}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3,1fr)", md: "repeat(4,1fr)" },
          gap: 2,
          pt: 1,
        }}
      >
        {trainers.map((t) => <TrainerCard key={t.name} trainer={t} />)}
      </Box>
    </Box>
  );
}
