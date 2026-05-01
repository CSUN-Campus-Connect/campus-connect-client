"use client";

import * as React from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";

import type { NoteComment, NoteFolder, NoteFolderItem } from "@/components/academics/shared/constants";
import { Stars } from "@/components/academics/NoteShare/NoteView.ui";

function makeId() {
  return `${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
}

export default function NoteViewCommentsPanel({
  folder,
  selectedItem,
  selectedItemComments,
  avgForSelected,
  formatRelative,
  onAddComment,
}: {
  folder: NoteFolder;
  selectedItem: NoteFolderItem | null;
  selectedItemComments: NoteComment[];
  avgForSelected: number;
  formatRelative: (iso: string) => string;
  onAddComment: (comment: NoteComment) => void;
}) {
  const [commentBody, setCommentBody] = React.useState("");
  const [commentRating, setCommentRating] = React.useState<1 | 2 | 3 | 4 | 5>(5);

  const canComment = React.useMemo(() => {
    return !!commentBody.trim();
  }, [commentBody]);

  const submitComment = () => {
    if (!canComment) return;

    const c: NoteComment = {
      id: makeId(),
      folderId: folder.id,
      itemId: selectedItem ? selectedItem.id : undefined,
      author: "anonymous",
      authorEmail: "anonymous",
      createdAt: new Date().toISOString(),
      rating: commentRating,
      body: commentBody.trim(),
    };

    onAddComment(c);
    setCommentBody("");
    setCommentRating(5);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        bgcolor: "#fff",
        border: "1.5px solid rgba(0,0,0,0.07)",
        p: 2.25,
        height: { xs: "auto", md: 520 },
        minHeight: 520,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
        <Typography sx={{ fontWeight: 950, fontSize: "0.92rem", color: "rgba(0,0,0,0.78)" }}>Comments</Typography>

        <Chip
          label={`${avgForSelected.toFixed(1)}`}
          icon={<Stars value={avgForSelected} size={14} />}
          sx={{
            height: 24,
            borderRadius: 999,
            fontWeight: 950,
            bgcolor: "rgba(168,5,50,0.08)",
            color: "#A80532",
            "& .MuiChip-icon": { ml: 0.7 },
          }}
        />
      </Stack>

      <Divider sx={{ my: 1.4 }} />

      <Box sx={{ flex: 1, overflow: "auto", pr: 0.5 }}>
        {selectedItem && (
          <Box sx={{ mb: 1.2 }}>
            <Typography sx={{ fontWeight: 950, color: "rgba(0,0,0,0.78)" }}>{selectedItem.title}</Typography>
            <Typography sx={{ fontSize: "0.78rem", color: "rgba(0,0,0,0.55)" }}>For: {selectedItem.type.toUpperCase()}</Typography>
          </Box>
        )}

        <Stack spacing={1.1}>
          {selectedItemComments.length === 0 ? (
            <Typography sx={{ fontSize: "0.84rem", color: "rgba(0,0,0,0.5)" }}>No comments yet.</Typography>
          ) : (
            selectedItemComments.map((c) => (
              <Paper
                key={c.id}
                elevation={0}
                sx={{
                  borderRadius: 3,
                  p: 1.4,
                  bgcolor: "rgba(0,0,0,0.015)",
                  border: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <Avatar sx={{ width: 28, height: 28, bgcolor: "#A80532", fontWeight: 950, fontSize: "0.78rem" }}>
                    {(c.author || "A").slice(0, 1).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                      <Typography sx={{ fontWeight: 950, fontSize: "0.82rem", color: "rgba(0,0,0,0.78)" }}>
                        {c.authorEmail || "anonymous"}
                      </Typography>
                      <Typography sx={{ fontSize: "0.72rem", color: "rgba(0,0,0,0.45)", fontWeight: 800 }}>
                        {formatRelative(c.createdAt)}
                      </Typography>
                    </Stack>

                    <Box sx={{ mt: 0.45 }}>
                      <Stars value={c.rating} size={14} />
                    </Box>

                    <Typography sx={{ mt: 0.8, fontSize: "0.84rem", color: "rgba(0,0,0,0.65)" }}>{c.body}</Typography>
                  </Box>
                </Stack>
              </Paper>
            ))
          )}
        </Stack>
      </Box>

      <Divider sx={{ my: 1.4 }} />

      <Typography sx={{ fontWeight: 950, fontSize: "0.86rem", color: "rgba(0,0,0,0.78)", mb: 1.0 }}>Add a comment</Typography>

      <Stack direction="row" spacing={0.4} sx={{ mb: 1.0 }}>
        {([1, 2, 3, 4, 5] as const).map((n) => {
          const filled = n <= commentRating;
          return (
            <IconButton key={n} onClick={() => setCommentRating(n)} size="small" aria-label={`Rate ${n} star${n !== 1 ? "s" : ""}`} sx={{ color: filled ? "#A80532" : "rgba(0,0,0,0.22)" }}>
              {filled ? <StarRoundedIcon /> : <StarBorderRoundedIcon />}
            </IconButton>
          );
        })}
      </Stack>

      <TextField
        label="Comment"
        value={commentBody}
        onChange={(e) => setCommentBody(e.target.value)}
        fullWidth
        size="small"
        multiline
        minRows={3}
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 1.2 }}>
        <Button
          variant="contained"
          disabled={!canComment}
          onClick={submitComment}
          sx={{
            borderRadius: 999,
            fontWeight: 950,
            bgcolor: "#A80532",
            "&:hover": { bgcolor: "#810326" },
            px: 2.6,
          }}
        >
          Post comment
        </Button>
      </Box>
    </Paper>
  );
}