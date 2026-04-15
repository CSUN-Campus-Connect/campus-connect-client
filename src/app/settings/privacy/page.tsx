"use client";

import React, { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import { SettingsToggle } from "@/components/settings";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";

import { api } from "../../../lib/axios";

const red = "#B11226";
const pageBackground = "#FFFFFF";
const cardBackground = "#FFFFFF";
const border = "#E5E7EB";
const subtleBorder = "#F1F5F9";
const primaryText = "#111827";
const secondaryText = "#6B7280";

type AccountVisibility = "everyone" | "friends";
type WhoCanMessage = "everyone" | "friends" | "nobody";

type PrivacySettings = {
  accountVisibility: AccountVisibility;
  whoCanMessage: WhoCanMessage;
  allowTagging: boolean;
};

type SaveStatus = "idle" | "loading" | "saving" | "saved";

const defaultSettings: PrivacySettings = {
  accountVisibility: "everyone",
  whoCanMessage: "everyone",
  allowTagging: true,
};

const selectSx = {
  minWidth: 180,
  borderRadius: 2,
  backgroundColor: "#FFFFFF",
  "& .MuiSelect-select": {
    py: 1.25,
    fontSize: 14,
    fontWeight: 500,
    color: primaryText,
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: border,
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#D1D5DB",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: red,
    borderWidth: "1px",
  },
};

const outlineButtonSx = {
  textTransform: "none",
  borderRadius: 2,
  px: 2,
  py: 1,
  borderColor: border,
  color: primaryText,
  fontWeight: 600,
  boxShadow: "none",
  "&:hover": {
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
    boxShadow: "none",
  },
};

function SettingsRow({
  label,
  description,
  right,
  isLast = false,
}: {
  label: string;
  description?: string;
  right: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        gap: 2,
        py: 2.5,
        flexDirection: { xs: "column", sm: "row" },
        ...(isLast ? {} : { borderBottom: `1px solid ${subtleBorder}` }),
      }}
    >
      <Box sx={{ minWidth: 0, pr: { sm: 2 }, flex: 1 }}>
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 700,
            color: primaryText,
            lineHeight: 1.35,
          }}
        >
          {label}
        </Typography>

        {description && (
          <Typography
            sx={{
              fontSize: 14,
              color: secondaryText,
              mt: 0.5,
              lineHeight: 1.5,
            }}
          >
            {description}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          flexShrink: 0,
          width: { xs: "100%", sm: "auto" },
          display: "flex",
          justifyContent: { xs: "flex-start", sm: "flex-end" },
        }}
      >
        {right}
      </Box>
    </Box>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        background: cardBackground,
        border: `1px solid ${border}`,
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      {(title || description) && (
        <>
          <Box sx={{ px: { xs: 2, sm: 3 }, py: 2.25 }}>
            {title && (
              <Typography
                sx={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: primaryText,
                  lineHeight: 1.3,
                }}
              >
                {title}
              </Typography>
            )}

            {description && (
              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 14,
                  color: secondaryText,
                  lineHeight: 1.5,
                }}
              >
                {description}
              </Typography>
            )}
          </Box>

          <Divider sx={{ borderColor: border }} />
        </>
      )}

      <Box sx={{ px: { xs: 2, sm: 3 } }}>{children}</Box>
    </Box>
  );
}

