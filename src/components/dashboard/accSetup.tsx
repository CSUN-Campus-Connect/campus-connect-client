"use client";

import * as React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
  Chip,
} from "@mui/material";

const RED = "#A80532";
const solidBtn = {
  bgcolor: RED,
  color: "#fff",
  "&:hover": { bgcolor: "#810326" },
};
const outlineBtn = {
  borderColor: RED,
  color: RED,
  "&:hover": { borderColor: "#810326", color: "#810326" },
};

// ─── CSUN Majors ────────────────────────────────────────────────────────────
const CSUN_MAJORS = [
  "Accountancy",
  "Africana Studies",
  "Anthropology",
  "Applied Mathematics",
  "Art",
  "Art History",
  "Biochemistry",
  "Biology",
  "Business Administration",
  "Chemistry",
  "Child and Adolescent Development",
  "Civil Engineering",
  "Communication Studies",
  "Computer Engineering",
  "Computer Science",
  "Construction Management",
  "Counseling",
  "Criminal Justice",
  "Dance",
  "Early Childhood Education",
  "Economics",
  "Electrical Engineering",
  "Elementary Education",
  "Engineering",
  "English",
  "Environmental and Occupational Health",
  "Environmental Science",
  "Film, Television and Media Studies",
  "Finance",
  "Geography",
  "Geological Sciences",
  "Health Administration",
  "History",
  "Human Development",
  "Humanities",
  "Industrial and Manufacturing Systems Engineering",
  "Information Systems",
  "Journalism",
  "Kinesiology",
  "Liberal Studies",
  "Linguistics",
  "Management",
  "Marketing",
  "Mathematics",
  "Mechanical Engineering",
  "Music",
  "Nursing",
  "Nutrition",
  "Philosophy",
  "Physical Education",
  "Physics",
  "Political Science",
  "Psychology",
  "Public Administration",
  "Public Health",
  "Real Estate",
  "Recreation and Tourism Management",
  "Religious Studies",
  "Secondary Education",
  "Social Work",
  "Sociology",
  "Spanish",
  "Special Education",
  "Speech-Language Pathology",
  "Sustainability",
  "Theatre",
  "Urban Studies and Planning",
  "Women's and Gender Studies",
  "Other / Undeclared",
];

// ─── Pronoun options ────────────────────────────────────────────────────────
const PRONOUN_OPTIONS = [
  "He/Him",
  "She/Her",
  "They/Them",
  "He/They",
  "She/They",
  "Ze/Zir",
  "Prefer not to say",
  "Custom",
];

// ─── Types ──────────────────────────────────────────────────────────────────
type YearOption =
  | ""
  | "Freshman"
  | "Sophomore"
  | "Junior"
  | "Senior"
  | "Graduate";

type TabIndex = 0 | 1; // 0 = Profile, 1 = Housing

type NewAccountSetupProps = {
  /**
   * BACKEND: Set to true when the user has never completed profile setup.
   * Replace with a real check from your user record, e.g.:
   *   const isNewAccount = !user.profileComplete;
   */
  isNewAccount?: boolean;
};

