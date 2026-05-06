// ============================================================
// StudyGroupsPanel.tsx — Backend Integration Notes
// ============================================================

// Study Groups is an event-creation and discovery feature where
// CSUN students can post or find group study sessions, see who
// is attending, and push events to their calendar.
//
// Think of it as a lightweight event board / LFG (Looking For
// Group) system scoped to the CSUN student body.
//
// ── Suggested DB Tables ──────────────────────────────────────
//
//   study_groups
//     id                UUID PK
//     course_subject    VARCHAR(20)
//     course_number     VARCHAR(20)
//     topic             VARCHAR(255) NOT NULL
//     tags              TEXT[]           ← normalized tag array
//     date_time         TIMESTAMPTZ NOT NULL
//     location          TEXT NOT NULL
//     is_virtual        BOOLEAN DEFAULT false
//     meeting_link      TEXT             ← only set if is_virtual
//     max_members       INT DEFAULT 8
//     notes             TEXT
//     is_private        BOOLEAN DEFAULT false
//     created_by        VARCHAR(255) NOT NULL  ← FK → users.email
//     created_at        TIMESTAMPTZ DEFAULT NOW()
//     expires_at        TIMESTAMPTZ            ← created_at + 3 days (enforced via CRON or DB trigger)
//
//   study_group_members
//     id                UUID PK
//     group_id          UUID FK → study_groups.id ON DELETE CASCADE
//     member_email      VARCHAR(255) NOT NULL  ← must end in @my.csun.edu
//     joined_at         TIMESTAMPTZ DEFAULT NOW()
//     UNIQUE(group_id, member_email)
//
//   study_group_invites
//     id                UUID PK
//     group_id          UUID FK → study_groups.id ON DELETE CASCADE
//     invited_email     VARCHAR(255) NOT NULL
//     invited_at        TIMESTAMPTZ DEFAULT NOW()
//
// ── Suggested API Routes ─────────────────────────────────────
//   GET    /api/study-groups                  list public groups
//   GET    /api/study-groups/mine             groups the current user created or joined
//   POST   /api/study-groups                  create a new group (auth required)
//   DELETE /api/study-groups/:id              delete a group (owner only)
//   POST   /api/study-groups/:id/join         join a group
//   DELETE /api/study-groups/:id/leave        leave a group
//   GET    /api/study-groups/:id/calendar     returns .ics file or redirect to Google Calendar
//
// ── Auth ─────────────────────────────────────────────────────
// All write routes (create, join, leave, delete) require the
// user to be authenticated via CSUN SSO / email-verified JWT.
// Once auth is live, remove all self-reported email fields from
// the forms and derive identity from req.user on the server.
// ============================================================

"use client";

import * as React from "react";
import {
  Alert, Avatar, AvatarGroup, Box, Button, Chip, Dialog, DialogContent,
  Checkbox, Divider, FormControlLabel, IconButton, InputAdornment, Paper,
  Snackbar, Stack, Switch, TextField, Tooltip, Typography,
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import PlaceIcon from "@mui/icons-material/Place";
import VideocamIcon from "@mui/icons-material/Videocam";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SchoolIcon from "@mui/icons-material/School";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import NotesIcon from "@mui/icons-material/StickyNote2";
import EventNoteIcon from "@mui/icons-material/EventNote";
import LockIcon from "@mui/icons-material/Lock";

import type { StudyGroup } from "../shared/constants";

// BACKEND TODO: Remove mockStudyGroups import entirely once real
// API fetching is wired up. This seeds local state for dev only.
import { mockStudyGroups } from "../shared/mockData";

const SPECIAL_PRIVATE_TAG = "Private" as const;

// BACKEND TODO: Fetch TOPIC_TAGS dynamically from the backend
// so they can be managed without a code deploy:
//   GET /api/study-groups/tags → string[]
// Consider adding a `usageCount` field so popular tags surface first.
const TOPIC_TAGS = [
  "AI", "STEM", "Computer Science", "Math", "Physics", "Chemistry", "Biology", "Engineering", "Art", "Design",
  "Music", "Literature", "Writing", "History", "Psychology", "Business", "Economics", "Language", "Philosophy",
] as const;

// normalizeEmail is client-side convenience. The server must also
// normalize (trim + lowercase) all emails before DB writes.
function normalizeEmail(s: string) {
  return s.trim().toLowerCase();
}

// BACKEND NOTE: isValidCsunEmail is a frontend guard only.
// Mirror this exact regex (or equivalent) as a CHECK constraint on
// study_group_members.member_email and as middleware validation on
// every route that accepts an email parameter. Never trust the client.
function isValidCsunEmail(email: string) {
  const e = normalizeEmail(email);
  return /^[^\s@]+@my\.csun\.edu$/i.test(e);
}

// ── Helpers ──────────────────────────────────────────────────

// BACKEND TODO: Remove makeId. All record IDs should be the
// UUID primary key returned by the database after INSERT.
// Using client-generated IDs risks collisions and undermines
// the DB as the source of truth.
function makeId() { return `${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`; }

// daysUntil / isPast are purely presentational — keep client-side.
// The server should enforce expiry logic via a scheduled job:
//   DELETE FROM study_groups WHERE expires_at < NOW()
//   (runs as a CRON or DB-level TTL trigger)
function daysUntil(iso: string) { return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000); }
function isPast(iso: string) { return new Date(iso) < new Date(); }

