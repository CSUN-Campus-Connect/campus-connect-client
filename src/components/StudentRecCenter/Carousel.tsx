"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Box, IconButton, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ProgramCard from "@/components/StudentRecCenter/ProgramCard";

export type Slide = {
  title: string;
  blurb: string;
  imageSrc: string;
  onAddToEvents: () => void; //mount endpoint handler here for adding to events to user's event calendar
  onInvite: () => void; //mount endpoint handler here for inviting friends to the event, could be a modal that pops up with sharing options (email, social media, etc.)
};

const CARD_W = 32;

const SLOTS: Record<number, { x: number; scale: number; opacity: number; brightness: number; z: number }> = {
  [-2]: { x: -108, scale: 0.74, opacity: 0,    brightness: 0.5,  z: 0 },
  [-1]: { x:  -68, scale: 0.88, opacity: 0.88, brightness: 0.75, z: 2 },
  [0]:  { x:    0, scale: 1,    opacity: 1,    brightness: 1,    z: 4 },
  [1]:  { x:   68, scale: 0.88, opacity: 0.88, brightness: 0.75, z: 2 },
  [2]:  { x:  108, scale: 0.74, opacity: 0,    brightness: 0.5,  z: 0 },
};

const spring = { type: "spring" as const, stiffness: 300, damping: 30, mass: 0.8 };

export default function Carousel({ slides }: { slides: Slide[] }) {
  const [current, setCurrent] = React.useState(0);
  const count = slides.length;

  const go = (dir: 1 | -1) => setCurrent((c) => (c + dir + count) % count);

  const getPos = (i: number) => {
    let diff = i - current;
    if (diff > count / 2) diff -= count;
    if (diff < -count / 2) diff += count;
    return Math.max(-2, Math.min(2, diff));
  };

  const arrowBtn = {
    width: 44, height: 44, flexShrink: 0,
    bgcolor: "rgba(255,255,255,0.18)",
    border: "1.5px solid rgb(255, 0, 0)",
    color: "#ff0000",
    backdropFilter: "blur(10px)",
    "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
  };

  return (
    <Box sx={{ position: "relative" }}>

      {/* ── Row: left arrow · track · right arrow ── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>

        <motion.div whileHover={{ x: -2 }} whileTap={{ scale: 0.9 }}>
          <IconButton onClick={() => go(-1)} aria-label="Previous" sx={arrowBtn}>
            <ChevronLeftIcon />
          </IconButton>
        </motion.div>

        {/* Track: overflow visible so side cards show fully */}
        <Box sx={{ flex: 1, position: "relative", minHeight: { xs: 380, sm: 420, md: 450 }, overflow: "visible" }}>
          {slides.map((slide, i) => {
            const pos = getPos(i);
            const slot = SLOTS[pos];
            const isCenter = pos === 0;
            const isClickable = pos === -1 || pos === 1;

            return (
              <motion.div
                key={slide.title}
                onClick={() => isClickable && go(pos as 1 | -1)}
                animate={{
                  x: `${slot.x}%`,
                  scale: slot.scale,
                  opacity: slot.opacity,
                  zIndex: slot.z,
                }}
                transition={spring}
                style={{
                  position: "absolute",
                  left: `calc(50% - ${CARD_W / 2}%)`,
                  top: 0,
                  bottom: 0,
                  width: `${CARD_W}%`,
                  display: "flex",
                  alignItems: "center",
                  cursor: isClickable ? "pointer" : "default",
                  pointerEvents: Math.abs(pos) <= 1 ? "auto" : "none",
                  transformOrigin: "center center",
                }}
              >
                <motion.div
                  animate={{
                    filter: `brightness(${slot.brightness})`,
                    boxShadow: isCenter
                      ? "0 24px 56px rgba(0,0,0,0.30), 0 8px 20px rgba(168,5,50,0.22)"
                      : "0 8px 28px rgba(0,0,0,0.18)",
                  }}
                  transition={spring}
                  style={{ width: "100%", borderRadius: 16, position: "relative" }}
                >
                  {/* Tint overlay on side cards */}
                  {!isCenter && (
                    <motion.div
                      animate={{ opacity: Math.abs(pos) === 1 ? 1 : 0 }}
                      transition={{ duration: 0.25 }}
                      style={{
                        position: "absolute", inset: 0, borderRadius: 16,
                        background: "rgba(50,0,12,0.22)",
                        pointerEvents: "none", zIndex: 2,
                      }}
                    />
                  )}
                  <ProgramCard
                    white hideRSVP
                    title={slide.title}
                    blurb={slide.blurb}
                    imageSrc={slide.imageSrc}
                    onAddToEvents={slide.onAddToEvents}
                    onInvite={slide.onInvite}
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </Box>

        <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.9 }}>
          <IconButton onClick={() => go(1)} aria-label="Next" sx={arrowBtn}>
            <ChevronRightIcon />
          </IconButton>
        </motion.div>

      </Box>

      {/* ── Dots ── */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75, mt: 2.5 }}>
        {slides.map((_, i) => (
          <motion.div
            key={i}
            role="button"
            tabIndex={0}
            aria-label={`Go to slide ${i + 1} of ${count}`}
            aria-current={i === current ? "true" : undefined}
            onClick={() => setCurrent(i)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setCurrent(i); } }}
            animate={{
              width: i === current ? 22 : 7,
              backgroundColor: i === current ? "#ff0000" : "rgba(255, 0, 0, 0.32)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{ height: 7, borderRadius: 999, cursor: "pointer" }}
            whileHover={{ backgroundColor: "rgba(228, 47, 47, 0.65)" }}
          />
        ))}
      </Box>

      <Box sx={{ textAlign: "center", mt: 1 }}>
        <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>
          {current + 1} / {count}
        </Typography>
      </Box>

    </Box>
  );
}
