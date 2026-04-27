"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  Box,
  Stack,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  Chip,
  Skeleton,
} from "@mui/material";
import PushPinIcon from "@mui/icons-material/PushPin";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { WidgetHeader } from "./WidgetHeader";
import type { ID, Message, Thread, User } from "@/types/messages";

const RED = "#A80532";

function formatAgoShort(nowMs: number, ts: number): string {
  const diff = nowMs - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function isOnline(lastActiveAt: number): boolean {
  return Date.now() - lastActiveAt < 3 * 60 * 1000; // within 3 mins
}

export type DMNotificationsWidgetProps = {
  onDelete?: () => void;
  /** IDs of threads the user has pinned */
  pinnedThreadIds?: Set<ID>;
  threads?: Thread[];
  users?: User[];
  allMessages?: Message[];
  meId?: ID;
  /** Navigate to messages and open a specific thread */
  onOpenThread?: (threadId: ID) => void;
};

export const DMNotificationsWidget: React.FC<DMNotificationsWidgetProps> = ({
  onDelete,
  pinnedThreadIds = new Set(),
  threads = [],
  users = [],
  allMessages = [],
  meId = "me",
  onOpenThread,
}) => {
  const [nowMs, setNowMs] = React.useState(Date.now());

  React.useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Build a user map
  const userMap = React.useMemo(
    () => Object.fromEntries(users.map((u) => [u.id, u])),
    [users]
  );

  // Get pinned threads (only DMs, not group chats)
  const pinnedDMs = React.useMemo(() => {
    return threads
      .filter(
        (t) =>
          pinnedThreadIds.has(t.id) &&
          t.participantIds.length === 2 // only 1-on-1 DMs
      )
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [threads, pinnedThreadIds]);

  // Get last message per thread
  const lastMessageByThread = React.useMemo(() => {
    const map: Record<ID, Message | null> = {};
    for (const t of pinnedDMs) {
      const msgs = allMessages
        .filter((m) => m.threadId === t.id)
        .sort((a, b) => b.createdAt - a.createdAt);
      map[t.id] = msgs[0] ?? null;
    }
    return map;
  }, [pinnedDMs, allMessages]);

  const hasPinned = pinnedDMs.length > 0;

  return (
    <Card
      className="widget-card"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid rgba(168,5,50,0.10)",
        boxShadow: "0 4px 24px rgba(168,5,50,0.07)",
      }}
    >
      <WidgetHeader title="Pinned DMs" onDelete={onDelete} />

      {/* Accent strip */}
      <Box
        sx={{
          height: 3,
          background: `linear-gradient(90deg, ${RED} 0%, #e8527a 60%, #ff9fb2 100%)`,
        }}
      />

      <CardContent
        sx={{
          flex: 1,
          overflow: "auto",
          p: "12px !important",
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(168,5,50,0.2)", borderRadius: 4 },
        }}
      >
        {!hasPinned ? (
          /* Empty state */
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 3,
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                bgcolor: "rgba(168,5,50,0.07)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PushPinIcon sx={{ color: RED, fontSize: 22, opacity: 0.7 }} />
            </Box>
            <Typography
              sx={{ fontSize: 13, fontWeight: 700, color: "rgba(0,0,0,0.5)", textAlign: "center" }}
            >
              No pinned DMs yet
            </Typography>
            <Typography
              sx={{ fontSize: 11, color: "rgba(0,0,0,0.38)", textAlign: "center", maxWidth: 180 }}
            >
              Pin conversations from Messages to see them here as quick access
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1}>
            {pinnedDMs.map((thread) => {
              const otherId = thread.participantIds.find((id) => id !== meId) ?? "";
              const other = userMap[otherId];
              const lastMsg = lastMessageByThread[thread.id];
              const online = other ? isOnline(other.lastActiveAt) : false;
              const isMine = lastMsg?.fromUserId === meId;
              const isUnread =
                lastMsg &&
                !isMine &&
                !new Set(lastMsg.seenByUserIds ?? []).has(meId);

              return (
                <Box
                  key={thread.id}
                  sx={{
                    borderRadius: 2.5,
                    border: isUnread
                      ? `1.5px solid rgba(168,5,50,0.35)`
                      : "1.5px solid rgba(0,0,0,0.07)",
                    bgcolor: isUnread
                      ? "rgba(168,5,50,0.04)"
                      : "rgba(0,0,0,0.02)",
                    p: 1.25,
                    transition: "all 0.18s ease",
                    "&:hover": {
                      bgcolor: "rgba(168,5,50,0.06)",
                      border: `1.5px solid rgba(168,5,50,0.25)`,
                      transform: "translateY(-1px)",
                      boxShadow: "0 3px 12px rgba(168,5,50,0.10)",
                    },
                    cursor: "default",
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.25}>
                    {/* Avatar with online dot */}
                    <Box sx={{ position: "relative", flexShrink: 0 }}>
                      <Avatar
                        src={other?.avatarUrl}
                        sx={{ width: 38, height: 38, border: `2px solid ${isUnread ? RED : "rgba(0,0,0,0.08)"}` }}
                      >
                        {other?.displayName?.[0] ?? "?"}
                      </Avatar>
                      {online && (
                        <FiberManualRecordIcon
                          sx={{
                            position: "absolute",
                            bottom: -1,
                            right: -1,
                            fontSize: 13,
                            color: "#22c55e",
                            filter: "drop-shadow(0 0 2px white)",
                          }}
                        />
                      )}
                    </Box>

                    {/* Name + message preview */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.25 }}>
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: isUnread ? 800 : 700,
                            color: "rgba(0,0,0,0.87)",
                            lineHeight: 1.2,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {other?.displayName ?? "Unknown"}
                        </Typography>
                        {isUnread && (
                          <Box
                            sx={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              bgcolor: RED,
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <PushPinIcon sx={{ fontSize: 11, color: "rgba(168,5,50,0.5)", ml: "auto !important", flexShrink: 0 }} />
                      </Stack>

                      {lastMsg ? (
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: isUnread ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.45)",
                            fontWeight: isUnread ? 600 : 400,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {isMine ? (
                            <Box component="span" sx={{ color: "rgba(0,0,0,0.35)", fontStyle: "italic" }}>
                              You:{" "}
                            </Box>
                          ) : null}
                          {lastMsg.text ?? (lastMsg as any).voiceUrl ? "🎤 Voice message" : "📎 Attachment"}
                        </Typography>
                      ) : (
                        <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.3)", fontStyle: "italic" }}>
                          No messages yet
                        </Typography>
                      )}
                    </Box>

                    {/* Timestamp + open button */}
                    <Stack alignItems="flex-end" spacing={0.5} sx={{ flexShrink: 0 }}>
                      {lastMsg && (
                        <Typography sx={{ fontSize: 10, fontWeight: 600, color: "rgba(0,0,0,0.35)" }}>
                          {formatAgoShort(nowMs, lastMsg.createdAt)}
                        </Typography>
                      )}
                      <Tooltip title={`Open chat with ${other?.displayName ?? "user"}`} arrow>
                        <IconButton
                          size="small"
                          onClick={() => onOpenThread?.(thread.id)}
                          sx={{
                            width: 28,
                            height: 28,
                            bgcolor: RED,
                            color: "white",
                            borderRadius: 1.5,
                            "&:hover": {
                              bgcolor: "#8a0428",
                              transform: "scale(1.08)",
                            },
                            transition: "all 0.15s ease",
                          }}
                        >
                          <OpenInNewIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}
      </CardContent>

      {/* Footer */}
      {hasPinned && (
        <Box
          sx={{
            px: 1.5,
            py: 1,
            borderTop: "1px solid rgba(0,0,0,0.06)",
            bgcolor: "rgba(168,5,50,0.02)",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <ChatBubbleOutlineIcon sx={{ fontSize: 12, color: "rgba(168,5,50,0.5)" }} />
          <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.4)", fontWeight: 600 }}>
            {pinnedDMs.length} pinned conversation{pinnedDMs.length !== 1 ? "s" : ""}
          </Typography>
        </Box>
      )}
    </Card>
  );
};
