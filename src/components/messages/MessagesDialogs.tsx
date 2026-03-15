"use client";

import * as React from "react";
import type { ID, User } from "@/types/messages";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Checkbox,
  Tab,
  Tabs,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { RED } from "./constants";
import { GIF_LIST } from "./utils";

export type MessagesDialogsProps = {
  newMsgOpen: boolean;
  noteOpen: boolean;
  gifOpen: boolean;
  imgView: { open: boolean; url: string; name: string };
  reportOpen: boolean;
  reportReason: string;
  reportDetails: string;
  myNoteText: string;
  users: User[];
  meId: ID;
  blockedUserIds: Set<ID>;
  gifFavorites: string[];
  onCloseNewMsg: () => void;
  onCloseNote: () => void;
  onCloseGif: () => void;
  onCloseImgView: () => void;
  onCloseReport: () => void;
  onPickUser: (id: ID) => void;
  onSaveNote: (text: string) => void;
  onAddGif: (url: string) => void;
  onToggleGifFav: (url: string) => void;
  onReportReason: (r: string) => void;
  onReportDetails: (v: string) => void;
  onSubmitReport: () => void;
  createGroupOpen?: boolean;

  //onSearchUsers: (q: string) => Promise<User[]>;

  onCloseCreateGroup?: () => void;
  onCreateGroup?: (participantIds: ID[], name: string) => void | Promise<void>;
};

