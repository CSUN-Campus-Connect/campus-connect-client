"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import CircularProgress from "@mui/material/CircularProgress";

import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import DoneAllOutlinedIcon from "@mui/icons-material/DoneAllOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import KeyboardReturnOutlinedIcon from "@mui/icons-material/KeyboardReturnOutlined";
import CloudDownloadOutlinedIcon from "@mui/icons-material/CloudDownloadOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import NotificationsOffOutlinedIcon from "@mui/icons-material/NotificationsOffOutlined";
import PreviewOutlinedIcon from "@mui/icons-material/PreviewOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import ChatIcon from "@mui/icons-material/Chat";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import TextFieldsOutlinedIcon from "@mui/icons-material/TextFieldsOutlined";

import {
  SettingsPageHeader,
  SettingsSectionLabel,
  SettingsCard,
  SettingsRow,
  SettingsToggle,
  SettingsChevron,
} from "@/components/settings";
import { MessageBackgroundSettingsSection } from "@/components/messages/MessageBackgroundSettingsSection";
import { useMessagesData } from "@/components/messages/useMessagesData";
import {
  loadMessageChatPreferences,
  saveMessageChatPreferences,
  notifyMessageChatPreferencesChanged,
  MESSAGE_PREFS_CHANGED_EVENT,
} from "@/lib/messageChatPreferences";
import type { ID, User } from "@/types/messages";
import { RED } from "@/components/messages/constants";

