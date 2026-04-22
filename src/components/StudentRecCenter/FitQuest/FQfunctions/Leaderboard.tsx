"use client";

// *BACKEND: QUEST LEADERBOARD EVENT DATA*
// When a user logs a new result for a quest (adds a score on the leaderboard),
// `handleSaveEntry` below:
//   - Which quest was updated            -> `entryQuestIdx` / `quests[entryQuestIdx]`
//   - Party / quest title                -> `quests[entryQuestIdx].title` (or similar field)
//   - Member display name                -> `name`
//   - Score / PR / time / reps etc       -> `score`
//   - Client-side timestamp of the entry -> `newEntry.at`
// The backend team can wire an actual POST like `/api/fitquest/leaderboard`
// or `/api/fitquest/quests/:questId/entries` directly inside that handler.

import * as React from "react";
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack,} from "@mui/material";
import type { Quest, QuestEntry } from "./StartQuest";
import { GOAL_LABEL } from "./StartQuest";

//BACKEND: leaderboard entry payload & helper function
export type QuestEntryEventPayload = {
  questId: string;
  questTitle: string;
  goal: Quest["goal"];      // Goal type of the quest
  // full list of entries for this quest (including the new one)
  entries: QuestEntry[];// the specific entry that was just created
  newEntry: QuestEntry;
};

export async function sendQuestEntryToBackend(
  payload: QuestEntryEventPayload
): Promise<void> {
  // Implement the actual POST request to your backend here.
}

const RED = "#B6002D";

type LeaderBoardProps = {
  quests: Quest[];
  onAbandon?: (q: Quest) => void;
  setQuests?: React.Dispatch<React.SetStateAction<Quest[]>>;
};

