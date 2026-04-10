"use client";

import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { api } from "../../../lib/axios";
import { subtle } from "crypto";

const border = "#E5E7EB";
const subtleBorder = "#F3F4F6";
const primaryText = "#111827";
const secondaryText = "#6B7280";
const hoverBackground = "#F6F7F9";
const expandedBackground = "#FAFBFC";
const red = "#B11226";

type LoginHistoryItem = {
  id: string;
  deviceLabel: string;
  locationLabel: string;
  timestampLabel: string;
};

type ActiveSessionItem = {
  id: string;
  deviceLabel: string;
  detailLabel: string;
  isCurrentSession: boolean;
};

function ContentCard({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        border: `1px solid ${border}`,
        borderRadius: 2,
        background: "#FFFFFF",
        p: 1.75,
      }}
    >
      {children}
    </Box>
  );
}

function SectionStatus({
  loading,
  error,
  emptyMessage,
  hasItems,
  children,
}: {
  loading: boolean;
  error: string | null;
  emptyMessage: string;
  hasItems: boolean;
  children: React.ReactNode;
}) {
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: secondaryText,
        }}
      >
        <CircularProgress size={16} />
        <Typography sx={{ fontSize: 14, color: secondaryText }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Typography sx={{ fontSize: 14, color: "#991B1B", lineHeight: 1.5 }}>
        {error}
      </Typography>
    );
  }

  if (!hasItems) {
    return (
      <Typography sx={{ fontSize: 14, color: secondaryText, lineHeight: 1.5 }}>
        {emptyMessage}
      </Typography>
    );
  }

  return <>{children}</>;
}

function ActionRow({
  title,
  description,
  isOpen = false,
  onToggle,
  onExternalClick,
  children,
  isLast = false,
}: {
  title: string;
  description: string;
  isOpen?: boolean;
  onToggle?: () => void;
  onExternalClick?: () => void;
  children?: React.ReactNode;
  isLast?: boolean;
}) {
  const handleClick = () => {
    if (onExternalClick) {
      onExternalClick();
      return;
    }

    if (onToggle) {
      onToggle();
    }
  };

  return (
    <Box>
      <Box
        role="button"
        tabIndex={0}
        aria-expanded={onExternalClick ? undefined : isOpen}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          px: { xs: 2, sm: 2.5 },
          py: 2.5,
          cursor: "pointer",
          transition: "background-color 0.15s ease",
          "&:hover": {
            backgroundColor: hoverBackground,
          },
          "&:focus-visible": {
            outline: `2px solid ${border}`,
            outlineOffset: "-2px",
          },
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              fontWeight: 700,
              color: primaryText,
              fontSize: 15,
              lineHeight: 1.35,
            }}
          >
            {title}
          </Typography>

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
        </Box>

        {onExternalClick ? (
          <OpenInNewIcon
            sx={{
              color: "#9CA3AF",
              flexShrink: 0,
              fontSize: 20,
            }}
          />
        ) : (
          <ExpandMoreIcon
            sx={{
              color: "#9CA3AF",
              flexShrink: 0,
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          />
        )}
      </Box>

      {!onExternalClick && isOpen && (
        <Box
          sx={{
            borderTop: `1px solid ${subtleBorder}`,
            background: expandedBackground,
            px: { xs: 2, sm: 2.5 },
            py: 2,
          }}
        >
          {children}
        </Box>
      )}

      {!isLast && <Divider sx={{ borderColor: subtleBorder }} />}
    </Box>
  );
}

