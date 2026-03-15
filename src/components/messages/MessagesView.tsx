"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { ID, Message, Note, Thread, User } from "@/types/messages";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Dialog,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import GifBoxIcon from "@mui/icons-material/GifBox";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChatIcon from "@mui/icons-material/Chat";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import ReportIcon from "@mui/icons-material/Report";
import SearchIcon from "@mui/icons-material/Search";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import GroupsIcon from "@mui/icons-material/Groups";
import EditIcon from "@mui/icons-material/Edit";
import SettingsIcon from "@mui/icons-material/Settings";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import WallpaperIcon from "@mui/icons-material/Wallpaper";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import { RED, DRAWER_WIDTH } from "./constants";
import {
  panelScrollSx,
  scrollBarSx,
  formatAgo,
  activityText,
  getLastMessage,
  isThreadUnread,
  emptyDraft,
  type DraftState,
} from "./utils";
import MessagesDialogs from "./MessagesDialogs";
import VoiceMessageButton from "./VoiceMessageButton";
import bg1 from "./backgroundImages/ai-generated-ruled-paper-background-free-photo.jpg";
import bg2 from "./backgroundImages/RYr5wp.png.webp";
import bg3 from "./backgroundImages/Messenger-Sky-Chat-Theme-Hero.png.webp";
import bg4 from "./backgroundImages/Messenger-Valentines-Day-Chat-Theme-Hero.png.webp";
import bg5 from "./backgroundImages/7e7349a10a37cf62330cd9c4dd356b27.jpg";
import bg6 from "./backgroundImages/7351b72a516a99f1d024bcd113cb1b1b.jpg";
import bg7 from "./backgroundImages/8ff1e61516ecd920472d5f746aea62f1.jpg";

const DashboardSidebar = dynamic(() => import("@/components/dashboard/sidebar"), {
  ssr: false,
  loading: () => <Box sx={{ width: 220, flexShrink: 0, height: "100vh", borderRight: "1px solid rgba(0,0,0,0.08)", bgcolor: "white" }} />,
});

type StaticImage = { src: string; default?: string };
const BACKGROUNDS = [
  { id: 1, label: "Background 1", src: (bg1 as StaticImage).src ?? (bg1 as unknown as string) },
  { id: 2, label: "Background 2", src: (bg2 as StaticImage).src ?? (bg2 as unknown as string) },
  { id: 3, label: "Background 3", src: (bg3 as StaticImage).src ?? (bg3 as unknown as string) },
  { id: 4, label: "Background 4", src: (bg4 as StaticImage).src ?? (bg4 as unknown as string) },
  { id: 5, label: "Background 5", src: (bg5 as StaticImage).src ?? (bg5 as unknown as string) },
  { id: 6, label: "Background 6", src: (bg6 as StaticImage).src ?? (bg6 as unknown as string) },
  { id: 7, label: "Background 7", src: (bg7 as StaticImage).src ?? (bg7 as unknown as string) },
] as const;

function VoiceMessageBubble({ url, mine, initialDuration, sourceFile }: { url: string; mine: boolean; initialDuration?: number; sourceFile?: File | null }) {
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
      const p = playerRef.current;
      if (p) {
        p.pause();
        p.src = "";
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
    if (p && typeof p.catch === "function") {
      p.catch(() => stopPlayer());
    }
  }, [url, sourceFile, stopPlayer]);

  const displayDuration = knownDuration !== null ? knownDuration : 0;
  const displayCurrent = knownDuration !== null ? Math.min(Math.round(currentSec), knownDuration) : 0;
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 0.75,
        px: 1.25,
        py: 1.25,
        borderRadius: 2.5,
        border: "1px solid rgba(0,0,0,0.10)",
        bgcolor: mine ? "rgba(168,5,50,0.06)" : "rgba(0,0,0,0.05)",
        maxWidth: 280,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.25}>
        <IconButton
          onClick={togglePlay}
          size="small"
          sx={{
            width: 40,
            height: 40,
            bgcolor: "white",
            border: "1px solid rgba(0,0,0,0.12)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
          }}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <PauseIcon sx={{ fontSize: 26, color: "rgba(0,0,0,0.85)" }} /> : <PlayArrowIcon sx={{ fontSize: 26, color: "rgba(0,0,0,0.85)", ml: 0.25 }} />}
        </IconButton>
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
          {Array.from({ length: 24 }).map((_, i) => {
            const progress = knownDuration ? (displayCurrent / knownDuration) * 24 : 0;
            const filled = i < Math.round(progress);
            return (
              <Box
                key={i}
                sx={{
                  width: 4,
                  height: 12,
                  borderRadius: 1,
                  bgcolor: filled ? (mine ? RED : "rgba(0,0,0,0.6)") : "rgba(0,0,0,0.18)",
                }}
              />
            );
          })}
        </Box>
        <Typography
          component="span"
          sx={{
            fontSize: 12,
            fontWeight: 700,
            color: "rgba(0,0,0,0.7)",
            bgcolor: "rgba(255,255,255,0.9)",
            px: 1,
            py: 0.5,
            borderRadius: 1.5,
          }}
        >
          {fmt(displayCurrent)} / {fmt(displayDuration)}
        </Typography>
      </Stack>
      <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.5)", fontWeight: 600 }}>
        press play to listen to this voice message
      </Typography>
    </Box>
  );
}

