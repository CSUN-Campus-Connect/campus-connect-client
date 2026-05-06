"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import GradingOutlinedIcon from "@mui/icons-material/GradingOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import ContactMailOutlinedIcon from "@mui/icons-material/ContactMailOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import TrendingDownOutlinedIcon from "@mui/icons-material/TrendingDownOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";

import {
  SettingsPageHeader,
  SettingsSectionLabel,
  SettingsCard,
  SettingsRow,
  SettingsToggle,
} from "@/components/settings";

export default function AcademicSettingsPage() {
  const [assignmentReminders, setAssignmentReminders] = useState(true);
  const [examReminders, setExamReminders] = useState(true);
  const [gradeAlerts, setGradeAlerts] = useState(true);
  const [registrationDeadlines, setRegistrationDeadlines] = useState(true);

  const [defaultSemester, setDefaultSemester] = useState<string>("fall2026");
  const [hideCompletedCourses, setHideCompletedCourses] = useState(true);

  const [defaultAssignmentReminder, setDefaultAssignmentReminder] = useState<"1d" | "2d" | "1w">("2d");
  const [calendarSync, setCalendarSync] = useState(true);

  const [gpaTracker, setGpaTracker] = useState(true);
  const [lowGradeAlerts, setLowGradeAlerts] = useState(true);

  const [showCoursesPublicly, setShowCoursesPublicly] = useState(false);
  const [shareStudyAvailability, setShareStudyAvailability] = useState(true);
  const [preferredContact, setPreferredContact] = useState<"email" | "phone" | "both">("email");

  return (
    <Box>
      <SettingsPageHeader
        title="Academic settings"
        subtitle="Coursework, grades, and contact preferences. Local until academics sync is enabled."
      />

      <SettingsSectionLabel>Notifications</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="blue"
          icon={<AssignmentOutlinedIcon fontSize="small" />}
          title="Assignment reminders"
          action={<SettingsToggle checked={assignmentReminders} onChange={setAssignmentReminders} inputProps={{ "aria-label": "Assignment reminders" }} />}
        />
        <SettingsRow
          divider
          tint="violet"
          icon={<QuizOutlinedIcon fontSize="small" />}
          title="Exam reminders"
          action={<SettingsToggle checked={examReminders} onChange={setExamReminders} inputProps={{ "aria-label": "Exam reminders" }} />}
        />
        <SettingsRow
          divider
          tint="green"
          icon={<GradingOutlinedIcon fontSize="small" />}
          title="Grade alerts"
          action={<SettingsToggle checked={gradeAlerts} onChange={setGradeAlerts} inputProps={{ "aria-label": "Grade alerts" }} />}
        />
        <SettingsRow
          tint="orange"
          icon={<EventNoteOutlinedIcon fontSize="small" />}
          title="Registration deadlines"
          action={<SettingsToggle checked={registrationDeadlines} onChange={setRegistrationDeadlines} inputProps={{ "aria-label": "Registration deadlines notifications" }} />}
        />
      </SettingsCard>

      <SettingsSectionLabel>Contact preferences</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="sky"
          icon={<EmailOutlinedIcon fontSize="small" />}
          title="School email"
          description="Shown on file with your institution."
          action={
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "text.primary", maxWidth: 200 }} noWrap>
              user@school.edu
            </Typography>
          }
        />
        <SettingsRow
          divider
          tint="emerald"
          icon={<PhoneOutlinedIcon fontSize="small" />}
          title="Phone number"
          action={
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "text.secondary", letterSpacing: "0.04em" }}>
              ********45
            </Typography>
          }
        />
        <SettingsRow
          tint="violet"
          icon={<ContactMailOutlinedIcon fontSize="small" />}
          title="Preferred contact method"
          action={
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="acad-contact-label">Method</InputLabel>
              <Select
                labelId="acad-contact-label"
                label="Method"
                value={preferredContact}
                onChange={(e) => setPreferredContact(e.target.value as typeof preferredContact)}
              >
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="phone">Phone</MenuItem>
                <MenuItem value="both">Both</MenuItem>
              </Select>
            </FormControl>
          }
        />
      </SettingsCard>

      <SettingsSectionLabel>Courses</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="brand"
          icon={<SchoolOutlinedIcon fontSize="small" />}
          title="Default semester"
          action={
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="sem-label">Semester</InputLabel>
              <Select
                labelId="sem-label"
                label="Semester"
                value={defaultSemester}
                onChange={(e) => setDefaultSemester(e.target.value)}
              >
                <MenuItem value="fall2026">Fall 2026</MenuItem>
                <MenuItem value="spring2027">Spring 2027</MenuItem>
                <MenuItem value="summer2027">Summer 2027</MenuItem>
              </Select>
            </FormControl>
          }
        />
        <SettingsRow
          tint="slate"
          icon={<VisibilityOffOutlinedIcon fontSize="small" />}
          title="Hide completed courses"
          action={<SettingsToggle checked={hideCompletedCourses} onChange={setHideCompletedCourses} inputProps={{ "aria-label": "Hide completed courses" }} />}
        />
      </SettingsCard>

      <SettingsSectionLabel>Assignments</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="orange"
          icon={<ScheduleOutlinedIcon fontSize="small" />}
          title="Default reminder"
          action={
            <FormControl size="small" sx={{ minWidth: 170 }}>
              <InputLabel id="asgn-rem-label">When</InputLabel>
              <Select
                labelId="asgn-rem-label"
                label="When"
                value={defaultAssignmentReminder}
                onChange={(e) => setDefaultAssignmentReminder(e.target.value as typeof defaultAssignmentReminder)}
              >
                <MenuItem value="1d">1 day before</MenuItem>
                <MenuItem value="2d">2 days before</MenuItem>
                <MenuItem value="1w">1 week before</MenuItem>
              </Select>
            </FormControl>
          }
        />
        <SettingsRow
          tint="cyan"
          icon={<CalendarMonthOutlinedIcon fontSize="small" />}
          title="Calendar sync"
          action={<SettingsToggle checked={calendarSync} onChange={setCalendarSync} inputProps={{ "aria-label": "Calendar sync" }} />}
        />
      </SettingsCard>

      <SettingsSectionLabel>Grades</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="brand"
          icon={<SchoolOutlinedIcon fontSize="small" />}
          title="GPA tracker"
          action={<SettingsToggle checked={gpaTracker} onChange={setGpaTracker} inputProps={{ "aria-label": "GPA tracker" }} />}
        />
        <SettingsRow
          tint="red"
          icon={<TrendingDownOutlinedIcon fontSize="small" />}
          title="Low grade alerts"
          action={<SettingsToggle checked={lowGradeAlerts} onChange={setLowGradeAlerts} inputProps={{ "aria-label": "Low grade alerts" }} />}
        />
      </SettingsCard>

      <SettingsSectionLabel>Privacy</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow
          divider
          tint="slate"
          icon={<VisibilityOffOutlinedIcon fontSize="small" />}
          title="Show courses publicly"
          action={<SettingsToggle checked={showCoursesPublicly} onChange={setShowCoursesPublicly} inputProps={{ "aria-label": "Show courses publicly" }} />}
        />
        <SettingsRow
          tint="green"
          icon={<ShareOutlinedIcon fontSize="small" />}
          title="Share study availability"
          action={<SettingsToggle checked={shareStudyAvailability} onChange={setShareStudyAvailability} inputProps={{ "aria-label": "Share study availability" }} />}
        />
      </SettingsCard>
    </Box>
  );
}
