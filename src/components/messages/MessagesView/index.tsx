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
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Switch,
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
import EditIcon from "@mui/icons-material/Edit";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import GroupsIcon from "@mui/icons-material/Groups";
import SettingsIcon from "@mui/icons-material/Settings";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import WallpaperIcon from "@mui/icons-material/Wallpaper";
import { RED, DRAWER_WIDTH } from "../constants";
import {
  panelScrollSx,
  scrollBarSx,
  formatAgo,
  activityText,
  getLastMessage,
  isThreadUnread,
  isGroupThread,
  emptyDraft,
  type DraftState,
} from "../utils";
import {
  loadMessageChatPreferences,
  saveMessageChatPreferences,
  notifyMessageChatPreferencesChanged,
  serializeMessageChatPreferences,
  MESSAGE_PREFS_CHANGED_EVENT,
  type MessageChatPreferences,
} from "@/lib/messageChatPreferences";
import MessagesDialogs from "../MessagesDialogs";
import VoiceMessageButton from "../VoiceMessageButton";
import { useToast, Toast } from "../Toast";
import Grainient from "../backgroundanimations/Grainient";
import GridScan from "../backgroundanimations/GridScan";
import Lightning from "../backgroundanimations/Lightning";
import Particles from "../backgroundanimations/Particles";
import { BACKGROUNDS, hexToHue, type AnimatedBg } from "./backgrounds";
import { VoiceMessageBubble } from "./VoiceMessageBubble";
import { api } from "@/lib/axios";


