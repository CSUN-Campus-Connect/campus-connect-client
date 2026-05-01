"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import ContactMailOutlinedIcon from "@mui/icons-material/ContactMailOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import QueueOutlinedIcon from "@mui/icons-material/QueueOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import AlarmOnOutlinedIcon from "@mui/icons-material/AlarmOnOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";

import {
  SettingsPageHeader,
  SettingsSectionLabel,
  SettingsCard,
  SettingsRow,
  SettingsToggle,
} from "@/components/settings";

const MAX_ATTENDEES_OPTIONS = [25, 50, 100, 200, 500] as const;

export default function EventSettingsPage() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [phoneNotif, setPhoneNotif] = useState(true);
  const [preferredContact, setPreferredContact] = useState<"email" | "phone" | "both" | "app">("both");
  const [reminder, setReminder] = useState<"15m" | "1h" | "1d" | "1w">("1d");

  const [requireRsvp, setRequireRsvp] = useState(true);
  const [waitlist, setWaitlist] = useState(true);
  const [maxAttendees, setMaxAttendees] = useState<number>(100);
  const [autoConfirmRsvp, setAutoConfirmRsvp] = useState(true);

  const [audience, setAudience] = useState<"campus" | "public" | "private">("campus");
  const [showInSearch, setShowInSearch] = useState(true);
  const [privateInviteOnly, setPrivateInviteOnly] = useState(false);

  const [showOrganizerEmail, setShowOrganizerEmail] = useState(true);
  const [showOrganizerPhone, setShowOrganizerPhone] = useState(false);
  const [allowAttendeeMessages, setAllowAttendeeMessages] = useState(true);

  const [eventChanges, setEventChanges] = useState(true);
  const [eventCancellations, setEventCancellations] = useState(true);
  const [startingSoon, setStartingSoon] = useState(true);
  const [rsvpConfirmations, setRsvpConfirmations] = useState(true);

  const [checkInRequired, setCheckInRequired] = useState(false);
  const [lateEntryAllowed, setLateEntryAllowed] = useState(true);
  const [showAttendeeList, setShowAttendeeList] = useState(true);

  return (
    <Box>
      <SettingsPageHeader
        title="Event settings"
        subtitle="Contact, RSVP, visibility, and notifications for events you host or attend."
      />

      <SettingsSectionLabel>Contact preferences</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="blue"
          icon={<EmailOutlinedIcon fontSize="small" />}
          title="Email notifications"
          action={<SettingsToggle checked={emailNotif} onChange={setEmailNotif} inputProps={{ "aria-label": "Email notifications" }} />}
        />
        <SettingsRow
          divider
          tint="green"
          icon={<PhoneOutlinedIcon fontSize="small" />}
          title="Phone notifications"
          action={<SettingsToggle checked={phoneNotif} onChange={setPhoneNotif} inputProps={{ "aria-label": "Phone notifications" }} />}
        />
        <SettingsRow
          divider
          tint="violet"
          icon={<ContactMailOutlinedIcon fontSize="small" />}
          title="Preferred contact method"
          action={
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="pref-contact-label">Method</InputLabel>
              <Select
                labelId="pref-contact-label"
                label="Method"
                value={preferredContact}
                onChange={(e) => setPreferredContact(e.target.value as typeof preferredContact)}
              >
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="phone">Phone</MenuItem>
                <MenuItem value="both">Both</MenuItem>
                <MenuItem value="app">In-app only</MenuItem>
              </Select>
            </FormControl>
          }
        />
        <SettingsRow
          tint="orange"
          icon={<ScheduleOutlinedIcon fontSize="small" />}
          title="Reminder time"
          description="Default reminder before events you care about."
          action={
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="reminder-label">When</InputLabel>
              <Select
                labelId="reminder-label"
                label="When"
                value={reminder}
                onChange={(e) => setReminder(e.target.value as typeof reminder)}
              >
                <MenuItem value="15m">15 minutes before</MenuItem>
                <MenuItem value="1h">1 hour before</MenuItem>
                <MenuItem value="1d">1 day before</MenuItem>
                <MenuItem value="1w">1 week before</MenuItem>
              </Select>
            </FormControl>
          }
        />
      </SettingsCard>

      <SettingsSectionLabel>RSVP</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="emerald"
          icon={<HowToRegOutlinedIcon fontSize="small" />}
          title="Require RSVP"
          action={<SettingsToggle checked={requireRsvp} onChange={setRequireRsvp} inputProps={{ "aria-label": "Require RSVP" }} />}
        />
        <SettingsRow
          divider
          tint="cyan"
          icon={<QueueOutlinedIcon fontSize="small" />}
          title="Waitlist"
          action={<SettingsToggle checked={waitlist} onChange={setWaitlist} inputProps={{ "aria-label": "Enable waitlist" }} />}
        />
        <SettingsRow
          divider
          tint="slate"
          icon={<GroupsOutlinedIcon fontSize="small" />}
          title="Max attendees"
          action={
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel id="max-att-label">Cap</InputLabel>
              <Select
                labelId="max-att-label"
                label="Cap"
                value={maxAttendees}
                onChange={(e) => setMaxAttendees(Number(e.target.value))}
              >
                {MAX_ATTENDEES_OPTIONS.map((n) => (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          }
        />
        <SettingsRow
          tint="green"
          icon={<CheckCircleOutlineIcon fontSize="small" />}
          title="Auto confirm RSVP"
          action={<SettingsToggle checked={autoConfirmRsvp} onChange={setAutoConfirmRsvp} inputProps={{ "aria-label": "Auto confirm RSVP" }} />}
        />
      </SettingsCard>

      <SettingsSectionLabel>Visibility</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="sky"
          icon={<VisibilityOutlinedIcon fontSize="small" />}
          title="Audience"
          description="Who can discover events you create."
          action={
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="event-vis-label">Audience</InputLabel>
              <Select
                labelId="event-vis-label"
                label="Audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value as typeof audience)}
              >
                <MenuItem value="campus">Campus only</MenuItem>
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
          action={<SettingsToggle checked={showInSearch} onChange={setShowInSearch} inputProps={{ "aria-label": "Show event in search" }} />}
        />
        <SettingsRow
          tint="violet"
          icon={<LockOutlinedIcon fontSize="small" />}
          title="Private invite only"
          description="Hide from browse; share link or invite only."
          action={<SettingsToggle checked={privateInviteOnly} onChange={setPrivateInviteOnly} inputProps={{ "aria-label": "Private invite only" }} />}
        />
      </SettingsCard>

      <SettingsSectionLabel>Organizer info</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="blue"
          icon={<EmailOutlinedIcon fontSize="small" />}
          title="Show organizer email"
          action={<SettingsToggle checked={showOrganizerEmail} onChange={setShowOrganizerEmail} inputProps={{ "aria-label": "Show organizer email" }} />}
        />
        <SettingsRow
          divider
          tint="slate"
          icon={<BadgeOutlinedIcon fontSize="small" />}
          title="Show organizer phone"
          action={<SettingsToggle checked={showOrganizerPhone} onChange={setShowOrganizerPhone} inputProps={{ "aria-label": "Show organizer phone" }} />}
        />
        <SettingsRow
          tint="cyan"
          icon={<ForumOutlinedIcon fontSize="small" />}
          title="Allow attendee messages"
          action={<SettingsToggle checked={allowAttendeeMessages} onChange={setAllowAttendeeMessages} inputProps={{ "aria-label": "Allow attendee messages" }} />}
        />
      </SettingsCard>

      <SettingsSectionLabel>Notifications</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="orange"
          icon={<NotificationsActiveOutlinedIcon fontSize="small" />}
          title="Event changes"
          action={<SettingsToggle checked={eventChanges} onChange={setEventChanges} inputProps={{ "aria-label": "Event changes notifications" }} />}
        />
        <SettingsRow
          divider
          tint="red"
          icon={<EventBusyOutlinedIcon fontSize="small" />}
          title="Event cancellations"
          action={<SettingsToggle checked={eventCancellations} onChange={setEventCancellations} inputProps={{ "aria-label": "Event cancellations notifications" }} />}
        />
        <SettingsRow
          divider
          tint="amber"
          icon={<AlarmOnOutlinedIcon fontSize="small" />}
          title="Starting soon"
          action={<SettingsToggle checked={startingSoon} onChange={setStartingSoon} inputProps={{ "aria-label": "Starting soon notifications" }} />}
        />
        <SettingsRow
          tint="emerald"
          icon={<AssignmentTurnedInOutlinedIcon fontSize="small" />}
          title="RSVP confirmations"
          action={<SettingsToggle checked={rsvpConfirmations} onChange={setRsvpConfirmations} inputProps={{ "aria-label": "RSVP confirmations notifications" }} />}
        />
      </SettingsCard>

      <SettingsSectionLabel>Attendance</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="violet"
          icon={<LoginOutlinedIcon fontSize="small" />}
          title="Check-in required"
          action={<SettingsToggle checked={checkInRequired} onChange={setCheckInRequired} inputProps={{ "aria-label": "Check-in required" }} />}
        />
        <SettingsRow
          divider
          tint="sky"
          icon={<AccessTimeOutlinedIcon fontSize="small" />}
          title="Late entry allowed"
          action={<SettingsToggle checked={lateEntryAllowed} onChange={setLateEntryAllowed} inputProps={{ "aria-label": "Late entry allowed" }} />}
        />
        <SettingsRow
          tint="blue"
          icon={<ListAltOutlinedIcon fontSize="small" />}
          title="Show attendee list"
          action={<SettingsToggle checked={showAttendeeList} onChange={setShowAttendeeList} inputProps={{ "aria-label": "Show attendee list" }} />}
        />
      </SettingsCard>
    </Box>
  );
}