export default function PrivacyPage() {
  const [accountVisibility, setAccountVisibility] =
    useState<AccountVisibility>(defaultSettings.accountVisibility);
  const [whoCanMessage, setWhoCanMessage] =
    useState<WhoCanMessage>(defaultSettings.whoCanMessage);
  const [allowTagging, setAllowTagging] = useState(
    defaultSettings.allowTagging
  );

  const [initialSettings, setInitialSettings] =
    useState<PrivacySettings | null>(null);

  const [hasLoaded, setHasLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("loading");
  const [errorOpen, setErrorOpen] = useState(false);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearSavedStatusRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const justLoadedRef = useRef(true);

  const currentSettings: PrivacySettings = {
    accountVisibility,
    whoCanMessage,
    allowTagging,
  };

  useEffect(() => {
    let isMounted = true;

    const fetchPrivacySettings = async () => {
      try {
        setHasLoaded(false);
        setSaveStatus("loading");

        

        const response = await api.get("/settings/privacy");

        const data: PrivacySettings = {
          accountVisibility:
            response.data.accountVisibility ?? defaultSettings.accountVisibility,
          whoCanMessage:
            response.data.whoCanMessage ?? defaultSettings.whoCanMessage,
          allowTagging:
            response.data.allowTagging ?? defaultSettings.allowTagging,
        };

        if (!isMounted) return;

        setAccountVisibility(data.accountVisibility);
        setWhoCanMessage(data.whoCanMessage);
        setAllowTagging(data.allowTagging);
        setInitialSettings(data);
        setSaveStatus("idle");
      } catch (error) {
        if (!isMounted) return;

       
        setAccountVisibility(defaultSettings.accountVisibility);
        setWhoCanMessage(defaultSettings.whoCanMessage);
        setAllowTagging(defaultSettings.allowTagging);
        setInitialSettings(defaultSettings);
        setSaveStatus("idle");
        setErrorOpen(true);
      } finally {
        if (isMounted) {
          setHasLoaded(true);
          justLoadedRef.current = true;
        }
      }
    };

    fetchPrivacySettings();

    return () => {
      isMounted = false;

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      if (clearSavedStatusRef.current) {
        clearTimeout(clearSavedStatusRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!hasLoaded || !initialSettings) return;

    
    if (justLoadedRef.current) {
      justLoadedRef.current = false;
      return;
    }

    const hasChanges =
      currentSettings.accountVisibility !== initialSettings.accountVisibility ||
      currentSettings.whoCanMessage !== initialSettings.whoCanMessage ||
      currentSettings.allowTagging !== initialSettings.allowTagging;

    if (!hasChanges) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (clearSavedStatusRef.current) {
      clearTimeout(clearSavedStatusRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setSaveStatus("saving");

        
        await api.patch("/settings/privacy", currentSettings);

        setInitialSettings(currentSettings);
        setSaveStatus("saved");

        clearSavedStatusRef.current = setTimeout(() => {
          setSaveStatus("idle");
        }, 1800);
      } catch (error) {
        setSaveStatus("idle");
        setErrorOpen(true);
      }
    }, 700);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [accountVisibility, whoCanMessage, allowTagging, hasLoaded, initialSettings]);

  return (
    <>
      <Box
        sx={{
          minHeight: "100%",
          background: pageBackground,
        }}
      >
        <Box
          sx={{
            mb: 4,
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: { xs: 28, sm: 30 },
                fontWeight: 900,
                color: primaryText,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}
            >
              Privacy
            </Typography>

            <Typography
              sx={{
                color: secondaryText,
                mt: 1,
                fontSize: 16,
                lineHeight: 1.6,
                maxWidth: 640,
              }}
            >
              Control who can view your profile and how others can interact with you.
            </Typography>
          </Box>
        </Box>

        <Stack spacing={2.5} sx={{ maxWidth: 760 }}>
          <SectionCard>
            <SettingsRow
              label="Who can view my account"
              description="Choose who is allowed to see your profile."
              right={
                <FormControl size="small">
                  <Select
                    value={accountVisibility}
                    onChange={(e) =>
                      setAccountVisibility(e.target.value as AccountVisibility)
                    }
                    sx={selectSx}
                    disabled={!hasLoaded}
                  >
                    <MenuItem value="everyone">Everyone</MenuItem>
                    <MenuItem value="friends">Friends</MenuItem>
                  </Select>
                </FormControl>
              }
            />

            <SettingsRow
              label="Who can message me"
              description="Choose who is allowed to send you direct messages."
              right={
                <FormControl size="small">
                  <Select
                    value={whoCanMessage}
                    onChange={(e) =>
                      setWhoCanMessage(e.target.value as WhoCanMessage)
                    }
                    sx={selectSx}
                    disabled={!hasLoaded}
                  >
                    <MenuItem value="everyone">Everyone</MenuItem>
                    <MenuItem value="friends">Friends</MenuItem>
                    <MenuItem value="nobody">Nobody</MenuItem>
                  </Select>
                </FormControl>
              }
            />

            <SettingsRow
              label="Allow tagging"
              description="Let other users tag you in posts and content."
              isLast
              right={
                <SettingsToggle
                  checked={allowTagging}
                  onChange={setAllowTagging}
                  disabled={!hasLoaded}
                />
              }
            />
          </SectionCard>

          <SectionCard>
            <Box
              sx={{
                display: "flex",
                alignItems: { xs: "flex-start", sm: "center" },
                justifyContent: "space-between",
                gap: 2,
                py: 2.5,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: primaryText,
                    lineHeight: 1.35,
                  }}
                >
                  Blocked Users
                </Typography>

                <Typography
                  sx={{
                    fontSize: 14,
                    color: secondaryText,
                    mt: 0.5,
                    lineHeight: 1.5,
                  }}
                >
                  Review and manage accounts you have blocked.
                </Typography>
              </Box>

              <Button
                variant="outlined"
                startIcon={<PersonOffOutlinedIcon />}
                sx={outlineButtonSx}
                
              >
                Manage Blocked
              </Button>
            </Box>
          </SectionCard>
        </Stack>
      </Box>
    </>
  );
}