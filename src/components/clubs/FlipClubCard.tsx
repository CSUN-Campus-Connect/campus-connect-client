"use client";

// ═══════════════════════════════════════════════════════════════════════
// BACKEND INTEGRATION — FlipClubCard
// ═══════════════════════════════════════════════════════════════════════
// isMember — passed from ClubsUI, driven by the membership query:
//   SELECT club_id FROM club_members WHERE user_id = :userId
//
// When isMember is true, the back face shows a "Leave Club" button that
// opens LeaveClubDialog.  onLeaveSuccess propagates the confirmed leave
// back up to ClubsUI so the membership set can be updated optimistically.
//
// FOUNDERS / ADMINS:
//   Consider passing a `role` prop alongside `isMember` so you can show
//   a disabled "Leave" button with a tooltip ("Transfer leadership first")
//   for club founders:
//     SELECT role FROM club_members WHERE club_id = :id AND user_id = :me
// ═══════════════════════════════════════════════════════════════════════

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Box, Button, Chip, Typography } from "@mui/material";
import type { Club } from "./temp(mockdata)/clubs.data";
import { btnMaroon } from "./ClubsStates";
import LeaveClubDialog from "./LeaveClubDialog";

interface FlipClubCardProps {
  club: Club;
  /** Whether the current user is a member — controls Leave button visibility */
  isMember?: boolean;
  /** Forwarded from ClubsUI; called after a confirmed leave */
  onLeaveSuccess?: (clubId: string) => void;
}

