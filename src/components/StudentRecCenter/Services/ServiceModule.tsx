"use client";

// @/components/StudentRecCenter/Services/ServiceModule.tsx

import * as React from "react";
import { Box, Button, Chip, Typography } from "@mui/material";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded";
import SelfImprovementRoundedIcon from "@mui/icons-material/SelfImprovementRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import DryRoundedIcon from "@mui/icons-material/DryRounded";
import AccessibleRoundedIcon from "@mui/icons-material/AccessibleRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import TimerRoundedIcon from "@mui/icons-material/TimerRounded";
import type { ServiceModule as ServiceModuleType } from "./ServicesData";
import ProShopModule from "./ProShopModule";
import TrainersGrid from "./TrainersGrid";
import ReservationsGrid from "./ReservationsGrid";

const ICON_MAP: Record<string, React.ReactNode> = {
  StorefrontRounded:      <StorefrontRoundedIcon />,
  FitnessCenterRounded:   <FitnessCenterRoundedIcon />,
  SelfImprovementRounded: <SelfImprovementRoundedIcon />,
  SchoolRounded:          <SchoolRoundedIcon />,
  FavoriteRounded:        <FavoriteRoundedIcon />,
  EventAvailableRounded:  <EventAvailableRoundedIcon />,
  LockRounded:            <LockRoundedIcon />,
  DryRounded:             <DryRoundedIcon />,
  AccessibleRounded:      <AccessibleRoundedIcon />,
};