const DashboardSidebar = dynamic(() => import("@/components/dashboard/sidebar"), {
  ssr: false,
  loading: () => <Box sx={{ width: 220, flexShrink: 0, height: "100vh", borderRight: "1px solid rgba(0,0,0,0.08)", bgcolor: "white" }} />,
});

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

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
  onSend: (threadId: string, text: string, attachments?: { type: string; fileName: string; fileUrl: string; fileSize: number }[]) => void | Promise<void>;
  onUpdateNote: (text: string) => void | Promise<void>;
  onPickUser: (userId: ID) => void | Promise<void>;
  onCreateGroup?: (participantIds: ID[], name: string, groupPictureUrl?: string) => void | Promise<void>;
  groupPictureByThreadId?: Record<string, string>;
  onRefresh: () => void;
  onEditMessage: (messageId: string, newText: string) => void | Promise<void>;
  onDeleteMessage: (messageId: string) => void | Promise<void>;
  onTypingStart: (threadId: string) => void;
  onTypingStop: (threadId: string) => void;
  typingByThread: Record<string, string | null>;
  readReceiptsByThread: Record<string, { userId: string; messageId: string }>;
  onReactMessage: (messageId: string, emoji: string) => void;
  reactionsByMessage: Record<string, { emoji: string; userId: string }[]>;
  onSearchUsers: (q: string) => Promise<User[]>;
  hasMoreByThread: Record<string, boolean>;
  loadingMoreByThread: Record<string, boolean>;
  onFetchOlder: (threadId: string) => void;
  uploadAttachment: (threadId: string, file: File) => Promise<{ fileUrl: string; fileName: string; fileSize: number; type: string } | null>;
  onLeaveGroup: (threadId: string) => Promise<void>;
  loadingThreadId: string | null;
  blockedUserIds: Set<ID>;
  blockUser: (userId: ID) => Promise<void>;
  unblockUser: (userId: ID) => Promise<void>;
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
    groupPictureByThreadId = {},
    onRefresh,
    onEditMessage,
    onDeleteMessage,
    onReactMessage,
    typingByThread,
    onTypingStart,
    onTypingStop,
    readReceiptsByThread,
    reactionsByMessage,
    onSearchUsers,
    hasMoreByThread,
    loadingMoreByThread,
    onFetchOlder,
    uploadAttachment,
    onLeaveGroup,
    loadingThreadId,
    blockedUserIds = new Set(),
    blockUser,
    unblockUser,
  } = props;

  const [activeTab, setActiveTab] = React.useState<"messages" | "requests">("messages");
  const [threadSearch, setThreadSearch] = React.useState("");
  const [reportedThreadIds, setReportedThreadIds] = React.useState<Set<ID>>(new Set());
  const [newMsgOpen, setNewMsgOpen] = React.useState(false);
  const [createGroupOpen, setCreateGroupOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [settingsTab, setSettingsTab] = React.useState<"backgrounds" | "pins" | "blocked" | "followers" | "notifications">("backgrounds");
  const [muteNotifications, setMuteNotifications] = React.useState(false);
  const [doNotDisturb, setDoNotDisturb] = React.useState(false);
  const [backgroundApplyToThreadIds, setBackgroundApplyToThreadIds] = React.useState<Set<ID>>(new Set());
  const [settingsFollowerQuery, setSettingsFollowerQuery] = React.useState("");
  const [pinnedThreadIds, setPinnedThreadIds] = React.useState<Set<ID>>(new Set());
  const [pinnedOrder, setPinnedOrder] = React.useState<ID[]>([]);
  const [backgroundByThreadId, setBackgroundByThreadId] = React.useState<Record<ID, number | null>>({});
  const [animatedBackgroundByThreadId, setAnimatedBackgroundByThreadId] = React.useState<Record<ID, AnimatedBg>>({});
  const [customBackgroundByThreadId, setCustomBackgroundByThreadId] = React.useState<Record<ID, string>>({});
  const [leftGroupThreadIds, setLeftGroupThreadIds] = React.useState<Set<ID>>(new Set());
  const [pendingAttachmentsByThreadId, setPendingAttachmentsByThreadId] = React.useState<Record<ID, { type: string; fileName: string; fileUrl: string; fileSize: number }[]>>({});
  const [reportInvolvedParties, setReportInvolvedParties] = React.useState<Set<ID>>(new Set());

  const prefsHydratedRef = React.useRef(false);
  const prefsSerializedRef = React.useRef("");

  React.useLayoutEffect(() => {
    const p = loadMessageChatPreferences();
    prefsSerializedRef.current = serializeMessageChatPreferences(p);
    setBackgroundByThreadId(p.backgroundByThreadId as Record<ID, number | null>);
    setAnimatedBackgroundByThreadId(p.animatedBackgroundByThreadId as Record<ID, AnimatedBg>);
    setCustomBackgroundByThreadId({ ...p.customBackgroundByThreadId });
    prefsHydratedRef.current = true;
  }, []);

  React.useEffect(() => {
    if (!prefsHydratedRef.current) return;
    const prefs: MessageChatPreferences = {
      blockedUserIds: Array.from(blockedUserIds),
      backgroundByThreadId: { ...backgroundByThreadId },
      animatedBackgroundByThreadId: { ...animatedBackgroundByThreadId },
      customBackgroundByThreadId: { ...customBackgroundByThreadId },
    };
    const next = serializeMessageChatPreferences(prefs);
    if (next === prefsSerializedRef.current) return;
    prefsSerializedRef.current = next;
    saveMessageChatPreferences(prefs);
    notifyMessageChatPreferencesChanged();
  }, [blockedUserIds, backgroundByThreadId, animatedBackgroundByThreadId, customBackgroundByThreadId]);

  React.useEffect(() => {
    const sync = () => {
      const p = loadMessageChatPreferences();
      const next = serializeMessageChatPreferences(p);
      if (next === prefsSerializedRef.current) return;
      prefsSerializedRef.current = next;
      setBackgroundByThreadId({ ...p.backgroundByThreadId } as Record<ID, number | null>);
      setAnimatedBackgroundByThreadId({ ...p.animatedBackgroundByThreadId } as Record<ID, AnimatedBg>);
      setCustomBackgroundByThreadId({ ...p.customBackgroundByThreadId });
    };
    window.addEventListener(MESSAGE_PREFS_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(MESSAGE_PREFS_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const [noteOpen, setNoteOpen] = React.useState(false);
  const [gifOpen, setGifOpen] = React.useState(false);
  const [imgView, setImgView] = React.useState({ open: false, url: "", name: "" });
  const [reportOpen, setReportOpen] = React.useState(false);
  const [reportDescription, setReportDescription] = React.useState("");
  const [reportRelationship, setReportRelationship] = React.useState("VICTIM");
  const [reportSubmitting, setReportSubmitting] = React.useState(false);
  const [reportSuccess, setReportSuccess] = React.useState<{ caseNumber: string } | null>(null);
  const [gifFavorites, setGifFavorites] = React.useState<string[]>([]);
  const toast = useToast();

  const [hoveredMsgId, setHoveredMsgId] = React.useState<ID | null>(null);
  const [msgMenuAnchor, setMsgMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [msgMenuTarget, setMsgMenuTarget] = React.useState<ID | null>(null);
  const [editingMsgId, setEditingMsgId] = React.useState<ID | null>(null);
  const [editingText, setEditingText] = React.useState("");
  const [emojiPickerMsgId, setEmojiPickerMsgId] = React.useState<ID | null>(null);

  const [readThreadIds, setReadThreadIds] = React.useState<Set<ID>>(new Set());
  React.useEffect(() => {
    if (selectedThreadId) setReadThreadIds((prev) => new Set([...prev, selectedThreadId]));
  }, [selectedThreadId]);
  React.useEffect(() => {
    if (selectedThreadId && threadMessages.length > 0) setReadThreadIds((prev) => new Set([...prev, selectedThreadId]));
  }, [selectedThreadId, threadMessages.length]);

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
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const prevScrollHeightRef = React.useRef<number>(0);
  const prevOldestMsgIdRef = React.useRef<string | null>(null);
  const isRestoringScrollRef = React.useRef<boolean>(false);
  const initialScrollDoneRef = React.useRef<Set<string>>(new Set());
  const voiceDurationsByFileName = React.useRef<Record<string, number>>({});
  const urlToDurationRef = React.useRef<Record<string, number>>({});
  const lastSentBlobUrlsRef = React.useRef<Record<string, { urls: string[]; sentAt: number }>>({});
  const sentVoiceFileByUrlRef = React.useRef<Record<string, File>>({});

  React.useEffect(() => { try { localStorage.setItem("cc_gif_favs", JSON.stringify(Array.from(new Set(gifFavorites)))); } catch {} }, [gifFavorites]);
  React.useEffect(() => {
    setNowMs(Date.now());
    const id = window.setInterval(() => setNowMs(Date.now()), 30000);
    return () => window.clearInterval(id);
  }, []);

  React.useEffect(() => {
    if (!selectedThreadId || !scrollerRef.current) return;
    scrollerRef.current.scrollTop = 0;
  }, [selectedThreadId]);

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

  const userById = React.useMemo(() => {
    const map = new Map<ID, User>(users.map((u) => [u.id, u]));
    if (!map.has(meId)) map.set(meId, me);
    return map;
  }, [users, meId, me]);

  const selectedThread = React.useMemo(() => (selectedThreadId ? threads.find((t) => t.id === selectedThreadId) ?? null : null), [threads, selectedThreadId]);
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

  const backgroundPreviewTid =
    backgroundApplyToThreadIds.size > 0 ? Array.from(backgroundApplyToThreadIds)[0]! : selectedThreadId;

  const myNoteText = notes.find((n) => n.userId === meId)?.text ?? "";
  const requestsCount = threads.filter((t) => t.isRequest).length;

  const togglePinThread = React.useCallback((threadId: ID) => {
    setPinnedThreadIds((prev) => {
      const next = new Set(prev);
      if (next.has(threadId)) next.delete(threadId);
      else if (prev.size < 3) next.add(threadId);
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
          if (!q) return true;
          const names = t.participantIds.map((id) => userById.get(id)?.displayName ?? userById.get(id)?.username ?? "").join(" ");
          const recent = allMessages.filter((m) => m.threadId === t.id).sort((a, b) => b.createdAt - a.createdAt).slice(0, 25).map((m) => m.text).join(" ");
          return `${t.name ?? "Group"} ${names} ${recent}`.toLowerCase().includes(q);
        }
        const otherId = t.participantIds.find((id) => id !== meId);
        if (!otherId) return false;
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
      const au = !readThreadIds.has(a.id) && isThreadUnread(allMessages, a.id, meId) ? 1 : 0;
      const bu = !readThreadIds.has(b.id) && isThreadUnread(allMessages, b.id, meId) ? 1 : 0;
      if (au !== bu) return bu - au;
      return b.updatedAt - a.updatedAt;
    });
  }, [threads, activeTab, reportedThreadIds, leftGroupThreadIds, blockedUserIds, threadSearch, userById, allMessages, meId, readThreadIds, pinnedThreadIds, pinnedOrder]);

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
    const pendingAttachments = pendingAttachmentsByThreadId[selectedThreadId] ?? [];
    if (!text && selectedDraft.files.length === 0 && pendingAttachments.length === 0) return;

    await onSend(selectedThread.id, text || "", pendingAttachments.length ? pendingAttachments as any : undefined);
    setDraftByThreadId((prev) => ({ ...prev, [selectedThreadId]: emptyDraft() }));
    setPendingAttachmentsByThreadId((prev) => ({ ...prev, [selectedThreadId]: [] }));
    onTypingStop(selectedThreadId);
  }, [selectedThread, selectedThreadId, selectedDraft, pendingAttachmentsByThreadId, onSend, onTypingStop]);

    const handleAttachFile = React.useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !selectedThreadId) return;
      e.target.value = "";

      const result = await uploadAttachment(selectedThreadId, file);
      if (!result) { toast.show("Upload failed", "error"); return; }

      setPendingAttachmentsByThreadId((prev) => ({
        ...prev,
        [selectedThreadId]: [...(prev[selectedThreadId] ?? []), result],
      }));
      setDraft((prev) => ({
        ...prev,
        files: [...prev.files, new File([file], result.fileName, { type: file.type })],
      }));
    }, [selectedThreadId, uploadAttachment, setDraft, toast]);

  const handleEditSubmit = React.useCallback(async () => {
    if (!editingMsgId || !editingText.trim()) return;
    await onEditMessage(editingMsgId, editingText);
    setEditingMsgId(null);
    setEditingText("");
  }, [editingMsgId, editingText, onEditMessage]);

  const openReport = () => {
    setReportDescription("");
    setReportRelationship("VICTIM");
    setReportSuccess(null);
    setReportInvolvedParties(otherUser ? new Set([otherUser.id]) : new Set());
    setReportOpen(true);
  };
  const submitReport = async () => {
    if (!selectedThread) return;
    setReportSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const lastMsg = threadMessages[threadMessages.length - 1];
      const incidentDate = lastMsg ? new Date(lastMsg.createdAt).toISOString() : new Date().toISOString();

      const involvedParties = Array.from(reportInvolvedParties).map((id) => {
        const u = userById.get(id);
        return {
          name: u?.displayName ?? "Unknown",
          description: `Reported user: @${u?.username ?? "unknown"}`,
          affiliation: "CSUN student",
          relationToReporter: "SUBJECT",
        };
      });

      const res = await api.post("/api/v1/security/reports", {
        reportType: "MISCONDUCT",
        title: "Private message misconduct",
        description: reportDescription,
        location: isGroupThread(selectedThread) ? `Group chat: ${selectedThread.name ?? "Group"}` : "Private message",
        incidentDate,
        reporterRelationship: reportRelationship,
        involvedParties,
      }, { headers: { Authorization: `Bearer ${token}` } });

      setReportSuccess({ caseNumber: res.data.caseNumber });
      setReportedThreadIds((prev) => new Set([...prev, selectedThread.id]));
    } catch (err) {
      toast.show("Failed to submit report", "error");
    } finally {
      setReportSubmitting(false);
    }
  };
  const handleBlock = () => { 
    if (otherUser) { 
      blockUser(otherUser.id);
      onRefresh(); 
    } 
  };
  const leaveGroup = async () => {
    if (!selectedThread || !isGroupThread(selectedThread)) return;
    await onLeaveGroup(selectedThread.id);
    setMenuAnchor(null);
    onRefresh();
  };

  const acceptRequest = (threadId: ID) => { onSelectedThreadIdChange(threadId); setActiveTab("messages"); onRefresh(); };
  const deleteThread = async (threadId: ID) => {
    setDraftByThreadId((prev) => { const c = { ...prev }; delete c[threadId]; return c; });
    if (selectedThreadId === threadId) onSelectedThreadIdChange(null);
    setLeftGroupThreadIds((prev) => new Set([...prev, threadId]));
    await onLeaveGroup(threadId);
  };

  const lastMyMessageId = React.useMemo(() => {
    const mine = [...threadMessages].reverse().find((m) => m.fromUserId === meId);
    return mine?.id ?? null;
  }, [threadMessages, meId]);

  const getGroupedReactions = React.useCallback((messageId: string) => {
    const reactions = reactionsByMessage[messageId] ?? [];
    const grouped: Record<string, { count: number; reactedByMe: boolean }> = {};
    for (const r of reactions) {
      if (!grouped[r.emoji]) grouped[r.emoji] = { count: 0, reactedByMe: false };
      grouped[r.emoji].count++;
      if (r.userId === meId) grouped[r.emoji].reactedByMe = true;
    }
    return grouped;
  }, [reactionsByMessage, meId]);

  const isBlocked = !!(otherUser && blockedUserIds.has(otherUser.id));

  return (
    <Box sx={{ display: "flex", bgcolor: "#fafafb", height: "100vh", overflow: "hidden" }}>
      <DashboardSidebar drawerWidth={DRAWER_WIDTH} onLogout={() => router.push("/")} />
      <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }, p: 3, height: "100vh", overflow: "hidden", display: "flex", minWidth: 0 }}>
        <Paper elevation={0} sx={{ width: "100%", height: "100%", minHeight: 0, maxHeight: "100%", borderRadius: 3, overflow: "hidden", bgcolor: "white", border: "1px solid rgba(0,0,0,0.08)", display: "grid", gridTemplateColumns: { xs: "1fr", md: "420px 1fr" }, gridTemplateRows: "1fr" }}>

          {/* ── Sidebar ── */}
          <Box sx={{ borderRight: "1px solid rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", minHeight: 0, minWidth: 0, overflow: "hidden", bgcolor: "white" }}>
            <Box sx={{ px: 2, py: 1.25, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Stack direction="row" alignItems="center" spacing={1.2} sx={{ minWidth: 0 }}>
                <Avatar src={me.avatarUrl} sx={{ width: 34, height: 34, bgcolor: "white", border: "1px solid rgba(0,0,0,0.12)" }} />
                <Stack direction="row" spacing={0.25} alignItems="center" sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 1000, fontSize: 16 }} noWrap>{me.displayName}</Typography>
                  <Tooltip title="Message settings">
                    <IconButton size="small" aria-label="Message settings" onClick={() => { setSettingsTab("backgrounds"); setSettingsOpen(true); }} sx={{ borderRadius: 2 }}>
                      <SettingsIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
              <Stack direction="row" spacing={0.5}>
                {onCreateGroup != null && (
                  <Tooltip title="Create group">
                    <IconButton onClick={() => setCreateGroupOpen(true)} aria-label="Create group" sx={{ borderRadius: 2 }} size="small"><GroupAddIcon /></IconButton>
                  </Tooltip>
                )}
                <Tooltip title="New message"><IconButton onClick={() => setNewMsgOpen(true)} aria-label="New message" sx={{ borderRadius: 2 }}><ChatIcon /></IconButton></Tooltip>
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
                  const unread = !readThreadIds.has(t.id) && isThreadUnread(allMessages, t.id, meId);
                  const lastText = last?.text || (last?.attachments?.length ? "Sent an attachment" : "Say hi");
                  const displayName = isGroup ? (t.name ?? "Group chat") : (other?.displayName ?? "");
                  const avatarSlot = isGroup ? (
                    <Box sx={{ position: "relative", width: 44, height: 44, mr: 1.5 }}>
                      {groupPictureByThreadId[t.id] ? (
                        <Avatar src={groupPictureByThreadId[t.id]} sx={{ width: 44, height: 44, bgcolor: "white" }} />
                      ) : (
                        <GroupsIcon sx={{ fontSize: 40, color: "rgba(0,0,0,0.35)" }} />
                      )}
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
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); togglePinThread(t.id); }} disabled={!pinnedThreadIds.has(t.id) && pinnedThreadIds.size >= 3} sx={{ ml: 0.5, opacity: 0.85 }}>
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

          {/* ── Chat panel ── */}
          <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0, overflow: "hidden", bgcolor: "white" }}>
            {/* Header */}
            <Box sx={{ px: 2, py: 1.25, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.08)", minHeight: 58, flexShrink: 0 }}>
              <Stack direction="row" alignItems="center" spacing={1.2}>
                <IconButton onClick={() => onSelectedThreadIdChange(null)} aria-label="Back to conversations" sx={{ display: { xs: "inline-flex", md: "none" } }}><ArrowBackIcon /></IconButton>
                {selectedThread && isGroupThread(selectedThread) ? (
                  <>
                    {selectedThreadId && groupPictureByThreadId[selectedThreadId] ? (
                      <Avatar src={groupPictureByThreadId[selectedThreadId]} sx={{ width: 40, height: 40, bgcolor: "white" }} />
                    ) : (
                      <GroupsIcon sx={{ fontSize: 32, color: "rgba(0,0,0,0.4)" }} />
                    )}
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
                  <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} aria-label="More options"><MoreHorizIcon /></IconButton>
                  <Menu open={!!menuAnchor} anchorEl={menuAnchor} onClose={() => setMenuAnchor(null)}>
                    <MenuItem onClick={() => { setMenuAnchor(null); openReport(); }}>Report</MenuItem>
                    {otherUser ? (
                      <MenuItem onClick={() => { setMenuAnchor(null); handleBlock(); }} sx={{ color: "#b91c1c", fontWeight: 900 }}>Block</MenuItem>
                    ) : (
                      <MenuItem onClick={leaveGroup} sx={{ color: "#b91c1c", fontWeight: 900 }}>Leave group</MenuItem>
                    )}
                    <MenuItem onClick={() => {
                      setMenuAnchor(null);
                      if (selectedThreadId) deleteThread(selectedThreadId);
                    }} sx={{ color: "#b91c1c", fontWeight: 900 }}>
                      Delete chat
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>

            {/* Messages scroller with background */}
            {loadingThreadId !== null && loadingThreadId === selectedThreadId && (
              <Box sx={{ width: "100%", height: 2, bgcolor: "rgba(0,0,0,0.06)" }}>
                <Box
                  sx={{
                    height: "100%",
                    bgcolor: RED,
                    animation: "loading-bar 1.2s ease-in-out infinite",
                    "@keyframes loading-bar": {
                      "0%": { width: "0%", marginLeft: "0%" },
                      "50%": { width: "60%", marginLeft: "20%" },
                      "100%": { width: "0%", marginLeft: "100%" },
                    },
                  }}
                />
              </Box>
            )}
            <Box sx={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {/* Background layer */}
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 0,
                  overflow: "hidden",
                  ...(selectedThreadId && !animatedBackgroundByThreadId[selectedThreadId]
                    ? customBackgroundByThreadId[selectedThreadId]
                      ? { backgroundImage: `url(${customBackgroundByThreadId[selectedThreadId]})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }
                      : backgroundByThreadId[selectedThreadId]
                        ? { backgroundImage: `url(${BACKGROUNDS.find((b) => b.id === backgroundByThreadId[selectedThreadId])?.src})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }
                        : {}
                    : {}),
                }}
              >
                {selectedThreadId && animatedBackgroundByThreadId[selectedThreadId] && (
                  <>
                    {animatedBackgroundByThreadId[selectedThreadId]?.type === "grainient" && (
                      <Grainient
                        color1={animatedBackgroundByThreadId[selectedThreadId].type === "grainient" ? animatedBackgroundByThreadId[selectedThreadId].color1 : "#ebebeb"}
                        color2={animatedBackgroundByThreadId[selectedThreadId].type === "grainient" ? animatedBackgroundByThreadId[selectedThreadId].color2 : "#e32400"}
                        color3={animatedBackgroundByThreadId[selectedThreadId].type === "grainient" ? animatedBackgroundByThreadId[selectedThreadId].color3 : "#B19EEF"}
                        timeSpeed={0.25} warpStrength={1} warpFrequency={5} warpSpeed={2} warpAmplitude={50} zoom={1.25}
                        className="messages-animated-bg"
                      />
                    )}
                    {animatedBackgroundByThreadId[selectedThreadId]?.type === "gridscan" && (
                      <GridScan sensitivity={0.55} lineThickness={1} linesColor="#392e4e" gridScale={0.1} scanColor="#FF9FFC" scanOpacity={0.4} enablePost bloomIntensity={0.6} chromaticAberration={0.002} noiseIntensity={0.01} className="messages-animated-bg" />
                    )}
                    {animatedBackgroundByThreadId[selectedThreadId]?.type === "lightning" && (
                      <Lightning hue={hexToHue(animatedBackgroundByThreadId[selectedThreadId].type === "lightning" ? animatedBackgroundByThreadId[selectedThreadId].color : "#6366f1")} xOffset={0} speed={1} intensity={1} size={1} className="messages-animated-bg" />
                    )}
                    {animatedBackgroundByThreadId[selectedThreadId]?.type === "particles" && (
                      <Particles
                        particleColors={animatedBackgroundByThreadId[selectedThreadId].type === "particles" && animatedBackgroundByThreadId[selectedThreadId].colors.length > 0 ? animatedBackgroundByThreadId[selectedThreadId].colors : ["#ffffff"]}
                        particleCount={200} particleSpread={10} speed={0.1} particleBaseSize={100} moveParticlesOnHover alphaParticles={false} disableRotation={false} pixelRatio={1}
                        className="messages-animated-bg"
                      />
                    )}
                  </>
                )}
              </Box>

              <Box
                ref={scrollerRef}
                onScroll={handleScroll}
                sx={{ 
                  position: "relative", 
                  zIndex: 1, 
                  flex: 1, 
                  minHeight: 0, 
                  overflowY: "auto", 
                  overflowX: "hidden", 
                  px: 2.5, 
                  py: 2,
                  display: "flex",
                  flexDirection: "column-reverse",
                  ...scrollBarSx,
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); toast.show("File attachments coming soon!", "info"); }}
              >
                {loadingThreadId === selectedThreadId && selectedThreadId ? (
                  <Box sx={{ height: "100%", display: "grid", placeItems: "center" }}>
                    <CircularProgress size={32} sx={{ color: RED }} />
                  </Box>
                ) : !selectedThread || (!otherUser && !isGroupThread(selectedThread)) ? (
                  <Box sx={{ height: "100%", display: "grid", placeItems: "center", textAlign: "center" }}>
                    <Box>
                      <Box sx={{ width: 84, height: 84, borderRadius: "50%", border: "2px solid rgba(0,0,0,0.18)", display: "grid", placeItems: "center", mx: "auto", mb: 2 }}><SendIcon sx={{ fontSize: 38, color: "rgba(0,0,0,0.55)" }} /></Box>
                      <Typography sx={{ fontWeight: 1000, fontSize: 20 }}>
                        {otherUser ? `Start a chat with ${otherUser.displayName}!` : "Your messages"}
                      </Typography>
                      <Typography sx={{ color: "rgba(0,0,0,0.60)", mt: 0.7 }}>
                        {otherUser ? "Say something to get the conversation going." : "Send a message to start a chat."}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      position: "relative",
                      zIndex: 1,
                      ...(selectedThreadId && (backgroundByThreadId[selectedThreadId] || animatedBackgroundByThreadId[selectedThreadId])
                        ? { bgcolor: "rgba(255,255,255,0.78)", backdropFilter: "blur(1px)", borderRadius: 2, px: 1.5, py: 1.25 }
                        : {}),
                    }}
                  >
                    {selectedThread.isRequest && (
                      <Box sx={{ mb: 2, p: 1.4, borderRadius: 2, bgcolor: "rgba(168,5,50,0.07)", border: "1px solid rgba(168,5,50,0.18)" }}>
                        <Typography sx={{ fontWeight: 1000 }}>Message request</Typography>
                        <Typography sx={{ color: "rgba(0,0,0,0.65)", fontSize: 13 }}>You can respond, delete, or report this request.</Typography>
                      </Box>
                    )}

                    {selectedThread && isGroupThread(selectedThread) && selectedThread.participantIds.some((id) => id !== meId && blockedUserIds.has(id)) && (
                      <Box sx={{ mb: 1.5, p: 1.2, borderRadius: 2, bgcolor: "rgba(168,5,50,0.05)", border: "1px solid rgba(168,5,50,0.12)" }}>
                        <Typography sx={{ fontSize: 13, color: "#b91c1c", fontWeight: 800 }}>
                          Someone you've blocked is in this group. Their messages are visible to others.
                        </Typography>
                      </Box>
                    )}

                    <Stack spacing={1.25}>
                      {selectedThreadId && loadingMoreByThread[selectedThreadId] && (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
                          <CircularProgress size={18} sx={{ color: "rgba(0,0,0,0.3)" }} />
                        </Box>
                      )}
                      {selectedThreadId && hasMoreByThread[selectedThreadId] && !loadingMoreByThread[selectedThreadId] && (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 0.5 }}>
                          <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.35)" }}>Scroll up for older messages</Typography>
                        </Box>
                      )}

                      {threadMessages.map((m) => {

                        const mine = m.fromUserId === meId;
                        const isEditing = editingMsgId === m.id;
                        const isDeleted = !m.text && !m.attachments?.length;
                        const isLastMine = mine && m.id === lastMyMessageId;
                        const seenByOther = selectedThreadId && readReceiptsByThread[selectedThreadId]?.messageId === m.id;
                        const groupedReactions = getGroupedReactions(m.id);
                        const hasReactions = Object.keys(groupedReactions).length > 0;
                        const showEmojiPicker = emojiPickerMsgId === m.id;

                        return (
                          <Box key={m.id} sx={{ mb: hasReactions ? 1.5 : 0 }}>
                            <Box
                              sx={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", alignItems: "center", gap: 0.5 }}
                              onMouseEnter={() => setHoveredMsgId(m.id)}
                              onMouseLeave={() => { setHoveredMsgId(null); setEmojiPickerMsgId(null); }}
                            >
                              {!isDeleted && !isEditing && (hoveredMsgId === m.id || showEmojiPicker) && (
                                <Box sx={{ order: mine ? 0 : 2, position: "relative" }}>
                                  <IconButton size="small" onClick={() => setEmojiPickerMsgId(showEmojiPicker ? null : m.id)} aria-label="React to message" aria-expanded={showEmojiPicker} sx={{ opacity: 0.55, fontSize: 16 }}>😊</IconButton>
                                  {showEmojiPicker && (
                                    <Box
                                      sx={{ position: "absolute", bottom: "100%", [mine ? "right" : "left"]: 0, mb: 0.5, bgcolor: "white", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 3, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", display: "flex", gap: 0.25, px: 0.75, py: 0.5, zIndex: 10 }}
                                      onMouseEnter={() => setEmojiPickerMsgId(m.id)}
                                    >
                                      {QUICK_EMOJIS.map((emoji) => {
                                        const alreadyReacted = groupedReactions[emoji]?.reactedByMe ?? false;
                                        return (
                                          <Box key={emoji} role="button" aria-label={`React with ${emoji}`} onClick={() => { onReactMessage(m.id, emoji); setEmojiPickerMsgId(null); }} sx={{ fontSize: 20, cursor: "pointer", px: 0.5, py: 0.25, borderRadius: 1.5, bgcolor: alreadyReacted ? "rgba(168,5,50,0.10)" : "transparent", "&:hover": { bgcolor: "rgba(0,0,0,0.07)", transform: "scale(1.2)" }, transition: "transform 0.1s" }}>
                                            {emoji}
                                          </Box>
                                        );
                                      })}
                                    </Box>
                                  )}
                                </Box>
                              )}

                              {mine && !isDeleted && (hoveredMsgId === m.id || msgMenuTarget === m.id) && !isEditing && (
                                <IconButton size="small" aria-label="Message options" onClick={(e) => { setMsgMenuAnchor(e.currentTarget); setMsgMenuTarget(m.id); }} sx={{ order: 1, alignSelf: "center", opacity: 0.6 }}>
                                  <MoreHorizIcon fontSize="small" />
                                </IconButton>
                              )}

                              <Box sx={{ order: 1, maxWidth: "78%", px: 1.6, py: 1.1, borderRadius: 3, bgcolor: mine ? "rgba(168,5,50,0.10)" : "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.06)", whiteSpace: "pre-wrap", fontSize: 14 }}>
                                {isDeleted ? (
                                  <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.4)", fontStyle: "italic" }}>Message deleted</Typography>
                                ) : isEditing ? (
                                  <Stack direction="row" spacing={0.5} alignItems="center">
                                    <TextField value={editingText} onChange={(e) => setEditingText(e.target.value)} size="small" autoFocus onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEditSubmit(); } if (e.key === "Escape") { setEditingMsgId(null); setEditingText(""); } }} InputProps={{ sx: { fontSize: 14, borderRadius: 2 } }} />
                                    <Button size="small" variant="contained" onClick={handleEditSubmit} sx={{ bgcolor: RED, fontWeight: 900, textTransform: "none", borderRadius: 999, minWidth: 0, px: 1.5 }}>Save</Button>
                                    <Button size="small" onClick={() => { setEditingMsgId(null); setEditingText(""); }} sx={{ fontWeight: 900, textTransform: "none", borderRadius: 999, minWidth: 0 }}>Cancel</Button>
                                  </Stack>
                                ) : (
                                  <>
                                    {!!m.text && <Box>{m.text}</Box>}
                                    {!!m.attachments?.length && (
                                      <Stack spacing={1} sx={{ mt: m.text ? 1 : 0 }}>
                                        {m.attachments.map((a, attachmentIndex) => {
                                          const name = (a.name || "").toLowerCase();
                                          const isVoice = a.type === "audio" || name.endsWith(".webm") || name.endsWith(".ogg") || name.endsWith(".mp4") || name.includes("voice") || urlToDurationRef.current[a.url] !== undefined;

                                          const sentBlobEntry = lastSentBlobUrlsRef.current[m.threadId];
                                          const isRecentSend = !!sentBlobEntry && Math.abs(m.createdAt - sentBlobEntry.sentAt) < 20000;
                                          const fallbackUrl = isRecentSend ? sentBlobEntry?.urls[attachmentIndex] : undefined;
                                          const voiceUrl = isRecentSend && fallbackUrl ? fallbackUrl : a.url;
                                          const voiceDuration = urlToDurationRef.current[voiceUrl] ?? urlToDurationRef.current[a.url];

                                          return (
                                            <React.Fragment key={a.id}>
                                              {isVoice ? (
                                                voiceUrl ? (
                                                  <VoiceMessageBubble url={voiceUrl} mine={mine} initialDuration={voiceDuration} sourceFile={mine ? sentVoiceFileByUrlRef.current[voiceUrl] : undefined} />
                                                ) : (
                                                  <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.6)" }}>Voice message</Typography>
                                                )
                                              ) : a.type === "image" ? (
                                                <Box component="img" src={a.url} alt={a.name} onClick={() => setImgView({ open: true, url: a.url, name: a.name })} sx={{ width: 220, maxWidth: "100%", borderRadius: 2, border: "1px solid rgba(0,0,0,0.10)", cursor: "zoom-in" }} />
                                              ) : a.type === "audio" ? (
                                                <audio controls src={a.url} />
                                              ) : (
                                                <Chip label={a.name} icon={<AttachFileIcon />} variant="outlined" sx={{ fontWeight: 800 }} />
                                              )}
                                            </React.Fragment>
                                          );
                                        })}
                                      </Stack>
                                    )}
                                  </>
                                )}
                              </Box>
                            </Box>

                            {hasReactions && (
                              <Box sx={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", flexWrap: "wrap", gap: 0.5, mt: 0.4, px: 0.5 }}>
                                {Object.entries(groupedReactions).map(([emoji, { count, reactedByMe }]) => (
                                  <Box key={emoji} onClick={() => onReactMessage(m.id, emoji)} sx={{ display: "inline-flex", alignItems: "center", gap: 0.4, px: 0.9, py: 0.2, borderRadius: 999, fontSize: 13, cursor: "pointer", bgcolor: reactedByMe ? "rgba(168,5,50,0.12)" : "rgba(0,0,0,0.05)", border: reactedByMe ? `1px solid rgba(168,5,50,0.35)` : "1px solid rgba(0,0,0,0.10)", "&:hover": { bgcolor: reactedByMe ? "rgba(168,5,50,0.20)" : "rgba(0,0,0,0.10)" }, transition: "background 0.15s", userSelect: "none" }}>
                                    <span>{emoji}</span>
                                    <Typography sx={{ fontSize: 12, fontWeight: 800, color: reactedByMe ? RED : "rgba(0,0,0,0.6)", lineHeight: 1 }}>{count}</Typography>
                                  </Box>
                                ))}
                              </Box>
                            )}

                            {isLastMine && m.status === "pending" && (
                              <Box sx={{ display: "flex", justifyContent: "flex-end", pr: 0.5, mt: 0.25 }}>
                                <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.35)" }}>Sending...</Typography>
                              </Box>
                            )}
                            {isLastMine && m.status === "failed" && (
                              <Box sx={{ display: "flex", justifyContent: "flex-end", pr: 0.5, mt: 0.25, gap: 0.5, alignItems: "center" }}>
                                <Typography sx={{ fontSize: 11, color: "#b91c1c" }}>Failed to send</Typography>
                                <Typography onClick={() => onSend(m.threadId, m.text)} sx={{ fontSize: 11, color: "#b91c1c", fontWeight: 900, cursor: "pointer", textDecoration: "underline" }}>Retry</Typography>
                              </Box>
                            )}
                            {isLastMine && m.status === "delivered" && !seenByOther && (
                              <Box sx={{ display: "flex", justifyContent: "flex-end", pr: 0.5, mt: 0.25 }}>
                                <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.4)" }}>Delivered</Typography>
                              </Box>
                            )}
                            {isLastMine && seenByOther && (
                              <Box sx={{ display: "flex", justifyContent: "flex-end", pr: 0.5, mt: 0.25 }}>
                                <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.4)" }}>Seen</Typography>
                              </Box>
                            )}
                          </Box>
                        );
                      })}

                      {selectedThreadId && typingByThread[selectedThreadId] && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1, py: 0.5 }}>
                          <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.5)", fontStyle: "italic" }}>
                            {userById.get(typingByThread[selectedThreadId]!)?.displayName ?? "Someone"} is typing...
                          </Typography>
                        </Box>
                      )}
                    </Stack>

                    <Menu open={!!msgMenuAnchor} anchorEl={msgMenuAnchor} onClose={() => { setMsgMenuAnchor(null); setMsgMenuTarget(null); }}>
                      <MenuItem onClick={() => { const msg = threadMessages.find((m) => m.id === msgMenuTarget); if (msg) { setEditingMsgId(msg.id); setEditingText(msg.text); } setMsgMenuAnchor(null); setMsgMenuTarget(null); }}>
                        <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                      </MenuItem>
                      <MenuItem onClick={() => { if (msgMenuTarget) onDeleteMessage(msgMenuTarget); setMsgMenuAnchor(null); setMsgMenuTarget(null); }} sx={{ color: "#b91c1c", fontWeight: 900 }}>
                        <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
                      </MenuItem>
                    </Menu>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Compose bar */}
            <Box sx={{ borderTop: "1px solid rgba(0,0,0,0.08)", px: 2, py: 1.25, bgcolor: "white", flexShrink: 0 }}>
            {otherUser && isBlocked && (
              <Box sx={{ mb: 1, p: 1.2, borderRadius: 2, bgcolor: "rgba(168,5,50,0.06)", border: "1px solid rgba(168,5,50,0.15)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: 13, color: "#b91c1c", fontWeight: 800 }}>
                  You have blocked this person. Unblock to send a message.
                </Typography>
                <Button size="small" onClick={() => unblockUser(otherUser.id)} sx={{ borderRadius: 999, fontWeight: 900, textTransform: "none", color: "#b91c1c", ml: 1 }}>
                  Unblock
                </Button>
              </Box>
            )}
            {(selectedDraft.files.length > 0 || selectedDraft.gifs.length > 0) && (
                <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap" }}>
                  {selectedDraft.files.map((f, idx) => <Chip key={`${f.name}-${idx}`} label={f.type.startsWith("audio/") ? "Voice message" : f.name} onDelete={() => setDraft((p) => ({ ...p, files: p.files.filter((_, i) => i !== idx) }))} sx={{ fontWeight: 800 }} />)}
                  {selectedDraft.gifs.map((g, idx) => <Chip key={`${g.id}-${idx}`} label="GIF" onDelete={() => setDraft((p) => ({ ...p, gifs: p.gifs.filter((_, i) => i !== idx) }))} sx={{ fontWeight: 900 }} />)}
                </Stack>
              )}
              <Stack direction="row" spacing={1} alignItems="center">
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAttachFile} />
                <IconButton disabled={!selectedThread || isBlocked} aria-label="Attach file" onClick={() => fileInputRef.current?.click()}>
                  <AttachFileIcon />
                </IconButton>
                <IconButton disabled={!selectedThread || isBlocked} aria-label="Record voice message" onClick={() => toast.show("Voice messages coming soon!", "info")}><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg></IconButton>
                <IconButton disabled={!selectedThread || isBlocked} aria-label="Open GIF picker" onClick={() => setGifOpen(true)}><GifBoxIcon /></IconButton>
                <TextField
                  value={selectedDraft.text}
                  onChange={(e) => { setDraft((p) => ({ ...p, text: e.target.value })); if (selectedThreadId) onTypingStart(selectedThreadId); }}
                  onBlur={() => { if (selectedThreadId) onTypingStop(selectedThreadId); }}
                  placeholder={selectedThread ? "Message..." : "Select a conversation to message"}
                  fullWidth size="small" disabled={!selectedThread || isBlocked}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  InputProps={{ sx: { borderRadius: 999, bgcolor: "rgba(0,0,0,0.03)", "& fieldset": { borderColor: "rgba(0,0,0,0.10)" } } }}
                />
                <IconButton onClick={handleSend} disabled={!selectedThread || isBlocked} aria-label="Send message"><SendIcon sx={{ color: selectedThread && !isBlocked ? RED : "rgba(0,0,0,0.25)" }} /></IconButton>
              </Stack>
              <Typography sx={{ mt: 0.7, fontSize: 11, color: "rgba(0,0,0,0.45)" }}>File attachments and voice messages coming soon.</Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      <MessagesDialogs
        newMsgOpen={newMsgOpen}
        noteOpen={noteOpen}
        gifOpen={gifOpen}
        imgView={imgView}
        myNoteText={myNoteText}
        users={users}
        meId={meId}
        blockedUserIds={blockedUserIds}
        gifFavorites={gifFavorites}
        onCloseNewMsg={() => setNewMsgOpen(false)}
        onCloseNote={() => setNoteOpen(false)}
        onCloseGif={() => setGifOpen(false)}
        onCloseImgView={() => setImgView({ open: false, url: "", name: "" })}
        onPickUser={(id) => { onPickUser(id); setNewMsgOpen(false); }}
        onSaveNote={(text) => { onUpdateNote(text.slice(0, 60)); setNoteOpen(false); }}
        onAddGif={addGif}
        onToggleGifFav={(url) => setGifFavorites((prev) => (prev.includes(url) ? prev.filter((x) => x !== url) : Array.from(new Set([...prev, url]))))}
        onSearchUsers={onSearchUsers}
        createGroupOpen={createGroupOpen}
        onCloseCreateGroup={() => setCreateGroupOpen(false)}
        onCreateGroup={onCreateGroup}
      />

      {/* Settings dialog — Vram's addition */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 1000, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
          Message settings
          {onCreateGroup != null && (
            <Button variant="contained" startIcon={<GroupAddIcon />} onClick={() => { setSettingsOpen(false); setCreateGroupOpen(true); }} sx={{ borderRadius: 999, fontWeight: 900, textTransform: "none", bgcolor: RED }}>Create group</Button>
          )}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Tabs value={settingsTab} onChange={(_, v) => setSettingsTab(v)} variant="scrollable" scrollButtons="auto" sx={{ "& .MuiTab-root": { textTransform: "none", fontWeight: 900, minHeight: 44 }, "& .MuiTabs-indicator": { bgcolor: RED, height: 3, borderRadius: 999 } }}>
            <Tab value="backgrounds" label="Backgrounds" />
            <Tab value="pins" label="Pins" />
            <Tab value="blocked" label="Blocked" />
            <Tab value="followers" label="Followers" />
            <Tab value="notifications" label="Notifications" />
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
                        <Button variant="outlined" onClick={(e) => { e.stopPropagation(); unblockUser(id); }} sx={{ borderRadius: 999, fontWeight: 900, textTransform: "none" }}>Unblock</Button>
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
                  const title = isGroup ? (t.name ?? "Group chat") : (userById.get(t.participantIds.find((id) => id !== meId) ?? "")?.displayName ?? "Chat");
                  const disabled = !pinnedThreadIds.has(t.id) && pinnedThreadIds.size >= 3;
                  return (
                    <ListItemButton key={t.id} onClick={() => { if (!disabled || pinnedThreadIds.has(t.id)) togglePinThread(t.id); }} sx={{ borderRadius: 2 }} disabled={disabled}>
                      {isGroup ? (groupPictureByThreadId[t.id] ? <Avatar src={groupPictureByThreadId[t.id]} sx={{ mr: 1.5, width: 34, height: 34, bgcolor: "white" }} /> : <GroupsIcon sx={{ mr: 1.5, color: "rgba(0,0,0,0.45)" }} />) : <Avatar src={userById.get(t.participantIds.find((id) => id !== meId) ?? "")?.avatarUrl} sx={{ mr: 1.5, bgcolor: "white", width: 34, height: 34 }} />}
                      <ListItemText primary={<Typography sx={{ fontWeight: 900 }}>{title}</Typography>} />
                      {pinnedThreadIds.has(t.id) ? <PushPinIcon fontSize="small" /> : <PushPinOutlinedIcon fontSize="small" />}
                    </ListItemButton>
                  );
                })}
              </List>
            </Box>
          )}

          {settingsTab === "followers" && (
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 900, color: "rgba(0,0,0,0.65)", mb: 1 }}>Your followers</Typography>
              <TextField value={settingsFollowerQuery} onChange={(e) => setSettingsFollowerQuery(e.target.value)} placeholder="Search followers" fullWidth size="small" InputProps={{ sx: { bgcolor: "rgba(0,0,0,0.04)", borderRadius: 999 } }} sx={{ mb: 1.5 }} />
              <List sx={{ p: 0, maxHeight: 360, overflow: "auto" }}>
                {users.filter((u) => u.id !== meId && !blockedUserIds.has(u.id)).filter((u) => { const q = settingsFollowerQuery.trim().toLowerCase(); return !q || u.displayName.toLowerCase().includes(q) || u.username.toLowerCase().includes(q); }).map((u) => (
                  <ListItemButton key={u.id} onClick={() => { onPickUser(u.id); setSettingsOpen(false); }} sx={{ borderRadius: 2 }}>
                    <Avatar src={u.avatarUrl} sx={{ mr: 1.5, bgcolor: "white" }} />
                    <ListItemText primary={<Typography sx={{ fontWeight: 900 }}>{u.displayName}</Typography>} secondary={`@${u.username}`} />
                    <Button variant="contained" size="small" startIcon={<ChatIcon />} sx={{ borderRadius: 999, fontWeight: 900, textTransform: "none", bgcolor: RED }}>DM</Button>
                  </ListItemButton>
                ))}
              </List>
            </Box>
          )}

          {settingsTab === "notifications" && (
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 900, color: "rgba(0,0,0,0.65)", mb: 1.5 }}>Notifications</Typography>
              <Stack spacing={1.5}>
                <FormControlLabel control={<Switch checked={muteNotifications} onChange={(e) => setMuteNotifications(e.target.checked)} color="primary" />} label={<Typography sx={{ fontWeight: 800 }}>Mute notifications</Typography>} />
                <FormControlLabel control={<Switch checked={doNotDisturb} onChange={(e) => setDoNotDisturb(e.target.checked)} color="primary" />} label={<Typography sx={{ fontWeight: 800 }}>Do not disturb</Typography>} />
              </Stack>
              <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.55)", mt: 1.5 }}>When enabled, you won't get sound or badges for new messages.</Typography>
            </Box>
          )}

          {settingsTab === "backgrounds" && (
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 900, color: "rgba(0,0,0,0.65)", mb: 0.5 }}>Chat backgrounds</Typography>
              <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.55)", mb: 1.5 }}>Choose a style below, then select which conversations to apply it to.</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 800, color: "rgba(0,0,0,0.6)", mb: 1 }}>Apply to these conversations</Typography>
              <List sx={{ p: 0, maxHeight: 140, overflow: "auto", mb: 2, border: "1px solid rgba(0,0,0,0.10)", borderRadius: 2 }}>
                {threads.filter((t) => t.participantIds.includes(meId) && !leftGroupThreadIds.has(t.id)).map((t) => {
                  const isGroup = isGroupThread(t);
                  const title = isGroup ? (t.name ?? "Group chat") : (userById.get(t.participantIds.find((id) => id !== meId) ?? "")?.displayName ?? "Chat");
                  return (
                    <ListItemButton key={t.id} onClick={() => setBackgroundApplyToThreadIds((prev) => { const n = new Set(prev); if (n.has(t.id)) n.delete(t.id); else n.add(t.id); return n; })} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}><Checkbox edge="start" checked={backgroundApplyToThreadIds.has(t.id)} disableRipple size="small" /></ListItemIcon>
                      {isGroup ? <GroupsIcon sx={{ mr: 1, color: "rgba(0,0,0,0.45)", fontSize: 20 }} /> : <Avatar src={userById.get(t.participantIds.find((id) => id !== meId) ?? "")?.avatarUrl} sx={{ mr: 1, width: 28, height: 28, bgcolor: "white" }} />}
                      <ListItemText primary={<Typography sx={{ fontSize: 13, fontWeight: 800 }}>{title}</Typography>} />
                    </ListItemButton>
                  );
                })}
              </List>
              <Typography sx={{ fontSize: 12, fontWeight: 800, color: "rgba(0,0,0,0.6)", mb: 1 }}>Premier — Animated backgrounds</Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
                {[
                  { type: null as AnimatedBg, label: "None" },
                  { type: { type: "grainient" as const, color1: "#ebebeb", color2: "#e32400", color3: "#B19EEF" } as AnimatedBg, label: "Gradient" },
                  { type: { type: "gridscan" as const } as AnimatedBg, label: "Grid scan" },
                  { type: { type: "lightning" as const, color: "#6366f1" } as AnimatedBg, label: "Lightning" },
                  { type: { type: "particles" as const, colors: ["#ffffff", "#c7d2fe", "#a78bfa"] } as AnimatedBg, label: "Particles" },
                ].map(({ type, label }) => {
                  const targetId = backgroundApplyToThreadIds.size > 0 ? Array.from(backgroundApplyToThreadIds)[0] : selectedThreadId;
                  const isSelected = type === null ? !targetId || !animatedBackgroundByThreadId[targetId!] : targetId && JSON.stringify(animatedBackgroundByThreadId[targetId]) === JSON.stringify(type);
                  return (
                    <Button key={label} variant={isSelected ? "contained" : "outlined"} size="small" onClick={() => {
                      const ids = backgroundApplyToThreadIds.size > 0 ? Array.from(backgroundApplyToThreadIds) : selectedThreadId ? [selectedThreadId] : [];
                      ids.forEach((tid) => {
                        setBackgroundByThreadId((p) => ({ ...p, [tid]: null }));
                        setCustomBackgroundByThreadId((p) => { const n = { ...p }; ids.forEach((id) => delete n[id]); return n; });
                        const value: AnimatedBg = type && type.type === "particles" ? { ...type, colors: [...type.colors] } : type;
                        setAnimatedBackgroundByThreadId((p) => ({ ...p, [tid]: value }));
                      });
                    }} sx={{ borderRadius: 999, fontWeight: 900, textTransform: "none", bgcolor: isSelected ? RED : undefined }}>{label}</Button>
                  );
                })}
              </Stack>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.25, mb: 2 }}>
                {BACKGROUNDS.map((b) => {
                  const ids = backgroundApplyToThreadIds.size > 0 ? Array.from(backgroundApplyToThreadIds) : selectedThreadId ? [selectedThreadId] : [];
                  const selected = ids.length > 0 && backgroundByThreadId[ids[0]] === b.id;
                  return (
                    <Box key={b.id} onClick={() => { ids.forEach((tid) => { setBackgroundByThreadId((p) => ({ ...p, [tid]: b.id })); setAnimatedBackgroundByThreadId((p) => ({ ...p, [tid]: null })); setCustomBackgroundByThreadId((p) => { const n = { ...p }; ids.forEach((id) => delete n[id]); return n; }); }); }} sx={{ cursor: "pointer", borderRadius: 2, overflow: "hidden", border: selected ? `2px solid ${RED}` : "1px solid rgba(0,0,0,0.12)", bgcolor: "rgba(0,0,0,0.02)" }}>
                      <Box component="img" src={b.src} alt={b.label} sx={{ width: "100%", height: 90, objectFit: "cover", display: "block" }} />
                      <Box sx={{ px: 1, py: 0.8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 900 }}>{b.label}</Typography>
                        {selected ? <CheckCircleIcon sx={{ fontSize: 18, color: RED }} /> : null}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
              <Typography sx={{ fontSize: 12, fontWeight: 800, color: "rgba(0,0,0,0.6)", mb: 1 }}>Upload your own image</Typography>
              <Typography sx={{ fontSize: 11, color: RED, fontWeight: 700, mb: 1 }}>Make sure your image is appropriate. Inappropriate content may result in a ban from our website.</Typography>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Button variant="outlined" component="label" sx={{ borderRadius: 999, fontWeight: 900, textTransform: "none" }}>
                  Choose image
                  <input type="file" accept="image/*" hidden onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const ids = backgroundApplyToThreadIds.size > 0 ? Array.from(backgroundApplyToThreadIds) : selectedThreadId ? [selectedThreadId] : [];
                    if (ids.length === 0) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      const dataUrl = reader.result as string;
                      setCustomBackgroundByThreadId((prev) => ({ ...prev, ...Object.fromEntries(ids.map((tid) => [tid, dataUrl])) }));
                      ids.forEach((tid) => { setBackgroundByThreadId((p) => ({ ...p, [tid]: null })); setAnimatedBackgroundByThreadId((p) => ({ ...p, [tid]: null })); });
                    };
                    reader.readAsDataURL(file);
                    e.target.value = "";
                  }} />
                </Button>
                {(backgroundApplyToThreadIds.size > 0 ? Array.from(backgroundApplyToThreadIds)[0] : selectedThreadId) && customBackgroundByThreadId[backgroundApplyToThreadIds.size > 0 ? Array.from(backgroundApplyToThreadIds)[0]! : selectedThreadId!] && (
                  <Box component="img" src={customBackgroundByThreadId[backgroundApplyToThreadIds.size > 0 ? Array.from(backgroundApplyToThreadIds)[0]! : selectedThreadId!]} alt="Custom" sx={{ width: 56, height: 56, objectFit: "cover", borderRadius: 2, border: `2px solid ${RED}` }} />
                )}
              </Stack>
              {backgroundPreviewTid && animatedBackgroundByThreadId[backgroundPreviewTid] && (
                <>
                  <Typography sx={{ fontSize: 12, fontWeight: 800, color: "rgba(0,0,0,0.6)", mb: 1 }}>Customize colors (animated)</Typography>
                  {animatedBackgroundByThreadId[backgroundPreviewTid]?.type === "grainient" && (
                    <Box sx={{ mb: 2 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                        {(["color1", "color2", "color3"] as const).map((key, i) => (
                          <Stack key={key} alignItems="center" spacing={0.5}>
                            <Box component="input" type="color" value={animatedBackgroundByThreadId[backgroundPreviewTid].type === "grainient" ? animatedBackgroundByThreadId[backgroundPreviewTid][key] : "#ebebeb"} onChange={(e) => setAnimatedBackgroundByThreadId((prev) => prev[backgroundPreviewTid]?.type === "grainient" ? { ...prev, [backgroundPreviewTid]: { ...prev[backgroundPreviewTid], [key]: e.target.value } } : prev)} sx={{ width: 40, height: 40, border: "none", borderRadius: 2, cursor: "pointer", p: 0 }} />
                            <Typography sx={{ fontSize: 11, fontWeight: 700 }}>Color {i + 1}</Typography>
                          </Stack>
                        ))}
                      </Stack>
                      <Box sx={{ width: "100%", height: 100, borderRadius: 2, overflow: "hidden", border: "1px solid rgba(0,0,0,0.12)" }}>
                        <Grainient color1={animatedBackgroundByThreadId[backgroundPreviewTid].type === "grainient" ? animatedBackgroundByThreadId[backgroundPreviewTid].color1 : "#ebebeb"} color2={animatedBackgroundByThreadId[backgroundPreviewTid].type === "grainient" ? animatedBackgroundByThreadId[backgroundPreviewTid].color2 : "#e32400"} color3={animatedBackgroundByThreadId[backgroundPreviewTid].type === "grainient" ? animatedBackgroundByThreadId[backgroundPreviewTid].color3 : "#B19EEF"} timeSpeed={0.25} warpStrength={1} warpFrequency={5} warpSpeed={2} warpAmplitude={50} zoom={1.25} />
                      </Box>
                    </Box>
                  )}
                  {animatedBackgroundByThreadId[backgroundPreviewTid]?.type === "gridscan" && (
                    <Box sx={{ width: "100%", height: 100, borderRadius: 2, overflow: "hidden", border: "1px solid rgba(0,0,0,0.12)" }}>
                      <GridScan sensitivity={0.55} lineThickness={1} linesColor="#392e4e" gridScale={0.1} scanColor="#FF9FFC" scanOpacity={0.4} enablePost bloomIntensity={0.6} chromaticAberration={0.002} noiseIntensity={0.01} />
                    </Box>
                  )}
                  {animatedBackgroundByThreadId[backgroundPreviewTid]?.type === "lightning" && (
                    <Box sx={{ mb: 2 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                        <Stack alignItems="center" spacing={0.5}>
                          <Box component="input" type="color" value={animatedBackgroundByThreadId[backgroundPreviewTid].type === "lightning" ? animatedBackgroundByThreadId[backgroundPreviewTid].color : "#6366f1"} onChange={(e) => setAnimatedBackgroundByThreadId((prev) => prev[backgroundPreviewTid]?.type === "lightning" ? { ...prev, [backgroundPreviewTid]: { ...prev[backgroundPreviewTid], color: e.target.value } } : prev)} sx={{ width: 40, height: 40, border: "none", borderRadius: 2, cursor: "pointer", p: 0 }} />
                          <Typography sx={{ fontSize: 11, fontWeight: 700 }}>Lightning</Typography>
                        </Stack>
                      </Stack>
                      <Box sx={{ width: "100%", height: 100, borderRadius: 2, overflow: "hidden", border: "1px solid rgba(0,0,0,0.12)" }}>
                        <Lightning hue={hexToHue(animatedBackgroundByThreadId[backgroundPreviewTid].type === "lightning" ? animatedBackgroundByThreadId[backgroundPreviewTid].color : "#6366f1")} xOffset={0} speed={1} intensity={1} size={1} />
                      </Box>
                    </Box>
                  )}
                  {animatedBackgroundByThreadId[backgroundPreviewTid]?.type === "particles" && (
                    <Box sx={{ mb: 2 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                        {[0, 1, 2].map((i) => {
                          const colors = animatedBackgroundByThreadId[backgroundPreviewTid].type === "particles" ? animatedBackgroundByThreadId[backgroundPreviewTid].colors : ["#ffffff", "#c7d2fe", "#a78bfa"];
                          const color = colors[i] ?? (i === 0 ? "#ffffff" : i === 1 ? "#c7d2fe" : "#a78bfa");
                          return (
                            <Stack key={i} alignItems="center" spacing={0.5}>
                              <Box component="input" type="color" value={color} onChange={(e) => { const next = [...colors]; while (next.length <= i) next.push(next[next.length - 1] ?? "#ffffff"); next[i] = e.target.value; setAnimatedBackgroundByThreadId((prev) => prev[backgroundPreviewTid]?.type === "particles" ? { ...prev, [backgroundPreviewTid]: { ...prev[backgroundPreviewTid], colors: next } } : prev); }} sx={{ width: 40, height: 40, border: "none", borderRadius: 2, cursor: "pointer", p: 0 }} />
                              <Typography sx={{ fontSize: 11, fontWeight: 700 }}>Color {i + 1}</Typography>
                            </Stack>
                          );
                        })}
                      </Stack>
                      <Box sx={{ width: "100%", height: 100, borderRadius: 2, overflow: "hidden", border: "1px solid rgba(0,0,0,0.12)", bgcolor: "rgba(0,0,0,0.4)" }}>
                        <Particles particleColors={animatedBackgroundByThreadId[backgroundPreviewTid].type === "particles" && animatedBackgroundByThreadId[backgroundPreviewTid].colors.length > 0 ? animatedBackgroundByThreadId[backgroundPreviewTid].colors : ["#ffffff", "#c7d2fe", "#a78bfa"]} particleCount={200} particleSpread={10} speed={0.1} particleBaseSize={100} moveParticlesOnHover alphaParticles={false} disableRotation={false} pixelRatio={1} />
                      </Box>
                    </Box>
                  )}
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSettingsOpen(false)} sx={{ fontWeight: 900, textTransform: "none" }}>Close</Button>
        </DialogActions>
      </Dialog>
          <Dialog open={reportOpen} onClose={() => { setReportOpen(false); setReportSuccess(null); }} maxWidth="xs" fullWidth>
  <DialogTitle sx={{ fontWeight: 1000 }}>Report user</DialogTitle>
  <DialogContent>
    {reportSuccess ? (
      <Box sx={{ py: 1 }}>
        <Typography sx={{ fontWeight: 900, mb: 1, color: "#15803d" }}>Report submitted ✓</Typography>
        <Typography sx={{ fontSize: 13, mb: 0.5 }}>
          Your case number is <strong>{reportSuccess.caseNumber}</strong>.
        </Typography>
        <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.6)", mb: 2 }}>
          You can track your report in the <strong>Safety</strong> page under <strong>My Reports</strong>.
        </Typography>
        {Array.from(reportInvolvedParties).map((id) => {
          const u = userById.get(id);
          if (!u || blockedUserIds.has(u.id)) return null;
          return (
            <Button key={id} fullWidth variant="outlined" onClick={() => { blockUser(u.id); }} sx={{ borderRadius: 999, fontWeight: 900, textTransform: "none", color: "#b91c1c", borderColor: "#b91c1c", mb: 0.5 }}>
              Block {u.displayName}
            </Button>
          );
        })}
      </Box>
    ) : (
      <Box sx={{ pt: 0.5 }}>
        <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.6)", mb: 2 }}>
          This will be filed as <strong>Student Misconduct</strong> and reviewed by the appropriate department.
        </Typography>
        <Typography sx={{ fontSize: 12, fontWeight: 900, color: "rgba(0,0,0,0.65)", mb: 0.75 }}>
          Who is this about?
        </Typography>
        <Box sx={{ mb: 2, border: "1px solid rgba(0,0,0,0.10)", borderRadius: 2, overflow: "hidden" }}>
          {(selectedThread && isGroupThread(selectedThread) ? groupParticipants : otherUser ? [otherUser] : []).map((u) => (
            <ListItemButton key={u.id} onClick={() => setReportInvolvedParties((prev) => { const next = new Set(prev); if (next.has(u.id)) next.delete(u.id); else next.add(u.id); return next; })} sx={{ py: 0.75 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Checkbox size="small" checked={reportInvolvedParties.has(u.id)} disableRipple />
              </ListItemIcon>
              <Avatar src={u.avatarUrl} sx={{ width: 28, height: 28, mr: 1, bgcolor: "white" }} />
              <ListItemText primary={<Typography sx={{ fontSize: 13, fontWeight: 900 }}>{u.displayName}</Typography>} secondary={`@${u.username}`} />
            </ListItemButton>
          ))}
        </Box>
        <TextField label="What happened?" multiline minRows={3} fullWidth value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} placeholder="Describe the misconduct in detail..." sx={{ mb: 2 }} />
        <TextField select label="Your relationship to this incident" fullWidth value={reportRelationship} onChange={(e) => setReportRelationship(e.target.value)} SelectProps={{ native: true }}>
          <option value="VICTIM">I am the person affected</option>
          <option value="WITNESS">I witnessed this incident</option>
          <option value="BYSTANDER">I heard about this from someone</option>
          <option value="ON_BEHALF_OF">I'm reporting on behalf of someone</option>
        </TextField>
      </Box>
    )}
  </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2 }}>
      {reportSuccess ? (
        <Button onClick={() => { setReportOpen(false); setReportSuccess(null); }} sx={{ fontWeight: 900, textTransform: "none" }}>Close</Button>
      ) : (
        <>
          <Button onClick={() => setReportOpen(false)} sx={{ fontWeight: 900, textTransform: "none" }}>Cancel</Button>
          <Button variant="contained" onClick={submitReport} disabled={!reportDescription.trim() || reportSubmitting || (!!selectedThread && isGroupThread(selectedThread) && reportInvolvedParties.size === 0)} sx={{ bgcolor: RED, fontWeight: 900, textTransform: "none", borderRadius: 999 }}>
            {reportSubmitting ? "Submitting..." : "Submit report"}
          </Button>
        </>
      )}
    </DialogActions>
  </Dialog>
      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={toast.close} />
    </Box>
  );
}