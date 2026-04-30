"use client";

import * as React from "react";
import {
  Card, CardContent, Box, Stack, Typography, Chip, IconButton, Tooltip,
} from "@mui/material";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import { WidgetHeader } from "./WidgetHeader";
import { ALL_GROUPS, WORKOUT_DECK } from "../StudentRecCenter/FitQuest/FQfunctions/workoutCardData";
import type { MuscleGroup, WorkoutCard } from "../StudentRecCenter/FitQuest/FQfunctions/WorkoutDeck";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const GROUP_COLORS: Record<string, string> = {
  Chest: "#B6002D", Back: "#1d4ed8", Legs: "#15803d", Shoulders: "#b45309",
  Arms: "#7c3aed", Core: "#be185d", "Full Body": "#0e7490", Cardio: "#c2410c",
};

const ANIM_CSS = `
  @keyframes wdDeal {
    0%   { opacity: 0; transform: translateY(-50px) scale(0.85) rotate(-4deg); }
    65%  { opacity: 1; transform: translateY(3px) scale(1.02) rotate(0.5deg); }
    100% { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
  }
  @keyframes wdShuffle {
    0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
    20%  { transform: translateY(-30px) rotate(-6deg) scale(0.9); opacity: 0.6; }
    50%  { transform: translateY(-15px) rotate(5deg) scale(0.93); opacity: 0.8; }
    80%  { transform: translateY(-5px) rotate(-2deg) scale(0.98); opacity: 0.95; }
    100% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
  }
  @keyframes wdLift {
    0%   { transform: translateY(0) scale(1); }
    100% { transform: translateY(-8px) scale(1.04); }
  }
  @keyframes wdLower {
    0%   { transform: translateY(-8px) scale(1.04); }
    100% { transform: translateY(0) scale(1); }
  }
  @keyframes wdDetailIn {
    0%   { opacity: 0; transform: translateY(6px); }
    100% { opacity: 1; transform: translateY(0); }
  }
`;

const WorkoutMiniCard: React.FC<{
  card: WorkoutCard;
  selected: boolean;
  dealDelay: number;
  animKey: number;
  shuffling: boolean;
  onClick: () => void;
}> = ({ card, selected, dealDelay, animKey, shuffling, onClick }) => {
  const color = GROUP_COLORS[card.group] ?? "#B6002D";

  const animation = shuffling
    ? `wdShuffle 0.55s cubic-bezier(0.36,0.07,0.19,0.97) ${dealDelay * 0.06}s both`
    : selected
    ? "wdLift 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards"
    : `wdDeal 0.45s cubic-bezier(0.34,1.56,0.64,1) ${dealDelay * 0.09}s both`;

  return (
    <Box
      key={animKey}
      onClick={onClick}
      sx={{
        width: 138,
        minHeight: 185,
        borderRadius: 2.5,
        border: `2px solid ${selected ? color : "#e5e7eb"}`,
        bgcolor: "#fff",
        cursor: "pointer",
        p: 1.5,
        display: "flex",
        flexDirection: "column",
        gap: 0.75,
        flexShrink: 0,
        position: "relative",
        boxShadow: selected
          ? `0 10px 28px ${color}45, 0 2px 8px rgba(0,0,0,0.1)`
          : "0 2px 8px rgba(0,0,0,0.07)",
        animation,
        willChange: "transform, opacity",
        zIndex: selected ? 2 : 1,
      }}
    >
      {selected && (
        <Box sx={{
          position: "absolute", inset: 0, borderRadius: 2.5,
          background: `linear-gradient(145deg, ${color}06, ${color}14)`,
          pointerEvents: "none",
        }} />
      )}
      {/* image */}
      <Box sx={{
        height: 78, borderRadius: 1.5, overflow: "hidden",
        bgcolor: `${color}10`, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Box
          component="img"
          src={card.image}
          alt={card.name}
          sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e: any) => { e.target.style.display = "none"; }}
        />
      </Box>
      {/* name */}
      <Typography sx={{ fontSize: 11.5, fontWeight: 800, color, lineHeight: 1.25 }}>
        {card.name}
      </Typography>
      {/* desc */}
      <Typography sx={{ fontSize: 10, color: "#555", lineHeight: 1.4, flex: 1 }}>
        {card.description}
      </Typography>
      {/* sets badge */}
      {card.sets && (
        <Box sx={{
          alignSelf: "flex-start",
          display: "flex", alignItems: "baseline", gap: 0.3,
          bgcolor: `${color}12`, borderRadius: 1, px: 0.75, py: 0.25,
        }}>
          <Typography sx={{ fontSize: 14, fontWeight: 900, color, lineHeight: 1 }}>{card.sets}</Typography>
          <Typography sx={{ fontSize: 9, color, fontWeight: 600, opacity: 0.8 }}>sets</Typography>
        </Box>
      )}
    </Box>
  );
};

