"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Box, Container, IconButton, Typography, Chip } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import NavTabs from "./srcNavTabs";

export default function Header({ value }: { value?: string }) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        py: scrolled ? 0.75 : 1.25,
        transition: "padding 0.3s ease",
        isolation: "isolate",
        transform: "translateZ(0)",
        willChange: "transform",
        bgcolor: scrolled ? "transparent" : "rgba(0,0,0,0.01)",
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: { xs: 1.5, sm: 2 },
            py: "10px",
            borderRadius: 999,
            background: scrolled ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.18)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: scrolled
              ? "1.5px solid rgba(168,5,50,0.15)"
              : "1.5px solid rgba(255,255,255,0.7)",
            boxShadow: scrolled
              ? "0 8px 32px rgba(168,5,50,0.12), 0 2px 8px rgba(0,0,0,0.08)"
              : "0 4px 24px rgba(0,0,0,0.08)",
            transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
            overflow: "visible",
            transform: "translateZ(0)",
            willChange: "backdrop-filter, background",
          }}
        >
          {/* Logo + wordmark */}
          <Link
            href="/StudentRecCenter"
            aria-label="SRC Home"
            style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}
          >
            <Image
              src="/images/src-logo.png"
              alt="CSUN SRC"
              width={36}
              height={36}
              style={{ objectFit: "contain", display: "block" }}
            />
            <Box sx={{ display: { xs: "none", sm: "flex" }, flexDirection: "column", lineHeight: 1 }}>
              <Typography
                sx={{
                  fontSize: 13, fontWeight: 900, letterSpacing: 2,
                  color: scrolled ? "#A80532" : "#fff",
                  textTransform: "uppercase", lineHeight: 1,
                  transition: "color 0.3s ease",
                }}
              >
                CSUN
              </Typography>
              <Typography
                sx={{
                  fontSize: 11, fontWeight: 500, letterSpacing: 0.5,
                  color: scrolled ? "rgba(168,5,50,0.7)" : "rgba(255,255,255,0.8)",
                  lineHeight: 1.3,
                  transition: "color 0.3s ease",
                }}
              >
                Student Recreation Center
              </Typography>
            </Box>
          </Link>

          <Box sx={{ flex: 1 }} />

          {/* Live badge */}
          <Chip
            label="● OPEN NOW" //BACKEND TODO:  change to dynamic clock API route for real hours status. please and thankyou :)
            size="small"
            sx={{
              display: { xs: "none", lg: "flex" },
              fontSize: 10, fontWeight: 800, letterSpacing: 1, height: 24,
              bgcolor: scrolled ? "rgba(34,197,94,0.12)" : "rgba(34,197,94,0.2)",
              color: scrolled ? "#16a34a" : "#bbf7d0",
              border: scrolled ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(187,247,208,0.4)",
              "& .MuiChip-label": { px: 1 },
              animation: "pulse 2s infinite",
              "@keyframes pulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.7 } },
            }}
          />

          <NavTabs value={value} inline scrolled={scrolled} />
        </Box>
      </Container>
    </Box>
  );
}