// formatDT is display-only — keep client-side.
// Store and return all timestamps as UTC ISO-8601 from the DB.
function formatDT(iso: string) {
  return new Date(iso).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

// ─── Sub-tab pill bar ─────────────────────────────────────────────────────────
// BACKEND NOTE: `counts` are currently derived client-side from
// the full groups array. Once API pagination is live, fetch counts
// from lightweight count endpoints instead:
//   GET /api/study-groups/counts → { public: number; mine: number }
function SubTabBar({
  active,
  counts,
  onChange,
  onCreate,
}: {
  active: number;
  counts: number[]; // BACKEND: from count API, not derived from full list
  onChange: (i: number) => void;
  onCreate: () => void;
}) {
  const tabs = [
    { label: "LFG", icon: <SchoolIcon sx={{ fontSize: 13 }} /> },
    { label: "My Groups",  icon: <EventNoteIcon sx={{ fontSize: 13 }} /> },
  ];
  return (
    <Stack direction="row" spacing={0.75} sx={{ mb: 2.5, flexWrap: "wrap", gap: 0.75, alignItems: "center", justifyContent: "space-between" }}>
      <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.75 }}>
        {tabs.map((t, i) => (
          <Box key={i} onClick={() => onChange(i)} sx={{
            display: "flex", alignItems: "center", gap: 0.6,
            px: 1.5, py: 0.6, borderRadius: 999, cursor: "pointer", userSelect: "none",
            transition: "all 0.15s",
            bgcolor: active === i ? "#fff" : "rgba(255,255,255,0.10)",
            color: active === i ? "#A80532" : "rgba(255,255,255,0.75)",
            border: active === i ? "none" : "1px solid rgba(255,255,255,0.18)",
            fontWeight: 700, fontSize: "0.80rem", fontFamily: "'DM Sans', sans-serif",
            "&:hover": { bgcolor: active === i ? "#fff" : "rgba(255,255,255,0.18)" },
          }}>
            {t.icon} {t.label}
            {counts[i] > 0 && (
              <Box sx={{ ml: 0.25, px: 0.6, py: 0.1, borderRadius: 999, fontSize: "0.60rem", fontWeight: 900, bgcolor: active === i ? "#A80532" : "rgba(255,255,255,0.22)", color: active === i ? "#fff" : "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>
                {counts[i]}
              </Box>
            )}
          </Box>
        ))}
      </Stack>

      {/* BACKEND: "Create Group" button opens CreateModal.
          Gate this button behind auth — only show it when the user
          has a valid CSUN session. Unauthenticated visitors should
          see a "Sign in to create a group" prompt instead. */}
      <Button variant="contained" startIcon={<AddIcon sx={{ fontSize: "14px !important" }} />} onClick={onCreate}
        sx={{ bgcolor: "#fff", color: "#A80532", fontWeight: 950, borderRadius: 999, fontSize: "0.78rem", px: 1.75, "&:hover": { bgcolor: "rgba(255,255,255,0.92)" }, flexShrink: 0, py: 0.75 }}>
        Create Group
      </Button>
    </Stack>
  );
}

// ─── Urgency chip ─────────────────────────────────────────────────────────────
// BACKEND NOTE: isPast() and daysUntil() are computed from group.dateTime.
// The server should also enforce a TTL: automatically soft-delete or
// archive groups where date_time + 3 days < NOW() via a scheduled job.
// The client's "Past" label is purely cosmetic — do not rely on it for
// access control or data cleanup.
function UrgencyChip({ dateTime }: { dateTime: string }) {
  const d = daysUntil(dateTime);
  if (isPast(dateTime)) return <Chip label="Past" size="small" sx={{ height: 18, fontSize: "0.65rem", fontWeight: 900, bgcolor: "rgba(0,0,0,0.07)", color: "rgba(0,0,0,0.45)" }} />;
  if (d === 0) return <Chip label="Today!" size="small" sx={{ height: 18, fontSize: "0.65rem", fontWeight: 900, bgcolor: "#fef2f2", color: "#dc2626" }} />;
  if (d === 1) return <Chip label="Tomorrow" size="small" sx={{ height: 18, fontSize: "0.65rem", fontWeight: 900, bgcolor: "#fffbeb", color: "#d97706" }} />;
  return <Chip label={`${d}d away`} size="small" sx={{ height: 18, fontSize: "0.65rem", fontWeight: 900, bgcolor: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.55)" }} />;
}

// ─── Group Card ───────────────────────────────────────────────────────────────
// BACKEND NOTE: GroupCard is a display-only component.
// The `group` prop should be the object returned from:
//   GET /api/study-groups          (for the LFG tab)
//   GET /api/study-groups/mine     (for My Groups tab)
//
// `isMember` and `isOwner` should be derived from the API response
// (e.g., a `isMember: boolean` field on each group object) rather
// than computed by comparing local ID arrays client-side.
function GroupCard({ group, isMember, isOwner, onJoin, onLeave, onDelete, onAddToCalendar }: {
  group: StudyGroup;
  isMember: boolean;  // BACKEND: derive from API response field, not local state
  isOwner: boolean;   // BACKEND: derive from API response field (group.createdBy === req.user.email)
  onJoin: (g: StudyGroup) => void;
  onLeave: (id: string) => void;
  onDelete: (id: string) => void;
  onAddToCalendar: (g: StudyGroup) => void;
}) {
  const isFull = group.maxMembers !== undefined && group.members.length >= group.maxMembers;
  const past = isPast(group.dateTime);
  const courseLabel = `${group.courseSubject || "STUDY"}${group.courseNumber ? ` ${group.courseNumber}` : ""}`.trim();

  return (
    <Paper elevation={0} sx={{
      position: "relative",
      borderRadius: 4,
      border: isMember ? "1.5px solid #bbf7d0" : "1.5px solid rgba(0,0,0,0.07)",
      bgcolor: "#fff", overflow: "hidden",
      opacity: past ? 0.72 : 1,
      transition: "box-shadow 0.2s, transform 0.2s",
      "&:hover": !past ? { boxShadow: "0 8px 28px rgba(0,0,0,0.11)", transform: "translateY(-2px)" } : {},
    }}>
      {/* BACKEND: group.isPrivate is stored as the `is_private` BOOLEAN column
          in study_groups. The server must enforce that private groups are never
          returned in the public LFG list — only to members on the invite list. */}
      {group.isPrivate && (
        <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none", bgcolor: "rgba(168,5,50,0.04)" }} />
      )}
      <Box sx={{ height: 3, bgcolor: "#A80532" }} />
      <Box sx={{ p: 2.25 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ mb: 1.25 }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" spacing={0.65} alignItems="center" flexWrap="wrap" sx={{ mb: 0.5 }}>
              {/* BACKEND: courseSubject + courseNumber → study_groups.course_subject + course_number */}
              <Chip label={courseLabel} size="small"
                sx={{ bgcolor: "#A80532", color: "#fff", fontWeight: 900, fontSize: "0.68rem", height: 20 }} />
              <Chip
                icon={group.isPrivate ? <LockIcon sx={{ fontSize: "12px !important" }} /> : undefined}
                label={group.isPrivate ? "Private" : "Public"}
                size="small"
                sx={{ height: 18, fontSize: "0.62rem", fontWeight: 900, bgcolor: group.isPrivate ? "rgba(168,5,50,0.08)" : "rgba(0,0,0,0.05)", color: group.isPrivate ? "#A80532" : "rgba(0,0,0,0.55)", "& .MuiChip-icon": { color: group.isPrivate ? "#A80532" : "rgba(0,0,0,0.45)" } }}
              />
              {isMember && (
                <Chip icon={<CheckCircleIcon sx={{ fontSize: "10px !important" }} />} label="Joined" size="small"
                  sx={{ height: 18, fontSize: "0.62rem", fontWeight: 900, bgcolor: "#f0fdf4", color: "#16a34a", "& .MuiChip-icon": { color: "#16a34a" } }} />
              )}
            </Stack>
            {/* BACKEND: group.topic → study_groups.topic VARCHAR(255) */}
            <Typography fontWeight={950} sx={{ fontSize: "0.95rem", lineHeight: 1.25, color: "#111" }}>{group.topic}</Typography>
            {/* BACKEND: group.tags → study_groups.tags TEXT[] (array column in Postgres)
                or a normalized study_group_tags join table for more flexible querying */}
            {(group.tags?.length ?? 0) > 0 && (
              <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.85, gap: 0.5 }}>
                {group.tags!.slice(0, 4).map((t) => (
                  <Chip key={t} label={t} size="small" sx={{ height: 16, fontSize: "0.60rem", bgcolor: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.55)", fontWeight: 900 }} />
                ))}
              </Stack>
            )}
          </Box>
          {/* BACKEND: group.dateTime → study_groups.date_time TIMESTAMPTZ
              Always stored and returned as UTC. The client formats for local display. */}
          <UrgencyChip dateTime={group.dateTime} />
        </Stack>

        <Stack spacing={0.4} sx={{ mb: 1.25 }}>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <AccessTimeIcon sx={{ fontSize: 13, color: "rgba(0,0,0,0.38)" }} />
            <Typography sx={{ fontSize: "0.78rem", color: "rgba(0,0,0,0.62)" }}>{formatDT(group.dateTime)}</Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} alignItems="center">
            {group.isVirtual ? <VideocamIcon sx={{ fontSize: 13, color: "rgba(0,0,0,0.38)" }} /> : <PlaceIcon sx={{ fontSize: 13, color: "rgba(0,0,0,0.38)" }} />}
            <Typography sx={{ fontSize: "0.78rem", color: "rgba(0,0,0,0.62)" }}>
              {/* BACKEND: group.location → study_groups.location TEXT
                  group.isVirtual → study_groups.is_virtual BOOLEAN
                  group.meetingLink → study_groups.meeting_link TEXT (nullable, only when is_virtual)
                  Validate meetingLink server-side: must be https://, and ideally restricted
                  to trusted domains (zoom.us, meet.google.com, teams.microsoft.com) to
                  prevent phishing links from being posted. */}
              {group.isVirtual && group.meetingLink
                ? <a href={group.meetingLink} target="_blank" rel="noreferrer" style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>{group.location} ↗</a>
                : group.location}
            </Typography>
          </Stack>
          {group.notes && (
            <Stack direction="row" spacing={0.75} alignItems="flex-start">
              <NotesIcon sx={{ fontSize: 13, color: "rgba(0,0,0,0.38)", mt: 0.15 }} />
              {/* BACKEND: group.notes → study_groups.notes TEXT (nullable)
                  Sanitize on the server before storing to prevent XSS in rendered output. */}
              <Typography sx={{ fontSize: "0.75rem", color: "rgba(0,0,0,0.50)", lineHeight: 1.4 }}>{group.notes}</Typography>
            </Stack>
          )}
        </Stack>

        <Divider sx={{ mb: 1.25 }} />

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={0.75} alignItems="center">
            {/* BACKEND: group.members is populated from the study_group_members table.
                Return it as an array of { id, name/email } objects from the API.
                For performance, only include the first 5 member avatars (matching the
                AvatarGroup max={5}) via LIMIT 5 in the JOIN query, plus a total count. */}
            <AvatarGroup max={5} sx={{ "& .MuiAvatar-root": { width: 22, height: 22, fontSize: "0.60rem", bgcolor: "#A80532" } }}>
              {group.members.map((m) => <Avatar key={m.id}>{m.name[0]}</Avatar>)}
            </AvatarGroup>
            {/* BACKEND: group.members.length is the current count from the DB.
                group.maxMembers → study_groups.max_members INT.
                Enforce the cap server-side in the JOIN route: if the current member
                count >= max_members, return 409 Conflict and reject the join. */}
            <Typography sx={{ fontSize: "0.70rem", color: "rgba(0,0,0,0.48)" }}>
              {group.members.length}{group.maxMembers ? `/${group.maxMembers}` : ""}
            </Typography>
            {isFull && !isMember && (
              <Chip label="Full" size="small" sx={{ height: 16, fontSize: "0.60rem", bgcolor: "#fef2f2", color: "#dc2626", fontWeight: 900 }} />
            )}
          </Stack>

          {!past && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              {/* BACKEND: "Add to Calendar" generates a Google Calendar URL client-side
                  using group.dateTime and group.location / group.meetingLink.
                  Future enhancement: offer a server-side .ics file download via
                  GET /api/study-groups/:id/calendar → returns an iCalendar (.ics) file
                  compatible with Apple Calendar, Outlook, and Google Calendar import.
                  This is more reliable than deep-linking to Google Calendar. */}
              <Tooltip title="Add to Calendar">
                <IconButton size="small" aria-label="Add to calendar" sx={{ p: 0.5, color: "rgba(0,0,0,0.35)", "&:hover": { color: "#A80532", bgcolor: "rgba(168,5,50,0.06)" } }}
                  onClick={() => onAddToCalendar(group)}>
                  <CalendarTodayIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
              {isOwner ? (
                // BACKEND: onDelete → DELETE /api/study-groups/:id
                // Server must verify req.user.email === study_groups.created_by
                // before allowing deletion. Never rely on the client's isOwner flag alone.
                // On delete, CASCADE to study_group_members and study_group_invites.
                <Tooltip title="Delete group">
                  <IconButton size="small" aria-label="Delete study group" sx={{ p: 0.5, color: "rgba(0,0,0,0.32)", "&:hover": { color: "#dc2626", bgcolor: "rgba(220,38,38,0.06)" } }}
                    onClick={() => onDelete(group.id)}>
                    <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              ) : isMember ? (
                // BACKEND: onLeave → DELETE /api/study-groups/:id/leave
                // Deletes the row in study_group_members where
                //   group_id = :id AND member_email = req.user.email
                <Button size="small" variant="outlined" startIcon={<ExitToAppIcon sx={{ fontSize: "11px !important" }} />}
                  onClick={() => onLeave(group.id)}
                  sx={{ borderRadius: 999, fontWeight: 900, fontSize: "0.68rem", borderColor: "rgba(0,0,0,0.20)", color: "rgba(0,0,0,0.55)", px: 1, "&:hover": { borderColor: "#dc2626", color: "#dc2626" } }}>
                  Leave
                </Button>
              ) : !isFull ? (
                // BACKEND: onJoin → opens JoinModal → POST /api/study-groups/:id/join
                // See JoinModal below for full API details.
                <Button size="small" variant="contained" startIcon={<PersonAddIcon sx={{ fontSize: "11px !important" }} />}
                  onClick={() => onJoin(group)}
                  sx={{ bgcolor: "#A80532", "&:hover": { bgcolor: "#810326" }, fontWeight: 900, borderRadius: 999, fontSize: "0.70rem", px: 1.25 }}>
                  Join
                </Button>
              ) : null}
            </Stack>
          )}
        </Stack>
      </Box>
    </Paper>
  );
}

