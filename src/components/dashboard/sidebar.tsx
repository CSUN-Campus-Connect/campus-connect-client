"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Profile } from "@/app/profile/page";
import { loadProfile } from "@/lib/load-profile";

import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Button,
  IconButton,
  Typography,
  Tooltip,
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
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export const EXPANDED_WIDTH = 220;

const navItems: { label: string; icon: React.ReactNode; href?: string }[] = [
  { label: "Home",        icon: <HomeIcon />,         href: "/dashboard" },
  { label: "Social",      icon: <GroupsIcon />,        href: "/social" },
  { label: "Messages",    icon: <MailOutlineIcon />,   href: "/messages" },
  { label: "Events",      icon: <EventIcon />,         href: "/events" },
  { label: "Clubs",       icon: <Diversity3Icon />,    href: "/clubs" },
  { label: "Academics",   icon: <SchoolIcon />,        href: "/academics" },
  { label: "Marketplace", icon: <StorefrontIcon />,    href: "/marketplace" },
  { label: "Safety",      icon: <ShieldIcon />,        href: "/security" },
  { label: "SRC",         icon: (
      <Box component="img" src="/cards/SRCcard.png" alt="SRC"
        sx={{ width: 40, height: 40, objectFit: "contain", display: "block", ml: -0.8 }} />
    ),                                                  href: "/StudentRecCenter" },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring" as const, stiffness: 260, damping: 20 },
  },
};

type SidebarProps = {
  drawerWidth?: number;
  onLogout: () => void;
  onWidthChange?: (width: number) => void;
};

export default function DashboardSidebar({ onLogout, onWidthChange }: SidebarProps) {
  const pathname = usePathname();
  const [profile] = React.useState<Profile>(loadProfile());
  const name = `${profile?.first ?? ""} ${profile?.last ?? ""}`.trim();

  const [collapsed, setCollapsed] = React.useState(false);
  const width = collapsed ? 0 : EXPANDED_WIDTH;

  const pointerY = useMotionValue<number>(Infinity);

  React.useEffect(() => {
    onWidthChange?.(width);
  }, [width, onWidthChange]);

  return (
    <>
      {/* ── Sidebar panel — fixed, always viewport-tall ── */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: `${width}px`,
          // ↑ width transitions to 0 on collapse — NO white gap remains
          overflow: "hidden",
          transition: "width 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 1400,
          bgcolor: "#A80532",
          color: "rgba(255,255,255,0.92)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        {/* Inner box is always EXPANDED_WIDTH wide so content never squishes */}
        <Box sx={{ width: EXPANDED_WIDTH, display: "flex", flexDirection: "column", height: "100%" }}>

          {/* ── Top action row ── */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pt: 1, px: 1 }}>
            <Tooltip title="Logout" placement="right">
              <IconButton onClick={onLogout}
                sx={{ borderRadius: 2, p: 0.75, color: "#fff", "&:hover": { bgcolor: "rgba(255,255,255,0.12)" } }}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings" placement="right">
              <IconButton component={Link} href="/settings"
                sx={{ borderRadius: 2, p: 0.75, color: "#fff", "&:hover": { bgcolor: "rgba(255,255,255,0.12)" } }}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* ── Logo ── */}
          <Box sx={{ pt: 1.5, px: 2, pb: 1, display: "flex", justifyContent: "center" }}>
            <Box component="img" src="/ToroConnectLogoCircle.png" alt="Toro Campus Connect Logo"
              sx={{ width: "100%", maxWidth: 140, aspectRatio: "1 / 1", objectFit: "cover", display: "block" }} />
          </Box>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 1 }} />

          {/* ── Nav list — scrollable, padded so nothing hides under profile btn ── */}
          <Box sx={{
            flex: 1, overflowY: "auto", overflowX: "hidden",
            pb: "80px",
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
          }}>
            <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ overflow: "hidden" }}>
              <List sx={{ px: 0, mt: 1, overflow: "hidden" }}
                onPointerMove={(e) => pointerY.set(e.clientY)}
                onPointerLeave={() => pointerY.set(Infinity)}>
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
          </Box>

          {/* ── Profile button — fixed bottom-left, always visible ── */}
          <Box sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: `${width}px`,
            overflow: "hidden",
            transition: "width 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
            zIndex: 1401,
          }}>
            <Box sx={{ width: EXPANDED_WIDTH, p: 2, pt: 1, bgcolor: "#A80532" }}>
              <Button
                component={Link}
                href="/profile"
                fullWidth
                startIcon={<Avatar sx={{ bgcolor: "#e11d48" }}><PersonIcon /></Avatar>}
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
                  <Typography variant="body2" fontWeight={700}>{name || "Profile"}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.75 }}>View Profile</Typography>
                </Box>
              </Button>
            </Box>
          </Box>

        </Box>
      </Box>

      {/* ── Collapse / Expand tab — overlays page content, never pushes it ── */}
      <Box
        component="button"
        onClick={() => setCollapsed((p) => !p)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        sx={{
          position: "fixed",
          top: "50%",
          // sits right at the edge of the sidebar, overlaying the page
          left: `${width}px`,
          transform: "translateY(-50%)",
          zIndex: 1500,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 20,
          height: 52,
          bgcolor: "#A80532",
          color: "#fff",
          border: "none",
          borderRadius: "0 8px 8px 0",
          cursor: "pointer",
          boxShadow: "3px 0 8px rgba(0,0,0,0.25)",
          transition: "left 0.28s cubic-bezier(0.4, 0, 0.2, 1), width 0.15s, background-color 0.15s",
          "&:hover": { bgcolor: "#c0062e", width: 24 },
        }}
      >
        {collapsed ? <ChevronRightIcon sx={{ fontSize: 16 }} /> : <ChevronLeftIcon sx={{ fontSize: 16 }} />}
      </Box>
    </>
  );
}

function DockRow({ label, icon, href, active, pointerY, onComingSoon }: {
  label: string;
  icon: React.ReactNode;
  href?: string;
  active: boolean;
  pointerY: ReturnType<typeof useMotionValue<number>>;
  onComingSoon: () => void;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const shiftX = useTransform(pointerY, (y: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return 0;
    const d = Math.abs(y - (rect.top + rect.height / 2));
    return Math.max(0, 1 - d / 120) * 18;
  });
  const springX = useSpring(shiftX, { stiffness: 420, damping: 30, mass: 0.22 });

  return (
    <motion.div ref={ref} variants={itemVariants} whileTap={{ scale: 0.99 }} style={{ x: springX }}>
      <ListItem disablePadding sx={{ mb: 0.5 }}>
        <ListItemButton
          component={href ? Link : "button"}
          href={href as any}
          onClick={href ? undefined : onComingSoon}
          selected={active}
          sx={{
            mx: 1, borderRadius: 2, px: 2, minHeight: 44,
            "&.Mui-selected": { bgcolor: "rgba(255,255,255,0.12)", color: "#fff" },
            "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
          }}
        >
          <ListItemIcon sx={{ color: "inherit", minWidth: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {icon}
          </ListItemIcon>
          <ListItemText primary={label} primaryTypographyProps={{ fontWeight: 600 }} />
        </ListItemButton>
      </ListItem>
    </motion.div>
  );
}
