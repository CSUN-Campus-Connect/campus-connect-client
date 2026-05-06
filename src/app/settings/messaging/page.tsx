"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";

import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import DoneAllOutlinedIcon from "@mui/icons-material/DoneAllOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import NotificationsOffOutlinedIcon from "@mui/icons-material/NotificationsOffOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import ChatIcon from "@mui/icons-material/Chat";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import {
  SettingsPageHeader,
  SettingsSectionLabel,
  SettingsCard,
  SettingsRow,
  SettingsToggle,
} from "@/components/settings";
import { MessageBackgroundSettingsSection } from "@/components/messages/MessageBackgroundSettingsSection";
import { useMessagesData } from "@/components/messages/useMessagesData";
import type { ID, User } from "@/types/messages";
import { RED } from "@/components/messages/constants";

/** Small info icon that shows a tooltip on hover */
function InfoTip({ text }: { text: string }) {
  return (
    <Tooltip title={text} arrow placement="top">
      <InfoOutlinedIcon
        sx={{ fontSize: 15, color: "text.disabled", cursor: "help", ml: 0.5, flexShrink: 0 }}
      />
    </Tooltip>
  );
}

/** Row title with an inline info tooltip */
function TitleWithTip({ label, tip }: { label: string; tip: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      {label}
      <InfoTip text={tip} />
    </Box>
  );
}

function PeopleYouCanMessageSection({ users, meId }: { users: User[]; meId: ID }) {
  const [query, setQuery] = useState("");

  const people = useMemo(
    () =>
      users
        .filter((u) => u.id !== meId)
        .filter((u) => {
          const q = query.trim().toLowerCase();
          if (!q) return true;
          return (
            u.displayName.toLowerCase().includes(q) ||
            u.username.toLowerCase().includes(q)
          );
        }),
    [users, meId, query]
  );

  return (
    <>
      <SettingsSectionLabel>People you can message</SettingsSectionLabel>
      <SettingsCard>
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary", mb: 1.5, lineHeight: 1.45 }}>
            People on campus you can start a conversation with.
          </Typography>
          <TextField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name"
            fullWidth
            size="small"
            inputProps={{ "aria-label": "Search people by name" }}
            InputProps={{ sx: { borderRadius: 2 } }}
            sx={{ mb: 1.5 }}
          />
          {people.length === 0 ? (
            <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
              No people match your search.
            </Typography>
          ) : (
            <List dense disablePadding sx={{ maxHeight: 280, overflow: "auto" }}>
              {people.map((u) => (
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
                      Message
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

  // Privacy
  const [readReceipts, setReadReceipts] = useState(true);
  const [typingIndicators, setTypingIndicators] = useState(true);

  // Chat preferences
  // Group chats
  const [allowGroupInvites, setAllowGroupInvites] = useState(true);
  const [muteGroupNotifications, setMuteGroupNotifications] = useState(false);

  // Safety
  const [filterSpam, setFilterSpam] = useState(true);
  const [allowMessageRequests, setAllowMessageRequests] = useState(true);

  // TODO: wire to actual account privacy setting from user profile
  const isPublicAccount = false;

  const meId = data.me.id;
  const showLoader = data.loading && data.threads.length === 0;

  return (
    <Box>
      <SettingsPageHeader
        title="Messages settings"
        subtitle="Chat backgrounds, people, privacy, and chat preferences."
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

          <PeopleYouCanMessageSection users={data.usersWithMe} meId={meId} />
        </>
      )}

      <SettingsSectionLabel>Privacy</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          icon={<DoneAllOutlinedIcon fontSize="small" />}
          title="Read receipts"
          description="Others can see when you've read their messages."
          action={
            <SettingsToggle
              checked={readReceipts}
              onChange={setReadReceipts}
              inputProps={{ "aria-label": "Send read receipts" }}
            />
          }
        />
        <SettingsRow
          icon={<VisibilityOutlinedIcon fontSize="small" />}
          title={
            <TitleWithTip
              label="Typing indicators"
              tip="When on, others can see when you're typing — and you can see when they are too."
            />
          }
          action={
            <SettingsToggle
              checked={typingIndicators}
              onChange={setTypingIndicators}
              inputProps={{ "aria-label": "Typing indicators" }}
            />
          }
        />
      </SettingsCard>

      <SettingsSectionLabel>Group chats</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          icon={<MailOutlineIcon fontSize="small" />}
          title="Allow group invites"
          action={
            <SettingsToggle
              checked={allowGroupInvites}
              onChange={setAllowGroupInvites}
              inputProps={{ "aria-label": "Allow group invites" }}
            />
          }
        />
        <SettingsRow
          divider
          icon={<NotificationsOffOutlinedIcon fontSize="small" />}
          title="Mute group notifications"
          action={
            <SettingsToggle
              checked={muteGroupNotifications}
              onChange={setMuteGroupNotifications}
              inputProps={{ "aria-label": "Mute group notifications" }}
            />
          }
        />
      </SettingsCard>

      <SettingsSectionLabel>Safety</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          icon={<FilterAltOutlinedIcon fontSize="small" />}
          title="Filter spam messages"
          action={
            <SettingsToggle
              checked={filterSpam}
              onChange={setFilterSpam}
              inputProps={{ "aria-label": "Filter spam messages" }}
            />
          }
        />
        <SettingsRow
          icon={<PersonAddAltOutlinedIcon fontSize="small" />}
          title={
            <TitleWithTip
              label="Allow message requests"
              tip={
                isPublicAccount
                  ? "Not available for public accounts. Change your visibility in Privacy settings."
                  : "Let people who don't follow you send you a message request."
              }
            />
          }
          action={
            <SettingsToggle
              checked={allowMessageRequests}
              onChange={setAllowMessageRequests}
              disabled={isPublicAccount}
              inputProps={{ "aria-label": "Allow message requests" }}
            />
          }
        />
      </SettingsCard>
    </Box>
  );
}
