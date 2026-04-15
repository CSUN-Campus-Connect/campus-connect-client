"use client";

import * as React from "react";
import Link from "next/link";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GroupsIcon from "@mui/icons-material/Groups";
import Grainient from "@/components/messages/backgroundanimations/Grainient";
import GridScan from "@/components/messages/backgroundanimations/GridScan";
import Lightning from "@/components/messages/backgroundanimations/Lightning";
import Particles from "@/components/messages/backgroundanimations/Particles";
import { RED } from "@/components/messages/constants";
import {
  loadMessageChatPreferences,
  saveMessageChatPreferences,
  notifyMessageChatPreferencesChanged,
} from "@/lib/messageChatPreferences";
import type { ID, Thread, User } from "@/types/messages";
import { BACKGROUNDS, hexToHue, type AnimatedBg } from "@/components/messages/MessagesView/backgrounds";
import { isGroupThread } from "@/components/messages/utils";

export type MessageBackgroundSettingsSectionProps = {
  threads: Thread[];
  users: User[];
  meId: ID;
  groupPictureByThreadId?: Record<string, string>;
  /** Threads the user left (optional; hides from apply list when provided) */
  leftGroupThreadIds?: Set<ID>;
};

export function MessageBackgroundSettingsSection({
  threads,
  users,
  meId,
  groupPictureByThreadId = {},
  leftGroupThreadIds = new Set(),
}: MessageBackgroundSettingsSectionProps) {
  const userById = React.useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  const [applyIds, setApplyIds] = React.useState<Set<ID>>(new Set());
  const [backgroundByThreadId, setBackgroundByThreadId] = React.useState<Record<ID, number | null>>({});
  const [animatedBackgroundByThreadId, setAnimatedBackgroundByThreadId] = React.useState<
    Record<ID, AnimatedBg | null>
  >({});
  const [customBackgroundByThreadId, setCustomBackgroundByThreadId] = React.useState<Record<ID, string>>({});

  React.useEffect(() => {
    const p = loadMessageChatPreferences();
    setBackgroundByThreadId({ ...p.backgroundByThreadId });
    setAnimatedBackgroundByThreadId({ ...p.animatedBackgroundByThreadId });
    setCustomBackgroundByThreadId({ ...p.customBackgroundByThreadId });
  }, []);

  const listenRefresh = React.useCallback(() => {
    const p = loadMessageChatPreferences();
    setBackgroundByThreadId({ ...p.backgroundByThreadId });
    setAnimatedBackgroundByThreadId({ ...p.animatedBackgroundByThreadId });
    setCustomBackgroundByThreadId({ ...p.customBackgroundByThreadId });
  }, []);

  React.useEffect(() => {
    const onEvt = () => listenRefresh();
    window.addEventListener("cc-message-chat-prefs-changed", onEvt);
    window.addEventListener("storage", onEvt);
    return () => {
      window.removeEventListener("cc-message-chat-prefs-changed", onEvt);
      window.removeEventListener("storage", onEvt);
    };
  }, [listenRefresh]);

  const visibleThreads = React.useMemo(
    () => threads.filter((t) => t.participantIds.includes(meId) && !leftGroupThreadIds.has(t.id)),
    [threads, meId, leftGroupThreadIds]
  );

  const previewTid =
    applyIds.size > 0 ? Array.from(applyIds)[0]! : visibleThreads[0]?.id ?? null;

  /** Require explicit selection when you have more than one chat (avoids accidental applies). */
  const applyToThreadIds = (): ID[] => {
    if (applyIds.size > 0) return Array.from(applyIds);
    if (visibleThreads.length === 1) return [visibleThreads[0]!.id];
    return [];
  };

  const applyStaticBackground = (b: (typeof BACKGROUNDS)[number]) => {
    const ids = applyToThreadIds();
    if (ids.length === 0) return;
    const nextBg = { ...backgroundByThreadId };
    const nextAnim: Record<ID, AnimatedBg | null> = { ...animatedBackgroundByThreadId };
    const cur = loadMessageChatPreferences();
    const custom = { ...cur.customBackgroundByThreadId };
    ids.forEach((tid) => {
      nextBg[tid] = b.id;
      nextAnim[tid] = null;
      delete custom[tid];
    });
    setBackgroundByThreadId(nextBg);
    setAnimatedBackgroundByThreadId(nextAnim);
    setCustomBackgroundByThreadId((prev) => {
      const n = { ...prev };
      ids.forEach((id) => delete n[id]);
      return n;
    });
    saveMessageChatPreferences({
      ...cur,
      backgroundByThreadId: { ...cur.backgroundByThreadId, ...Object.fromEntries(ids.map((id) => [id, b.id])) },
      animatedBackgroundByThreadId: {
        ...cur.animatedBackgroundByThreadId,
        ...Object.fromEntries(ids.map((id) => [id, null])),
      },
      customBackgroundByThreadId: custom,
    });
    notifyMessageChatPreferencesChanged();
  };

  const setAnimatedForApplied = (type: AnimatedBg) => {
    const ids = applyToThreadIds();
    if (ids.length === 0) return;
    const value: AnimatedBg =
      type && type.type === "particles" ? { ...type, colors: [...type.colors] } : type;
    const nextBg = { ...backgroundByThreadId };
    const nextAnim = { ...animatedBackgroundByThreadId };
    const cur = loadMessageChatPreferences();
    const custom = { ...cur.customBackgroundByThreadId };
    ids.forEach((tid) => {
      nextBg[tid] = null;
      nextAnim[tid] = value;
      delete custom[tid];
    });
    setBackgroundByThreadId(nextBg);
    setAnimatedBackgroundByThreadId(nextAnim);
    setCustomBackgroundByThreadId((prev) => {
      const n = { ...prev };
      ids.forEach((id) => delete n[id]);
      return n;
    });
    saveMessageChatPreferences({
      ...cur,
      backgroundByThreadId: { ...cur.backgroundByThreadId, ...Object.fromEntries(ids.map((id) => [id, null])) },
      animatedBackgroundByThreadId: {
        ...cur.animatedBackgroundByThreadId,
        ...Object.fromEntries(ids.map((id) => [id, value])),
      },
      customBackgroundByThreadId: custom,
    });
    notifyMessageChatPreferencesChanged();
  };

  const selectedAnim = previewTid ? animatedBackgroundByThreadId[previewTid] : null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary", mb: 0.5 }}>
        Chat backgrounds
      </Typography>
      <Typography sx={{ fontSize: 14, color: "text.secondary", mb: 2, maxWidth: 720 }}>
        Choose who gets each background, then pick a still image, animated style, or your own upload.{" "}
        <Box component={Link} href="/messages" sx={{ color: RED, fontWeight: 700 }}>
          Open Messages
        </Box>{" "}
        to chat with these backgrounds applied.
      </Typography>

      <Typography sx={{ fontSize: 13, fontWeight: 800, color: "text.secondary", mb: 1 }}>
        Apply to these conversations
      </Typography>
      {visibleThreads.length === 0 ? (
        <Typography sx={{ fontSize: 14, color: "text.secondary", mb: 2 }}>
          No conversations yet. Start a chat from Messages to set per-chat backgrounds.
        </Typography>
      ) : visibleThreads.length > 1 && applyIds.size === 0 ? (
        <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 1.5, fontWeight: 600 }}>
          Select one or more conversations below to choose who receives your background.
        </Typography>
      ) : null}
      {visibleThreads.length > 0 ? (
        <List
          sx={{
            p: 0,
            maxHeight: 200,
            overflow: "auto",
            mb: 2,
            border: (t) => `1px solid ${t.palette.divider}`,
            borderRadius: 2,
          }}
        >
          {visibleThreads.map((t) => {
            const isGroup = isGroupThread(t);
            const title = isGroup
              ? t.name ?? "Group chat"
              : userById.get(t.participantIds.find((id) => id !== meId) ?? "")?.displayName ?? "Chat";
            return (
              <ListItemButton
                key={t.id}
                onClick={() =>
                  setApplyIds((prev) => {
                    const n = new Set(prev);
                    if (n.has(t.id)) n.delete(t.id);
                    else n.add(t.id);
                    return n;
                  })
                }
                sx={{ py: 0.5 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Checkbox edge="start" checked={applyIds.has(t.id)} disableRipple size="small" />
                </ListItemIcon>
                {isGroup ? (
                  groupPictureByThreadId[t.id] ? (
                    <Avatar src={groupPictureByThreadId[t.id]} sx={{ mr: 1, width: 28, height: 28 }} />
                  ) : (
                    <GroupsIcon sx={{ mr: 1, color: "text.secondary", fontSize: 22 }} />
                  )
                ) : (
                  <Avatar
                    src={userById.get(t.participantIds.find((id) => id !== meId) ?? "")?.avatarUrl}
                    sx={{ mr: 1, width: 28, height: 28 }}
                  />
                )}
                <ListItemText
                  primary={<Typography sx={{ fontSize: 13, fontWeight: 700 }}>{title}</Typography>}
                />
              </ListItemButton>
            );
          })}
        </List>
      ) : null}

      <Typography sx={{ fontSize: 13, fontWeight: 800, color: "text.secondary", mb: 1 }}>
        Animated backgrounds
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
        {(
          [
            { type: null as AnimatedBg, label: "None" },
            {
              type: { type: "grainient" as const, color1: "#ebebeb", color2: "#e32400", color3: "#B19EEF" },
              label: "Gradient",
            },
            { type: { type: "gridscan" as const }, label: "Grid scan" },
            { type: { type: "lightning" as const, color: "#6366f1" }, label: "Lightning" },
            {
              type: { type: "particles" as const, colors: ["#ffffff", "#c7d2fe", "#a78bfa"] },
              label: "Particles",
            },
          ] as const
        ).map(({ type, label }) => {
          const targetId = previewTid;
          const isSelected =
            type === null
              ? !targetId || !animatedBackgroundByThreadId[targetId]
              : targetId &&
                JSON.stringify(animatedBackgroundByThreadId[targetId]) === JSON.stringify(type);
          return (
            <Button
              key={label}
              variant={isSelected ? "contained" : "outlined"}
              size="small"
              disabled={visibleThreads.length === 0 || applyToThreadIds().length === 0}
              onClick={() => {
                if (type === null) {
                  const ids = applyToThreadIds();
                  if (ids.length === 0) return;
                  const nextAnim = { ...animatedBackgroundByThreadId };
                  ids.forEach((tid) => {
                    nextAnim[tid] = null;
                  });
                  setAnimatedBackgroundByThreadId(nextAnim);
                  const cur = loadMessageChatPreferences();
                  saveMessageChatPreferences({
                    ...cur,
                    animatedBackgroundByThreadId: {
                      ...cur.animatedBackgroundByThreadId,
                      ...Object.fromEntries(ids.map((id) => [id, null])),
                    },
                  });
                  notifyMessageChatPreferencesChanged();
                  return;
                }
                setAnimatedForApplied(type);
              }}
              sx={{
                borderRadius: 999,
                fontWeight: 800,
                textTransform: "none",
                bgcolor: isSelected ? RED : undefined,
              }}
            >
              {label}
            </Button>
          );
        })}
      </Stack>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)" }, gap: 1.25, mb: 2 }}>
        {BACKGROUNDS.map((b) => {
          const ids = applyToThreadIds();
          const selected = ids.length > 0 && backgroundByThreadId[ids[0]!] === b.id;
          return (
            <Box
              key={b.id}
              onClick={() => applyStaticBackground(b)}
              sx={{
                cursor: visibleThreads.length && applyToThreadIds().length ? "pointer" : "default",
                opacity: visibleThreads.length && applyToThreadIds().length ? 1 : 0.45,
                borderRadius: 2,
                overflow: "hidden",
                border: (t) => (selected ? `2px solid ${RED}` : `1px solid ${t.palette.divider}`),
                bgcolor: "action.hover",
              }}
            >
              <Box component="img" src={b.src} alt={b.label} sx={{ width: "100%", height: 88, objectFit: "cover", display: "block" }} />
              <Box sx={{ px: 1, py: 0.75, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: 12, fontWeight: 800 }}>{b.label}</Typography>
                {selected ? <CheckCircleIcon sx={{ fontSize: 18, color: RED }} /> : null}
              </Box>
            </Box>
          );
        })}
      </Box>

      <Typography sx={{ fontSize: 13, fontWeight: 800, color: "text.secondary", mb: 0.5 }}>
        Upload your own image
      </Typography>
      <Typography sx={{ fontSize: 12, color: "error.main", fontWeight: 600, mb: 1 }}>
        Use appropriate images only. Violations may result in account action.
      </Typography>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Button variant="outlined" component="label" sx={{ borderRadius: 999, fontWeight: 800, textTransform: "none" }}>
          Choose image
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              const ids = applyToThreadIds();
              if (!file || ids.length === 0) return;
              const reader = new FileReader();
              reader.onload = () => {
                const dataUrl = reader.result as string;
                const nextCustom = { ...customBackgroundByThreadId };
                const nextBg = { ...backgroundByThreadId };
                const nextAnim = { ...animatedBackgroundByThreadId };
                ids.forEach((tid) => {
                  nextCustom[tid] = dataUrl;
                  nextBg[tid] = null;
                  nextAnim[tid] = null;
                });
                setCustomBackgroundByThreadId(nextCustom);
                setBackgroundByThreadId(nextBg);
                setAnimatedBackgroundByThreadId(nextAnim);
                const cur = loadMessageChatPreferences();
                saveMessageChatPreferences({
                  ...cur,
                  customBackgroundByThreadId: { ...cur.customBackgroundByThreadId, ...Object.fromEntries(ids.map((id) => [id, dataUrl])) },
                  backgroundByThreadId: { ...cur.backgroundByThreadId, ...Object.fromEntries(ids.map((id) => [id, null])) },
                  animatedBackgroundByThreadId: {
                    ...cur.animatedBackgroundByThreadId,
                    ...Object.fromEntries(ids.map((id) => [id, null])),
                  },
                });
                notifyMessageChatPreferencesChanged();
              };
              reader.readAsDataURL(file);
              e.target.value = "";
            }}
          />
        </Button>
        {previewTid && customBackgroundByThreadId[previewTid] ? (
          <Box
            component="img"
            src={customBackgroundByThreadId[previewTid]}
            alt="Custom preview"
            sx={{ width: 56, height: 56, objectFit: "cover", borderRadius: 2, border: `2px solid ${RED}` }}
          />
        ) : null}
      </Stack>

      {previewTid && selectedAnim && selectedAnim !== null && (
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 800, color: "text.secondary", mb: 1 }}>
            Customize colors (preview)
          </Typography>
          {selectedAnim.type === "grainient" && (
            <Box sx={{ mb: 1.5 }}>
              <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap" }}>
                {(["color1", "color2", "color3"] as const).map((key, i) => (
                  <Box key={key} component="label" sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 700 }}>Color {i + 1}</Typography>
                    <Box
                      component="input"
                      type="color"
                      value={selectedAnim[key]}
                      onChange={(e) => {
                        const v = e.target.value;
                        setAnimatedBackgroundByThreadId((prev) => {
                          const curA = prev[previewTid];
                          if (curA?.type !== "grainient") return prev;
                          const next = { ...prev, [previewTid]: { ...curA, [key]: v } };
                          const prefs = loadMessageChatPreferences();
                          saveMessageChatPreferences({
                            ...prefs,
                            animatedBackgroundByThreadId: { ...prefs.animatedBackgroundByThreadId, [previewTid]: next[previewTid] },
                          });
                          notifyMessageChatPreferencesChanged();
                          return next;
                        });
                      }}
                      sx={{ width: 40, height: 40, border: "none", borderRadius: 1, cursor: "pointer", p: 0 }}
                    />
                  </Box>
                ))}
              </Stack>
              <Box sx={{ width: "100%", maxWidth: 400, height: 100, borderRadius: 2, overflow: "hidden", border: (t) => `1px solid ${t.palette.divider}` }}>
                <Grainient
                  color1={selectedAnim.color1}
                  color2={selectedAnim.color2}
                  color3={selectedAnim.color3}
                  timeSpeed={0.25}
                  warpStrength={1}
                  warpFrequency={5}
                  warpSpeed={2}
                  warpAmplitude={50}
                  zoom={1.25}
                />
              </Box>
            </Box>
          )}
          {selectedAnim.type === "gridscan" && (
            <Box sx={{ width: "100%", maxWidth: 400, height: 100, borderRadius: 2, overflow: "hidden", border: (t) => `1px solid ${t.palette.divider}` }}>
              <GridScan
                sensitivity={0.55}
                lineThickness={1}
                linesColor="#392e4e"
                gridScale={0.1}
                scanColor="#FF9FFC"
                scanOpacity={0.4}
                enablePost={true}
                bloomIntensity={0.6}
                chromaticAberration={0.002}
                noiseIntensity={0.01}
              />
            </Box>
          )}
          {selectedAnim.type === "lightning" && (
            <Box>
              <Box
                component="input"
                type="color"
                value={selectedAnim.color}
                onChange={(e) => {
                  const v = e.target.value;
                  setAnimatedBackgroundByThreadId((prev) => {
                    const curA = prev[previewTid];
                    if (curA?.type !== "lightning") return prev;
                    const next = { ...prev, [previewTid]: { ...curA, color: v } };
                    const prefs = loadMessageChatPreferences();
                    saveMessageChatPreferences({
                      ...prefs,
                      animatedBackgroundByThreadId: { ...prefs.animatedBackgroundByThreadId, [previewTid]: next[previewTid] },
                    });
                    notifyMessageChatPreferencesChanged();
                    return next;
                  });
                }}
                sx={{ width: 40, height: 40, border: "none", borderRadius: 1, cursor: "pointer", p: 0, mb: 1 }}
              />
              <Box sx={{ width: "100%", maxWidth: 400, height: 100, borderRadius: 2, overflow: "hidden", border: (t) => `1px solid ${t.palette.divider}` }}>
                <Lightning hue={hexToHue(selectedAnim.color)} xOffset={0} speed={1} intensity={1} size={1} />
              </Box>
            </Box>
          )}
          {selectedAnim.type === "particles" && (
            <Box>
              <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap" }}>
                {[0, 1, 2].map((i) => {
                  const colors = selectedAnim.colors;
                  const color = colors[i] ?? "#ffffff";
                  return (
                    <Box key={i} component="label" sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
                      <Typography sx={{ fontSize: 11, fontWeight: 700 }}>Color {i + 1}</Typography>
                      <Box
                        component="input"
                        type="color"
                        value={color}
                        onChange={(e) => {
                          const v = e.target.value;
                          setAnimatedBackgroundByThreadId((prev) => {
                            const curA = prev[previewTid];
                            if (curA?.type !== "particles") return prev;
                            const nextColors = [...curA.colors];
                            while (nextColors.length <= i) nextColors.push(nextColors[nextColors.length - 1] ?? "#ffffff");
                            nextColors[i] = v;
                            const next = { ...prev, [previewTid]: { ...curA, colors: nextColors } };
                            const prefs = loadMessageChatPreferences();
                            saveMessageChatPreferences({
                              ...prefs,
                              animatedBackgroundByThreadId: { ...prefs.animatedBackgroundByThreadId, [previewTid]: next[previewTid] },
                            });
                            notifyMessageChatPreferencesChanged();
                            return next;
                          });
                        }}
                        sx={{ width: 40, height: 40, border: "none", borderRadius: 1, cursor: "pointer", p: 0 }}
                      />
                    </Box>
                  );
                })}
              </Stack>
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 400,
                  height: 100,
                  borderRadius: 2,
                  overflow: "hidden",
                  border: (t) => `1px solid ${t.palette.divider}`,
                  bgcolor: "rgba(0,0,0,0.35)",
                }}
              >
                <Particles
                  particleColors={selectedAnim.colors.length ? selectedAnim.colors : ["#ffffff", "#c7d2fe", "#a78bfa"]}
                  particleCount={200}
                  particleSpread={10}
                  speed={0.1}
                  particleBaseSize={100}
                  moveParticlesOnHover={false}
                  alphaParticles={false}
                  disableRotation={false}
                  pixelRatio={1}
                />
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
