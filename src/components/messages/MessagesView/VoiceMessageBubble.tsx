"use client";

import * as React from "react";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import { RED } from "../constants";

export function VoiceMessageBubble({
  url,
  mine,
  initialDuration,
  sourceFile,
}: {
  url: string;
  mine: boolean;
  initialDuration?: number;
  sourceFile?: File | null;
}) {
  const playerRef = React.useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = React.useRef<string | null>(null);
  const [durationSec, setDurationSec] = React.useState<number | null>(initialDuration ?? null);
  const [currentSec, setCurrentSec] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const knownDuration = durationSec ?? (initialDuration != null ? initialDuration : null);

  const stopPlayer = React.useCallback(() => {
    const p = playerRef.current;
    if (p) {
      p.pause();
      p.src = "";
      p.load();
      playerRef.current = null;
    }
    if (objectUrlRef.current) {
      try {
        URL.revokeObjectURL(objectUrlRef.current);
      } catch {}
      objectUrlRef.current = null;
    }
    setIsPlaying(false);
    setCurrentSec(0);
  }, []);

  React.useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.pause();
        playerRef.current.src = "";
      }
      if (objectUrlRef.current) {
        try {
          URL.revokeObjectURL(objectUrlRef.current);
        } catch {}
      }
    };
  }, []);

  const togglePlay = React.useCallback(() => {
    if (objectUrlRef.current) {
      try {
        URL.revokeObjectURL(objectUrlRef.current);
      } catch {}
      objectUrlRef.current = null;
    }
    const playUrl = sourceFile ? (objectUrlRef.current = URL.createObjectURL(sourceFile)) : url;
    if (!playUrl) return;
    const existing = playerRef.current;
    if (existing) {
      if (!existing.paused) {
        existing.pause();
        setIsPlaying(false);
        return;
      }
      existing.src = "";
      existing.load();
      playerRef.current = null;
    }
    const audio = new Audio(playUrl);
    playerRef.current = audio;
    audio.onloadedmetadata = () => {
      if (Number.isFinite(audio.duration)) setDurationSec((prev) => (prev === null ? Math.ceil(audio.duration) : prev));
    };
    audio.ontimeupdate = () => setCurrentSec(audio.currentTime);
    audio.onended = () => stopPlayer();
    audio.onerror = () => stopPlayer();
    setCurrentSec(0);
    setIsPlaying(true);
    const p = audio.play();
    if (p && typeof p.catch === "function") p.catch(() => stopPlayer());
  }, [url, sourceFile, stopPlayer]);

  const displayDuration = knownDuration !== null ? knownDuration : 0;
  const displayCurrent = knownDuration !== null ? Math.min(Math.round(currentSec), knownDuration) : 0;
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, px: 1.25, py: 1.25, borderRadius: 2.5, border: "1px solid rgba(0,0,0,0.10)", bgcolor: mine ? "rgba(168,5,50,0.06)" : "rgba(0,0,0,0.05)", maxWidth: 280 }}>
      <Stack direction="row" alignItems="center" spacing={1.25}>
        <IconButton onClick={togglePlay} size="small" sx={{ width: 40, height: 40, bgcolor: "white", border: "1px solid rgba(0,0,0,0.12)", "&:hover": { bgcolor: "rgba(255,255,255,0.9)" } }} aria-label={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? <PauseIcon sx={{ fontSize: 26, color: "rgba(0,0,0,0.85)" }} /> : <PlayArrowIcon sx={{ fontSize: 26, color: "rgba(0,0,0,0.85)", ml: 0.25 }} />}
        </IconButton>
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
          {Array.from({ length: 24 }).map((_, i) => {
            const progress = knownDuration ? (displayCurrent / knownDuration) * 24 : 0;
            const filled = i < Math.round(progress);
            return <Box key={i} sx={{ width: 4, height: 12, borderRadius: 1, bgcolor: filled ? (mine ? RED : "rgba(0,0,0,0.6)") : "rgba(0,0,0,0.18)" }} />;
          })}
        </Box>
        <Typography component="span" sx={{ fontSize: 12, fontWeight: 700, color: "rgba(0,0,0,0.7)", bgcolor: "rgba(255,255,255,0.9)", px: 1, py: 0.5, borderRadius: 1.5 }}>
          {fmt(displayCurrent)} / {fmt(displayDuration)}
        </Typography>
      </Stack>
      <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.5)", fontWeight: 600 }}>press play to listen to this voice message</Typography>
    </Box>
  );
}
