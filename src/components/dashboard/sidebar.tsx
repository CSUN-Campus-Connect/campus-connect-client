"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Profile } from "@/app/profile/page";
import { loadProfile } from "@/lib/load-profile";

import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Stack,
  Button,
  IconButton,
  Typography,
} from "@mui/material";

import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import SchoolIcon from "@mui/icons-material/School";
import GroupsIcon from "@mui/icons-material/Groups";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import EventIcon from "@mui/icons-material/Event";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import ShieldIcon from "@mui/icons-material/Shield";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

type SidebarProps = {
  drawerWidth: number;
  onLogout: () => void;
};

const SRCIcon: React.ReactNode = (
  <Box
    component="img"
    src="/cards/SRCcard.png"
    alt=""
    sx={{
      width: 40,
      height: 40,
      objectFit: "contain",
      display: "block",
      ml: -0.8,
    }}
  />
);

const navItems: { label: string; icon: React.ReactNode; href?: string }[] = [
  { label: "Home",        icon: <HomeIcon aria-hidden="true" />,        href: "/dashboard" },
  { label: "Social",      icon: <GroupsIcon aria-hidden="true" />,      href: "/social" },
  { label: "Messages",    icon: <MailOutlineIcon aria-hidden="true" />, href: "/messages" },
  { label: "Events",      icon: <EventIcon aria-hidden="true" />,       href: "/events" },
  { label: "Clubs",       icon: <Diversity3Icon aria-hidden="true" />,  href: "/clubs" },
  { label: "Academics",   icon: <SchoolIcon aria-hidden="true" />,      href: "/academics" },
  { label: "Marketplace", icon: <StorefrontIcon aria-hidden="true" />,  href: "/marketplace" },
  { label: "Safety",      icon: <ShieldIcon aria-hidden="true" />,      href: "/security" },
  { label: "SRC",         icon: SRCIcon,                                href: "/StudentRecCenter" },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 16,
    scale: 0.96,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 20,
    },
  },
};

export default function DashboardSidebar({ drawerWidth, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [profile] = React.useState<Profile>(loadProfile());
  const name = `${profile?.first ?? ""} ${profile?.last ?? ""}`.trim();

  const pointerY = useMotionValue<number>(Infinity);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          borderRight: 0,
          bgcolor: "#A80532",
          color: "rgba(255,255,255,0.92)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 1400,
          pointerEvents: "auto",
          overflowX: "hidden",
          overflowY: "hidden",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        },
      }}
    >
      <IconButton
        onClick={onLogout}
        aria-label="Log out"
        sx={{
          position: "absolute",
          top: 8,
          left: 8,
          borderRadius: 2,
          p: 0.75,
          color: "#fff",
          bgcolor: "transparent",
          "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
        }}
      >
        <LogoutIcon aria-hidden="true" />
      </IconButton>

      <IconButton
        component={Link}
        href="/settings"
        aria-label="Go to settings"
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          borderRadius: 2,
          p: 0.75,
          color: "#fff",
          bgcolor: "transparent",
          "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
        }}
      >
        <SettingsIcon aria-hidden="true" />
      </IconButton>

      <Box sx={{ pt: 4.5, px: 2, pb: 1 }}>
        <Stack direction="column" alignItems="center" spacing={1}>
          <Box
            component="img"
            src="/ToroConnectLogoCircle.png"
            alt="Toro Campus Connect Logo"
            sx={{
              width: "100%",
              maxWidth: 160,
              aspectRatio: "1 / 1",
              objectFit: "cover",
              display: "block",
            }}
          />
        </Stack>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 1 }} />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ overflow: "hidden" }}
      >
        <List
          component="nav"
          aria-label="Main navigation"
          sx={{
            px: 0,
            mt: 1,
            overflow: "hidden",
          }}
          onPointerMove={(e) => pointerY.set(e.clientY)}
          onPointerLeave={() => pointerY.set(Infinity)}
        >
          {navItems.map((item) => {
            const active =
              !!item.href &&
              (pathname === item.href || pathname.startsWith(item.href + "/"));

            return (
              <DockRow
                key={item.label}
                label={item.label}
                href={item.href}
                icon={item.icon}
                active={active}
                pointerY={pointerY}
                onComingSoon={() => alert("Coming soon")}
              />
            );
          })}
        </List>
      </motion.div>

      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ p: 2, pt: 1 }}>
        <Button
          component={Link}
          href="/profile"
          fullWidth
          startIcon={
            <Avatar aria-hidden="true" sx={{ bgcolor: "#e11d48" }}>
              <PersonIcon />
            </Avatar>
          }
          sx={{
            justifyContent: "flex-start",
            textTransform: "none",
            color: "#fff",
            bgcolor: "rgba(255,255,255,0.06)",
            borderRadius: 2,
            px: 2,
            py: 1.25,
            "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
          }}
        >
          <Box textAlign="left">
            <Typography variant="body2" fontWeight={700}>
              {name || "Profile"}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.75 }}>
              View Profile
            </Typography>
          </Box>
        </Button>
      </Box>
    </Drawer>
  );
}

function DockRow({
  label,
  icon,
  href,
  active,
  pointerY,
  onComingSoon,
}: {
  label: string;
  icon: React.ReactNode;
  href?: string;
  active: boolean;
  pointerY: ReturnType<typeof useMotionValue<number>>;
  onComingSoon: () => void;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);

  const maxShift = 18;
  const influence = 120;

  const shiftX = useTransform(pointerY, (y: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return 0;
    const centerY = rect.top + rect.height / 2;
    const d = Math.abs(y - centerY);
    const t = Math.max(0, 1 - d / influence);
    return t * maxShift;
  });

  const springX = useSpring(shiftX, {
    stiffness: 420,
    damping: 30,
    mass: 0.22,
  });

  return (
    <motion.div
      ref={ref}
      variants={itemVariants}
      whileTap={{ scale: 0.99 }}
      style={{ x: springX }}
    >
      <ListItem disablePadding sx={{ mb: 0.5 }}>
        <ListItemButton
          component={href ? Link : "button"}
          href={href as any}
          onClick={href ? undefined : onComingSoon}
          sx={{
            mx: 1,
            borderRadius: 2,
            px: 2,
            "&.Mui-selected": {
              bgcolor: "rgba(255,255,255,0.12)",
              color: "#fff",
            },
            "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
          }}
          selected={active}
          aria-current={active ? "page" : undefined}
        >
          <ListItemIcon
            sx={{
              color: "inherit",
              minWidth: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </ListItemIcon>

          <ListItemText
            primary={label}
            primaryTypographyProps={{ fontWeight: 600 }}
          />
        </ListItemButton>
      </ListItem>
    </motion.div>
  );
}