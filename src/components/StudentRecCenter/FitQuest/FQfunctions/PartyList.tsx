"use client";

import * as React from "react";
import { Box, Button, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack,
  TextField, Tooltip, Typography, Select,} from "@mui/material";
import { scoreOf, Quest, QuestEntry, Party, GOAL_LABEL } from "./StartQuest";
import LeaderBoard from "./Leaderboard";

const RED = "#B6002D";
const solid = { bgcolor: "#111", color: "#fff", "&:hover": { bgcolor: "#222" } };

type PartyListProps = {
  parties: Party[];
  setParties: React.Dispatch<React.SetStateAction<Party[]>>;
  quests: Quest[];
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>;
};

export default function PartyList({
  parties,
  setParties,
  quests,
  setQuests,
}: PartyListProps) {
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);
  const [openQuestIdx, setOpenQuestIdx] = React.useState<number | null>(null);
  const [editIdx, setEditIdx] = React.useState<number | null>(null);
  const [editDraft, setEditDraft] = React.useState<Party | null>(null);

  const deleteParty = (i: number) =>
    setParties((prev) => prev.filter((_, idx) => idx !== i));

  const saveEdit = () => {
    if (editIdx === null || !editDraft) return;
    setParties((prev) => prev.map((p, idx) => (idx === editIdx ? editDraft : p)));
    setEditIdx(null);
    setEditDraft(null);
  };

  // Remove a quest (used by the "Abandon quest? ×" button in LeaderBoard)
  const abandonQuest = (questToRemove: Quest) => {
    setQuests((prev) => prev.filter((q) => q !== questToRemove));
  };

  return (
    <>
      <Typography variant="h6" fontWeight={900} sx={{ color: "#fff", mt: 3, mb: 1 }}>
        Your Parties
      </Typography>

      <Box sx={{ maxHeight: 520, overflowY: "auto", pr: 1 }}>
        {parties.map((p, idx) => {
          const qs = quests.filter((q) => q.partyIndex === idx);

          return (
            <Box
              key={idx}
              sx={{
                mb: 1.25,
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.10)",
                border: "3px solid rgba(255,255,255,0.9)",
                p: 1.5,
                position: "relative",
                color: "#fff",
              }}
            >
              {/* Disband button */}
              <Tooltip title="Disband this party" placement="top">
                <Box
                  onMouseEnter={() => setHoverIdx(idx)}
                  onMouseLeave={() => setHoverIdx(null)}
                  onClick={() => deleteParty(idx)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Disband party: ${p.name}`}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); deleteParty(idx); } }}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 10,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    px: hoverIdx === idx ? 1.25 : 0,
                    width: hoverIdx === idx ? "auto" : 26,
                    height: 26,
                    borderRadius: 999,
                    transition: "all .18s ease",
                    bgcolor: RED,
                    color: "#fff",
                    fontWeight: 900,
                    fontSize: 13,
                    cursor: "pointer",
                    boxShadow: "0 4px 10px rgba(0,0,0,.25)",
                    "&:hover": { bgcolor: "#810326" },
                    whiteSpace: "nowrap",
                  }}
                >
                  {hoverIdx === idx ? "Disband? ×" : "×"}
                </Box>
              </Tooltip>

              <Typography variant="h6" fontWeight={900} sx={{ mb: 0.25 }}>
                {p.name}
              </Typography>
              <Typography sx={{ mb: 0.25, fontSize: 14 }}>
                Date: {p.date} • Time: {p.time} • {p.recurring ? "Recurring" : "One time"}
              </Typography>
              <Typography sx={{ mb: 0.5, fontSize: 14 }}>
                Duration: {p.durationMins} mins • Focus: {p.focus}
              </Typography>

              <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                <Button
                  size="small"
                  variant="contained"
                  sx={solid}
                  onClick={() => setOpenQuestIdx(idx)}
                >
                  Add Entry
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: "#fff", color: "#fff" }}
                  onClick={() => {
                    setEditIdx(idx);
                    setEditDraft(p);
                  }}
                >
                  Edit
                </Button>
              </Box>

              {/* Leaderboards per quest */}
              <Collapse in>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 3,
                    bgcolor: "rgba(0,0,0,0.25)",
                    border: "2px dashed rgba(255,255,255,0.7)",
                  }}
                >
                  <LeaderBoard quests={qs} onAbandon={abandonQuest} />
                </Box>
              </Collapse>

              {/* Add Entry modal */}
              <QuestDialog
                open={openQuestIdx === idx}
                onClose={() => setOpenQuestIdx(null)}
                partyIndex={idx}
                parties={parties}
                quests={quests}
                setQuests={setQuests}
              />
            </Box>
          );
        })}

        {parties.length === 0 && (
          <Typography sx={{ color: "rgba(255,255,255,0.85)" }}>No parties yet.</Typography>
        )}
      </Box>

      {/* Edit Party Modal */}
      <Dialog
        open={editIdx !== null}
        onClose={() => {
          setEditIdx(null);
          setEditDraft(null);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Party</DialogTitle>
        <DialogContent dividers>
          {editDraft && (
            <Stack spacing={1} sx={{ pt: 1 }}>
              <TextField
                label="Group name"
                value={editDraft.name}
                onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <TextField
                  type="date"
                  label="Date"
                  InputLabelProps={{ shrink: true }}
                  value={editDraft.date}
                  onChange={(e) => setEditDraft({ ...editDraft, date: e.target.value })}
                  fullWidth
                />
                <TextField
                  type="time"
                  label="Start time"
                  InputLabelProps={{ shrink: true }}
                  value={editDraft.time}
                  onChange={(e) => setEditDraft({ ...editDraft, time: e.target.value })}
                  fullWidth
                />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <TextField
                  type="number"
                  label="Duration (mins)"
                  value={editDraft.durationMins}
                  onChange={(e) =>
                    setEditDraft({
                      ...editDraft,
                      durationMins: Number(e.target.value || 0),
                    })
                  }
                  fullWidth
                />
                <TextField
                  label="Focus"
                  value={editDraft.focus}
                  onChange={(e) => setEditDraft({ ...editDraft, focus: e.target.value })}
                  fullWidth
                />
              </Stack>
              <Typography sx={{ fontWeight: 700 }}>Members</Typography>
              {editDraft.members.map((m, i) => (
                <Stack key={i} direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <TextField
                    label={`Member ${i + 1} name`}
                    value={m.name}
                    onChange={(e) => {
                      const next = [...editDraft.members];
                      next[i] = { ...m, name: e.target.value };
                      setEditDraft({ ...editDraft, members: next });
                    }}
                  />
                  <TextField
                    label={`Member ${i + 1} email`}
                    value={m.email}
                    onChange={(e) => {
                      const next = [...editDraft.members];
                      next[i] = { ...m, email: e.target.value };
                      setEditDraft({ ...editDraft, members: next });
                    }}
                  />
                </Stack>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setEditIdx(null);
              setEditDraft(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" sx={solid} onClick={saveEdit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function QuestDialog({
  open,
  onClose,
  partyIndex,
  parties,
  quests,
  setQuests,
}: {
  open: boolean;
  onClose: () => void;
  partyIndex: number;
  parties: Party[];
  quests: Quest[];
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>;
}) {
  const partyQuests = quests.filter((q) => q.partyIndex === partyIndex);
  const [which, setWhich] = React.useState(0);
  React.useEffect(() => {
    setWhich(0);
  }, [open, partyIndex]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Party Quest</DialogTitle>
      <DialogContent dividers>
        {partyQuests.length > 1 && (
          <Box sx={{ mb: 1 }}>
            <Select value={which} onChange={(e) => setWhich(Number(e.target.value))} inputProps={{ "aria-label": "Select quest" }}>
              {partyQuests.map((q, i) => (
                <MenuItem key={i} value={i}>
                  {q.exercise} ({GOAL_LABEL[q.goal]})
                </MenuItem>
              ))}
            </Select>
          </Box>
        )}
        {partyQuests[which] ? (
          <PartyQuestBody
            partyIndex={partyIndex}
            quest={partyQuests[which]}
            parties={parties}
            setQuests={setQuests}
          />
        ) : (
          <Typography>No active quests for this party.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

function PartyQuestBody({
  partyIndex,
  quest,
  parties,
  setQuests,
}: {
  partyIndex: number;
  quest: Quest;
  parties: Party[];
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>;
}) {
  const party = parties[partyIndex];

  // Inputs based on goal type
  const [member, setMember] = React.useState("");
  const [weight, setWeight] = React.useState<number | "">("");
  const [reps, setReps] = React.useState<number | "">("");
  const [repsOnly, setRepsOnly] = React.useState<number | "">("");
  const [durationMins, setDurationMins] = React.useState<number | "">("");
  const [distance, setDistance] = React.useState<number | "">("");

  const add = () => {
    const who = member.trim();
    if (!who) return;

    const entry: QuestEntry = { name: who, at: Date.now(), score: 0 };
    if (quest.goal === "pr") {
      entry.weight = Number(weight || 0);
      entry.reps = Number(reps || 0);
    } else if (quest.goal === "max_reps") {
      entry.reps = Number(reps || 0);
    } else if (quest.goal === "reps") {
      entry.repsOnly = Number(repsOnly || 0);
    } else if (quest.goal === "duration") {
      entry.durationMins = Number(durationMins || 0);
    } else if (quest.goal === "distance") {
      entry.distance = Number(distance || 0);
    }
    entry.score = scoreOf(quest, entry);

    // REPLACE existing entry by same member (case-sensitive name match)
    setQuests((prev) =>
      prev.map((q) =>
        q === quest
          ? { ...q, entries: [entry, ...q.entries.filter((e) => e.name !== who)] }
          : q
      )
    );

    setMember("");
    setWeight("");
    setReps("");
    setRepsOnly("");
    setDurationMins("");
    setDistance("");
  };

  const ranked = [...quest.entries].sort((a, b) => b.score - a.score);

  return (
    <>
      <Typography sx={{ fontWeight: 900, mb: 1 }}>
        {party?.name} - {quest.exercise} ({GOAL_LABEL[quest.goal]})
      </Typography>

      <Stack spacing={1} sx={{ pt: 0.5 }}>
        <TextField select label="Member" value={member} onChange={(e) => setMember(e.target.value)}>
          {party?.members.map((m, i) => (
            <MenuItem key={i} value={m.name || (i === 0 ? "(you)" : "")}>
              {m.name || (i === 0 ? "(you)" : "")}
            </MenuItem>
          ))}
        </TextField>

        {quest.goal === "pr" && (
          <>
            <TextField
              type="number"
              label="Weight (lb)"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value || 0))}
            />
            <TextField
              type="number"
              label="Reps"
              value={reps}
              onChange={(e) => setReps(Number(e.target.value || 0))}
            />
          </>
        )}

        {quest.goal === "max_reps" && (
          <TextField
            type="number"
            label="Reps"
            value={reps}
            onChange={(e) => setReps(Number(e.target.value || 0))}
          />
        )}

        {quest.goal === "reps" && (
          <TextField
            type="number"
            label="Reps"
            value={repsOnly}
            onChange={(e) => setRepsOnly(Number(e.target.value || 0))}
          />
        )}

        {quest.goal === "duration" && (
          <TextField
            type="number"
            label="Duration (mins)"
            value={durationMins}
            onChange={(e) => setDurationMins(Number(e.target.value || 0))}
          />
        )}

        {quest.goal === "distance" && (
          <TextField
            type="number"
            label="Distance"
            value={distance}
            onChange={(e) => setDistance(Number(e.target.value || 0))}
          />
        )}

        <Button variant="contained" sx={solid} onClick={add}>
          Add Result
        </Button>
      </Stack>

      <Box sx={{ mt: 1.5 }}>
        {ranked.length === 0 ? (
          <Typography color="text.secondary" sx={{ fontSize: 14 }}>
            No entries yet. Be the first.
          </Typography>
        ) : (
          ranked.map((e, i) => (
            <Box
              key={i}
              sx={{
                p: 0.75,
                borderRadius: 2,
                bgcolor:
                  i === 0
                    ? "#FFF7E0"
                    : i === 1
                    ? "#F0F7FF"
                    : i === 2
                    ? "#F7F0FF"
                    : "#FAFAFA",
                mb: 0.4,
                fontSize: 14,
              }}
            >
              <strong style={{ marginRight: 8 }}>
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
              </strong>
              <strong>{e.name}</strong>
            </Box>
          ))
        )}
      </Box>
    </>
  );
}