// ─── Join Modal ───────────────────────────────────────────────────────────────
// BACKEND TODO: JoinModal currently takes a self-reported email from the user
// and calls `onJoin(email)` which updates local state only (no persistence).
//
// Replace with a real API call:
//   POST /api/study-groups/:id/join
//   Body: { email }   ← temporary until SSO auth is live
//
// Server responsibilities:
//   1. Validate email ends with @my.csun.edu (CHECK constraint).
//   2. Verify group.is_private === false OR email is in study_group_invites
//      for this group — reject with 403 if not authorized to join.
//   3. Check current member count < max_members — reject with 409 if full.
//   4. INSERT INTO study_group_members (group_id, member_email) — enforce
//      UNIQUE constraint to prevent duplicate joins.
//   5. Return the updated StudyGroup object (with new member added).
//
// Once CSUN SSO/auth is integrated:
//   - Remove the email field from this modal entirely.
//   - Derive member_email from req.user.email in the JWT/session.
//   - The user just clicks "Join" with no email input required.
//
// Notification hook: after a successful join, optionally send the group
// creator an email notification: "A new student joined your study group."
function JoinModal({ open, group, onClose, onJoin }: {
  open: boolean;
  group: StudyGroup | null;
  onClose: () => void;
  onJoin: (email: string) => void; // BACKEND: replace with POST /api/study-groups/:id/join
}) {
  const [email, setEmail] = React.useState("");
  const [err, setErr] = React.useState<string | null>(null);

  const normalized = normalizeEmail(email);
  const valid = !!normalized && isValidCsunEmail(normalized);

  React.useEffect(() => {
    if (!email.trim()) { setErr(null); return; }
    setErr(valid ? null : "Use your @my.csun.edu email.");
  }, [email, valid]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}>
      <Box sx={{ bgcolor: "#A80532", px: 3, py: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography fontWeight={950} sx={{ color: "#fff", fontSize: "1.05rem" }}>Join Study Group</Typography>
            {group && <Typography sx={{ color: "rgba(255,255,255,0.75)", fontSize: "0.80rem", mt: 0.15 }}>{group.topic}</Typography>}
          </Box>
          <IconButton onClick={onClose} aria-label="Close" sx={{ color: "rgba(255,255,255,0.80)" }}><CloseIcon /></IconButton>
        </Stack>
      </Box>
      <DialogContent sx={{ p: 2.5 }}>
        <Stack spacing={1.5}>
          {/* BACKEND: This email field is a temporary stand-in for authentication.
              Once CSUN SSO is live, remove this field — the server derives the
              member's email from the authenticated session token (req.user.email).
              DB write: INSERT INTO study_group_members (group_id, member_email, joined_at)
              VALUES (:groupId, :email, NOW()) ON CONFLICT DO NOTHING */}
          <TextField
            size="small"
            label="Your CSUN Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!err}
            helperText={err ?? "Must end in @my.csun.edu"}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          {/* BACKEND: On click, fire POST /api/study-groups/:groupId/join
              Show a loading spinner while the request is in-flight.
              On success: close modal, update local group state with returned member list.
              On 409 (full): show "This group is full" error.
              On 403 (private, not invited): show "You need an invite to join." error. */}
          <Button
            variant="contained"
            disabled={!valid}
            onClick={() => { onJoin(normalized); onClose(); setEmail(""); setErr(null); }}
            sx={{ bgcolor: "#A80532", "&:hover": { bgcolor: "#810326" }, fontWeight: 950, borderRadius: 999, py: 1.1 }}>
            Join Group
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

// ─── Create Modal ─────────────────────────────────────────────────────────────
// BACKEND TODO: CreateModal builds a StudyGroup object entirely client-side
// and passes it to `onCreate` which updates local React state only.
// Nothing is persisted to a database.
//
// Replace `handleCreate` with a real API call:
//   POST /api/study-groups
//   Content-Type: application/json
//   Body: {
//     topic, courseSubject, courseNumber, tags,
//     dateTime, location, isVirtual, meetingLink,
//     maxMembers, notes, isPrivate, invitedEmails
//   }
//
// Server responsibilities on POST /api/study-groups:
//   1. Authenticate the request — derive createdBy from req.user.email.
//      (Remove the "Your CSUN Email" field once auth is live.)
//   2. Validate all required fields and types.
//   3. Validate dateTime is in the future.
//   4. If isVirtual: validate meetingLink is https:// and from an allowed domain.
//   5. If isPrivate: validate all invitedEmails end in @my.csun.edu, INSERT rows
//      into study_group_invites.
//   6. INSERT INTO study_groups (...) → returns new group with DB-assigned id + created_at.
//   7. Auto-INSERT the creator into study_group_members as the first member.
//   8. Compute expires_at = date_time + INTERVAL '3 days', store on the record.
//   9. Return the fully-formed StudyGroup object.
//
// Notification hook: after creation, send email confirmations to all invitedEmails
// for private groups: "You've been invited to a private study group."
function CreateModal({ open, onClose, onCreate }: {
  open: boolean;
  onClose: () => void;
  onCreate: (g: StudyGroup) => void; // BACKEND: replace with async POST API call
}) {
  // ── Form fields → DB column mapping ──────────────────────────
  // subject      → study_groups.course_subject VARCHAR(20)
  // number       → study_groups.course_number  VARCHAR(20)
  // topic        → study_groups.topic          VARCHAR(255) NOT NULL
  // tags         → study_groups.tags           TEXT[]
  // dateTime     → study_groups.date_time      TIMESTAMPTZ NOT NULL
  // location     → study_groups.location       TEXT NOT NULL
  // isVirtual    → study_groups.is_virtual     BOOLEAN
  // meetingLink  → study_groups.meeting_link   TEXT (only if is_virtual)
  // maxMembers   → study_groups.max_members    INT DEFAULT 8
  // notes        → study_groups.notes          TEXT
  // creatorEmail → study_groups.created_by     VARCHAR(255) (from auth session post-SSO)
  // isPrivate    → study_groups.is_private     BOOLEAN
  // invitedEmails→ study_group_invites table   (separate rows per invited email)
  const [subject, setSubject] = React.useState("");
  const [number, setNumber] = React.useState("");
  const [topic, setTopic] = React.useState("");
  const [tags, setTags] = React.useState<string[]>([]);
  const [dateTime, setDateTime] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [isVirtual, setIsVirtual] = React.useState(false);
  const [meetingLink, setMeetingLink] = React.useState("");
  const [maxMembers, setMaxMembers] = React.useState("8");
  const [notes, setNotes] = React.useState("");
  const [creatorEmail, setCreatorEmail] = React.useState(""); // BACKEND: remove post-auth
  const [isPrivate, setIsPrivate] = React.useState(false);
  const [inviteInput, setInviteInput] = React.useState("");
  const [invitedEmails, setInvitedEmails] = React.useState<string[]>([]);
  const [inviteError, setInviteError] = React.useState<string | null>(null);

  // BACKEND NOTE: canSubmit is client-side UX gating only.
  // The server must independently validate ALL of these conditions
  // and return descriptive 400 errors if any are violated.
  // Additional server-side checks:
  //   - dateTime must be in the future
  //   - maxMembers must be between 2 and 50
  //   - meetingLink must be a valid https:// URL from an allowed domain
  const canSubmit = topic.trim() && dateTime && (isVirtual ? meetingLink.trim() : location.trim()) && isValidCsunEmail(creatorEmail) && (!isPrivate || invitedEmails.length > 0);

  // BACKEND NOTE: addInvite validates emails client-side before adding to the local
  // invitedEmails list. The server must re-validate the full invitedEmails array
  // on POST — never trust that client pre-validation ran correctly.
  // Each valid email → INSERT INTO study_group_invites (group_id, invited_email, invited_at)
  const addInvite = (raw: string) => {
    const email = normalizeEmail(raw);
    if (!email) return;
    if (!isValidCsunEmail(email)) {
      setInviteError("Each member must be a valid @my.csun.edu email.");
      return;
    }
    setInviteError(null);
    setInvitedEmails((prev) => (prev.includes(email) ? prev : [...prev, email]));
  };

  const toggleTag = (t: string) => {
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  // BACKEND TODO: Replace this entire function body with an API call.
  //
  // Target implementation:
  //   const res = await fetch('/api/study-groups', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       topic: topic.trim(),
  //       courseSubject: subject.trim().toUpperCase() || 'STUDY',
  //       courseNumber: number.trim(),
  //       tags,
  //       dateTime: new Date(dateTime).toISOString(),   // send as UTC ISO-8601
  //       location: isVirtual ? (location || 'Virtual') : location.trim(),
  //       isVirtual,
  //       meetingLink: isVirtual ? meetingLink.trim() : undefined,
  //       maxMembers: Number(maxMembers) || 8,
  //       notes: notes.trim() || undefined,
  //       isPrivate,
  //       invitedEmails: isPrivate ? invitedEmails : [],
  //     }),
  //   });
  //   if (!res.ok) { /* surface error */ return; }
  //   const newGroup = await res.json(); // server returns the persisted StudyGroup
  //   onCreate(newGroup);
  //   onClose();
  //   [reset all form state]
  const handleCreate = () => {
    if (!canSubmit) return;
    const newGroup: StudyGroup = {
      id: makeId(),                              // BACKEND: replace with DB-returned UUID
      courseSubject: subject.trim() ? subject.toUpperCase() : "STUDY",
      courseNumber: number.trim(),
      topic: topic.trim(),
      tags: tags.length ? tags : undefined,
      dateTime: new Date(dateTime).toISOString(), // BACKEND: validated server-side as future date
      location: isVirtual ? (location || "Virtual") : location.trim(),
      isVirtual,
      meetingLink: isVirtual ? meetingLink.trim() : undefined,
      members: [{ id: makeId(), name: normalizeEmail(creatorEmail) }], // BACKEND: server inserts creator as first member
      createdBy: normalizeEmail(creatorEmail),   // BACKEND: from req.user.email (auth session)
      createdAt: new Date().toISOString(),        // BACKEND: set server-side (DEFAULT NOW())
      maxMembers: Number(maxMembers) || 8,
      notes: notes.trim() || undefined,
      isPrivate,
      invitedEmails: isPrivate ? invitedEmails : undefined, // BACKEND: written to study_group_invites table
    };
    onCreate(newGroup);
    onClose();
    // Reset form state after submission
    setSubject(""); setNumber(""); setTopic(""); setTags([]); setDateTime(""); setLocation("");
    setIsVirtual(false); setMeetingLink(""); setMaxMembers("8"); setNotes(""); setCreatorEmail("");
    setIsPrivate(false); setInviteInput(""); setInvitedEmails([]); setInviteError(null);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}>
      <Box sx={{ bgcolor: "#A80532", px: 3, py: 2.25 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1.25} alignItems="center">
            <GroupsIcon sx={{ color: "#fff", fontSize: 22 }} />
            <Typography fontWeight={950} sx={{ color: "#fff", fontSize: "1.1rem" }}>Create Study Group</Typography>
          </Stack>
          <IconButton onClick={onClose} aria-label="Close" sx={{ color: "rgba(255,255,255,0.80)" }}><CloseIcon /></IconButton>
        </Stack>
        {/* BACKEND NOTE: "Sessions auto-expire 3 days after the meeting date."
            This expiry must be enforced server-side. Recommended approaches:
              Option A: A scheduled CRON job that runs nightly and soft-deletes rows
                        where date_time + INTERVAL '3 days' < NOW()
              Option B: A DB-level partial index or trigger that marks groups as expired
              Option C: Compute expires_at on INSERT and filter by it on every read:
                        SELECT * FROM study_groups WHERE expires_at > NOW() */}
        <Typography sx={{ color: "rgba(255,255,255,0.70)", fontSize: "0.80rem", mt: 0.4 }}>Sessions auto-expire 3 days after the meeting date.</Typography>
      </Box>
      <DialogContent sx={{ p: 2.5 }}>
        <Stack spacing={1.75}>

          {/* ── TOPIC ─────────────────────────────────────────────
              DB: study_groups.topic VARCHAR(255) NOT NULL
              Validation: non-empty, max 255 chars (enforce via maxLength + DB constraint)
              This is the event title shown on the GroupCard. */}
          <TextField size="small" label="Group Title *" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder='e.g. "Midterm Review — Chapter 5-9"'
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            inputProps={{ maxLength: 255 }} // BACKEND: mirror as VARCHAR(255) constraint
          />

          {/* ── TAGS ──────────────────────────────────────────────
              DB: study_groups.tags TEXT[] (Postgres array column)
              OR: a normalized study_group_tags table for join-based queries:
                { group_id UUID FK, tag VARCHAR(100) }
              These tags drive the filter chips on the main panel.
              Server-side: validate that all submitted tags exist in the allowed
              TOPIC_TAGS list (whitelist approach) to prevent arbitrary tag injection. */}
          <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
            {TOPIC_TAGS.map((t) => (
              <Chip
                key={t}
                label={t}
                size="small"
                clickable
                onClick={() => toggleTag(t)}
                sx={{ height: 20, fontSize: "0.68rem", fontWeight: 900, bgcolor: tags.includes(t) ? "rgba(168,5,50,0.08)" : "rgba(0,0,0,0.04)", color: tags.includes(t) ? "#A80532" : "rgba(0,0,0,0.55)", "&:hover": { bgcolor: tags.includes(t) ? "rgba(168,5,50,0.12)" : "rgba(0,0,0,0.06)" } }}
              />
            ))}
          </Stack>

          {/* ── SUBJECT + COURSE NUMBER ────────────────────────────
              DB: study_groups.course_subject VARCHAR(20)
                  study_groups.course_number  VARCHAR(20)
              These map to the course label chip on the GroupCard (e.g., "COMP 333").
              Validation: subject should be alpha-only uppercase (e.g., COMP, MATH).
              course_number is optional — not all groups are tied to a specific course. */}
          <Stack direction="row" spacing={1}>
            <TextField size="small" label="Subject" value={subject} onChange={(e) => setSubject(e.target.value.toUpperCase())} placeholder="COMP"
              sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              inputProps={{ maxLength: 20 }} // BACKEND: VARCHAR(20) constraint
            />
            <TextField size="small" label="Number" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="333"
              sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              inputProps={{ maxLength: 20 }} // BACKEND: VARCHAR(20) constraint
            />
          </Stack>

          {/* ── CREATOR EMAIL ──────────────────────────────────────
              DB: study_groups.created_by VARCHAR(255) NOT NULL
              TEMPORARY: This field is a placeholder for CSUN SSO authentication.
              Once auth is integrated, remove this field entirely and derive
              created_by = req.user.email from the JWT/session token on the server.
              The creator is auto-added as the first member in study_group_members.
              Validation: must match /^[^\s@]+@my\.csun\.edu$/i */}
          <TextField size="small" label="Your CSUN Email *" value={creatorEmail} onChange={(e) => setCreatorEmail(e.target.value)}
            error={!!creatorEmail && !isValidCsunEmail(creatorEmail)}
            helperText={creatorEmail && !isValidCsunEmail(creatorEmail) ? "Must end in @my.csun.edu" : ""}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />

          {/* ── DATE / TIME + MAX MEMBERS ─────────────────────────
              DB: study_groups.date_time   TIMESTAMPTZ NOT NULL
                  study_groups.max_members INT DEFAULT 8
                  study_groups.expires_at  TIMESTAMPTZ (date_time + 3 days, set on INSERT)
              Validation rules (enforce server-side):
                - date_time must be in the future (> NOW())
                - date_time should be within a reasonable window (e.g., < 6 months out)
                - max_members must be between 2 and 50
              The datetime-local input provides a local time string — the server must
              parse it as UTC or the client must send an explicit UTC ISO-8601 string.
              Recommended: always serialize as new Date(dateTime).toISOString() before
              sending to the API to avoid timezone ambiguity. */}
          <Stack direction="row" spacing={1.25}>
            <TextField size="small" label="Date & Time *" type="datetime-local" value={dateTime}
              onChange={(e) => setDateTime(e.target.value)} InputLabelProps={{ shrink: true }}
              sx={{ flex: 2, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              // BACKEND: Send new Date(dateTime).toISOString() to ensure UTC encoding
            />
            <TextField size="small" label="Max Members" type="number" value={maxMembers}
              onChange={(e) => setMaxMembers(e.target.value)}
              sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              inputProps={{ min: 2, max: 50 }} // BACKEND: enforce CHECK (max_members BETWEEN 2 AND 50)
            />
          </Stack>

          {/* ── VIRTUAL / IN-PERSON TOGGLE ────────────────────────
              DB: study_groups.is_virtual BOOLEAN DEFAULT false
              Determines whether location is a physical address or a meeting link.
              The server must enforce: if is_virtual = true, meeting_link is required
              and must be a valid https:// URL. If is_virtual = false, location
              (physical address or campus room) is required. */}
          <FormControlLabel
            control={<Switch checked={isVirtual} onChange={(e) => setIsVirtual(e.target.checked)}
              sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#A80532" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#A80532" } }} />}
            label={<Typography sx={{ fontSize: "0.88rem", fontWeight: 700 }}>Virtual meeting</Typography>}
          />

          {isVirtual
            ? (
              // ── MEETING LINK (virtual) ─────────────────────────
              // DB: study_groups.meeting_link TEXT (nullable)
              // Only stored when is_virtual = true.
              // Server validation:
              //   - Must be a valid https:// URL
              //   - Recommend restricting to trusted domains:
              //     zoom.us, meet.google.com, teams.microsoft.com, webex.com
              //     to prevent phishing links from being listed publicly.
              //   - Strip tracking params before storing.
              <TextField size="small" label="Meeting Link *" value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} placeholder="https://csun.zoom.us/j/…"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            )
            : (
              // ── PHYSICAL LOCATION (in-person) ──────────────────
              // DB: study_groups.location TEXT NOT NULL
              // Examples: "Oviatt Library — Room 2", "Bookstein Hall 2200"
              // Future enhancement: integrate a campus map autocomplete API
              // so students can select from known CSUN buildings/rooms,
              // making locations consistent and searchable.
              <TextField size="small" label="Location *" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Oviatt Library — Room 2"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            )
          }

          {/* ── PRIVATE GROUP TOGGLE ──────────────────────────────
              DB: study_groups.is_private BOOLEAN DEFAULT false
              When true, the group does NOT appear in the public LFG list.
              The server must enforce this: filter out is_private = true groups
              from GET /api/study-groups unless the requesting user's email
              is in study_group_invites for this group.
              Access check on join: verify invited_email = req.user.email exists
              in study_group_invites before allowing the join. */}
          <FormControlLabel
            control={<Checkbox checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />}
            label={<Typography sx={{ fontSize: "0.88rem", fontWeight: 700 }}>Private group</Typography>}
          />

          {isPrivate && (
            <Stack spacing={1}>
              {/* ── INVITED MEMBERS (private group) ───────────────
                  DB: study_group_invites table
                    { id UUID PK, group_id UUID FK, invited_email VARCHAR(255), invited_at TIMESTAMPTZ }
                  Each email in `invitedEmails` becomes a separate row in study_group_invites
                  on POST /api/study-groups.
                  Server responsibilities:
                    1. Validate all emails end in @my.csun.edu.
                    2. INSERT INTO study_group_invites for each email.
                    3. Optionally send invitation emails to each address:
                       "You've been invited to join a private study group: {topic}"
                    4. When a student visits the app, show their pending invites via:
                       GET /api/study-groups/invites → groups where invited_email = req.user.email
                  Future: support removing an invite (DELETE /api/study-groups/:id/invites/:email)
                  which the group owner can do from a management UI. */}
              <TextField
                size="small"
                label="Members (emails end in @my.csun.edu)"
                value={inviteInput}
                onChange={(e) => setInviteInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addInvite(inviteInput);
                    setInviteInput("");
                  }
                }}
                onBlur={() => {
                  if (inviteInput.trim()) {
                    addInvite(inviteInput);
                    setInviteInput("");
                  }
                }}
                error={!!inviteError}
                helperText={inviteError ?? "Press Enter to add each email."}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              {invitedEmails.length > 0 && (
                <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
                  {invitedEmails.map((e) => (
                    <Chip
                      key={e}
                      label={e}
                      size="small"
                      onDelete={() => setInvitedEmails((prev) => prev.filter((x) => x !== e))}
                      sx={{ height: 20, fontSize: "0.68rem", fontWeight: 900, bgcolor: "rgba(0,0,0,0.04)", color: "rgba(0,0,0,0.70)" }}
                    />
                  ))}
                </Stack>
              )}
            </Stack>
          )}

          {/* ── SESSION NOTES ─────────────────────────────────────
              DB: study_groups.notes TEXT (nullable)
              Free-form text for the group creator to add context:
              e.g. "Bring your textbook", "Focus on Chapter 5 onwards"
              Server-side: sanitize HTML/script tags before storing to prevent XSS.
              Enforce a reasonable max length: VARCHAR(1000) or TEXT with a CHECK constraint. */}
          <TextField size="small" label="Session Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            inputProps={{ maxLength: 1000 }} // BACKEND: mirror as a CHECK or VARCHAR(1000)
          />

          {/* BACKEND: Disable this button and show a loading spinner while the
              POST /api/study-groups request is in-flight.
              Surface API errors inline (e.g., "A group with this topic already exists
              at this time" → 409 Conflict) rather than silently failing.
              On success, also trigger a calendar event notification if the user
              has connected their CSUN/Google Calendar via OAuth. */}
          <Button variant="contained" disabled={!canSubmit} onClick={handleCreate} startIcon={<GroupsIcon />}
            sx={{ bgcolor: "#A80532", "&:hover": { bgcolor: "#810326" }, fontWeight: 950, borderRadius: 999, py: 1.2 }}>
            Create Study Group
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
// BACKEND TODO: Replace all local useState with real data fetching.
//
// Recommended pattern (SWR or React Query):
//   const { data: groups, mutate } = useSWR('/api/study-groups');
//   const { data: myGroups }       = useSWR('/api/study-groups/mine');
//
// `myGroupIds` and `myHostIds` are currently tracked in local state.
// Once auth is live, the API returns `isMember` and `isOwner` fields on each
// group object so you don't need to maintain separate ID sets client-side.
export default function StudyGroupsPanel() {
  // BACKEND TODO: Seed from GET /api/study-groups instead of mockStudyGroups.
  const [groups, setGroups] = React.useState<StudyGroup[]>(mockStudyGroups);

  // BACKEND TODO: myGroupIds should come from GET /api/study-groups/mine
  // returning the groups the authenticated user is a member of.
  // No need to track this client-side once the API scopes results by user.
  const [myGroupIds, setMyGroupIds] = React.useState<string[]>(["sg1"]);
  const [myHostIds, setMyHostIds] = React.useState<string[]>([]);

  const [joinTarget, setJoinTarget] = React.useState<StudyGroup | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [subTab, setSubTab] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterMode, setFilterMode] = React.useState<"all" | "virtual" | "in-person">("all");
  const [tagFilters, setTagFilters] = React.useState<string[]>([]);
  const [toast, setToast] = React.useState<string | null>(null);

  // BACKEND NOTE: filterGroups applies search, mode, and tag filters client-side.
  // Once the dataset grows, move filtering to the server:
  //   GET /api/study-groups?q=calculus&mode=virtual&tags=Math,STEM
  // Use DB indexes on topic, tags, is_virtual, and date_time for performance.
  // Full-text search on topic + notes can leverage Postgres tsvector.
  const filterGroups = (list: StudyGroup[]) => {
    let filtered = list;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((g) =>
        `${g.courseSubject} ${g.courseNumber} ${g.topic} ${g.notes ?? ""} ${(g.tags ?? []).join(" ")}`.toLowerCase().includes(q)
      );
    }
    if (tagFilters.includes(SPECIAL_PRIVATE_TAG)) {
      filtered = filtered.filter((g) => !!g.isPrivate);
    }
    const normalTags = tagFilters.filter((t) => t !== SPECIAL_PRIVATE_TAG);
    if (normalTags.length) {
      filtered = filtered.filter((g) => (g.tags ?? []).some((t) => normalTags.includes(t)));
    }
    if (filterMode === "virtual") filtered = filtered.filter((g) => g.isVirtual);
    if (filterMode === "in-person") filtered = filtered.filter((g) => !g.isVirtual);
    return filtered;
  };

  const toggleTagFilter = (t: string) => {
    setTagFilters((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  // BACKEND NOTE: lfgGroups filters out private groups client-side.
  // This is a UI convenience only — the server must NEVER return
  // is_private = true groups in the GET /api/study-groups (public) endpoint.
  // Private groups should only appear via GET /api/study-groups/mine for members.
  const lfgGroups = filterGroups(groups.filter((g) => !g.isPrivate));
  const myGroups = filterGroups(groups.filter((g) => myGroupIds.includes(g.id)));
  const displayed = subTab === 0 ? lfgGroups : myGroups;

  // BACKEND TODO: Replace with POST /api/study-groups/:id/join
  // Body: { email }
  // On success: the server returns the updated group with the new member included.
  // Invalidate the SWR cache to re-fetch the group list.
  // Also: push a calendar event to the user's schedule (if calendar integration is live):
  //   POST /api/calendar/events with the group's dateTime, location, and topic.
  const handleJoin = (email: string) => {
    if (!joinTarget) return;
    setGroups((prev) => prev.map((g) => {
      if (g.id !== joinTarget.id) return g;
      if (g.members.some((m) => normalizeEmail(m.name) === normalizeEmail(email))) return g;
      return { ...g, members: [...g.members, { id: makeId(), name: normalizeEmail(email) }] };
    }));
    setMyGroupIds((prev) => [...prev, joinTarget.id]);
    setToast(`Joined "${joinTarget.topic}"!`);
  };

  // BACKEND TODO: Replace with the POST /api/study-groups response handler.
  // After the API returns the persisted group, call onCreate(returnedGroup) and
  // invalidate the SWR/React Query cache to reflect the new group in the list.
  // Also schedule a calendar event for the creator:
  //   POST /api/calendar/events → adds the study session to the user's event schedule
  const handleCreate = (g: StudyGroup) => {
    setGroups((prev) => [g, ...prev]);
    setMyGroupIds((prev) => [...prev, g.id]);
    setMyHostIds((prev) => [...prev, g.id]);
    setToast(`Created "${g.topic}"!`);
  };

  // BACKEND TODO: Replace with DELETE /api/study-groups/:id/leave
  // Deletes the row: study_group_members WHERE group_id = :id AND member_email = req.user.email
  // Also remove the associated calendar event from the user's schedule if one was added:
  //   DELETE /api/calendar/events?groupId=:id&userEmail=req.user.email
  const handleLeave = (id: string) => {
    setMyGroupIds((prev) => prev.filter((i) => i !== id));
    setToast("Left study group.");
  };

  // BACKEND TODO: Replace with DELETE /api/study-groups/:id
  // Server must verify req.user.email === study_groups.created_by before deleting.
  // ON DELETE CASCADE will clean up study_group_members and study_group_invites.
  // Also cancel/remove the calendar event for all members:
  //   DELETE FROM calendar_events WHERE group_id = :id (if internal calendar is used)
  //   or send cancellation emails via SendGrid/CSUN SMTP to all members.
  const handleDelete = (id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
    setMyGroupIds((prev) => prev.filter((i) => i !== id));
    setMyHostIds((prev) => prev.filter((i) => i !== id));
    setToast("Study group deleted.");
  };

  // BACKEND NOTE: handleAddToCalendar currently generates a Google Calendar deep-link
  // client-side using group.dateTime and group.location/meetingLink.
  // This is a convenient shortcut but doesn't integrate with the app's own event schedule.
  //
  // For deeper calendar integration, consider:
  //   Option A: GET /api/study-groups/:id/calendar.ics
  //             Returns a standards-compliant iCalendar file (.ics) that can be imported
  //             into any calendar app (Google, Apple, Outlook).
  //   Option B: Internal event schedule integration
  //             POST /api/calendar/events { groupId, title, dateTime, location }
  //             This writes to the user's in-app event schedule (if the platform has one),
  //             so events show up in the student's personal dashboard.
  //   Option C: Google Calendar OAuth integration
  //             Use Google Calendar API to insert events directly into the student's
  //             Google Calendar after they authorize via OAuth.
  const handleAddToCalendar = (g: StudyGroup) => {
    const start = new Date(g.dateTime);
    const end = new Date(start.getTime() + 90 * 60000); // default 90-min session
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(g.topic)}&dates=${start.toISOString().replace(/[-:]/g, "").slice(0, 15)}Z/${end.toISOString().replace(/[-:]/g, "").slice(0, 15)}Z&location=${encodeURIComponent(g.isVirtual ? (g.meetingLink ?? g.location) : g.location)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setToast("Opening Google Calendar…");
  };

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1.5} sx={{ mb: 2.5 }}>
        <Box>
          <Typography fontWeight={950} sx={{ color: "#111", fontSize: "1.15rem", lineHeight: 1.2 }}>Study Groups</Typography>
          <Typography sx={{ color: "#999", fontSize: "0.82rem", mt: 0.25 }}>
            {groups.length} active · join with your school email
          </Typography>
        </Box>
      </Stack>

      <SubTabBar active={subTab} counts={[lfgGroups.length, myGroups.length]} onChange={setSubTab} onCreate={() => setCreateOpen(true)} />

      {/* Search + filter bar
          BACKEND: Debounce searchQuery (300ms) before firing an API search request.
          Pass filterMode and tagFilters as query params for server-side filtering:
          GET /api/study-groups?q=calculus&mode=virtual&tags=Math,STEM&page=1&limit=20 */}
      <Paper elevation={0} sx={{ borderRadius: 3, p: 1.75, mb: 2.5, bgcolor: "#fff", border: "1.5px solid #f0f0f3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
        <TextField fullWidth size="small" placeholder="Search by course, topic, or keyword…"
          value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 15, color: "#b0b8c4" }} /></InputAdornment> }}
          sx={{ mb: 1.25, "& .MuiOutlinedInput-root": { bgcolor: "#f8f9fb", color: "#222", borderRadius: 2, "& fieldset": { borderColor: "#e8eaed" }, "&:hover fieldset": { borderColor: "#A80532" }, "&.Mui-focused fieldset": { borderColor: "#A80532" } }, "& .MuiInputBase-input::placeholder": { color: "#b0b8c4", opacity: 1 } }}
        />
        <Stack direction="row" spacing={0.6} flexWrap="wrap" sx={{ gap: 0.6 }}>
          {(["all", "virtual", "in-person"] as const).map((f) => (
            <Chip key={f} label={f === "all" ? "All" : f === "virtual" ? "Virtual" : "In-Person"} size="small" clickable onClick={() => setFilterMode(f)}
              sx={{ fontWeight: 900, fontSize: "0.68rem", bgcolor: filterMode === f ? "#A80532" : "#fff", color: filterMode === f ? "#fff" : "#666", border: filterMode === f ? "none" : "1.5px solid #e8eaed", "&:hover": { bgcolor: filterMode === f ? "#8e0229" : "#f5f5f7" }, boxShadow: filterMode === f ? "0 2px 8px rgba(168,5,50,0.22)" : "none" }} />
          ))}

          {subTab === 1 && (
            <Chip
              label={SPECIAL_PRIVATE_TAG}
              size="small"
              clickable
              onClick={() => toggleTagFilter(SPECIAL_PRIVATE_TAG)}
              sx={{ fontWeight: 900, fontSize: "0.68rem", bgcolor: tagFilters.includes(SPECIAL_PRIVATE_TAG) ? "#A80532" : "#fff", color: tagFilters.includes(SPECIAL_PRIVATE_TAG) ? "#fff" : "#666", border: tagFilters.includes(SPECIAL_PRIVATE_TAG) ? "none" : "1.5px solid #e8eaed", "&:hover": { bgcolor: tagFilters.includes(SPECIAL_PRIVATE_TAG) ? "#8e0229" : "#f5f5f7" }, boxShadow: tagFilters.includes(SPECIAL_PRIVATE_TAG) ? "0 2px 8px rgba(168,5,50,0.22)" : "none" }}
            />
          )}

          {TOPIC_TAGS.map((t) => (
            <Chip
              key={t}
              label={t}
              size="small"
              clickable
              onClick={() => toggleTagFilter(t)}
              sx={{ fontWeight: 900, fontSize: "0.66rem", bgcolor: tagFilters.includes(t) ? "#A80532" : "#fff", color: tagFilters.includes(t) ? "#fff" : "#666", border: tagFilters.includes(t) ? "none" : "1.5px solid #e8eaed", "&:hover": { bgcolor: tagFilters.includes(t) ? "#8e0229" : "#f5f5f7" }, boxShadow: tagFilters.includes(t) ? "0 2px 8px rgba(168,5,50,0.22)" : "none" }}
            />
          ))}
        </Stack>
      </Paper>

      {displayed.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: "#fff", border: "1.5px solid #f0f0f3", textAlign: "center" }}>
          <GroupsIcon sx={{ fontSize: 38, color: "#e0e0e0", mb: 1.5 }} />
          <Typography sx={{ color: "#333", fontWeight: 900 }}>
            {subTab === 1 ? "You haven't joined any groups yet." : "No study groups found."}
          </Typography>
          <Typography sx={{ color: "#999", mt: 0.5, fontSize: "0.85rem" }}>
            {subTab === 1 ? "Browse all groups or create your own!" : "Try clearing your search or create the first one!"}
          </Typography>
        </Paper>
      ) : (
        // BACKEND TODO: Add pagination or infinite scroll once the group list scales.
        // Suggested: GET /api/study-groups?page=1&limit=12 with cursor-based pagination.
        // Use IntersectionObserver on the last card to load the next page automatically.
        <Box sx={{ display: "grid", gap: 1.75, gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
          {displayed.map((g) => (
            <GroupCard key={g.id} group={g}
              isMember={myGroupIds.includes(g.id)}   // BACKEND: replace with g.isMember from API response
              isOwner={myHostIds.includes(g.id)}      // BACKEND: replace with g.isOwner from API response
              onJoin={(grp) => setJoinTarget(grp)}
              onLeave={handleLeave}
              onDelete={handleDelete}
              onAddToCalendar={handleAddToCalendar}
            />
          ))}
        </Box>
      )}

      <JoinModal open={Boolean(joinTarget)} group={joinTarget} onClose={() => setJoinTarget(null)} onJoin={handleJoin} />
      <CreateModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreate} />

      {/* BACKEND: Toast messages are currently hardcoded success strings.
          Once API calls are live, surface actual server responses or
          localized error messages (e.g., "Group is full", "Already a member")
          through this Snackbar for both success and failure cases. */}
      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast(null)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="success" sx={{ borderRadius: 3, fontWeight: 700 }}>{toast}</Alert>
      </Snackbar>
    </Box>
  );
}