export type MessagesViewProps = {
  me: User;
  meId: ID;
  threads: Thread[];
  users: User[];
  notes: Note[];
  allMessages: Message[];
  threadMessages: Message[];
  selectedThreadId: ID | null;
  onSelectedThreadIdChange: (id: ID | null) => void;
  onSend: (threadId: string, text: string, attachmentUrls?: string[]) => void | Promise<void>;
  onUpdateNote: (text: string) => void | Promise<void>;
  onPickUser: (userId: ID) => void | Promise<void>;
  onCreateGroup?: (participantIds: ID[], name: string) => void | Promise<void>;
  onRefresh: () => void;

  /*
  onEditMessage: (messageId: string, newText: string) => void | Promise<void>;
  onDeleteMessage: (messageId: string) => void | Promise<void>;
  onReactMessage: (messageId: string, emoji: string) => void;
  typingByThread: Record<string, string | null>;
  onTypingStart: (threadId: string) => void;
  onTypingStop: (threadId: string) => void;
  readReceiptsByThread: Record<string, { userId: string; messageId: string }>;
  reactionsByMessage: Record<string, { emoji: string; userId: string }[]>;
  onSearchUsers: (q: string) => Promise<User[]>;
  hasMoreByThread: Record<string, boolean>;
  loadingMoreByThread: Record<string, boolean>;
  onFetchOlder: (threadId: string) => void;
  

  */

};

export default function MessagesView(props: MessagesViewProps) {
  const router = useRouter();
  const {
    me,
    meId,
    threads,
    users,
    notes,
    allMessages,
    threadMessages,
    selectedThreadId,
    onSelectedThreadIdChange,
    onSend,
    onUpdateNote,
    onPickUser,
    onCreateGroup,
    onRefresh,
    
  } = props;

  const [activeTab, setActiveTab] = React.useState<"messages" | "requests">("messages");
  const [threadSearch, setThreadSearch] = React.useState("");
  const [blockedUserIds, setBlockedUserIds] = React.useState<Set<ID>>(new Set());
  const [reportedThreadIds, setReportedThreadIds] = React.useState<Set<ID>>(new Set());
  const [newMsgOpen, setNewMsgOpen] = React.useState(false);
  const [createGroupOpen, setCreateGroupOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [settingsTab, setSettingsTab] = React.useState<"pins" | "backgrounds" | "blocked">("pins");
  const [pinnedThreadIds, setPinnedThreadIds] = React.useState<Set<ID>>(new Set());
  const [pinnedOrder, setPinnedOrder] = React.useState<ID[]>([]);
  const [backgroundByThreadId, setBackgroundByThreadId] = React.useState<Record<ID, number | null>>({});
  const [leftGroupThreadIds, setLeftGroupThreadIds] = React.useState<Set<ID>>(new Set());
  const [noteOpen, setNoteOpen] = React.useState(false);
  const [gifOpen, setGifOpen] = React.useState(false);
  const [imgView, setImgView] = React.useState({ open: false, url: "", name: "" });
  const [reportOpen, setReportOpen] = React.useState(false);
  const [reportReason, setReportReason] = React.useState("");
  const [reportDetails, setReportDetails] = React.useState("");
  const [gifFavorites, setGifFavorites] = React.useState<string[]>([]);
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("cc_gif_favs");
      if (stored) {
        const parsed = JSON.parse(stored);
        const arr = Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
        setGifFavorites(Array.from(new Set(arr)));
      }
    } catch {}
  }, []);
  const [draftByThreadId, setDraftByThreadId] = React.useState<Record<ID, DraftState>>({});
  const [nowMs, setNowMs] = React.useState<number | null>(null);
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);
  const bottomRef = React.useRef<HTMLDivElement | null>(null);
  const voiceDurationsByFileName = React.useRef<Record<string, number>>({});
  const urlToDurationRef = React.useRef<Record<string, number>>({});
  const lastSentBlobUrlsRef = React.useRef<Record<string, { urls: string[]; sentAt: number }>>({});
  const sentVoiceFileByUrlRef = React.useRef<Record<string, File>>({});

  React.useEffect(() => {
    try {
      localStorage.setItem("cc_gif_favs", JSON.stringify(Array.from(new Set(gifFavorites))));
    } catch {}
  }, [gifFavorites]);
  React.useEffect(() => {
    setNowMs(Date.now());
    const id = window.setInterval(() => setNowMs(Date.now()), 30000);
    return () => window.clearInterval(id);
  }, []);
/*

  // On thread switch — reset tracking only, don't scroll yet (messages not loaded)
 React.useEffect(() => {
    prevOldestMsgIdRef.current = null;
    prevScrollHeightRef.current = 0;
    isRestoringScrollRef.current = false;
    if (selectedThreadId) {
      initialScrollDoneRef.current.delete(selectedThreadId);
    }
  }, [selectedThreadId]);

  // On messages change — handle all scroll cases
  React.useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !threadMessages.length || !selectedThreadId) return;

    // Guard: if messages don't belong to selected thread, skip
    if (threadMessages[0]?.threadId !== selectedThreadId) return;

    const currentOldestId = threadMessages[0]?.id ?? null;
    const prevOldestId = prevOldestMsgIdRef.current;

    if (isRestoringScrollRef.current && prevOldestId !== null && currentOldestId !== prevOldestId) {
      const diff = scroller.scrollHeight - prevScrollHeightRef.current;
      scroller.scrollTop = Math.max(0, diff);
      isRestoringScrollRef.current = false;
    } else if (!isRestoringScrollRef.current) {
      const distanceFromBottom = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;

      const isFullLoad = threadMessages.length >= 10;
      if ((!initialScrollDoneRef.current.has(selectedThreadId) && isFullLoad) || distanceFromBottom < 150) {
        const targetThreadId = selectedThreadId;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (scrollerRef.current && targetThreadId === selectedThreadId) {
              scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
              initialScrollDoneRef.current.add(targetThreadId);
            }
          });
        });
      }
    }

    prevOldestMsgIdRef.current = currentOldestId;
    prevScrollHeightRef.current = scroller.scrollHeight;
  }, [threadMessages, selectedThreadId]);

  // Detect scroll to top → load older messages
  const handleScroll = React.useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !selectedThreadId) return;
    if (scroller.scrollTop < 200) {
      if (hasMoreByThread[selectedThreadId] && !loadingMoreByThread[selectedThreadId]) {
        prevScrollHeightRef.current = scroller.scrollHeight;
        isRestoringScrollRef.current = true;
        onFetchOlder(selectedThreadId);
      }
    }
  }, [selectedThreadId, hasMoreByThread, loadingMoreByThread, onFetchOlder]);
*/  