export default function SecurityPage() {
  const [loginHistoryOpen, setLoginHistoryOpen] = useState(false);
  const [activeSessionsOpen, setActiveSessionsOpen] = useState(false);

  const [loginHistory, setLoginHistory] = useState<LoginHistoryItem[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSessionItem[]>([]);

  const [loginHistoryLoading, setLoginHistoryLoading] = useState(false);
  const [activeSessionsLoading, setActiveSessionsLoading] = useState(false);

  const [loginHistoryError, setLoginHistoryError] = useState<string | null>(null);
  const [activeSessionsError, setActiveSessionsError] = useState<string | null>(null);

  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  useEffect(() => {
    if (!loginHistoryOpen) return;

    let isMounted = true;

    const fetchLoginHistory = async () => {
      try {
        setLoginHistoryLoading(true);
        setLoginHistoryError(null);

       
       // UI shape:
       //     id: string,
       //     deviceLabel: string,
       //     locationLabel: string,
       //     timestampLabel: string,
       
        const mappedData: LoginHistoryItem[] = [
          {
            id: "1",
            deviceLabel: "Chrome on Windows",
            locationLabel: "Hidden Hills, CA",
            timestampLabel: "2 hours ago",
          },
          {
            id: "2",
            deviceLabel: "Safari on iPhone",
            locationLabel: "Los Angeles, CA",
            timestampLabel: "Yesterday",
          },
        ];

        if (!isMounted) return;
        setLoginHistory(mappedData);
      } catch (error) {
        if (!isMounted) return;
        setLoginHistoryError("We couldn't load your login history.");
      } finally {
        if (isMounted) {
          setLoginHistoryLoading(false);
        }
      }
    };

    fetchLoginHistory();

    return () => {
      isMounted = false;
    };
  }, [loginHistoryOpen]);

  useEffect(() => {
    if (!activeSessionsOpen) return;

    let isMounted = true;

    const fetchActiveSessions = async () => {
      try {
        setActiveSessionsLoading(true);
        setActiveSessionsError(null);


        const mappedData: ActiveSessionItem[] = [
          {
            id: "1",
            deviceLabel: "This device",
            detailLabel: "Chrome on Windows • Current session",
            isCurrentSession: true,
          },
          {
            id: "2",
            deviceLabel: "Safari on iPhone",
            detailLabel: "Last active 3 hours ago",
            isCurrentSession: false,
          },
        ];

        if (!isMounted) return;
        setActiveSessions(mappedData);
      } catch (error) {
        if (!isMounted) return;
        setActiveSessionsError("We couldn't load your active sessions.");
      } finally {
        if (isMounted) {
          setActiveSessionsLoading(false);
        }
      }
    };

    fetchActiveSessions();

    return () => {
      isMounted = false;
    };
  }, [activeSessionsOpen]);

  const handleRevokeSession = async (sessionId: string) => {
    try {
      setRevokingSessionId(sessionId);

      

      setActiveSessions((prev) => prev.filter((session) => session.id !== sessionId));
    } catch (error) {
      console.error("Failed to revoke session", error);
    } finally {
      setRevokingSessionId(null);
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    try {
      setRevokingAll(true);

     
      setActiveSessions((prev) => prev.filter((session) => session.isCurrentSession));
    } catch (error) {
      console.error("Failed to revoke other sessions", error);
    } finally {
      setRevokingAll(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography
          sx={{
            fontSize: { xs: 28, sm: 30 },
            fontWeight: 900,
            color: primaryText,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}
        >
          Security
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
          Review login activity and manage access to your account.
        </Typography>
      </Box>

      <Stack spacing={2.5} sx={{ maxWidth: 760 }}>
        <Box
          sx={{
            background: "#FFFFFF",
            border: `1px solid ${border}`,
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <ActionRow
            title="Login History"
            description="View recent login activity"
            isOpen={loginHistoryOpen}
            onToggle={() => setLoginHistoryOpen((prev) => !prev)}
          >
            <Stack spacing={1.5}>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: secondaryText,
                }}
              >
                Recent Sign-Ins
              </Typography>

              <SectionStatus
                loading={loginHistoryLoading}
                error={loginHistoryError}
                emptyMessage="No recent login activity found."
                hasItems={loginHistory.length > 0}
              >
                {loginHistory.map((item) => (
                  <ContentCard key={item.id}>
                    <Typography
                      sx={{ fontSize: 14, fontWeight: 700, color: primaryText }}
                    >
                      {item.deviceLabel}
                    </Typography>
                    <Typography
                      sx={{ fontSize: 13, color: secondaryText, mt: 0.5 }}
                    >
                      {item.locationLabel} • {item.timestampLabel}
                    </Typography>
                  </ContentCard>
                ))}
              </SectionStatus>
            </Stack>
          </ActionRow>

          <ActionRow
            title="Active Sessions"
            description="Manage active login sessions"
            isOpen={activeSessionsOpen}
            onToggle={() => setActiveSessionsOpen((prev) => !prev)}
          >
            <Stack spacing={1.5}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: { xs: "flex-start", sm: "center" },
                  justifyContent: "space-between",
                  gap: 1.5,
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: secondaryText,
                  }}
                >
                  Current Devices
                </Typography>
              </Box>

              <SectionStatus
                loading={activeSessionsLoading}
                error={activeSessionsError}
                emptyMessage="No active sessions found."
                hasItems={activeSessions.length > 0}
              >
                {activeSessions.map((session) => (
                  <ContentCard key={session.id}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: { xs: "flex-start", sm: "center" },
                        justifyContent: "space-between",
                        gap: 1.5,
                        flexDirection: { xs: "column", sm: "row" },
                      }}
                    >
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            flexWrap: "wrap",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: primaryText,
                            }}
                          >
                            {session.deviceLabel}
                          </Typography>

                          {session.isCurrentSession && (
                            <Chip
                              label="Current"
                              size="small"
                              sx={{
                                height: 22,
                                backgroundColor: "#F0FDF4",
                                color: "#166534",
                                fontWeight: 700,
                              }}
                            />
                          )}
                        </Box>

                        <Typography
                          sx={{ fontSize: 13, color: secondaryText, mt: 0.5 }}
                        >
                          {session.detailLabel}
                        </Typography>
                      </Box>

                      {!session.isCurrentSession && (
                        <Button
                          variant="text"
                          disabled={revokingSessionId === session.id}
                          onClick={() => handleRevokeSession(session.id)}
                          sx={{
                            textTransform: "none",
                            color: red,
                            fontWeight: 700,
                            alignSelf: { xs: "flex-start", sm: "center" },
                            "&:hover": {
                              backgroundColor: "#FEF2F2",
                            },
                          }}
                        >
                          {revokingSessionId === session.id ? "Ending..." : "End session"}
                        </Button>
                      )}
                    </Box>
                  </ContentCard>
                ))}
              </SectionStatus>
            </Stack>
          </ActionRow>

          <ActionRow
            title="Privacy Policy"
            description="Read our privacy policy"
            onExternalClick={() => {
              
              window.open("/privacy-policy", "_blank");
            }}
            isLast
          />
        </Box>
      </Stack>
    </Box>
  );
}