export default function FlipClubCard({ club, isMember = false, onLeaveSuccess }: FlipClubCardProps) {
  const [flipped, setFlipped] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const router = useRouter();

  const initials = React.useMemo(() => {
    const parts = (club.name ?? "").split(" ").filter(Boolean);
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("");
  }, [club.name]);

  const href = club.href ?? `/clubs/${club.id}`;

  const categoryColor: Record<string, string> = {
    STEM: "rgba(59,130,246,0.85)",
    Business: "rgba(16,185,129,0.85)",
    Arts: "rgba(236,72,153,0.85)",
    Cultural: "rgba(245,158,11,0.85)",
    Sports: "rgba(239,68,68,0.85)",
    Literature: "rgba(139,92,246,0.85)",
    Fraternity: "rgba(20,184,166,0.85)",
    Sorority: "rgba(244,114,182,0.85)",
  };
  const catColor = categoryColor[club.category ?? ""] ?? "rgba(100,100,100,0.75)";

  const bannerGradient: Record<string, string> = {
    STEM:        "linear-gradient(135deg,#1e3a8a 0%,#3b82f6 100%)",
    Business:    "linear-gradient(135deg,#064e3b 0%,#10b981 100%)",
    Arts:        "linear-gradient(135deg,#831843 0%,#ec4899 100%)",
    Cultural:    "linear-gradient(135deg,#78350f 0%,#f59e0b 100%)",
    Sports:      "linear-gradient(135deg,#7f1d1d 0%,#ef4444 100%)",
    Literature:  "linear-gradient(135deg,#4c1d95 0%,#8b5cf6 100%)",
    Fraternity:  "linear-gradient(135deg,#134e4a 0%,#14b8a6 100%)",
    Sorority:    "linear-gradient(135deg,#831843 0%,#f472b6 100%)",
  };
  const fallbackBanner = bannerGradient[club.category ?? ""] ?? "linear-gradient(135deg,#b4002e 0%,#7a0018 100%)";

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setFlipped((v) => !v)}
      sx={{
        position: "relative",
        height: 300,
        perspective: "1200px",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      {/* Wrapper that flips */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          transition: "transform 540ms cubic-bezier(0.2, 0.8, 0.2, 1)",
          transform: flipped ? "rotateY(180deg)" : hovered ? "rotateY(0deg) translateY(-4px)" : "rotateY(0deg)",
          borderRadius: "20px",
          zIndex: 1,
          boxShadow: hovered
            ? "0 18px 50px rgba(63, 63, 63, 0.22)"
            : "0 6px 24px rgba(27, 27, 27, 0.12)",
        }}
      >
        {/* ── FRONT FACE ──────────────────────────────────────────────── */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            borderRadius: "20px",
            overflow: "hidden",
            bgcolor: "#ffffff",
            border: `4px solid ${catColor}`,
            cursor: "pointer",
            pointerEvents: flipped ? "none" : "auto",
          }}
        >
          {/* Card content */}
          <Box sx={{ position: "relative", zIndex: 1, height: "100%" }}>
          {/* Banner */}
          <Box
            sx={{
              height: 120,
              ...(club.bannerUrl
                ? { backgroundImage: `url(${club.bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                : { background: fallbackBanner }),
              position: "relative",
              filter: "saturate(110%) contrast(105%)",
            }}
          >
            {/* Category badge */}
            <Box
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                px: 1.2,
                py: 0.5,
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 0.5,
                color: "white",
                bgcolor: catColor,
                backdropFilter: "blur(8px)",
                textTransform: "uppercase",
              }}
            >
              {club.category ?? "Club"}
            </Box>

            {/* "Member" badge — visible when user belongs to this club */}
            {isMember && (
              <Box
                sx={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  px: 1.1,
                  py: 0.4,
                  borderRadius: 99,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 0.5,
                  color: "white",
                  bgcolor: "rgba(16,185,129,0.80)",
                  backdropFilter: "blur(8px)",
                  textTransform: "uppercase",
                }}
              >
                ✓ Member
              </Box>
            )}

            {/* "Flip" hint pill */}
            <Box
              sx={{
                position: "absolute",
                bottom: 8,
                right: 8,
                px: 1,
                py: 0.4,
                borderRadius: 99,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 0.5,
                color: "rgba(255,255,255,0.85)",
                bgcolor: "rgba(0,0,0,0.35)",
                backdropFilter: "blur(8px)",
                opacity: hovered ? 1 : 0,
                transition: "opacity 0.2s ease",
              }}
            >
              CLICK TO FLIP
            </Box>
          </Box>

          {/* Avatar */}
          <Box
            sx={{
              position: "absolute",
              top: 84,
              left: 16,
              width: 60,
              height: 60,
              borderRadius: "50%",
              border: "3px solid white",
              boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
              overflow: "hidden",
              bgcolor: catColor,
              display: "grid",
              placeItems: "center",
              zIndex: 10,
            }}
          >
            {club.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={club.logoUrl}
                alt={`${club.name} logo`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <Typography sx={{ color: "white", fontWeight: 900, fontSize: 18, lineHeight: 1, userSelect: "none" }}>
                {initials}
              </Typography>
            )}
          </Box>

          {/* Info */}
          <Box sx={{ pt: 7, px: 2.2, pb: 2 }}>
            <Typography
              sx={{
                fontSize: 17,
                fontWeight: 900,
                color: "#1a1a1a",
                lineHeight: 1.2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {club.name}
            </Typography>
            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                color: "rgba(80,80,80,0.85)",
                lineHeight: 1.4,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {club.tagline ?? ""}
            </Typography>
          </Box>
          </Box> {/* end content wrapper */}
        </Box>

        {/* ── BACK FACE ───────────────────────────────────────────────── */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            borderRadius: "20px",
            overflow: "hidden",
            bgcolor: "#ffffff",
            border: `4px solid ${catColor}`,
            cursor: "pointer",
            pointerEvents: flipped ? "auto" : "none",
          }}
        >
          {/* Back face content */}
          <Box sx={{ position: "relative", zIndex: 1, height: "100%" }}>
          <Box
            sx={{
              p: 2.4,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              boxSizing: "border-box",
            }}
          >
            <Typography sx={{ fontSize: 17, fontWeight: 900, color: "#1a1a1a", lineHeight: 1.25 }}>
              {club.card?.headline ?? club.name}
            </Typography>
            <Typography
              sx={{
                mt: 1,
                fontSize: 13,
                color: "rgba(60,60,60,0.85)",
                lineHeight: 1.55,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
              }}
            >
              {club.card?.blurb ?? club.description ?? "Click View club to learn more."}
            </Typography>

            {/* Chips */}
            {club.card?.chips && club.card.chips.length > 0 && (
              <Box sx={{ display: "flex", gap: 0.7, flexWrap: "wrap", mt: 1.5 }}>
                {club.card.chips.map((chip) => (
                  <Chip
                    key={chip}
                    label={chip}
                    size="small"
                    sx={{
                      fontSize: 11,
                      fontWeight: 800,
                      bgcolor: catColor.replace("0.85)", "0.10)"),
                      color: catColor.replace("0.85)", "1)"),
                      border: `1px solid ${catColor.replace("0.85)", "0.30)")}`,
                      height: 22,
                    }}
                  />
                ))}
              </Box>
            )}

            <Box sx={{ flex: 1 }} />

            {/* ── Action row ─────────────────────────────────────────── */}
            <Box
              sx={{
                display: "flex",
                gap: 1,
                justifyContent: "space-between",
                alignItems: "center",
                mt: 1.5,
                flexWrap: "wrap",
              }}
            >
              <Typography sx={{ fontSize: 11, color: "rgba(100,100,100,0.55)", fontWeight: 700 }}>
                Tap to flip back
              </Typography>

              <Box
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                sx={{ display: "flex", gap: 0.8, alignItems: "center" }}
              >
                {/* Leave button — only shown when user is a member */}
                {isMember && (
                  <LeaveClubDialog
                    clubId={club.id}
                    clubName={club.name}
                    onLeaveSuccess={onLeaveSuccess}
                    variant="card"
                  />
                )}

                <Button
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    router.push(href);
                  }}
                  sx={{
                    ...btnMaroon,
                    fontSize: 13,
                    py: 0.8,
                    px: 2,
                    bgcolor: catColor.replace("0.85)", "1)"),
                    "&:hover": {
                      bgcolor: catColor.replace("0.85)", "1)"),
                      filter: "brightness(1.15)",
                    },
                  }}
                >
                  View club →
                </Button>
              </Box>
            </Box>
          </Box> {/* end inner content */}
          </Box> {/* end back content wrapper */}
        </Box>
      </Box>
    </Box>
  );
}
