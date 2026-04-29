// src/app/StudentRecCenter/page.tsx
"use client";

import * as React from "react";
import {
  Box, Container, Typography, Card, CardActionArea, Chip,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/sidebar";
import Header from "@/components/StudentRecCenter/srcHeader";
import Carousel from "@/components/StudentRecCenter/Carousel";
import AddToEventsModal from "@/components/StudentRecCenter/AddToEventsModal";
import InviteFriendModal from "@/components/StudentRecCenter/InviteFriendModal";
import SrcStatusBadge from "@/components/StudentRecCenter/SrcStatusBadge";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import PoolIcon from "@mui/icons-material/Pool";
import SportsBasketballIcon from "@mui/icons-material/SportsBasketball";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";
import GroupIcon from "@mui/icons-material/Group";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const categoryIcons: Record<string, React.ReactNode> = {
  Boxing: <FitnessCenterIcon sx={{ fontSize: 22 }} />,
  Yoga: <SelfImprovementIcon sx={{ fontSize: 22 }} />,
  Aquatics: <PoolIcon sx={{ fontSize: 22 }} />,
  Recovery: <TrendingUpIcon sx={{ fontSize: 22 }} />,
  "Personal Training": <FitnessCenterIcon sx={{ fontSize: 22 }} />,
  "Sport Clubs": <SportsBasketballIcon sx={{ fontSize: 22 }} />,
};

const quickStats = [
  // BACKEND TODO: replace static values with a GET /api/src/stats endpoint
  // that returns { hoursToday, memberCount, weeklyClasses, sportClubCount }
  // so these update dynamically each semester.
  { icon: <AccessTimeIcon sx={{ fontSize: 18 }} />, label: "Open Today", value: "6am – 10pm" },
  { icon: <PeopleIcon sx={{ fontSize: 18 }} />, label: "Members", value: "12,000+" },
  { icon: <EventIcon sx={{ fontSize: 18 }} />, label: "Weekly Classes", value: "80+" },
  { icon: <GroupIcon sx={{ fontSize: 18 }} />, label: "Sport Clubs", value: "40+" },
];

const programData = [
  { title: "Yoga", blurb: "Guided flows for balance and flexibility. Mats available.", imageSrc: "/images/carouselSRC/yoga.png" },
  { title: "Boxing Conditioning", blurb: "Pads, bags, and footwork. High energy training.", imageSrc: "/images/carouselSRC/boxing.png" },
  { title: "Aquatics", blurb: "Lap swim and learn to swim options for all levels.", imageSrc: "/images/carouselSRC/aquatics.png" },
  { title: "Recovery Sessions", blurb: "Mobility, stretching, and tools to feel your best.", imageSrc: "/images/carouselSRC/recovery.png" },
  { title: "Private Instruction", blurb: "One on one coaching tailored to your goals.", imageSrc: "/images/carouselSRC/private.png" },
  { title: "First Aid & CPR", blurb: "Learn lifesaving skills with certified instruction.", imageSrc: "/images/carouselSRC/firstaid.png" },
  { title: "Reservations", blurb: "Reserve courts, lanes, and spaces with ease.", imageSrc: "/images/carouselSRC/reserve.png" },
  { title: "Group Exercise", blurb: "Join classes across strength, cardio, and mobility.", imageSrc: "/images/carouselSRC/classes.png" },
  { title: "Games Room", blurb: "Billiards, console gaming, lounge space to unwind.", imageSrc: "/images/carouselSRC/game-room.jpg" },
  { title: "Rock Wall", blurb: "Bouldering and top rope for all experience levels.", imageSrc: "/images/carouselSRC/rock-wall.jpg" },
  { title: "Outdoor Experiences", blurb: "Trips and skills clinics to explore the outdoors.", imageSrc: "/images/CarouselSRC/outdoor.png" },
  { title: "Intramural Sports", blurb: "Leagues and tournaments for friendly competition.", imageSrc: "/images/carouselSRC/intramurals.jpg" },
];

export default function StudentRecCenterHomePage() {
  const router = useRouter();
  const [sidebarWidth, setSidebarWidth] = React.useState(220);

  const [eventsModal, setEventsModal] = React.useState<{ open: boolean; title: string }>({ open: false, title: "" });
  const [inviteModal, setInviteModal] = React.useState<{ open: boolean; title: string }>({ open: false, title: "" });

  const post = (url: string, body: object) =>
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

  const handleAddToEvents = async (email: string) => {
    const res = await post("/api/events", { program: eventsModal.title, email });
    if (!res.ok) throw new Error("Failed");
  };

  const handleInvite = async (senderEmail: string, friendEmail: string) => {
    const res = await post("/api/invite", { program: inviteModal.title, senderEmail, friendEmail });
    if (!res.ok) throw new Error("Failed");
  };

  const featured = programData.map((p) => ({
    ...p,
    onAddToEvents: () => setEventsModal({ open: true, title: p.title }),
    onInvite: () => setInviteModal({ open: true, title: p.title }),
  }));

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <DashboardSidebar
        onLogout={() => router.push("/login")}
        onWidthChange={setSidebarWidth}
      />

      <Box
        sx={{
          ml: `${sidebarWidth}px`,
          flex: 1,
          minWidth: 0,
          minHeight: "100vh",
          position: "relative",
          transition: "margin-left 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <Header value="" />
        <Box sx={{ height: "1px", bgcolor: "rgba(168,5,50,0.6)", mx: 2 }} />

        <Container maxWidth="xl" sx={{ pt: 2, pb: 2 }}>
          {/* ── HERO ── */}
          <Box
            sx={{
              position: "relative", borderRadius: 5, overflow: "hidden",
              height: { xs: 280, sm: 360, md: 480 }, mb: 2,
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)", isolation: "isolate", transform: "translateZ(0)",
            }}
          >
            <video src="../videos/hero-src.mp4" autoPlay muted loop playsInline
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "blur(20px) brightness(0.65) saturate(0.85)", transform: "scale(1.1) translateZ(0)", willChange: "transform" }}
            />
            <video src="../videos/hero-src.mp4" autoPlay muted loop playsInline
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", transform: "translateZ(0)", willChange: "transform" }}
            />
            <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(168,5,50,0.6) 0%, transparent 50%, rgba(0,0,0,0.4) 100%)" }} />
            <Box sx={{ position: "absolute", bottom: { xs: 20, md: 36 }, left: { xs: 20, md: 40 } }}>
              <Typography sx={{ fontSize: { xs: 11, sm: 12 }, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: "rgba(255,255,255,0.7)", mb: 0.5 }}>
                California State University Northridge
              </Typography>
              <Typography sx={{ fontSize: { xs: 36, sm: 52, md: 72 }, fontWeight: 900, lineHeight: 0.9, letterSpacing: -1, color: "transparent", WebkitTextStroke: { xs: "2px rgba(255,255,255,0.9)", md: "2.5px rgba(255,255,255,0.9)" }, textShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
                CSUN
              </Typography>
              <Typography sx={{ fontSize: { xs: 18, sm: 22, md: 28 }, fontWeight: 900, letterSpacing: 6, color: "#fff", textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
                SRC
              </Typography>
              {/* ── Real open/closed badge — computed from actual SRC hours ── */}
              <Box sx={{ mt: 1.5 }}>
                <SrcStatusBadge />
              </Box>
            </Box>
          </Box>

          {/* ── STATS BAR ── */}
          <Box sx={{ display: "flex", flexWrap: "wrap", mb: 2.5, borderRadius: 4, overflow: "hidden", border: "1.5px solid rgba(255,255,255,0.2)", backdropFilter: "blur(12px)", bgcolor: "rgba(255,255,255,0.1)" }}>
            {quickStats.map((s, i) => (
              <Box key={s.label} sx={{ flex: "1 1 140px", display: "flex", alignItems: "center", gap: 1.5, px: { xs: 2, md: 3 }, py: { xs: 1.5, md: 2 }, borderRight: i < quickStats.length - 1 ? "1px solid rgba(255,255,255,0.15)" : "none" }}>
                <Box sx={{ color: "rgba(255,255,255,0.6)" }}>{s.icon}</Box>
                <Box>
                  <Typography sx={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.55)", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>{s.label}</Typography>
                  <Typography sx={{ fontSize: "0.95rem", color: "#fff", fontWeight: 800, lineHeight: 1.1 }}>{s.value}</Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* ── QUICK CATEGORIES ── */}
          <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.5)", letterSpacing: 3, fontWeight: 700, display: "block", mb: 1.5 }}>
            Explore Programs
          </Typography>
          <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)", md: "repeat(6, 1fr)" }, mb: 5 }}>
            {[
              { title: "Boxing",            href: "/StudentRecCenter/programs#boxing" },
              { title: "Yoga",              href: "/StudentRecCenter/programs#yoga" },
              { title: "Aquatics",          href: "/StudentRecCenter/programs#aquatics" },
              { title: "Recovery",          href: "/StudentRecCenter/programs#recovery" },
              { title: "Personal Training", href: "/StudentRecCenter/programs#pt" },
              { title: "Sport Clubs",       href: "/StudentRecCenter/SportClubs" },
            ].map((c) => (
              <Card key={c.title} elevation={0} sx={{ borderRadius: 3, bgcolor: "rgba(255,255,255,0.09)", border: "1.5px solid rgba(255,255,255,0.18)", backdropFilter: "blur(10px)", transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)", "&:hover": { transform: "translateY(-4px)", bgcolor: "rgba(255,255,255,0.17)", border: "1.5px solid rgba(255,255,255,0.45)", boxShadow: "0 12px 30px rgba(0,0,0,0.2)" } }}>
                <CardActionArea component={Link} href={c.href} sx={{ p: 2, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
                  <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: "rgba(168,5,50,0.3)", border: "1px solid rgba(168,5,50,0.4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffb3c1" }}>
                    {categoryIcons[c.title] ?? <FitnessCenterIcon sx={{ fontSize: 20 }} />}
                  </Box>
                  <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "0.9rem", lineHeight: 1.1 }}>{c.title}</Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: "0.72rem" }}>View classes →</Typography>
                </CardActionArea>
              </Card>
            ))}
          </Box>

          {/* ── FEATURED CAROUSEL ── */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
            <Box>
              <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.5)", letterSpacing: 3, fontWeight: 700, display: "block" }}>Highlights</Typography>
              <Typography variant="h5" fontWeight={900} sx={{ color: "#fff", letterSpacing: -0.5 }}>Featured at the SRC</Typography>
            </Box>
            <Chip label="12 programs" size="small" sx={{ bgcolor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.18)", fontSize: 11, fontWeight: 600 }} />
          </Box>
          <Carousel slides={featured} />
        </Container>

        <AddToEventsModal open={eventsModal.open} programTitle={eventsModal.title} onClose={() => setEventsModal({ open: false, title: "" })} onConfirm={handleAddToEvents} />
        <InviteFriendModal open={inviteModal.open} programTitle={inviteModal.title} onClose={() => setInviteModal({ open: false, title: "" })} onConfirm={handleInvite} />
      </Box>
    </Box>
  );
}
