"use client";

import { useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import PermMediaOutlinedIcon from "@mui/icons-material/PermMediaOutlined";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";

import {
  SettingsPageHeader,
  SettingsSectionLabel,
  SettingsCard,
  SettingsRow,
  SettingsToggle,
  SettingsChevron,
} from "@/components/settings";

export default function ClubSettingsPage() {
  const [joinType, setJoinType] = useState<"open" | "request" | "invite">("request");
  const [allowMemberInvites, setAllowMemberInvites] = useState(true);
  const [showMembersList, setShowMembersList] = useState(true);

  const [adminsCanPost, setAdminsCanPost] = useState(true);
  const [membersCanPost, setMembersCanPost] = useState(false);
  const [adminsApproveMembers, setAdminsApproveMembers] = useState(true);
  const [adminsCreateEvents, setAdminsCreateEvents] = useState(true);

  const [allowComments, setAllowComments] = useState(true);
  const [allowMediaUploads, setAllowMediaUploads] = useState(true);
  const [pinImportantPosts, setPinImportantPosts] = useState(true);

  const [clubVisibility, setClubVisibility] = useState<"public" | "private">("public");
  const [showInSearch, setShowInSearch] = useState(true);
  const [requireSchoolEmail, setRequireSchoolEmail] = useState(true);

  const [whoCanCreateEvents, setWhoCanCreateEvents] = useState<"admins" | "moderators" | "members">("admins");
  const [eventReminders, setEventReminders] = useState(true);
  const [rsvpRequired, setRsvpRequired] = useState(true);

  const [newPostsNotif, setNewPostsNotif] = useState(true);
  const [eventRemindersNotif, setEventRemindersNotif] = useState(true);
  const [joinRequestsNotif, setJoinRequestsNotif] = useState(true);

  const [contentFiltering, setContentFiltering] = useState(true);

  return (
    <Box>
      <SettingsPageHeader
        title="Club settings"
        subtitle="Defaults for clubs you manage. Per-club overrides can ship with admin tools."
      />

      <SettingsSectionLabel>Membership</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="violet"
          icon={<GroupAddOutlinedIcon fontSize="small" />}
          title="Join type"
          action={
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="join-type-label">Type</InputLabel>
              <Select
                labelId="join-type-label"
                label="Type"
                value={joinType}
                onChange={(e) => setJoinType(e.target.value as typeof joinType)}
              >
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="request">Request to join</MenuItem>
                <MenuItem value="invite">Invite only</MenuItem>
              </Select>
            </FormControl>
          }
        />
        <SettingsRow
          divider
          tint="blue"
          icon={<MailOutlineIcon fontSize="small" />}
          title="Allow member invites"
          action={<SettingsToggle checked={allowMemberInvites} onChange={setAllowMemberInvites} />}
        />
        <SettingsRow
          tint="cyan"
          icon={<PeopleOutlineIcon fontSize="small" />}
          title="Show members list"
          action={<SettingsToggle checked={showMembersList} onChange={setShowMembersList} />}
        />
      </SettingsCard>

      <SettingsSectionLabel>Roles &amp; permissions</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="brand"
          icon={<AdminPanelSettingsOutlinedIcon fontSize="small" />}
          title="Admins can post"
          action={<SettingsToggle checked={adminsCanPost} onChange={setAdminsCanPost} />}
        />
        <SettingsRow
          divider
          tint="slate"
          icon={<EditNoteOutlinedIcon fontSize="small" />}
          title="Members can post"
          action={<SettingsToggle checked={membersCanPost} onChange={setMembersCanPost} />}
        />
        <SettingsRow
          divider
          tint="emerald"
          icon={<HowToRegOutlinedIcon fontSize="small" />}
          title="Admins can approve members"
          action={<SettingsToggle checked={adminsApproveMembers} onChange={setAdminsApproveMembers} />}
        />
        <SettingsRow
          tint="orange"
          icon={<EventAvailableOutlinedIcon fontSize="small" />}
          title="Admins can create events"
          action={<SettingsToggle checked={adminsCreateEvents} onChange={setAdminsCreateEvents} />}
        />
      </SettingsCard>

      <SettingsSectionLabel>Posting</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="sky"
          icon={<ChatBubbleOutlineIcon fontSize="small" />}
          title="Allow comments"
          action={<SettingsToggle checked={allowComments} onChange={setAllowComments} />}
        />
        <SettingsRow
          divider
          tint="amber"
          icon={<PermMediaOutlinedIcon fontSize="small" />}
          title="Allow media uploads"
          action={<SettingsToggle checked={allowMediaUploads} onChange={setAllowMediaUploads} />}
        />
        <SettingsRow
          tint="violet"
          icon={<PushPinOutlinedIcon fontSize="small" />}
          title="Pin important posts"
          action={<SettingsToggle checked={pinImportantPosts} onChange={setPinImportantPosts} />}
        />
      </SettingsCard>

      <SettingsSectionLabel>Privacy</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint={clubVisibility === "private" ? "slate" : "sky"}
          icon={clubVisibility === "private" ? <LockOutlinedIcon fontSize="small" /> : <PublicOutlinedIcon fontSize="small" />}
          title="Club visibility"
          action={
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="club-vis-label">Visibility</InputLabel>
              <Select
                labelId="club-vis-label"
                label="Visibility"
                value={clubVisibility}
                onChange={(e) => setClubVisibility(e.target.value as typeof clubVisibility)}
              >
                <MenuItem value="public">Public</MenuItem>
                <MenuItem value="private">Private</MenuItem>
              </Select>
            </FormControl>
          }
        />
        <SettingsRow
          divider
          tint="blue"
          icon={<SearchOutlinedIcon fontSize="small" />}
          title="Show in search"
          action={<SettingsToggle checked={showInSearch} onChange={setShowInSearch} />}
        />
        <SettingsRow
          tint="green"
          icon={<EmailOutlinedIcon fontSize="small" />}
          title="Require school email"
          action={<SettingsToggle checked={requireSchoolEmail} onChange={setRequireSchoolEmail} />}
        />
      </SettingsCard>

      <SettingsSectionLabel>Events</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="orange"
          icon={<EventAvailableOutlinedIcon fontSize="small" />}
          title="Who can create events"
          action={
            <FormControl size="small" sx={{ minWidth: 190 }}>
              <InputLabel id="events-who-label">Creators</InputLabel>
              <Select
                labelId="events-who-label"
                label="Creators"
                value={whoCanCreateEvents}
                onChange={(e) => setWhoCanCreateEvents(e.target.value as typeof whoCanCreateEvents)}
              >
                <MenuItem value="admins">Admins only</MenuItem>
                <MenuItem value="moderators">Moderators &amp; admins</MenuItem>
                <MenuItem value="members">All members</MenuItem>
              </Select>
            </FormControl>
          }
        />
        <SettingsRow
          divider
          tint="amber"
          icon={<NotificationsNoneOutlinedIcon fontSize="small" />}
          title="Event reminders"
          action={<SettingsToggle checked={eventReminders} onChange={setEventReminders} />}
        />
        <SettingsRow
          tint="cyan"
          icon={<HowToRegOutlinedIcon fontSize="small" />}
          title="RSVP required"
          action={<SettingsToggle checked={rsvpRequired} onChange={setRsvpRequired} />}
        />
      </SettingsCard>

      <SettingsSectionLabel>Notifications</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="rose"
          icon={<EditNoteOutlinedIcon fontSize="small" />}
          title="New posts"
          action={<SettingsToggle checked={newPostsNotif} onChange={setNewPostsNotif} />}
        />
        <SettingsRow
          divider
          tint="orange"
          icon={<EventAvailableOutlinedIcon fontSize="small" />}
          title="Event reminders"
          action={<SettingsToggle checked={eventRemindersNotif} onChange={setEventRemindersNotif} />}
        />
        <SettingsRow
          tint="blue"
          icon={<GroupAddOutlinedIcon fontSize="small" />}
          title="Join requests"
          action={<SettingsToggle checked={joinRequestsNotif} onChange={setJoinRequestsNotif} />}
        />
      </SettingsCard>

      <SettingsSectionLabel>Moderation</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="red"
          icon={<BlockOutlinedIcon fontSize="small" />}
          title="Blocked members"
          action={
            <Box component={Link} href="/settings/privacy" sx={{ display: "flex", alignItems: "center", color: "inherit" }}>
              <SettingsChevron />
            </Box>
          }
        />
        <SettingsRow
          divider
          tint="amber"
          icon={<FlagOutlinedIcon fontSize="small" />}
          title="Report settings"
          action={
            <Box component={Link} href="/settings/support" sx={{ display: "flex", alignItems: "center", color: "inherit" }}>
              <SettingsChevron />
            </Box>
          }
        />
        <SettingsRow
          tint="green"
          icon={<FilterAltOutlinedIcon fontSize="small" />}
          title="Content filtering"
          action={<SettingsToggle checked={contentFiltering} onChange={setContentFiltering} />}
        />
      </SettingsCard>
    </Box>
  );
}