export const WorkoutDeckWidget: React.FC<{ onDelete?: () => void }> = ({ onDelete }) => {
  const [group, setGroup] = React.useState<MuscleGroup>("Chest");
  const [hand, setHand] = React.useState<WorkoutCard[]>([]);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [dealt, setDealt] = React.useState(false);
  const [animKey, setAnimKey] = React.useState(0);
  const [shuffling, setShuffling] = React.useState(false);

  const deal = (g: MuscleGroup, doShuffle = false) => {
    const pool = shuffle(WORKOUT_DECK.filter(c => c.group === g));
    const newHand = pool.slice(0, 4);

    if (doShuffle && dealt) {
      setShuffling(true);
      setTimeout(() => {
        setHand(newHand);
        setSelected(null);
        setAnimKey(k => k + 1);
        setShuffling(false);
      }, 400);
    } else {
      setHand(newHand);
      setSelected(null);
      setAnimKey(k => k + 1);
      setDealt(true);
    }
  };

  const handleGroup = (g: MuscleGroup) => { setGroup(g); deal(g, false); };
  const handleShuffle = () => deal(group, true);
  const selectedCard = hand.find(c => c.id === selected);

  return (
    <>
      <style>{ANIM_CSS}</style>
      <Card className="widget-card" sx={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
        <WidgetHeader
          title="Fit Deck"
          onDelete={onDelete}
          action={
            <Tooltip title="Shuffle">
              <span>
                <IconButton size="small" onClick={handleShuffle} disabled={!dealt} sx={{ mr: 0.5 }}>
                  <ShuffleIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          }
        />
        <CardContent sx={{ flex: 1, overflow: "auto", p: 2, "&:last-child": { pb: 2 } }}>
          <Stack spacing={2}>
            {/* Group chips */}
            <Stack direction="row" flexWrap="wrap" gap={0.75}>
              {ALL_GROUPS.map(g => {
                const col = GROUP_COLORS[g] ?? "#B6002D";
                const active = g === group;
                return (
                  <Chip
                    key={g}
                    label={g}
                    size="small"
                    clickable
                    onClick={() => handleGroup(g)}
                    sx={{
                      fontSize: 11, height: 26, fontWeight: active ? 700 : 500,
                      bgcolor: active ? col : "#f3f4f6",
                      color: active ? "#fff" : "#374151",
                      border: `1.5px solid ${active ? col : "transparent"}`,
                      transition: "all 0.15s",
                      "&:hover": { bgcolor: active ? col : `${col}18`, color: active ? "#fff" : col, border: `1.5px solid ${col}` },
                    }}
                  />
                );
              })}
            </Stack>

            {/* Empty state */}
            {!dealt ? (
              <Box
                onClick={() => deal(group)}
                sx={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", minHeight: 190, gap: 1.5, cursor: "pointer",
                  borderRadius: 3, border: "2px dashed #e5e7eb", p: 3,
                  transition: "all 0.15s",
                  "&:hover": { borderColor: "#B6002D", bgcolor: "rgba(182,0,45,0.02)" },
                }}
              >
                <Box sx={{
                  width: 56, height: 56, borderRadius: "50%",
                  bgcolor: "rgba(182,0,45,0.08)", display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <FitnessCenterIcon sx={{ fontSize: 28, color: "#B6002D" }} />
                </Box>
                <Typography fontWeight={700} sx={{ color: "#B6002D", fontSize: 14 }}>
                  Deal a hand
                </Typography>
                <Typography variant="caption" color="text.secondary" textAlign="center">
                  Pick a muscle group above or click here to deal
                </Typography>
              </Box>
            ) : (
              <>
                {/* Cards */}
                <Box sx={{ display: "flex", gap: 1.5, overflowX: "auto", pb: 0.5, pt: 0.25 }}>
                  {hand.map((card, i) => (
                    <WorkoutMiniCard
                      key={`${card.id}-${animKey}`}
                      card={card}
                      selected={selected === card.id}
                      dealDelay={i}
                      animKey={animKey}
                      shuffling={shuffling}
                      onClick={() => setSelected(prev => prev === card.id ? null : card.id)}
                    />
                  ))}
                </Box>

                {/* Detail panel */}
                <Box sx={{
                  borderRadius: 2.5,
                  border: `1.5px solid ${selectedCard ? `${GROUP_COLORS[selectedCard.group] ?? "#B6002D"}35` : "#f0f0f0"}`,
                  bgcolor: selectedCard ? `${GROUP_COLORS[selectedCard.group] ?? "#B6002D"}06` : "#fafafa",
                  p: 2,
                  minHeight: 100,
                  transition: "border-color 0.2s, background 0.2s",
                }}>
                  {selectedCard ? (
                    <Stack
                      key={selectedCard.id}
                      direction="row"
                      spacing={2}
                      alignItems="flex-start"
                      sx={{ animation: "wdDetailIn 0.2s ease" }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{
                          fontSize: 16, fontWeight: 800,
                          color: GROUP_COLORS[selectedCard.group] ?? "#B6002D", mb: 0.5,
                        }}>
                          {selectedCard.name}
                        </Typography>
                        <Typography sx={{ fontSize: 12.5, color: "#444", lineHeight: 1.55, mb: 1.25 }}>
                          {selectedCard.description}
                        </Typography>
                        {selectedCard.focuses && (
                          <Stack direction="row" flexWrap="wrap" gap={0.5}>
                            {selectedCard.focuses.map(f => (
                              <Box key={f} sx={{
                                px: 1, py: 0.3, borderRadius: 10,
                                bgcolor: `${GROUP_COLORS[f] ?? "#6b7280"}12`,
                                border: `1px solid ${GROUP_COLORS[f] ?? "#6b7280"}28`,
                              }}>
                                <Typography sx={{ fontSize: 10, fontWeight: 700, color: GROUP_COLORS[f] ?? "#6b7280" }}>
                                  {f}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        )}
                      </Box>
                      {selectedCard.sets && (
                        <Box sx={{
                          flexShrink: 0, textAlign: "center",
                          bgcolor: `${GROUP_COLORS[selectedCard.group] ?? "#B6002D"}10`,
                          borderRadius: 2, px: 2.5, py: 1.5,
                          border: `1.5px solid ${GROUP_COLORS[selectedCard.group] ?? "#B6002D"}22`,
                        }}>
                          <Typography sx={{
                            fontSize: 32, fontWeight: 900, lineHeight: 1,
                            color: GROUP_COLORS[selectedCard.group] ?? "#B6002D",
                          }}>
                            {selectedCard.sets}
                          </Typography>
                          <Typography sx={{ fontSize: 10, color: "#888", fontWeight: 600, mt: 0.25 }}>sets</Typography>
                        </Box>
                      )}
                    </Stack>
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 60 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.45, fontStyle: "italic" }}>
                        Select a card to see details
                      </Typography>
                    </Box>
                  )}
                </Box>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>
    </>
  );
};