function FollowersAndBlocksSection({ users, meId }: { users: User[]; meId: ID }) {
  const [followerQuery, setFollowerQuery] = useState("");
  const [blockedIds, setBlockedIds] = useState<Set<ID>>(new Set());

  const refreshBlocked = useCallback(() => {
    const p = loadMessageChatPreferences();
    setBlockedIds(new Set(p.blockedUserIds));
  }, []);

  useEffect(() => {
    refreshBlocked();
  }, [refreshBlocked]);

  useEffect(() => {
    const onSync = () => refreshBlocked();
    window.addEventListener(MESSAGE_PREFS_CHANGED_EVENT, onSync);
    window.addEventListener("storage", onSync);
    return () => {
      window.removeEventListener(MESSAGE_PREFS_CHANGED_EVENT, onSync);
      window.removeEventListener("storage", onSync);
    };
  }, [refreshBlocked]);

  const followers = useMemo(
    () =>
      users
        .filter((u) => u.id !== meId && !blockedIds.has(u.id))
        .filter((u) => {
          const q = followerQuery.trim().toLowerCase();
          if (!q) return true;
          return u.displayName.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
        }),
    [users, meId, blockedIds, followerQuery]
  );

  const blockedUsers = useMemo(
    () =>
      Array.from(blockedIds)
        .map((id) => users.find((u) => u.id === id))
        .filter((u): u is User => !!u),
    [blockedIds, users]
  );

  const persistBlocked = (next: Set<ID>) => {
    setBlockedIds(next);
    const prefs = loadMessageChatPreferences();
    const merged = {
      ...prefs,
      blockedUserIds: Array.from(next),
    };
    saveMessageChatPreferences(merged);
    notifyMessageChatPreferencesChanged();
  };

  return (
    <>
      <SettingsSectionLabel>Followers &amp; people</SettingsSectionLabel>
      <SettingsCard>
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography sx={{ fontSize: "0.9375rem", fontWeight: 600, color: "text.primary", mb: 1 }}>
            Your followers
          </Typography>
          <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary", mb: 1.5, lineHeight: 1.45 }}>
            People you can message from campus. Open a chat from Messages to talk with them.
          </Typography>
          <TextField
            value={followerQuery}
            onChange={(e) => setFollowerQuery(e.target.value)}
            placeholder="Search by name"
            fullWidth
            size="small"
            InputProps={{ sx: { borderRadius: 2 } }}
            sx={{ mb: 1.5 }}
          />
          {followers.length === 0 ? (
            <Typography sx={{ fontSize: 14, color: "text.secondary" }}>No people match your search.</Typography>
          ) : (
            <List dense disablePadding sx={{ maxHeight: 280, overflow: "auto" }}>
              {followers.map((u) => (
                <ListItem
                  key={u.id}
                  secondaryAction={
                    <Button
                      component={Link}
                      href="/messages"
                      size="small"
                      variant="contained"
                      startIcon={<ChatIcon />}
                      sx={{ borderRadius: 999, fontWeight: 800, textTransform: "none", bgcolor: RED }}
                    >
                      Messages
                    </Button>
                  }
                  sx={{ borderRadius: 2, mb: 0.5, bgcolor: "action.hover" }}
                >
                  <ListItemAvatar>
                    <Avatar src={u.avatarUrl} sx={{ width: 40, height: 40 }} />
                  </ListItemAvatar>
                  <ListItemText primary={u.displayName} secondary={`@${u.username}`} />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </SettingsCard>

      <SettingsSectionLabel>Blocked</SettingsSectionLabel>
      <SettingsCard>
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography sx={{ fontSize: "0.9375rem", fontWeight: 600, color: "text.primary", mb: 1 }}>
            Blocked users
          </Typography>
          <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary", mb: 1.5, lineHeight: 1.45 }}>
            Unblock someone to allow DMs and show them in your follower list again.
          </Typography>
          {blockedUsers.length === 0 ? (
            <Typography sx={{ fontSize: 14, color: "text.secondary" }}>You haven&apos;t blocked anyone.</Typography>
          ) : (
            <List dense disablePadding sx={{ maxHeight: 280, overflow: "auto" }}>
              {blockedUsers.map((u) => (
                <ListItem
                  key={u.id}
                  secondaryAction={
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        const next = new Set(blockedIds);
                        next.delete(u.id);
                        persistBlocked(next);
                      }}
                      sx={{ borderRadius: 999, fontWeight: 800, textTransform: "none" }}
                    >
                      Unblock
                    </Button>
                  }
                  sx={{ borderRadius: 2, mb: 0.5, bgcolor: "action.hover" }}
                >
                  <ListItemAvatar>
                    <Avatar src={u.avatarUrl} sx={{ width: 40, height: 40 }} />
                  </ListItemAvatar>
                  <ListItemText primary={u.displayName} secondary={`@${u.username}`} />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </SettingsCard>
    </>
  );
}

export default function MessagingSettingsPage() {
  const data = useMessagesData();

  const [newMessages, setNewMessages] = useState(true);
  const [groupMessages, setGroupMessages] = useState(true);
  const [messageRequests, setMessageRequests] = useState(true);
  const [readReceiptsNotif, setReadReceiptsNotif] = useState(true);

  const [whoCanMessageYou, setWhoCanMessageYou] = useState<"everyone" | "students" | "friends">("students");
  const [readReceiptsPrivacy, setReadReceiptsPrivacy] = useState(true);
  const [typingIndicators, setTypingIndicators] = useState(true);

  const [enterToSend, setEnterToSend] = useState(true);
  const [mediaAutoDownload, setMediaAutoDownload] = useState(false);
  const [saveChatHistory, setSaveChatHistory] = useState(true);
  const [archiveInactive, setArchiveInactive] = useState(false);

  const [allowGroupInvites, setAllowGroupInvites] = useState(true);
  const [muteGroupNotifications, setMuteGroupNotifications] = useState(false);
  const [showGroupPreviews, setShowGroupPreviews] = useState(true);

  const [filterSpam, setFilterSpam] = useState(true);
  const [allowMessageRequests, setAllowMessageRequests] = useState(true);
  const [reportBlockShortcuts, setReportBlockShortcuts] = useState(true);

  const [chatTheme, setChatTheme] = useState<"default" | "dark" | "soft">("default");
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("medium");

  const meId = data.me.id;
  const showLoader = data.loading && data.threads.length === 0;

  return (
    <Box>
      <SettingsPageHeader
        title="Messages settings"
        subtitle="Chat backgrounds, people, notifications, and privacy. Backgrounds sync with the Messages app on this device."
      />

      {showLoader ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress size={36} />
        </Box>
      ) : (
        <>
          <Box
            sx={{
              border: (t) => `1px solid ${t.palette.divider}`,
              borderRadius: 3,
              p: 2,
              mb: 3,
              bgcolor: "background.paper",
              maxWidth: 900,
            }}
          >
            <MessageBackgroundSettingsSection
              threads={data.threads}
              users={data.usersWithMe}
              meId={meId}
              groupPictureByThreadId={data.groupPictureByThreadId}
            />
          </Box>

          <FollowersAndBlocksSection users={data.usersWithMe} meId={meId} />
        </>
      )}

      <SettingsSectionLabel>Notifications</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="blue"
          icon={<MarkEmailUnreadOutlinedIcon fontSize="small" />}
          title="New messages"
          action={<SettingsToggle checked={newMessages} onChange={setNewMessages} />}
        />
        <SettingsRow
          divider
          tint="violet"
          icon={<GroupOutlinedIcon fontSize="small" />}
          title="Group messages"
          action={<SettingsToggle checked={groupMessages} onChange={setGroupMessages} />}
        />
        <SettingsRow
          divider
          tint="orange"
          icon={<PersonAddAltOutlinedIcon fontSize="small" />}
          title="Message requests"
          action={<SettingsToggle checked={messageRequests} onChange={setMessageRequests} />}
        />
        <SettingsRow
          tint="emerald"
          icon={<DoneAllOutlinedIcon fontSize="small" />}
          title="Read receipts"
          description="Let others know when you have read their messages."
          action={<SettingsToggle checked={readReceiptsNotif} onChange={setReadReceiptsNotif} />}
        />
      </SettingsCard>

      <SettingsSectionLabel>Privacy</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="sky"
          icon={<ForumOutlinedIcon fontSize="small" />}
          title="Who can message you"
          action={
            <FormControl size="small" sx={{ minWidth: 170 }}>
              <InputLabel id="msg-who-label">Audience</InputLabel>
              <Select
                labelId="msg-who-label"
                label="Audience"
                value={whoCanMessageYou}
                onChange={(e) => setWhoCanMessageYou(e.target.value as typeof whoCanMessageYou)}
              >
                <MenuItem value="everyone">Everyone</MenuItem>
                <MenuItem value="students">Students only</MenuItem>
                <MenuItem value="friends">Friends only</MenuItem>
              </Select>
            </FormControl>
          }
        />
        <SettingsRow
          divider
          tint="green"
          icon={<DoneAllOutlinedIcon fontSize="small" />}
          title="Read receipts"
          description="Send read receipts to others."
          action={<SettingsToggle checked={readReceiptsPrivacy} onChange={setReadReceiptsPrivacy} />}
        />
        <SettingsRow
          divider
          tint="cyan"
          icon={<VisibilityOutlinedIcon fontSize="small" />}
          title="Typing indicators"
          action={<SettingsToggle checked={typingIndicators} onChange={setTypingIndicators} />}
        />
        <SettingsRow
          tint="red"
          icon={<BlockOutlinedIcon fontSize="small" />}
          title="Blocked users (account)"
          action={
            <Box component={Link} href="/settings/privacy" sx={{ display: "flex", alignItems: "center", color: "inherit" }}>
              <SettingsChevron />
            </Box>
          }
        />
      </SettingsCard>

      <SettingsSectionLabel>Chat preferences</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="slate"
          icon={<KeyboardReturnOutlinedIcon fontSize="small" />}
          title="Enter to send"
          action={<SettingsToggle checked={enterToSend} onChange={setEnterToSend} />}
        />
        <SettingsRow
          divider
          tint="amber"
          icon={<CloudDownloadOutlinedIcon fontSize="small" />}
          title="Media auto-download"
          action={<SettingsToggle checked={mediaAutoDownload} onChange={setMediaAutoDownload} />}
        />
        <SettingsRow
          divider
          tint="blue"
          icon={<HistoryOutlinedIcon fontSize="small" />}
          title="Save chat history"
          action={<SettingsToggle checked={saveChatHistory} onChange={setSaveChatHistory} />}
        />
        <SettingsRow
          tint="violet"
          icon={<ArchiveOutlinedIcon fontSize="small" />}
          title="Archive inactive chats"
          action={<SettingsToggle checked={archiveInactive} onChange={setArchiveInactive} />}
        />
      </SettingsCard>

      <SettingsSectionLabel>Group chats</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="rose"
          icon={<MailOutlineIcon fontSize="small" />}
          title="Allow group invites"
          action={<SettingsToggle checked={allowGroupInvites} onChange={setAllowGroupInvites} />}
        />
        <SettingsRow
          divider
          tint="orange"
          icon={<NotificationsOffOutlinedIcon fontSize="small" />}
          title="Mute group notifications"
          action={<SettingsToggle checked={muteGroupNotifications} onChange={setMuteGroupNotifications} />}
        />
        <SettingsRow
          tint="cyan"
          icon={<PreviewOutlinedIcon fontSize="small" />}
          title="Show group previews"
          action={<SettingsToggle checked={showGroupPreviews} onChange={setShowGroupPreviews} />}
        />
      </SettingsCard>

      <SettingsSectionLabel>Safety</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="green"
          icon={<FilterAltOutlinedIcon fontSize="small" />}
          title="Filter spam messages"
          action={<SettingsToggle checked={filterSpam} onChange={setFilterSpam} />}
        />
        <SettingsRow
          divider
          tint="sky"
          icon={<PersonAddAltOutlinedIcon fontSize="small" />}
          title="Allow message requests"
          action={<SettingsToggle checked={allowMessageRequests} onChange={setAllowMessageRequests} />}
        />
        <SettingsRow
          tint="red"
          icon={<ReportProblemOutlinedIcon fontSize="small" />}
          title="Report / block shortcuts"
          action={<SettingsToggle checked={reportBlockShortcuts} onChange={setReportBlockShortcuts} />}
        />
      </SettingsCard>

      <SettingsSectionLabel>Appearance</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="violet"
          icon={<PaletteOutlinedIcon fontSize="small" />}
          title="Chat theme"
          action={
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="chat-theme-label">Theme</InputLabel>
              <Select
                labelId="chat-theme-label"
                label="Theme"
                value={chatTheme}
                onChange={(e) => setChatTheme(e.target.value as typeof chatTheme)}
              >
                <MenuItem value="default">Default</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
                <MenuItem value="soft">Soft</MenuItem>
              </Select>
            </FormControl>
          }
        />
        <SettingsRow
          tint="amber"
          icon={<TextFieldsOutlinedIcon fontSize="small" />}
          title="Font size"
          action={
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel id="msg-font-label">Size</InputLabel>
              <Select
                labelId="msg-font-label"
                label="Size"
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value as typeof fontSize)}
              >
                <MenuItem value="small">Small</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="large">Large</MenuItem>
              </Select>
            </FormControl>
          }
        />
      </SettingsCard>
    </Box>
  );
}