export default function LeaderBoard({
  quests,
  onAbandon,
  setQuests,
}: LeaderBoardProps) {
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);

  // state for the "Add entry" dialog
  const [entryQuestIdx, setEntryQuestIdx] = React.useState<number | null>(null);
  const [entryName, setEntryName] = React.useState("");
  const [entryScore, setEntryScore] = React.useState("");

  if (!quests?.length) {
    return (
      <Typography sx={{ fontSize: 14 }}>
        No active quest for this party yet.
      </Typography>
    );
  }

  const openEntryDialog = (questIdx: number) => {
    setEntryQuestIdx(questIdx);
    setEntryName("");
    setEntryScore("");
  };

  const closeEntryDialog = () => {
    setEntryQuestIdx(null);
  };

  const handleSaveEntry = () => { // Backend save entry point for quest leaderboard
    if (entryQuestIdx === null || !setQuests) {
      closeEntryDialog();
      return;
    }

    const name = entryName.trim() || "Anon";
    const numScore = Number(entryScore || "0");
    const score = Number.isNaN(numScore) ? 0 : numScore;

    const newEntry: QuestEntry = { // BACKEND ENTRY POINT: create new quest entry payload
      name,
      score,
      at: Date.now(),
    };

    setQuests((prev) =>
      prev.map((q, idx) =>
        idx === entryQuestIdx ? { ...q, entries: [...q.entries, newEntry] } : q
      )
    );
    // BACKEND CALL: send the new entry to the backend for persistence something like:
    /*void sendQuestEntryToBackend({
      questId: quest.id,
      questTitle: quest.title,
      goal: quest.goal,
      entries: updatedEntries,
      newEntry,
    });*/
    closeEntryDialog();
  };

  return (
    <>
      {quests.map((q, i) => {
        const sorted = [...q.entries]
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);
        const topScore = sorted[0]?.score || 1;

        return (
          <Box key={i} sx={{ mb: i === quests.length - 1 ? 0 : 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
              {q.imageSrc && (
                <Box
                  component="img"
                  src={q.imageSrc}
                  alt={q.exercise}
                  sx={{
                    width: 44,
                    height: 32,
                    objectFit: "cover",
                    borderRadius: 6,
                    border: "1px solid rgba(255,255,255,0.9)",
                    flexShrink: 0,
                  }}
                />
              )}
              <Typography sx={{ fontWeight: 900, fontSize: 14, lineHeight: 1.1 }}>
                {q.exercise} ({GOAL_LABEL[q.goal]})
              </Typography>

              {onAbandon && (
                <Box
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                  onClick={() => onAbandon(q)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Abandon quest: ${q.exercise}`}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onAbandon(q); } }}
                  sx={{
                    ml: "auto",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    px: hoverIdx === i ? 1.25 : 0,
                    width: hoverIdx === i ? "auto" : 22,
                    height: 22,
                    borderRadius: 999,
                    transition: "all .18s ease",
                    bgcolor: RED,
                    color: "#fff",
                    fontWeight: 900,
                    fontSize: 11,
                    cursor: "pointer",
                    boxShadow: "0 3px 8px rgba(0,0,0,.25)",
                    "&:hover": { bgcolor: "#810326" },
                    whiteSpace: "nowrap",
                    userSelect: "none",
                  }}
                >
                  {hoverIdx === i ? "Abandon quest? ×" : "×"}
                </Box>
              )}
            </Box>

            {sorted.length === 0 ? (
              <Typography
                color="text.secondary"
                sx={{ ml: q.imageSrc ? "52px" : 0, fontSize: 13 }}
              >
                No entries yet
              </Typography>
            ) : (
              <Box sx={{ ml: q.imageSrc ? "52px" : 0 }}>
                {sorted.map((e, rank) => (
                  <Box
                    key={rank}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      mb: 0.35,
                    }}
                  >
                    <Box sx={{ width: 20, textAlign: "center", fontSize: 13 }}>
                      {rank === 0
                        ? "🥇"
                        : rank === 1
                        ? "🥈"
                        : rank === 2
                        ? "🥉"
                        : `#${rank + 1}`}
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
                        position: "relative",
                        height: 18,
                        bgcolor: "rgba(255,255,255,0.15)",
                        borderRadius: 10,
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          width: `${Math.max(
                            6,
                            (e.score / topScore) * 100
                          )}%`,
                          bgcolor:
                            rank === 0
                              ? "#FFD54F"
                              : rank === 1
                              ? "#B0C4DE"
                              : rank === 2
                              ? "#D1C4E9"
                              : "rgba(255,255,255,0.55)",
                        }}
                      />
                      <Box
                        sx={{
                          position: "relative",
                          zIndex: 1,
                          pl: 1,
                          pr: 1.25,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box
                          sx={{
                            fontWeight: 700,
                            fontSize: 12.5,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            lineHeight: "18px",
                          }}
                          title={e.name}
                        >
                          {e.name}
                        </Box>
                        <Box sx={{ fontWeight: 800, fontSize: 12.5 }}>
                          {e.score}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            {/* Add entry button under the leaderboard */}
            {setQuests && (
              <Box sx={{ ml: q.imageSrc ? "52px" : 0, mt: 0.75 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => openEntryDialog(i)}
                  sx={{
                    borderColor: "#fff",
                    color: "#fff",
                    textTransform: "none",
                    fontSize: 12,
                    "&:hover": {
                      borderColor: "#fff",
                      bgcolor: "rgba(255,255,255,0.12)",
                    },
                  }}
                >
                  Add entry
                </Button>
              </Box>
            )}
          </Box>
        );
      })}

      {/* Add entry dialog */}
      <Dialog
        open={entryQuestIdx !== null}
        onClose={closeEntryDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 900 }}>Add quest entry</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField
              label="Name"
              value={entryName}
              onChange={(e) => setEntryName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Score"
              type="number"
              value={entryScore}
              onChange={(e) => setEntryScore(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEntryDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveEntry}
            sx={{ bgcolor: RED, "&:hover": { bgcolor: "#810326" } }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