// ── CPR special highlight panel ───────────────────────────────────────────────
function CPRHighlight({ service }: { service: ServiceModuleType }) {
  return (
    <Box
      sx={{
        borderRadius: "20px",
        overflow: "hidden",
        border: "1.5px solid rgba(244,63,94,0.45)",
        background: "linear-gradient(135deg, rgba(244,63,94,0.22) 0%, rgba(180,10,40,0.18) 50%, rgba(244,63,94,0.12) 100%)",
        backdropFilter: "blur(18px)",
        boxShadow: "0 0 40px rgba(244,63,94,0.20), inset 0 1px 0 rgba(255,255,255,0.12)",
        mt: 2,
      }}
    >
      {/* Top banner */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: "1px solid rgba(244,63,94,0.22)",
          background: "linear-gradient(90deg, rgba(244,63,94,0.28) 0%, transparent 100%)",
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "12px",
              bgcolor: "rgba(244,63,94,0.30)",
              border: "1px solid rgba(244,63,94,0.50)",
              display: "grid",
              placeItems: "center",
              color: "#fda4af",
              "& svg": { fontSize: 22 },
            }}
          >
            <FavoriteRoundedIcon aria-hidden="true" />
          </Box>
          <Box>
            <Typography sx={{ color: "white", fontWeight: 900, fontSize: 18, lineHeight: 1.1 }}>
              American Red Cross Certified
            </Typography>
            <Typography sx={{ color: "rgba(255,180,190,0.75)", fontSize: 12, fontWeight: 600 }}>
              CPR · AED · First Aid — One Day
            </Typography>
          </Box>
        </Box>
        <Button
          href={service.cta!.href}
          target="_blank"
          rel="noopener noreferrer"
          endIcon={<OpenInNewRoundedIcon aria-hidden="true" sx={{ fontSize: 13 }} />}
          sx={{
            borderRadius: 999,
            bgcolor: "#f43f5e",
            color: "white",
            fontWeight: 800,
            fontSize: 12.5,
            px: 2.2,
            py: 0.9,
            textTransform: "none",
            "&:hover": { bgcolor: "#e11d48", transform: "translateY(-2px)", boxShadow: "0 6px 20px rgba(244,63,94,0.5)" },
            transition: "all 0.2s ease",
          }}
        >
          {service.cta!.label}
        </Button>
      </Box>

      {/* Key facts row */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0, borderBottom: "1px solid rgba(244,63,94,0.15)" }}>
        {[
          { icon: <AttachMoneyRoundedIcon aria-hidden="true" sx={{ fontSize: 16 }} />, label: "Cost", value: "$70 per person" },
          { icon: <CalendarMonthRoundedIcon aria-hidden="true" sx={{ fontSize: 16 }} />, label: "Schedule", value: "Select Saturdays" },
          { icon: <TimerRoundedIcon aria-hidden="true" sx={{ fontSize: 16 }} />, label: "Duration", value: "9am – 3:45pm" },
          { icon: <PeopleRoundedIcon aria-hidden="true" sx={{ fontSize: 16 }} />, label: "Class size", value: "Max 10 participants" },
        ].map((f, i, arr) => (
          <Box
            key={f.label}
            sx={{
              flex: "1 1 130px",
              px: 2.5,
              py: 1.8,
              borderRight: i < arr.length - 1 ? "1px solid rgba(244,63,94,0.14)" : "none",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mb: 0.3, color: "rgba(255,150,165,0.7)" }}>
              {f.icon}
              <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: "rgba(255,150,165,0.65)" }}>
                {f.label}
              </Typography>
            </Box>
            <Typography sx={{ color: "white", fontWeight: 800, fontSize: 14 }}>{f.value}</Typography>
          </Box>
        ))}
      </Box>

      {/* Bullet grid */}
      <Box sx={{ p: 3, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1 }}>
        {(service.bullets ?? []).map((b) => (
          <Box key={b} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
            <Box
              sx={{
                width: 20, height: 20, borderRadius: "50%",
                bgcolor: "rgba(244,63,94,0.22)", border: "1px solid rgba(244,63,94,0.44)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, mt: 0.1,
              }}
            >
              <CheckRoundedIcon aria-hidden="true" sx={{ fontSize: 11, color: "#fda4af" }} />
            </Box>
            <Typography sx={{ color: "rgba(255,255,255,0.80)", fontSize: 13.5, lineHeight: 1.55 }}>{b}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

interface Props { service: ServiceModuleType }

export default function ServiceModule({ service }: Props) {
  const icon = ICON_MAP[service.iconName];
  const isCPR = service.id === "cpr-firstaid";

  return (
    <Box
      id={service.id}
      component="section"
      sx={{
        scrollMarginTop: 90,
        py: { xs: 4, md: 5 },
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "flex-start", mb: isCPR ? 0 : 2.5 }}>
        <Box
          aria-hidden="true"
          sx={{
            width: 52,
            height: 52,
            borderRadius: "14px",
            bgcolor: `${service.accentColor}22`,
            border: `1.5px solid ${service.accentColor}44`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: service.accentColor,
            flexShrink: 0,
            "& svg": { fontSize: 24 },
          }}
        >
          {icon}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, mb: 0.4 }}>
            <Typography
              component="h2"
              sx={{ color: "white", fontWeight: 900, fontSize: { xs: 22, md: 28 }, lineHeight: 1.1, letterSpacing: -0.4 }}
            >
              {service.title}
            </Typography>
            {service.badge && (
              <Chip
                label={service.badge}
                size="small"
                sx={{
                  height: 22, fontSize: 10.5, fontWeight: 800,
                  bgcolor: `${service.accentColor}28`, color: service.accentColor,
                  border: `1px solid ${service.accentColor}55`,
                  "& .MuiChip-label": { px: 1 },
                }}
              />
            )}
          </Box>
          <Typography sx={{ color: service.accentColor, fontSize: 13, fontWeight: 700, fontStyle: "italic", mb: 0.8, opacity: 0.85 }}>
            {service.tagline}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 1.75, maxWidth: 640 }}>
            {service.description}
          </Typography>
        </Box>

        {/* CTA — skip for CPR since CPR has its own CTA inside the highlight panel */}
        {service.cta && !isCPR && (
          <Button
            href={service.cta.href}
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<OpenInNewRoundedIcon aria-hidden="true" sx={{ fontSize: 13 }} />}
            sx={{
              borderRadius: 999,
              bgcolor: service.accentColor,
              color: "white",
              fontWeight: 800,
              fontSize: 12.5,
              px: 2.2,
              py: 0.9,
              textTransform: "none",
              whiteSpace: "nowrap",
              flexShrink: 0,
              alignSelf: "flex-start",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: service.accentColor,
                filter: "brightness(1.15)",
                transform: "translateY(-2px)",
                boxShadow: `0 6px 18px ${service.accentColor}55`,
              },
            }}
          >
            {service.cta.label}
          </Button>
        )}
      </Box>

      {/* CPR gets its own bright highlight panel */}
      {isCPR && <CPRHighlight service={service} />}

      {/* Bullets for non-CPR */}
      {!isCPR && service.bullets && service.bullets.length > 0 && (
        <Box sx={{ mb: 3, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 0.8 }}>
          {service.bullets.map((b) => (
            <Box key={b} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
              <Box
                sx={{
                  width: 20, height: 20, borderRadius: "50%",
                  bgcolor: `${service.accentColor}22`, border: `1px solid ${service.accentColor}44`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, mt: 0.1,
                }}
              >
                <CheckRoundedIcon aria-hidden="true" sx={{ fontSize: 11, color: service.accentColor }} />
              </Box>
              <Typography sx={{ color: "rgba(255,255,255,0.72)", fontSize: 13.5, lineHeight: 1.55 }}>{b}</Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Content modules */}
      {service.id === "pro-shop" && <ProShopModule service={service} />}

      {(service.id === "personal-training" || service.id === "private-instruction") && service.trainers && (
        <TrainersGrid
          trainers={service.trainers}
          label={service.id === "personal-training" ? "Your Personal Trainers" : "Private Instructors"}
        />
      )}

      {service.id === "reservations" && service.spaces && (
        <ReservationsGrid spaces={service.spaces} />
      )}
    </Box>
  );
}