const scrollToBottom = React.useCallback((behavior: ScrollBehavior) => {
    if (scrollerRef.current && bottomRef.current) scrollerRef.current.scrollTo({ top: bottomRef.current.offsetTop, behavior });
  }, []);
  React.useEffect(() => scrollToBottom("auto"), [selectedThreadId, scrollToBottom]);
  React.useEffect(() => scrollToBottom("smooth"), [threadMessages.length, scrollToBottom]);

  const userById = React.useMemo(() => {
    const map = new Map<ID, User>(users.map((u) => [u.id, u]));
    if (!map.has(meId)) map.set(meId, me);
    return map;
  }, [users, meId, me]);

  const selectedThread = React.useMemo(() => (selectedThreadId ? threads.find((t) => t.id === selectedThreadId) ?? null : null), [threads, selectedThreadId]);
  const isGroupThread = (t: Thread) => t.participantIds.length > 2;
  const otherUser = React.useMemo(() => {
    if (!selectedThread) return null;
    if (isGroupThread(selectedThread)) return null;
    const otherId = selectedThread.participantIds.find((id) => id !== meId);
    return otherId ? userById.get(otherId) ?? null : null;
  }, [selectedThread, userById, meId]);
  const groupParticipants = React.useMemo(() => {
    if (!selectedThread || !isGroupThread(selectedThread)) return [];
    return selectedThread.participantIds
      .filter((id) => id !== meId)
      .map((id) => userById.get(id))
      .filter((u): u is User => !!u);
  }, [selectedThread, userById, meId]);

  const myNoteText = notes.find((n) => n.userId === meId)?.text ?? "";
  const requestsCount = threads.filter((t) => t.isRequest).length;

  const togglePinThread = React.useCallback((threadId: ID) => {
    setPinnedThreadIds((prev) => {
      const next = new Set(prev);
      if (next.has(threadId)) {
        next.delete(threadId);
      } else if (prev.size < 3) {
        next.add(threadId);
      }
      return next;
    });
    setPinnedOrder((prev) => {
      if (prev.includes(threadId)) return prev.filter((id) => id !== threadId);
      return prev.length >= 3 ? prev : [threadId, ...prev];
    });
  }, []);

  const visibleThreads = React.useMemo(() => {
    const q = threadSearch.trim().toLowerCase();
    const base = threads
      .filter((t) => (activeTab === "requests" ? !!t.isRequest : !t.isRequest))
      .filter((t) => !reportedThreadIds.has(t.id))
      .filter((t) => !leftGroupThreadIds.has(t.id))
      .filter((t) => {
        if (isGroupThread(t)) {
          const hasBlocked = t.participantIds.some((id) => id !== meId && blockedUserIds.has(id));
          if (hasBlocked) return false;
          if (!q) return true;
          const names = t.participantIds.map((id) => userById.get(id)?.displayName ?? userById.get(id)?.username ?? "").join(" ");
          const recent = allMessages.filter((m) => m.threadId === t.id).sort((a, b) => b.createdAt - a.createdAt).slice(0, 25).map((m) => m.text).join(" ");
          return `${t.name ?? "Group"} ${names} ${recent}`.toLowerCase().includes(q);
        }
        const otherId = t.participantIds.find((id) => id !== meId);
        if (!otherId || blockedUserIds.has(otherId)) return false;
        if (!q) return true;
        const other = userById.get(otherId);
        const who = other ? `${other.displayName} @${other.username}` : "";
        const recent = allMessages.filter((m) => m.threadId === t.id).sort((a, b) => b.createdAt - a.createdAt).slice(0, 25).map((m) => m.text).join(" ");
        return `${who} ${recent}`.toLowerCase().includes(q);
      });
    const pinnedRank = (id: ID) => {
      if (!pinnedThreadIds.has(id)) return null;
      const idx = pinnedOrder.indexOf(id);
      return idx === -1 ? 999 : idx;
    };
    return base.sort((a, b) => {
      const ar = pinnedRank(a.id);
      const br = pinnedRank(b.id);
      if (ar !== null || br !== null) {
        if (ar === null) return 1;
        if (br === null) return -1;
        if (ar !== br) return ar - br;
      }
      const au = isThreadUnread(allMessages, a.id, meId) ? 1 : 0;
      const bu = isThreadUnread(allMessages, b.id, meId) ? 1 : 0;
      if (au !== bu) return bu - au;
      return b.updatedAt - a.updatedAt;
    });
  }, [threads, activeTab, reportedThreadIds, leftGroupThreadIds, blockedUserIds, threadSearch, userById, allMessages, meId, pinnedThreadIds, pinnedOrder]);

  const selectedDraft = selectedThreadId ? draftByThreadId[selectedThreadId] ?? emptyDraft() : emptyDraft();
  const setDraft = React.useCallback((updater: (prev: DraftState) => DraftState) => {
    if (!selectedThreadId) return;
    setDraftByThreadId((prev) => ({ ...prev, [selectedThreadId]: updater(prev[selectedThreadId] ?? emptyDraft()) }));
  }, [selectedThreadId]);

  const addFiles = React.useCallback((files: FileList | File[]) => {
    const arr = Array.from(files);
    if (!arr.length) return;
    setDraft((prev) => ({ ...prev, files: [...prev.files, ...arr].slice(0, 12) }));
  }, [setDraft]);

  const addGif = React.useCallback((url: string) => {
    setDraft((prev) => ({ ...prev, gifs: [...prev.gifs, { id: `gif_${Date.now()}`, type: "image" as const, name: "GIF", url }].slice(0, 12) }));
  }, [setDraft]);

  const handleSend = React.useCallback(async () => {
    if (!selectedThread || !selectedThreadId) return;
    const text = selectedDraft.text.trim();
    const gifUrls = selectedDraft.gifs.map((g) => g.url);
    const fileUrls = selectedDraft.files.map((f) => URL.createObjectURL(f));
    const urls = [...gifUrls, ...fileUrls];
    selectedDraft.files.forEach((f, i) => {
      if (f.type.startsWith("audio/")) {
        const blobUrl = fileUrls[i];
        urlToDurationRef.current[blobUrl] = voiceDurationsByFileName.current[f.name] ?? 0;
        sentVoiceFileByUrlRef.current[blobUrl] = f;
      }
    });
    if (!text && urls.length === 0) return;
    const sentAt = Date.now();
    lastSentBlobUrlsRef.current[selectedThread.id] = { urls, sentAt };
    await onSend(selectedThread.id, text || "", urls.length ? urls : undefined);
    setDraftByThreadId((prev) => ({ ...prev, [selectedThreadId]: emptyDraft() }));
  }, [selectedThread, selectedThreadId, selectedDraft, onSend]);

  const openReport = () => { setReportReason(""); setReportDetails(""); setReportOpen(true); };
  const submitReport = () => {
    if (selectedThread) { setReportedThreadIds((prev) => new Set([...prev, selectedThread.id])); onSelectedThreadIdChange(null); setReportOpen(false); onRefresh(); }
  };
  const handleBlock = () => { if (otherUser) { setBlockedUserIds((prev) => new Set([...prev, otherUser.id])); onSelectedThreadIdChange(null); onRefresh(); } };
  const leaveGroup = () => {
    if (!selectedThread || !isGroupThread(selectedThread)) return;
    setLeftGroupThreadIds((prev) => new Set([...prev, selectedThread.id]));
    setMenuAnchor(null);
    onSelectedThreadIdChange(null);
    onRefresh();
  };
  const acceptRequest = (threadId: ID) => { onSelectedThreadIdChange(threadId); setActiveTab("messages"); onRefresh(); };
  const deleteThread = (threadId: ID) => {
    setDraftByThreadId((prev) => { const c = { ...prev }; delete c[threadId]; return c; });
    if (selectedThreadId === threadId) onSelectedThreadIdChange(null);
    onRefresh();
  };

  return (
    <Box sx={{ display: "flex", bgcolor: "#fafafb", height: "100vh", overflow: "hidden" }}>
      <DashboardSidebar drawerWidth={DRAWER_WIDTH} onLogout={() => router.push("/")} />
      <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }, p: 3, height: "100vh", overflow: "hidden", display: "flex", minWidth: 0 }}>
        <Paper elevation={0} sx={{ width: "100%", height: "100%", minHeight: 0, maxHeight: "100%", borderRadius: 3, overflow: "hidden", bgcolor: "white", border: "1px solid rgba(0,0,0,0.08)", display: "grid", gridTemplateColumns: { xs: "1fr", md: "420px 1fr" }, gridTemplateRows: "1fr" }}>
          {/* Sidebar */}
          <Box sx={{ borderRight: "1px solid rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", minHeight: 0, minWidth: 0, overflow: "hidden", bgcolor: "white" }}>
            <Box sx={{ px: 2, py: 1.25, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Stack direction="row" alignItems="center" spacing={1.2} sx={{ minWidth: 0 }}>
                <Avatar src={me.avatarUrl} sx={{ width: 34, height: 34, bgcolor: "white", border: "1px solid rgba(0,0,0,0.12)" }} />
                <Stack direction="row" spacing={0.25} alignItems="center" sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 1000, fontSize: 16 }} noWrap>{me.username}</Typography>
                  <Tooltip title="Message settings">
                    <IconButton size="small" onClick={() => { setSettingsTab("pins"); setSettingsOpen(true); }} sx={{ borderRadius: 2 }}>
                      <SettingsIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
              <Stack direction="row" spacing={0.5}>
                {onCreateGroup != null && (
                  <Tooltip title="Create group">
                    <IconButton onClick={() => setCreateGroupOpen(true)} sx={{ borderRadius: 2 }} size="small"><GroupAddIcon /></IconButton>
                  </Tooltip>
                )}
                <Tooltip title="New message"><IconButton onClick={() => setNewMsgOpen(true)} sx={{ borderRadius: 2 }}><ChatIcon /></IconButton></Tooltip>
              </Stack>
            </Box>
            <Box sx={{ px: 2, pb: 1 }}>
              <TextField value={threadSearch} onChange={(e) => setThreadSearch(e.target.value)} placeholder="Search conversations" fullWidth size="small" InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "rgba(0,0,0,0.45)" }} />, sx: { bgcolor: "rgba(0,0,0,0.04)", borderRadius: 999 } }} />
            </Box>
            <Box sx={{ display: "flex", gap: 2, px: 2, py: 1.25, overflowX: "auto" }}>
              {[...notes].sort((a, b) => b.updatedAt - a.updatedAt).map((n) => {
                const u = userById.get(n.userId);
                if (!u) return null;
                const isMe = n.userId === meId;
                return (
                  <Box key={n.id} onClick={() => (n.userId === meId ? setNoteOpen(true) : onPickUser(n.userId))} sx={{ minWidth: 84, cursor: "pointer", userSelect: "none", textAlign: "center" }}>
                    <Avatar src={u.avatarUrl} sx={{ width: 56, height: 56, mx: "auto", border: isMe ? `2px solid ${RED}` : "2px solid rgba(0,0,0,0.12)", bgcolor: "white" }} />
                    <Typography sx={{ mt: 0.75, fontSize: 12, fontWeight: 700 }}>{isMe ? "Your note" : u.displayName.split(" ")[0]}</Typography>
                    <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.55)" }} noWrap>{n.text}</Typography>
                  </Box>
                );
              })}
            </Box>
            <Box sx={{ px: 2, pt: 0.25 }}>
              <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth" sx={{ "& .MuiTab-root": { textTransform: "none", fontWeight: 900, minHeight: 40, fontSize: 13 }, "& .MuiTabs-indicator": { bgcolor: RED, height: 3, borderRadius: 999 } }}>
                <Tab value="messages" label="Messages" />
                <Tab value="requests" label={`Requests (${requestsCount})`} />
              </Tabs>
            </Box>
            <Divider />
            <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", ...scrollBarSx }}>
              <List sx={{ px: 1.2, py: 1 }}>
                {visibleThreads.map((t) => {
                  const isGroup = isGroupThread(t);
                  const otherId = t.participantIds.find((id) => id !== meId);
                  const other = otherId ? userById.get(otherId) : null;
                  if (!isGroup && !other) return null;
                  const last = getLastMessage(allMessages, t.id);
                  const unread = isThreadUnread(allMessages, t.id, meId);
                  const lastText = last?.text || (last?.attachments?.length ? "Sent an attachment" : "Say hi");
                  const displayName = isGroup ? (t.name ?? "Group chat") : (other?.displayName ?? "");
                  const avatarSlot = isGroup ? (
                    <Box sx={{ position: "relative", width: 44, height: 44, mr: 1.5 }}>
                      <GroupsIcon sx={{ fontSize: 40, color: "rgba(0,0,0,0.35)" }} />
                    </Box>
                  ) : (
                    <Avatar src={other!.avatarUrl} sx={{ width: 44, height: 44, bgcolor: "white" }} />
                  );
                  return (
                    <Box key={t.id} sx={{ mb: 0.4 }}>
                      <ListItemButton selected={selectedThreadId === t.id} onClick={() => onSelectedThreadIdChange(t.id)} sx={{ borderRadius: 2.5, py: 1.0, "&.Mui-selected": { bgcolor: "rgba(0,0,0,0.06)" }, "&:hover": { bgcolor: "rgba(0,0,0,0.04)" } }}>
                        <Badge variant="dot" invisible={!unread} overlap="circular" sx={{ mr: 1.5, "& .MuiBadge-badge": { bgcolor: "#1d4ed8", width: 10, height: 10, borderRadius: 999, border: "2px solid white" } }}>
                          {avatarSlot}
                        </Badge>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography sx={{ fontWeight: unread ? 1000 : 900 }} noWrap>{displayName}</Typography>
                            <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.55)" }}>{nowMs && last ? formatAgo(nowMs, last.createdAt) : ""}</Typography>
                          </Stack>
                          <Typography sx={{ fontSize: 13, color: unread ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.60)", fontWeight: unread ? 900 : 700 }} noWrap>{lastText}</Typography>
                        </Box>
                        <Tooltip title={pinnedThreadIds.has(t.id) ? "Unpin" : pinnedThreadIds.size >= 3 ? "Max 3 pins" : "Pin"}>
                          <span>
                            <IconButton
                              size="small"
                              onClick={(e) => { e.stopPropagation(); togglePinThread(t.id); }}
                              disabled={!pinnedThreadIds.has(t.id) && pinnedThreadIds.size >= 3}
                              sx={{ ml: 0.5, opacity: 0.85 }}
                            >
                              {pinnedThreadIds.has(t.id) ? <PushPinIcon fontSize="small" /> : <PushPinOutlinedIcon fontSize="small" />}
                            </IconButton>
                          </span>
                        </Tooltip>
                      </ListItemButton>
                      {t.isRequest && activeTab === "requests" && (
                        <Stack direction="row" spacing={1} sx={{ mt: 0.6, px: 1.2 }}>
                          <Button startIcon={<CheckCircleIcon />} onClick={() => acceptRequest(t.id)} variant="contained" sx={{ flex: 1, bgcolor: RED, fontWeight: 900, textTransform: "none", borderRadius: 999 }}>Respond</Button>
                          <Button startIcon={<DeleteIcon />} onClick={() => deleteThread(t.id)} variant="outlined" sx={{ fontWeight: 900, textTransform: "none", borderRadius: 999 }}>Delete</Button>
                          <Button startIcon={<ReportIcon />} onClick={() => { onSelectedThreadIdChange(t.id); openReport(); }} variant="outlined" sx={{ fontWeight: 900, textTransform: "none", borderRadius: 999 }}>Report</Button>
                        </Stack>
                      )}
                    </Box>
                  );
                })}
              </List>
            </Box>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0, overflow: "hidden", bgcolor: "white" }}>
            <Box sx={{ px: 2, py: 1.25, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.08)", minHeight: 58 }}>
              <Stack direction="row" alignItems="center" spacing={1.2}>
                <IconButton onClick={() => onSelectedThreadIdChange(null)} sx={{ display: { xs: "inline-flex", md: "none" } }}><ArrowBackIcon /></IconButton>
                {selectedThread && isGroupThread(selectedThread) ? (
                  <>
                    <GroupsIcon sx={{ fontSize: 32, color: "rgba(0,0,0,0.4)" }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 1000, fontSize: 16 }} noWrap>{selectedThread.name ?? "Group chat"}</Typography>
                      <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.55)" }} noWrap>{groupParticipants.map((p) => p.displayName).join(", ")}</Typography>
                    </Box>
                  </>
                ) : otherUser ? (
                  <>
                    <Avatar src={otherUser.avatarUrl} sx={{ bgcolor: "white" }} />
                    <Box>
                      <Typography sx={{ fontWeight: 1000, fontSize: 16 }}>{otherUser.displayName}</Typography>
                      <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.55)" }}>{nowMs ? activityText(nowMs, otherUser.lastActiveAt) : ""}</Typography>
                    </Box>
                  </>
                ) : (
                  <Box>
                    <Typography sx={{ fontWeight: 1000, fontSize: 16 }}>Your messages</Typography>
                    <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.55)" }}>Select a conversation.</Typography>
                  </Box>
                )}
              </Stack>
              {(otherUser || (selectedThread && isGroupThread(selectedThread))) && (
                <>
                  <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}><MoreHorizIcon /></IconButton>
                  <Menu open={!!menuAnchor} anchorEl={menuAnchor} onClose={() => setMenuAnchor(null)}>
                    <MenuItem onClick={() => { setMenuAnchor(null); openReport(); }}>Report</MenuItem>
                    {otherUser ? (
                      <MenuItem onClick={() => { setMenuAnchor(null); handleBlock(); }} sx={{ color: "#b91c1c", fontWeight: 900 }}>Block</MenuItem>
                    ) : (
                      <MenuItem onClick={leaveGroup} sx={{ color: "#b91c1c", fontWeight: 900 }}>Leave group</MenuItem>
                    )}
                  </Menu>
                </>
              )}
            </Box>
            <Box
              ref={scrollerRef}
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                overflowX: "hidden",
                px: 2.5,
                py: 2,
                ...scrollBarSx,
                ...(selectedThreadId && backgroundByThreadId[selectedThreadId]
                  ? {
                      backgroundImage: `url(${BACKGROUNDS.find((b) => b.id === backgroundByThreadId[selectedThreadId])?.src})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }
                  : {}),
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); if (selectedThread) addFiles(e.dataTransfer.files); }}
            >
              {!selectedThread || (!otherUser && !isGroupThread(selectedThread)) ? (
                <Box sx={{ height: "100%", display: "grid", placeItems: "center", textAlign: "center" }}>
                  <Box>
                    <Box sx={{ width: 84, height: 84, borderRadius: "50%", border: "2px solid rgba(0,0,0,0.18)", display: "grid", placeItems: "center", mx: "auto", mb: 2 }}><SendIcon sx={{ fontSize: 38, color: "rgba(0,0,0,0.55)" }} /></Box>
                    <Typography sx={{ fontWeight: 1000, fontSize: 20 }}>Your messages</Typography>
                    <Typography sx={{ color: "rgba(0,0,0,0.60)", mt: 0.7 }}>Send a message to start a chat.</Typography>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ ...(selectedThreadId && backgroundByThreadId[selectedThreadId] ? { bgcolor: "rgba(255,255,255,0.78)", backdropFilter: "blur(1px)", borderRadius: 2, px: 1.5, py: 1.25 } : {}) }}>
                  {selectedThread.isRequest && (
                    <Box sx={{ mb: 2, p: 1.4, borderRadius: 2, bgcolor: "rgba(168,5,50,0.07)", border: "1px solid rgba(168,5,50,0.18)" }}>
                      <Typography sx={{ fontWeight: 1000 }}>Message request</Typography>
                      <Typography sx={{ color: "rgba(0,0,0,0.65)", fontSize: 13 }}>You can respond, delete, or report this request.</Typography>
                    </Box>
                  )}
                  <Stack spacing={1.25}>
                    {threadMessages.map((m) => {
                      const mine = m.fromUserId === meId;
                      return (
                        <Box key={m.id} sx={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
                          <Box sx={{ maxWidth: "78%", px: 1.6, py: 1.1, borderRadius: 3, bgcolor: mine ? "rgba(168,5,50,0.10)" : "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.06)", whiteSpace: "pre-wrap", fontSize: 14 }}>
                            {!!m.text && <Box>{m.text}</Box>}
                            {!!m.attachments?.length && (
                              <Stack spacing={1} sx={{ mt: m.text ? 1 : 0 }}>
                                {m.attachments.map((a, attachmentIndex) => {
                                  const name = (a.name || "").toLowerCase();
                                  const isVoice =
                                    a.type === "audio" ||
                                    name.endsWith(".webm") ||
                                    name.endsWith(".ogg") ||
                                    name.endsWith(".mp4") ||
                                    name.includes("voice") ||
                                    urlToDurationRef.current[a.url] !== undefined;

                                  const sentBlobEntry = lastSentBlobUrlsRef.current[m.threadId];
                                  const isRecentSend =
                                    !!sentBlobEntry && Math.abs(m.createdAt - sentBlobEntry.sentAt) < 20000;

                                  const fallbackUrl = isRecentSend ? sentBlobEntry?.urls[attachmentIndex] : undefined;

                                  const voiceUrl = isRecentSend && fallbackUrl ? fallbackUrl : a.url;
                                  const voiceDuration =
                                    urlToDurationRef.current[voiceUrl] ?? urlToDurationRef.current[a.url];

                                  return (
                                    <Box key={a.id}>
                                      {isVoice ? (
                                        voiceUrl ? (
                                          <VoiceMessageBubble
                                            url={voiceUrl}
                                            mine={mine}
                                            initialDuration={voiceDuration}
                                            sourceFile={mine ? sentVoiceFileByUrlRef.current[voiceUrl] : undefined}
                                          />
                                        ) : (
                                          <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.6)" }}>
                                            Voice message
                                          </Typography>
                                        )
                                      ) : a.type === "image" ? (
                                        <Box
                                          component="img"
                                          src={a.url}
                                          alt={a.name}
                                          onClick={() => setImgView({ open: true, url: a.url, name: a.name })}
                                          sx={{
                                            width: 220,
                                            maxWidth: "100%",
                                            borderRadius: 2,
                                            border: "1px solid rgba(0,0,0,0.10)",
                                            cursor: "zoom-in",
                                          }}
                                        />
                                      ) : (
                                        <Chip
                                          label={a.name?.startsWith("blob:") ? "Attachment" : a.name || "File"}
                                          icon={<AttachFileIcon />}
                                          variant="outlined"
                                          sx={{ fontWeight: 800 }}
                                          component="a"
                                          href={a.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          clickable
                                        />
                                      )}
                                    </Box>
                                  );
                                })}
                              </Stack>
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                    <Box ref={bottomRef} />
                  </Stack>
                </Box>
              )}
            </Box>
            <Box sx={{ borderTop: "1px solid rgba(0,0,0,0.08)", px: 2, py: 1.25, bgcolor: "white" }}>
              {(selectedDraft.files.length > 0 || selectedDraft.gifs.length > 0) && (
                <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap" }}>
                  {selectedDraft.files.map((f, idx) => <Chip key={`${f.name}-${idx}`} label={f.type.startsWith("audio/") ? "Voice message" : f.name} onDelete={() => setDraft((p) => ({ ...p, files: p.files.filter((_, i) => i !== idx) }))} sx={{ fontWeight: 800 }} />)}
                  {selectedDraft.gifs.map((g, idx) => <Chip key={`${g.id}-${idx}`} label="GIF" onDelete={() => setDraft((p) => ({ ...p, gifs: p.gifs.filter((_, i) => i !== idx) }))} sx={{ fontWeight: 900 }} />)}
                </Stack>
              )}
              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton component="label" disabled={!selectedThread} title="Attach file"><AttachFileIcon /><input hidden type="file" multiple accept="image/*,audio/*,application/pdf" onChange={(e) => { if (e.target.files) { addFiles(e.target.files); e.currentTarget.value = ""; } }} /></IconButton>
                <VoiceMessageButton disabled={!selectedThread} onVoiceRecorded={(file, durationSec) => { voiceDurationsByFileName.current[file.name] = durationSec; addFiles([file]); }} />
                <IconButton disabled={!selectedThread} onClick={() => setGifOpen(true)} title="GIFs"><GifBoxIcon /></IconButton>
                <TextField value={selectedDraft.text} onChange={(e) => setDraft((p) => ({ ...p, text: e.target.value }))} placeholder={selectedThread ? "Message..." : "Select a conversation to message"} fullWidth size="small" disabled={!selectedThread} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }} InputProps={{ sx: { borderRadius: 999, bgcolor: "rgba(0,0,0,0.03)", "& fieldset": { borderColor: "rgba(0,0,0,0.10)" } } }} />
                <IconButton onClick={handleSend} disabled={!selectedThread} title="Send"><SendIcon sx={{ color: selectedThread ? RED : "rgba(0,0,0,0.25)" }} /></IconButton>
              </Stack>
            </Box>
          </Box>
        </Paper>
      </Box>

      <MessagesDialogs
        newMsgOpen={newMsgOpen}
        noteOpen={noteOpen}
        gifOpen={gifOpen}
        imgView={imgView}
        reportOpen={reportOpen}
        reportReason={reportReason}
        reportDetails={reportDetails}
        myNoteText={myNoteText}
        users={users}
        meId={meId}
        blockedUserIds={blockedUserIds}
        gifFavorites={gifFavorites}
        onCloseNewMsg={() => setNewMsgOpen(false)}
        onCloseNote={() => setNoteOpen(false)}
        onCloseGif={() => setGifOpen(false)}
        onCloseImgView={() => setImgView({ open: false, url: "", name: "" })}
        onCloseReport={() => setReportOpen(false)}
        onPickUser={(id) => { onPickUser(id); setNewMsgOpen(false); }}
        onSaveNote={(text) => { onUpdateNote(text.slice(0, 60)); setNoteOpen(false); }}
        onAddGif={addGif}
        onToggleGifFav={(url) =>
          setGifFavorites((prev) => {
            if (prev.includes(url)) return prev.filter((x) => x !== url);
            return Array.from(new Set([...prev, url]));
          })
        }
        onReportReason={setReportReason}
        onReportDetails={setReportDetails}
        onSubmitReport={submitReport}
        createGroupOpen={createGroupOpen}
        onCloseCreateGroup={() => setCreateGroupOpen(false)}
        onCreateGroup={onCreateGroup}
      />

      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 1000 }}>Message settings</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Tabs
            value={settingsTab}
            onChange={(_, v) => setSettingsTab(v)}
            variant="fullWidth"
            sx={{ "& .MuiTab-root": { textTransform: "none", fontWeight: 900 }, "& .MuiTabs-indicator": { bgcolor: RED, height: 3, borderRadius: 999 } }}
          >
            <Tab value="pins" label="Pins" />
            <Tab value="backgrounds" label="Backgrounds" />
            <Tab value="blocked" label="Blocked" />
          </Tabs>
          <Divider sx={{ my: 1.5 }} />

          {settingsTab === "blocked" && (
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 900, color: "rgba(0,0,0,0.65)", mb: 1 }}>Blocked users</Typography>
              {Array.from(blockedUserIds).length === 0 ? (
                <Typography sx={{ color: "rgba(0,0,0,0.6)" }}>You haven't blocked anyone.</Typography>
              ) : (
                <List sx={{ p: 0, maxHeight: 360, overflow: "auto" }}>
                  {Array.from(blockedUserIds).map((id) => {
                    const u = userById.get(id);
                    if (!u) return null;
                    return (
                      <ListItemButton key={id} sx={{ borderRadius: 2 }}>
                        <Avatar src={u.avatarUrl} sx={{ mr: 1.5, bgcolor: "white" }} />
                        <ListItemText primary={<Typography sx={{ fontWeight: 900 }}>{u.displayName}</Typography>} secondary={`@${u.username}`} />
                        <Button
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBlockedUserIds((prev) => {
                              const next = new Set(prev);
                              next.delete(id);
                              return next;
                            });
                          }}
                          sx={{ borderRadius: 999, fontWeight: 900, textTransform: "none" }}
                        >
                          Unblock
                        </Button>
                      </ListItemButton>
                    );
                  })}
                </List>
              )}
            </Box>
          )}

          {settingsTab === "pins" && (
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 900, color: "rgba(0,0,0,0.65)" }}>Pinned chats (max 3)</Typography>
                <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.55)", fontWeight: 800 }}>{pinnedThreadIds.size}/3</Typography>
              </Stack>
              <List sx={{ p: 0, maxHeight: 360, overflow: "auto" }}>
                {threads.filter((t) => t.participantIds.includes(meId)).map((t) => {
                  const isGroup = isGroupThread(t);
                  const title = isGroup
                    ? (t.name ?? "Group chat")
                    : (userById.get(t.participantIds.find((id) => id !== meId) ?? "")?.displayName ?? "Chat");
                  const disabled = !pinnedThreadIds.has(t.id) && pinnedThreadIds.size >= 3;
                  return (
                    <ListItemButton
                      key={t.id}
                      onClick={() => { if (!disabled || pinnedThreadIds.has(t.id)) togglePinThread(t.id); }}
                      sx={{ borderRadius: 2 }}
                      disabled={disabled}
                    >
                      {isGroup ? (
                        <GroupsIcon sx={{ mr: 1.5, color: "rgba(0,0,0,0.45)" }} />
                      ) : (
                        <Avatar src={userById.get(t.participantIds.find((id) => id !== meId) ?? "")?.avatarUrl} sx={{ mr: 1.5, bgcolor: "white", width: 34, height: 34 }} />
                      )}
                      <ListItemText primary={<Typography sx={{ fontWeight: 900 }}>{title}</Typography>} />
                      {pinnedThreadIds.has(t.id) ? <PushPinIcon fontSize="small" /> : <PushPinOutlinedIcon fontSize="small" />}
                    </ListItemButton>
                  );
                })}
              </List>
            </Box>
          )}

          {settingsTab === "backgrounds" && (
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 900, color: "rgba(0,0,0,0.65)", mb: 1 }}>Chat backgrounds</Typography>
              {!selectedThreadId ? (
                <Typography sx={{ color: "rgba(0,0,0,0.6)" }}>Select a conversation to set its background.</Typography>
              ) : (
                <>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <WallpaperIcon sx={{ color: "rgba(0,0,0,0.45)" }} />
                    <Typography sx={{ fontWeight: 900 }} noWrap>
                      {selectedThread?.name ?? otherUser?.displayName ?? "Chat"}
                    </Typography>
                    <Box sx={{ flex: 1 }} />
                    <Button
                      variant="outlined"
                      onClick={() => setBackgroundByThreadId((prev) => ({ ...prev, [selectedThreadId]: null }))}
                      sx={{ borderRadius: 999, fontWeight: 900, textTransform: "none" }}
                    >
                      Clear
                    </Button>
                  </Stack>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.25 }}>
                    {BACKGROUNDS.map((b) => {
                      const selected = backgroundByThreadId[selectedThreadId] === b.id;
                      return (
                        <Box
                          key={b.id}
                          onClick={() => setBackgroundByThreadId((prev) => ({ ...prev, [selectedThreadId]: b.id }))}
                          sx={{
                            cursor: "pointer",
                            borderRadius: 2,
                            overflow: "hidden",
                            border: selected ? `2px solid ${RED}` : "1px solid rgba(0,0,0,0.12)",
                            bgcolor: "rgba(0,0,0,0.02)",
                          }}
                        >
                          <Box component="img" src={b.src} alt={b.label} sx={{ width: "100%", height: 90, objectFit: "cover", display: "block" }} />
                          <Box sx={{ px: 1, py: 0.8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <Typography sx={{ fontSize: 12, fontWeight: 900 }}>{b.label}</Typography>
                            {selected ? <CheckCircleIcon sx={{ fontSize: 18, color: RED }} /> : null}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSettingsOpen(false)} sx={{ fontWeight: 900, textTransform: "none" }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
