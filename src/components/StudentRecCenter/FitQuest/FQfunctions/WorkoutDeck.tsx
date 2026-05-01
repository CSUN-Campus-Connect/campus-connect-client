"use client";

import * as React from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { motion, AnimatePresence } from "framer-motion";
import { ALL_GROUPS, WORKOUT_DECK } from "./workoutCardData";
import SetRepDice from "./DiceRoll";

export type MuscleGroup =
  | "Chest"
  | "Back"
  | "Legs"
  | "Shoulders"
  | "Arms"
  | "Core"
  | "Full Body"
  | "Cardio";

export type WorkoutCard = {
  id: string;
  name: string;
  description: string;
  group: MuscleGroup;
  image: string;
  sets?: string;
  // reps removed
  focuses?: MuscleGroup[]; // NEW: tag indicators for muscle focus
};

// utils
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

type SpotlightCardProps = { children: React.ReactNode; active?: boolean };

const SpotlightCard: React.FC<SpotlightCardProps> = ({ children, active }) => {
  const [pos, setPos] = React.useState({ x: 0, y: 0 });

  const handleMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      onMouseMove={handleMove}
      style={{ position: "relative", borderRadius: 18, overflow: "hidden" }}
      whileHover={{ y: -6, boxShadow: "0 20px 35px rgba(0,0,0,0.45)" }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {active && (
        <motion.div
          key="glare"
          initial={{ x: "-150%" }}
          animate={{ x: ["-150%", "150%"] }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          style={{
            position: "absolute",
            inset: "-40%",
            background:
              "linear-gradient(120deg, transparent 0%, rgba(255,46,238,1) 45%, rgba(46,241,255,1) 55%, transparent 100%)",
            pointerEvents: "none",
            mixBlendMode: "screen",
            zIndex: 3,
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at ${pos.x}px ${pos.y}px, rgba(0,0,0,0.07), transparent 60%)`,
          pointerEvents: "none",
          mixBlendMode: "soft-light",
        }}
      />
      <Box
        sx={{
          position: "relative",
          p: 1.5,
          borderRadius: 2.5,
          bgcolor: "#ffffff",
          border: "2px solid #f5f5f5",
          color: "#000000",
          width: 220,
          height: 320,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* inner content frame */}
        <Box
          sx={{
            flex: 1,
            borderRadius: 2,
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "inset 0 0 0 2px rgba(182, 21, 21, 0.87)",
            background: "linear-gradient(145deg,#ffffff,#fafafa)",
            p: 1.25,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children}
        </Box>
      </Box>
    </motion.div>
  );
};

const CARD_COUNT = 5;
type Phase = "idle" | "riffle" | "cut" | "stacked" | "fanned";

const WorkoutCardDeck: React.FC = () => {
  const [group, setGroup] = React.useState<MuscleGroup>("Chest");
  const [cards, setCards] = React.useState<WorkoutCard[]>([]);
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [drawId, setDrawId] = React.useState(0);

  // 🔥 now ONLY shuffles cards for the selected group
  const drawNewHand = (targetGroup: MuscleGroup) => {
    const pool = shuffle(WORKOUT_DECK.filter((c) => c.group === targetGroup));
    setCards(pool.slice(0, CARD_COUNT));
    setDrawId((x) => x + 1);
    setSelectedId(null);
  };

  const startShuffleSequence = (targetGroup: MuscleGroup) => {
    drawNewHand(targetGroup);
    setPhase("riffle");
    window.setTimeout(() => setPhase("cut"), 450);
    window.setTimeout(() => setPhase("stacked"), 900);
  };

  const handleShuffleClick = () => startShuffleSequence(group);

  const handleGroupClick = (g: MuscleGroup) => {
    setGroup(g);
    startShuffleSequence(g);
  };

  const handleCardClick = (id: string) => {
    if (phase === "stacked") {
      setPhase("fanned");
      return;
    }
    if (phase === "fanned") {
      setSelectedId((prev) => (prev === id ? null : id));
    }
  };

  const showEmpty = phase === "idle" || cards.length === 0;
  const showingBack =
    phase === "riffle" || phase === "cut" || phase === "stacked";

  return (
    <Box
      sx={{
        mt: 4,
        mb: 2,
        p: 3,
        borderRadius: 3,
        bgcolor: "rgba(255,255,255,0.10)",
        border: "3px solid rgba(255,255,255,0.85)",
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.25), 0 0 18px rgba(0,0,0,0.35)",
        color: "#fff",
      }}
    >
      <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>
        Fit Deck Builder
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Dont know what workouts to choose? Pick a muscle group, shuffle the deck to deal a hand and get randomly selected array of excercises!
      </Typography>

      {/* muscle group chips */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ alignItems: "flex-start", mb: 2 }}
      >
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          {ALL_GROUPS.map((g) => (
            <Chip
              key={g}
              label={g}
              clickable
              onClick={() => handleGroupClick(g)}
              sx={{
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.6)",
                bgcolor: g === group ? "#fff" : "transparent",
                color: g === group ? "#000" : "#fff",
                fontWeight: g === group ? 700 : 500,
                "&:hover": {
                  bgcolor:
                    g === group ? "#f0f0f0" : "rgba(255,255,255,0.12)",
                },
              }}
            />
          ))}
        </Stack>
      </Stack>

      {/* dice on left, cards on right */}
      <Stack
        direction="row"
        spacing={4}
        sx={{
          mt: 6,
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        <Box sx={{ flexShrink: 0, ml: 6 }}>
          <SetRepDice />
        </Box>

        <Box
          sx={{
            position: "relative",
            height: 450,
            width: 520,
            overflow: "visible",
          }}
        >
          {/* idle CTA */}
          {showEmpty && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 40,
              }}
            >
              <motion.div
                role="button"
                tabIndex={0}
                aria-label="Shuffle and deal workout deck"
                onClick={handleShuffleClick}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleShuffleClick(); } }}
                style={{ cursor: "pointer" }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                <Stack spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      position: "relative",
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,0.9)",
                        background: "rgba(0,0,0,0.28)",
                        boxShadow: "0 12px 30px rgba(0,0,0,0.8)",
                        backdropFilter: "blur(2px)",
                      }}
                    />
                    <motion.div
                      style={{
                        position: "absolute",
                        inset: -6,
                        borderRadius: "50%",
                        border: "1px solid rgba(255,255,255,0.7)",
                      }}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.9, 0.15, 0.9],
                      }}
                      transition={{
                        duration: 1.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    <motion.div
                      style={{
                        position: "absolute",
                        inset: -12,
                        borderRadius: "50%",
                        border: "1px solid rgba(255,255,255,0.45)",
                      }}
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.6, 0, 0.6],
                      }}
                      transition={{
                        duration: 2.2,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />
                    <TouchAppIcon
                      aria-hidden="true"
                      sx={{
                        fontSize: 32,
                        color: "#fff",
                        filter: "drop-shadow(0 0 6px rgba(0,0,0,0.95))",
                      }}
                    />
                  </Box>
                  <Typography
                    variant="button"
                    sx={{
                      textTransform: "none",
                      fontWeight: 800,
                      color: "#fff",
                      textShadow: "0 0 6px rgba(0,0,0,0.95)",
                    }}
                  >
                    Click to shuffle deal a deck
                  </Typography>
                </Stack>
              </motion.div>
            </Box>
          )}

          {/* re-shuffle under cards */}
          {!showEmpty && (
            <Box
              sx={{
                position: "absolute",
                left: "60%",
                bottom: 10,
                transform: "translateX(-50%)",
                zIndex: 40,
              }}
            >
              <Stack direction="row" spacing={4} alignItems="center">
                <Box
                  role="button"
                  tabIndex={0}
                  aria-label="Re-shuffle deck"
                  onClick={handleShuffleClick}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleShuffleClick(); } }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    cursor: "pointer",
                    color: "#fff",
                    textShadow: "0 0 5px rgba(0,0,0,0.9)",
                    userSelect: "none",
                    "&:hover": { transform: "scale(1.05)" },
                    transition: "transform 0.15s ease-out",
                  }}
                >
                  <AutorenewIcon
                    aria-hidden="true"
                    sx={{
                      fontSize: 24,
                      filter: "drop-shadow(0 0 6px rgba(0,0,0,0.9))",
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, letterSpacing: 0.4 }}
                  >
                    Re-shuffle?
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}

          {/* cards */}
          {!showEmpty && (
            <AnimatePresence>
              {cards.map((card, index) => {
                const mid = (CARD_COUNT - 1) / 2;
                const spreadIndex = index - mid;
                const isSelected = selectedId === card.id;
                const fanRotate = spreadIndex * 8;
                const fanX = spreadIndex * 80;
                const fanY = 40 + Math.abs(spreadIndex) * 4;

                let animate;
                if (phase === "riffle") {
                  const leftSide = index % 2 === 0;
                  const pileIndex = Math.floor(index / 2);
                  animate = {
                    x: leftSide ? -80 : 80,
                    y: 40 + pileIndex * 8,
                    rotate: leftSide ? -12 : 12,
                    opacity: 1,
                    scale: 1,
                  };
                } else if (phase === "cut") {
                  const bottomHalf = index >= Math.ceil(CARD_COUNT / 2);
                  animate = {
                    x: 0,
                    y: bottomHalf ? 90 : 50,
                    rotate: bottomHalf ? 4 : -4,
                    opacity: 1,
                    scale: 1,
                  };
                } else if (phase === "stacked") {
                  animate = {
                    x: 0,
                    y: 80,
                    rotate: index * 2,
                    opacity: 1,
                    scale: 1,
                  };
                } else if (phase === "fanned" && isSelected) {
                  animate = {
                    x: 0,
                    y: 20,
                    rotate: 0,
                    opacity: 1,
                    scale: 1.15,
                  };
                } else if (phase === "fanned") {
                  animate = {
                    x: fanX,
                    y: fanY,
                    rotate: fanRotate,
                    opacity: 1,
                    scale: 1,
                  };
                } else {
                  animate = {
                    x: 0,
                    y: 80,
                    rotate: index * 2,
                    opacity: 1,
                    scale: 1,
                  };
                }

                const focuses =
                  card.focuses && card.focuses.length
                    ? card.focuses
                    : [card.group];

                return (
                  <motion.div
                    key={card.id + "-" + drawId}
                    role={phase === "stacked" || phase === "fanned" ? "button" : undefined}
                    tabIndex={phase === "stacked" || phase === "fanned" ? 0 : undefined}
                    aria-label={phase === "fanned" ? `${card.name} — ${card.description}` : phase === "stacked" ? "Fan out cards" : undefined}
                    aria-pressed={phase === "fanned" ? isSelected : undefined}
                    style={{
                      position: "absolute",
                      left: "40%",
                      top: -20,
                      transform: "translateX(-50%)",
                      cursor:
                        phase === "stacked" || phase === "fanned"
                          ? "pointer"
                          : "default",
                      zIndex: isSelected ? 30 : 10 + index,
                    }}
                    initial={{ y: -260, opacity: 0, rotate: 0, x: 0 }}
                    animate={animate}
                    exit={{ opacity: 0, y: 260 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 22,
                      delay:
                        phase === "riffle" || phase === "cut"
                          ? index * 0.06
                          : index * 0.03,
                    }}
                    onClick={() => handleCardClick(card.id)}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleCardClick(card.id); } }}
                  >
                    {showingBack ? (
                      <Box
                        sx={{
                          width: 220,
                          height: 320,
                          borderRadius: 2.5,
                          bgcolor: "#5b0013",
                          border: "2px solid #f5f5f5",
                          position: "relative",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Box
                          sx={{
                            position: "absolute",
                            inset: 10,
                            borderRadius: 2,
                            border: "2px solid rgba(255,255,255,0.8)",
                          }}
                        />
                        <Box
                          sx={{
                            position: "absolute",
                            inset: 22,
                            borderRadius: 2,
                            border: "1px dashed rgba(255,255,255,0.5)",
                          }}
                        />
                        <Box
                          component="img"
                          src="/cards/SRCcard.png"
                          alt="SRC logo"
                          sx={{ width: "60%", opacity: 0.95, zIndex: 1 }}
                        />
                      </Box>
                    ) : (
                      <SpotlightCard active={isSelected}>
                        <Box
                          component="img"
                          src={card.image}
                          alt={card.name}
                          sx={{
                            width: "100%",
                            height: 140,
                            objectFit: "cover",
                            borderRadius: 1.5,
                            mb: 1,
                          }}
                        />
                        <Typography
                          variant="subtitle2"
                          fontWeight={900}
                          sx={{ mb: 0.5, color: "#B6002D" }}
                        >
                          {card.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            textTransform: "uppercase",
                            letterSpacing: 0.8,
                            opacity: 0.8,
                            color: "#000",
                          }}
                        >
                          Workout type: {card.group}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ mt: 1, fontSize: 13, color: "#000" }}
                        >
                          {card.description}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            mt: 0.75,
                            fontSize: 11,
                            color: "#333",
                            fontWeight: 600,
                          }}
                        >
                          Focus: {focuses.join(" · ")}
                        </Typography>
                      </SpotlightCard>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default WorkoutCardDeck;