export default function MessagesDialogs(props: MessagesDialogsProps) {
  const {
    newMsgOpen,
    noteOpen,
    gifOpen,
    imgView,
    reportOpen,
    reportReason,
    reportDetails,
    myNoteText,
    users,
    meId,
    blockedUserIds,
    gifFavorites,
    onCloseNewMsg,
    onCloseNote,
    onCloseGif,
    onCloseImgView,
    onCloseReport,
    onPickUser,
    onSaveNote,
    onAddGif,
    onToggleGifFav,
    onReportReason,
    onReportDetails,
    onSubmitReport,
    createGroupOpen = false,
    onCloseCreateGroup,
    onCreateGroup,
  } = props;

  const [newMsgQuery, setNewMsgQuery] = React.useState("");
  const [noteText, setNoteText] = React.useState(myNoteText);
  const [gifTab, setGifTab] = React.useState<"all" | "favorites">("all");
  const [createGroupQuery, setCreateGroupQuery] = React.useState("");
  const [createGroupSelected, setCreateGroupSelected] = React.useState<Set<ID>>(new Set());
  const [createGroupName, setCreateGroupName] = React.useState("");
  React.useEffect(() => { if (!newMsgOpen) setNewMsgQuery(""); }, [newMsgOpen]);
  React.useEffect(() => { if (noteOpen) setNoteText(myNoteText); }, [noteOpen, myNoteText]);
  React.useEffect(() => { if (!gifOpen) setGifTab("all"); }, [gifOpen]);
  React.useEffect(() => {
    if (!createGroupOpen) {
      setCreateGroupQuery("");
      setCreateGroupSelected(new Set());
      setCreateGroupName("");
    }
  }, [createGroupOpen]);

  const filteredUsers = React.useMemo(() => {
    const q = newMsgQuery.trim().toLowerCase();
    return users
      .filter((u) => u.id !== meId && !blockedUserIds.has(u.id))
      .filter((u) => !q || u.username.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q))
      .slice(0, 30);
  }, [newMsgQuery, users, blockedUserIds, meId]);

  const createGroupFilteredUsers = React.useMemo(() => {
    const q = createGroupQuery.trim().toLowerCase();
    return users
      .filter((u) => u.id !== meId && !blockedUserIds.has(u.id))
      .filter((u) => !q || u.username.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q))
      .slice(0, 50);
  }, [createGroupQuery, users, blockedUserIds, meId]);

  const toggleCreateGroupUser = (id: ID) => {
    setCreateGroupSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
/* if (q.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    searchTimerRef.current = setTimeout(async () => {
      const results = await onSearchUsers(q);
      setSearchResults(results.filter((u) => u.id !== meId && !blockedUserIds.has(u.id)));
      setSearchLoading(false);
    }, 350);

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [newMsgQuery, onSearchUsers, meId, blockedUserIds]);

  // Fall back to local users list when query is empty
  const displayedUsers = newMsgQuery.trim().length < 2
    ? users.filter((u) => u.id !== meId && !blockedUserIds.has(u.id)).slice(0, 30)
    : searchResults;
  */ 
 const handleCreateGroup = () => {
    const name = createGroupName.trim() || "Group chat";
    const participantIds = [meId, ...createGroupSelected];
    if (participantIds.length < 2) return;
    onCreateGroup?.(participantIds, name);
    onCloseCreateGroup?.();
  };

  const trimmedNote = noteText.trim();
  const visibleGifs = React.useMemo(() => {
    if (gifTab === "favorites") return GIF_LIST.filter((g) => gifFavorites.includes(g.url));
    return GIF_LIST;
  }, [gifTab, gifFavorites]);

  return (
    <>
      <Dialog open={newMsgOpen} onClose={onCloseNewMsg} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 1000 }}>
          New message
          <IconButton onClick={onCloseNewMsg} sx={{ position: "absolute", right: 10, top: 10 }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField value={newMsgQuery} onChange={(e) => setNewMsgQuery(e.target.value)} placeholder="Search username or name" fullWidth size="small" InputProps={{ sx: { bgcolor: "rgba(0,0,0,0.04)", borderRadius: 999 } }} />
          <Divider sx={{ my: 1.5 }} />
          <List sx={{ p: 0, maxHeight: 380, overflow: "auto" }}>
            {filteredUsers.map((u) => (
              <ListItemButton key={u.id} onClick={() => { onPickUser(u.id); onCloseNewMsg(); }} sx={{ borderRadius: 2 }}>
                <Avatar src={u.avatarUrl} sx={{ mr: 1.5, bgcolor: "white" }} />
                <ListItemText primary={<Typography sx={{ fontWeight: 900 }}>{u.displayName}</Typography>} secondary={`@${u.username}`} />
                <Button variant="contained" sx={{ ml: 1, borderRadius: 999, fontWeight: 900, textTransform: "none", bgcolor: RED }}>Chat</Button>
              </ListItemButton>
            ))}
            {filteredUsers.length === 0 && <Box sx={{ py: 5, textAlign: "center" }}><Typography sx={{ fontWeight: 900 }}>No results</Typography></Box>}
          </List>
        </DialogContent>
      </Dialog>

      <Dialog open={noteOpen} onClose={onCloseNote} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 1000 }}>
          Create a note
          <IconButton onClick={onCloseNote} sx={{ position: "absolute", right: 10, top: 10 }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 900, color: "rgba(0,0,0,0.55)", mb: 1 }}>Keep it short (up to 60 chars)</Typography>
          <TextField value={noteText} onChange={(e) => setNoteText(e.target.value.slice(0, 60))} fullWidth placeholder="What's up?" size="small" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onCloseNote} sx={{ fontWeight: 900, textTransform: "none" }}>Cancel</Button>
          <Button disabled={!trimmedNote} variant="contained" sx={{ fontWeight: 900, textTransform: "none", borderRadius: 999, bgcolor: RED }} onClick={() => { onSaveNote(trimmedNote); onCloseNote(); }}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={gifOpen} onClose={onCloseGif} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 1000 }}>
          GIFs
          <IconButton onClick={onCloseGif} sx={{ position: "absolute", right: 10, top: 10 }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Tabs
            value={gifTab}
            onChange={(_, v) => setGifTab(v)}
            variant="fullWidth"
            sx={{ "& .MuiTab-root": { textTransform: "none", fontWeight: 900 }, "& .MuiTabs-indicator": { bgcolor: RED, height: 3, borderRadius: 999 } }}
          >
            <Tab value="all" label="All GIFs" />
            <Tab value="favorites" label={`Favorites (${gifFavorites.length})`} />
          </Tabs>
          <Divider sx={{ my: 1.25 }} />
          {gifTab === "favorites" && visibleGifs.length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <Typography sx={{ fontWeight: 900 }}>No favorites yet</Typography>
              <Typography sx={{ color: "rgba(0,0,0,0.6)", mt: 0.5 }}>Tap the star on a GIF to save it.</Typography>
            </Box>
          ) : (
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.25 }}>
              {visibleGifs.map((g) => (
                <Box key={g.url} sx={{ position: "relative" }}>
                  <Box component="img" src={g.url} alt={g.title} onClick={() => { onAddGif(g.url); onCloseGif(); }} sx={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 2, border: "1px solid rgba(0,0,0,0.10)", cursor: "pointer" }} />
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); onToggleGifFav(g.url); }} sx={{ position: "absolute", right: 6, top: 6, bgcolor: "rgba(255,255,255,0.9)" }}>
                    {gifFavorites.includes(g.url) ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}><Button onClick={onCloseGif} sx={{ fontWeight: 900, textTransform: "none" }}>Close</Button></DialogActions>
      </Dialog>

      <Dialog open={imgView.open} onClose={onCloseImgView} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 1000 }}>
          {imgView.name || "Image"}
          <IconButton onClick={onCloseImgView} sx={{ position: "absolute", right: 10, top: 10 }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: "grid", placeItems: "center" }}>
          {imgView.url ? <Box component="img" src={imgView.url} alt={imgView.name || "Image"} sx={{ width: "100%", maxWidth: 900, borderRadius: 2, border: "1px solid rgba(0,0,0,0.10)" }} /> : null}
        </DialogContent>
      </Dialog>

      {onCloseCreateGroup != null && onCreateGroup != null && (
        <Dialog open={createGroupOpen} onClose={onCloseCreateGroup} fullWidth maxWidth="xs">
          <DialogTitle sx={{ fontWeight: 1000 }}>
            Create group
            <IconButton onClick={onCloseCreateGroup} sx={{ position: "absolute", right: 10, top: 10 }}><CloseIcon /></IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <TextField value={createGroupName} onChange={(e) => setCreateGroupName(e.target.value.slice(0, 60))} placeholder="Group name (optional)" fullWidth size="small" sx={{ mb: 1.5 }} />
            <TextField value={createGroupQuery} onChange={(e) => setCreateGroupQuery(e.target.value)} placeholder="Search people" fullWidth size="small" InputProps={{ sx: { bgcolor: "rgba(0,0,0,0.04)", borderRadius: 999 } }} />
            <Divider sx={{ my: 1.5 }} />
            <List sx={{ p: 0, maxHeight: 320, overflow: "auto" }}>
              {createGroupFilteredUsers.map((u) => (
                <ListItemButton key={u.id} onClick={() => toggleCreateGroupUser(u.id)} sx={{ borderRadius: 2 }}>
                  <ListItemIcon>
                    <Checkbox edge="start" checked={createGroupSelected.has(u.id)} disableRipple />
                  </ListItemIcon>
                  <Avatar src={u.avatarUrl} sx={{ mr: 1.5, width: 40, height: 40, bgcolor: "white" }} />
                  <ListItemText primary={<Typography sx={{ fontWeight: 900 }}>{u.displayName}</Typography>} secondary={`@${u.username}`} />
                </ListItemButton>
              ))}
              {createGroupFilteredUsers.length === 0 && <Box sx={{ py: 4, textAlign: "center" }}><Typography sx={{ fontWeight: 900 }}>No results</Typography></Box>}
            </List>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={onCloseCreateGroup} sx={{ fontWeight: 900, textTransform: "none" }}>Cancel</Button>
            <Button disabled={createGroupSelected.size === 0} variant="contained" sx={{ fontWeight: 900, textTransform: "none", borderRadius: 999, bgcolor: RED }} onClick={handleCreateGroup}>
              Create group ({createGroupSelected.size} selected)
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Dialog open={reportOpen} onClose={onCloseReport} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 1000 }}>
          Report
          <IconButton onClick={onCloseReport} sx={{ position: "absolute", right: 10, top: 10 }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 1000, mb: 1 }}>Why are you reporting this conversation?</Typography>
          {["Spam", "Harassment", "Hate", "Scam", "Other"].map((r) => (
            <ListItemButton key={r} onClick={() => onReportReason(r)} sx={{ borderRadius: 2, mb: 0.5, bgcolor: reportReason === r ? "rgba(168,5,50,0.08)" : "transparent" }}>
              <ListItemText primary={<Typography sx={{ fontWeight: 900 }}>{r}</Typography>} />
            </ListItemButton>
          ))}
          <TextField value={reportDetails} onChange={(e) => onReportDetails(e.target.value)} placeholder="Optional details" fullWidth size="small" multiline minRows={3} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onCloseReport} sx={{ fontWeight: 900, textTransform: "none" }}>Cancel</Button>
          <Button disabled={!reportReason} variant="contained" onClick={onSubmitReport} sx={{ fontWeight: 900, textTransform: "none", borderRadius: 999, bgcolor: RED }}>Submit report</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
