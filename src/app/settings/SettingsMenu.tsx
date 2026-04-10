"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";

const red = "#B11226";

type Props = {
  variant?: "sidebar" | "card";
};

type Item = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

function Section({
  title,
  items,
  variant = "sidebar",
}: {
  title: string;
  items: Item[];
  variant?: "sidebar" | "card";
}) {
  const pathname = usePathname();

  return (
    <Box
      sx={{
        mb: 2.5,
        px: variant === "sidebar" ? 0.5 : 0,
      }}
    >
      <Typography
        sx={{
          mb: 1.25,
          px: 0.5,
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "text.secondary",
          lineHeight: 1.4,
        }}
      >
        {title}
      </Typography>

      <Box sx={{ display: "grid", gap: 0.75 }}>
        {items.map((it) => {
          const active = pathname === it.href;

          return (
            <Box
              key={it.href}
              component={Link}
              href={it.href}
              sx={{
                textDecoration: "none",
                color: "inherit",
                display: "block",
                borderRadius: 2,
                outline: "none",
                "&:focus-visible": {
                  boxShadow: (theme) => `0 0 0 3px ${theme.palette.action.focus}`,
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  px: 1.5,
                  py: 1.25,
                  borderRadius: 2,
                  minHeight: 44,
                  backgroundColor: active ? "action.selected" : "transparent",
                  transition: "background-color 120ms ease, transform 120ms ease",
                  "&:hover": {
                    backgroundColor: active ? "action.selected" : "action.hover",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: active ? red : "text.secondary",
                    flexShrink: 0,
                  }}
                >
                  {it.icon}
                </Box>

                <Typography
                  sx={{
                    fontSize: "0.95rem",
                    fontWeight: active ? 700 : 500,
                    color: "text.primary",
                    lineHeight: 1.4,
                  }}
                >
                  {it.label}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default function SettingsMenu({ variant = "sidebar" }: Props) {
  return (
    <Box>
      <Section
        title="Your account"
        variant={variant}
        items={[
          {
            href: "/settings/account",
            label: "Account",
            icon: <PersonOutlineIcon fontSize="small" />,
          },
        ]}
      />

      <Section
        title="Privacy & Security"
        variant={variant}
        items={[
          {
            href: "/settings/privacy",
            label: "Privacy",
            icon: <VisibilityOutlinedIcon fontSize="small" />,
          },
          {
            href: "/settings/security",
            label: "Security",
            icon: <SecurityOutlinedIcon fontSize="small" />,
          },
        ]}
      />

      <Section
        title="Preferences"
        variant={variant}
        items={[
          {
            href: "/settings/notifications",
            label: "Notifications",
            icon: <NotificationsOutlinedIcon fontSize="small" />,
          },
          {
            href: "/settings/appearance",
            label: "Appearance",
            icon: <PaletteOutlinedIcon fontSize="small" />,
          },
          {
            href: "/settings/language",
            label: "Website language",
            icon: <LanguageOutlinedIcon fontSize="small" />,
          },
        ]}
      />

      <Section
        title="Messaging"
        variant={variant}
        items={[
          {
            href: "/settings/messaging",
            label: "Messaging settings",
            icon: <ChatBubbleOutlineIcon fontSize="small" />,
          },
        ]}
      />

      <Section
        title="Social"
        variant={variant}
        items={[
          {
            href: "/settings/social",
            label: "Social settings",
            icon: <ArticleOutlinedIcon fontSize="small" />,
          },
        ]}
      />

      <Section
        title="Marketplace"
        variant={variant}
        items={[
          {
            href: "/settings/marketplace",
            label: "Marketplace settings",
            icon: <StorefrontOutlinedIcon fontSize="small" />,
          },
        ]}
      />

      <Section
        title="Clubs"
        variant={variant}
        items={[
          {
            href: "/settings/clubs",
            label: "Club settings",
            icon: <GroupsOutlinedIcon fontSize="small" />,
          },
        ]}
      />

      <Section
        title="Events"
        variant={variant}
        items={[
          {
            href: "/settings/events",
            label: "Event settings",
            icon: <EventOutlinedIcon fontSize="small" />,
          },
        ]}
      />

      <Section
        title="Academics"
        variant={variant}
        items={[
          {
            href: "/settings/academics",
            label: "Academic settings",
            icon: <MenuBookOutlinedIcon fontSize="small" />,
          },
        ]}
      />

      <Section
        title="Support"
        variant={variant}
        items={[
          {
            href: "/settings/support",
            label: "Help & Support",
            icon: <HelpOutlineIcon fontSize="small" />,
          },
        ]}
      />
    </Box>
  );
}