// ─── Component ──────────────────────────────────────────────────────────────
const NewAccountSetup: React.FC<NewAccountSetupProps> = ({
  isNewAccount = false,
}) => {
  // ── Banner / dialog visibility ──────────────────────────────────────────
  const [showBanner, setShowBanner] = React.useState(isNewAccount);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [formOpen, setFormOpen] = React.useState(false);

  // BACKEND: On first login, automatically prompt the user to set up their
  // profile. Replace `isNewAccount` with your real first-time-login flag.
  // Example: const isFirstLogin = !user?.profileComplete;
  React.useEffect(() => {
    if (isNewAccount) {
      // Small delay so the dashboard renders before the dialog appears
      const t = setTimeout(() => setConfirmOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, [isNewAccount]);

  // ── Form state ──────────────────────────────────────────────────────────
  const [showErrors, setShowErrors] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<TabIndex>(0);

  // BACKEND: profile picture file / URL (connect to your storage / avatar field)
  const [profilePicture, setProfilePicture] = React.useState<File | null>(null);
  const [fileError, setFileError] = React.useState("");

  // BACKEND: Required profile fields
  const [displayName, setDisplayName] = React.useState("");
  const [schoolId, setSchoolId] = React.useState("");
  const [major, setMajor] = React.useState("");
  const [year, setYear] = React.useState<YearOption>("");

  // BACKEND: Optional profile fields
  const [pronouns, setPronouns] = React.useState("");
  const [customPronouns, setCustomPronouns] = React.useState("");
  const [age, setAge] = React.useState("");
  const [hobbies, setHobbies] = React.useState("");
  const [clubs, setClubs] = React.useState("");
  const [bio, setBio] = React.useState("");
  const maxBioChars = 400;

  // BACKEND: Housing preferences (tab 2) — store as booleans server-side
  const [searchingRoom, setSearchingRoom] = React.useState("");
  const [searchingRoommate, setSearchingRoommate] = React.useState("");
  const [housingNotes, setHousingNotes] = React.useState("");

  // ── Shake animation flags ────────────────────────────────────────────────
  const [shakePic, setShakePic] = React.useState(false);
  const [shakeName, setShakeName] = React.useState(false);
  const [shakeSid, setShakeSid] = React.useState(false);
  const [shakeMajor, setShakeMajor] = React.useState(false);
  const [shakeYear, setShakeYear] = React.useState(false);

  React.useEffect(() => {
    if (!shakePic && !shakeName && !shakeSid && !shakeMajor && !shakeYear)
      return;
    const t = setTimeout(() => {
      setShakePic(false);
      setShakeName(false);
      setShakeSid(false);
      setShakeMajor(false);
      setShakeYear(false);
    }, 350);
    return () => clearTimeout(t);
  }, [shakePic, shakeName, shakeSid, shakeMajor, shakeYear]);

  // ── Progress ─────────────────────────────────────────────────────────────
  const totalRequired = 5;
  const completedRequired = React.useMemo(() => {
    let c = 0;
    if (profilePicture) c++;
    if (displayName.trim()) c++;
    if (schoolId.trim()) c++;
    if (major.trim()) c++;
    if (year) c++;
    return c;
  }, [profilePicture, displayName, schoolId, major, year]);

  const progressPercent = (completedRequired / totalRequired) * 100;
  const isComplete = completedRequired >= totalRequired;

  const requiredInvalid = (v: unknown) => showErrors && !v;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setProfilePicture(null);
      setFileError("");
      return;
    }
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setProfilePicture(null);
      setFileError("Only PNG and JPG files are allowed.");
      return;
    }
    setFileError("");
    setProfilePicture(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);

    const missingRequired =
      !profilePicture || !displayName || !schoolId || !major || !year;

    if (missingRequired) {
      if (!profilePicture) setShakePic(true);
      if (!displayName) setShakeName(true);
      if (!schoolId) setShakeSid(true);
      if (!major) setShakeMajor(true);
      if (!year) setShakeYear(true);

      // If errors are on tab 1 (Housing) but required fields are missing,
      // redirect back to Profile tab so user sees what's missing
      setActiveTab(0);
      return;
    }

    // BACKEND: send this payload to your API and mark account as "profile_complete"
    // Also set the first-time-login flag to false so this modal doesn't show again.
    const payload = {
      profilePicture,
      displayName,
      schoolId,
      major,
      year,
      pronouns: pronouns === "Custom" ? customPronouns : pronouns,
      age,
      hobbies,
      clubs,
      bio,
      // Housing preferences
      searchingRoom,
      searchingRoommate,
      housingNotes,
    };
    console.log("NEW ACCOUNT PROFILE PAYLOAD", payload);

    alert("Account setup complete (stub).");
    setFormOpen(false);
    setShowBanner(false);
  };

  // ── Early return (nothing to show) ───────────────────────────────────────
  if (!showBanner && !formOpen && !confirmOpen)
    return (
      <>
        <style jsx global>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-3px); }
            40%, 80% { transform: translateX(3px); }
          }
          .shake { animation: shake 0.25s ease-in-out; }
        `}</style>
      </>
    );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-3px); }
          40%, 80% { transform: translateX(3px); }
        }
        .shake { animation: shake 0.25s ease-in-out; }
      `}</style>

      {/* ── Top banner strip ─────────────────────────────────────────────── */}
      {showBanner && (
        <Box sx={{ mb: 2, maxWidth: 1100, mx: "auto" }}>
          <Box
            sx={{
              borderRadius: 3,
              bgcolor: "#ffffff",
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              px: 3,
              py: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: RED }}>
                Finish setting up your account
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(0,0,0,0.7)" }}>
                Add your profile info so other students can find you.
              </Typography>
            </Box>
            <Button
              variant="contained"
              sx={solidBtn}
              onClick={() => setConfirmOpen(true)}
            >
              Finish setup
            </Button>
          </Box>
        </Box>
      )}

      {/* ── Yes / Later confirmation ──────────────────────────────────────── */}
      <Dialog
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          // If this is a first-time login, keep the banner visible
          if (isNewAccount) setShowBanner(true);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: "center", fontWeight: 900, pb: 1 }}>
          {isNewAccount
            ? "Welcome! Let's set up your profile."
            : "Start now? You can always finish later."}
        </DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          <Typography
            variant="body2"
            sx={{ textAlign: "center", color: "rgba(0,0,0,0.7)", mb: 2 }}
          >
            {isNewAccount
              ? "It only takes a minute to fill out the basics so other students can find you."
              : "It only takes a minute to fill out the basics."}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2, pt: 0, gap: 2 }}>
          <Button
            variant="contained"
            sx={solidBtn}
            onClick={() => {
              setConfirmOpen(false);
              setFormOpen(true);
            }}
          >
            Yes
          </Button>
          <Button
            variant="outlined"
            sx={outlineBtn}
            onClick={() => {
              setConfirmOpen(false);
              setShowBanner(isNewAccount ? true : false);
            }}
          >
            Later
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Main profile-setup form dialog ───────────────────────────────── */}
      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <DialogTitle
            sx={{ fontWeight: 900, pb: 0, pr: 5, position: "relative" }}
          >
            Complete your profile
            <Typography variant="body2" sx={{ mt: 0.5, color: "rgba(0,0,0,0.6)" }}>
              {completedRequired} of {totalRequired} required fields completed
            </Typography>

            {/* Close button */}
            <Box
              onClick={() => setFormOpen(false)}
              sx={{
                position: "absolute",
                top: "50%",
                right: 8,
                transform: "translateY(-50%)",
                width: 34,
                height: 34,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "0.25s",
                color: RED,
                fontWeight: 900,
                fontSize: "20px",
                "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
              }}
            >
              ×
            </Box>
          </DialogTitle>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: "divider", px: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v as TabIndex)}
              TabIndicatorProps={{ style: { backgroundColor: RED } }}
              sx={{
                "& .MuiTab-root.Mui-selected": { color: RED, fontWeight: 700 },
              }}
            >
              <Tab label="Profile" />
              <Tab
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    Housing Preferences
                    {(searchingRoom || searchingRoommate) && (
                      <Chip
                        label="filled"
                        size="small"
                        sx={{ bgcolor: RED, color: "#fff", height: 18, fontSize: 10 }}
                      />
                    )}
                  </Box>
                }
              />
            </Tabs>
          </Box>

          <DialogContent dividers sx={{ pt: 2 }}>
            {/* ── TAB 0: Profile ─────────────────────────────────────────── */}
            {activeTab === 0 && (
              <Stack spacing={2.4}>
                {/* Profile picture */}
                <Box className={shakePic ? "shake" : ""}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      color: requiredInvalid(profilePicture) ? "#d32f2f" : "#111",
                      mb: 0.75,
                    }}
                  >
                    Profile picture (PNG or JPG)*
                  </Typography>
                  <Stack direction="row" spacing={2.5} alignItems="center">
                    <Box
                      sx={{
                        width: 96,
                        height: 96,
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: "3px solid #ffffff",
                        boxShadow: "0 0 0 2px rgba(0,0,0,0.15)",
                        bgcolor: "#111",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={
                          profilePicture
                            ? URL.createObjectURL(profilePicture)
                            : "/avatar_placeholder.png"
                        }
                        alt="Profile preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Button variant="contained" component="label" sx={solidBtn}>
                        Upload profile picture
                        <input
                          hidden
                          type="file"
                          accept="image/png, image/jpeg"
                          onChange={handleFileChange}
                        />
                      </Button>
                      <Typography
                        variant="caption"
                        sx={{ display: "block", mt: 0.75, color: "rgba(0,0,0,0.65)" }}
                      >
                        Recommended: square image, at least 400×400px.
                      </Typography>
                      {fileError && (
                        <Typography variant="caption" sx={{ color: "#d32f2f", mt: 0.5 }}>
                          {fileError}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </Box>

                {/* Display name + School ID */}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Box flex={1} className={shakeName ? "shake" : ""}>
                    <TextField
                      fullWidth
                      label="Display name*"
                      // BACKEND: save as user's public display name
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      error={requiredInvalid(displayName)}
                      helperText={requiredInvalid(displayName) ? "Required" : " "}
                    />
                  </Box>
                  <Box flex={1} className={shakeSid ? "shake" : ""}>
                    <TextField
                      fullWidth
                      label="School ID*"
                      // BACKEND: map to student ID field
                      value={schoolId}
                      onChange={(e) => setSchoolId(e.target.value)}
                      error={requiredInvalid(schoolId)}
                      helperText={requiredInvalid(schoolId) ? "Required" : " "}
                    />
                  </Box>
                </Stack>

                {/* Major dropdown + Year dropdown */}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Box flex={1} className={shakeMajor ? "shake" : ""}>
                    <FormControl fullWidth error={requiredInvalid(major)}>
                      <InputLabel>Major*</InputLabel>
                      <Select
                        label="Major*"
                        // BACKEND: map to academic major field
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
                      >
                        <MenuItem value="">
                          <em>Select major</em>
                        </MenuItem>
                        {CSUN_MAJORS.map((m) => (
                          <MenuItem key={m} value={m}>
                            {m}
                          </MenuItem>
                        ))}
                      </Select>
                      <Typography
                        variant="caption"
                        sx={{
                          mt: 0.5,
                          ml: 0.75,
                          color: requiredInvalid(major) ? "#d32f2f" : "transparent",
                        }}
                      >
                        Required
                      </Typography>
                    </FormControl>
                  </Box>

                  <Box flex={1} className={shakeYear ? "shake" : ""}>
                    <FormControl fullWidth error={requiredInvalid(year)}>
                      <InputLabel>Year at CSUN*</InputLabel>
                      <Select
                        label="Year at CSUN*"
                        // BACKEND: map to student's year standing
                        value={year}
                        onChange={(e) => setYear(e.target.value as YearOption)}
                      >
                        <MenuItem value="">
                          <em>Select year</em>
                        </MenuItem>
                        <MenuItem value="Freshman">Freshman</MenuItem>
                        <MenuItem value="Sophomore">Sophomore</MenuItem>
                        <MenuItem value="Junior">Junior</MenuItem>
                        <MenuItem value="Senior">Senior</MenuItem>
                        <MenuItem value="Graduate">Graduate</MenuItem>
                      </Select>
                      <Typography
                        variant="caption"
                        sx={{
                          mt: 0.5,
                          ml: 0.75,
                          color: requiredInvalid(year) ? "#d32f2f" : "transparent",
                        }}
                      >
                        Required
                      </Typography>
                    </FormControl>
                  </Box>
                </Stack>

                {/* Pronouns + Age */}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Box flex={1}>
                    <FormControl fullWidth>
                      <InputLabel>Pronouns (optional)</InputLabel>
                      <Select
                        label="Pronouns (optional)"
                        // BACKEND: store as string; "Custom" means use customPronouns value
                        value={pronouns}
                        onChange={(e) => {
                          setPronouns(e.target.value);
                          if (e.target.value !== "Custom") setCustomPronouns("");
                        }}
                      >
                        <MenuItem value="">
                          <em>Prefer not to say</em>
                        </MenuItem>
                        {PRONOUN_OPTIONS.map((p) => (
                          <MenuItem key={p} value={p}>
                            {p}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {pronouns === "Custom" && (
                      <TextField
                        fullWidth
                        label="Enter your pronouns"
                        // BACKEND: free-text pronoun field
                        value={customPronouns}
                        onChange={(e) => setCustomPronouns(e.target.value)}
                        sx={{ mt: 1 }}
                        placeholder="e.g. xe/xem"
                      />
                    )}
                  </Box>
                  <Box flex={1}>
                    <TextField
                      fullWidth
                      label="Age (optional)"
                      type="number"
                      // BACKEND: optional | consider storing as integer
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                    />
                  </Box>
                </Stack>

                {/* Hobbies + Clubs */}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Box flex={1}>
                    <TextField
                      fullWidth
                      label="Hobbies (optional)"
                      // BACKEND: free-text interests
                      multiline
                      minRows={3}
                      value={hobbies}
                      onChange={(e) => setHobbies(e.target.value)}
                    />
                  </Box>
                  <Box flex={1}>
                    <TextField
                      fullWidth
                      label="Clubs (optional)"
                      // BACKEND: comma-separated or free-text; normalize server-side
                      multiline
                      minRows={3}
                      value={clubs}
                      onChange={(e) => setClubs(e.target.value)}
                    />
                  </Box>
                </Stack>

                {/* Bio */}
                <Box>
                  <TextField
                    fullWidth
                    label="Bio (optional)"
                    // BACKEND: short profile bio, max 400 characters
                    multiline
                    minRows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, maxBioChars))}
                    helperText={`${bio.length}/${maxBioChars} characters`}
                  />
                </Box>
              </Stack>
            )}

            {/* ── TAB 1: Housing Preferences ─────────────────────────────── */}
            {activeTab === 1 && (
              <Stack spacing={2.4}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Housing preferences
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(0,0,0,0.6)" }}>
                    Let other students know if you're on the housing market. You
                    can update these at any time from your profile.
                  </Typography>
                </Box>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Box flex={1}>
                    <FormControl fullWidth>
                      <InputLabel>Looking for a room?</InputLabel>
                      <Select
                        label="Looking for a room?"
                        // BACKEND: store as boolean — "yes" → true, "no" → false
                        value={searchingRoom}
                        onChange={(e) => setSearchingRoom(e.target.value)}
                      >
                        <MenuItem value="">
                          <em>No answer</em>
                        </MenuItem>
                        <MenuItem value="yes">Yes — I need a place to live</MenuItem>
                        <MenuItem value="no">No — I have housing sorted</MenuItem>
                      </Select>
                    </FormControl>
                    <Typography
                      variant="caption"
                      sx={{ mt: 0.75, ml: 0.75, color: "rgba(0,0,0,0.5)", display: "block" }}
                    >
                      Shown on your public profile to landlords and students
                      listing rooms.
                    </Typography>
                  </Box>

                  <Box flex={1}>
                    <FormControl fullWidth>
                      <InputLabel>Looking for a roommate?</InputLabel>
                      <Select
                        label="Looking for a roommate?"
                        // BACKEND: store as boolean — "yes" → true, "no" → false
                        value={searchingRoommate}
                        onChange={(e) => setSearchingRoommate(e.target.value)}
                      >
                        <MenuItem value="">
                          <em>No answer</em>
                        </MenuItem>
                        <MenuItem value="yes">Yes — I want to find a roommate</MenuItem>
                        <MenuItem value="no">No — I'm all set</MenuItem>
                      </Select>
                    </FormControl>
                    <Typography
                      variant="caption"
                      sx={{ mt: 0.75, ml: 0.75, color: "rgba(0,0,0,0.5)", display: "block" }}
                    >
                      Other students looking to share housing will be able to
                      find you.
                    </Typography>
                  </Box>
                </Stack>

                {/* Additional housing notes */}
                <Box>
                  <TextField
                    fullWidth
                    label="Housing notes (optional)"
                    // BACKEND: free-text field for housing preferences / constraints
                    multiline
                    minRows={4}
                    placeholder="e.g. looking for a pet-friendly place near campus, budget ~$800/mo, available August..."
                    value={housingNotes}
                    onChange={(e) => setHousingNotes(e.target.value)}
                    helperText="Any extra details to help potential matches find you"
                  />
                </Box>
              </Stack>
            )}
          </DialogContent>

          {/* Footer */}
          <DialogActions sx={{ justifyContent: "space-between", px: 3, py: 1.5 }}>
            <Typography variant="caption" sx={{ color: "rgba(0,0,0,0.6)" }}>
              * Required fields
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
              {activeTab === 0 ? (
                <>
                  <Button onClick={() => setFormOpen(false)}>Cancel</Button>
                  <Button
                    variant="outlined"
                    sx={outlineBtn}
                    onClick={() => setActiveTab(1)}
                  >
                    Next: Housing →
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => setActiveTab(0)}>← Back</Button>
                  <Button type="submit" variant="contained" sx={solidBtn}>
                    Save profile
                  </Button>
                </>
              )}
            </Box>
          </DialogActions>
        </form>
      </Dialog>

      {/* ── Bottom anchored progress meter ─────────────────────────────────── */}
      {formOpen && (
        <Box
          sx={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            pb: 2,
            px: 2,
            zIndex: 1301,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: 520,
              borderRadius: 999,
              bgcolor: isComplete ? "#0f3d0f" : "#111",
              color: "#fff",
              px: 3,
              py: 1.5,
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              gap: 2,
              pointerEvents: "auto",
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                  fontSize: 12,
                }}
              >
                <span>
                  Profile setup: {completedRequired}/{totalRequired} required fields
                </span>
                <span>{Math.round(progressPercent)}%</span>
              </Box>
              <Box
                sx={{
                  height: 8,
                  borderRadius: 999,
                  bgcolor: "#444",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    width: `${progressPercent}%`,
                    bgcolor: isComplete ? "#16a34a" : RED,
                    transition: "width 0.25s ease-out",
                  }}
                />
              </Box>
            </Box>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                border: "2px solid #fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 900,
                bgcolor: isComplete ? "#16a34a" : "transparent",
              }}
            >
              {isComplete ? "✓" : ""}
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

export default NewAccountSetup;
