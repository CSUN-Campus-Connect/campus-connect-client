// src/app/StudentRecCenter/FitQuest/page.tsx
"use client";

import * as React from "react";
import { Box, Container, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { useRouter } from "next/navigation";
import Header from "@/components/StudentRecCenter/srcHeader";
import DashboardSidebar from "@/components/dashboard/sidebar";
import SrcStatusBadge from "@/components/StudentRecCenter/SrcStatusBadge";
import CreateParty, { Party } from "@/components/StudentRecCenter/FitQuest/FQfunctions/CreateParty";
import PartyList from "@/components/StudentRecCenter/FitQuest/FQfunctions/PartyList";
import StartQuest, { Quest } from "@/components/StudentRecCenter/FitQuest/FQfunctions/StartQuest";
import MilestonesPanel, { Milestone } from "@/components/StudentRecCenter/FitQuest/FQfunctions/Milestones";
import WorkoutDeck from "@/components/StudentRecCenter/FitQuest/FQfunctions/WorkoutDeck";
// import { useAuthorize } from "@/lib/useAuthorize";

export default function FitQuestPage() {

  // authorization (commented out to disable lockout)
  // const router = useRouter();
  // const { auth, user, token, loading } = useAuthorize();
  // React.useEffect(() => {
  //   if(loading) return;
  //   if (auth && token) console.log("Stored user: ", user);
  //   else { router.replace("/"); }
  // }, [auth, token, user, loading, router]);

  const router = useRouter();
  const [sidebarWidth, setSidebarWidth] = React.useState(220);

  const [parties, setParties] = React.useState<Party[]>([]);
  const [quests, setQuests] = React.useState<Quest[]>([]);
  const [milestones, setMilestones] = React.useState<Milestone[]>([]);

  const addParty = (p: Party) => setParties((prev) => [...prev, p]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* ── Sidebar ── */}
      <DashboardSidebar
        onLogout={() => router.push("/login")}
        onWidthChange={setSidebarWidth}
      />

      {/* ── Main content ── */}
      <Box
        sx={{
          ml: `${sidebarWidth}px`,
          flex: 1,
          minWidth: 0,
          transition: "margin-left 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <Header value="/StudentRecCenter/FitQuest" />

        <Container sx={{ pt: 3, pb: 8 }}>
          {/* Page heading + live status */}
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1, flexWrap: "wrap", gap: 1 }}>
            <Typography variant="h4" fontWeight={900} sx={{ color: "#fff" }}>
              FitQuest
            </Typography>
            <SrcStatusBadge />
          </Box>

          <Typography sx={{ color: "rgba(255,255,255,0.95)", mb: 3 }}>
            Interactive fitness feature. Build parties that follow the same
            training plan and compete in exercise categories with friends or set
            personal milestones.
          </Typography>

          <Grid container columnSpacing={{ xs: 0, md: 5 }} rowSpacing={3}>
            {/* Left column */}
            <Grid xs={12} md={6} sx={{ pr: { md: 1 } }}>
              <CreateParty
                onCreate={addParty}
                existingNames={parties.map((p) => p.name)}
              />
              <PartyList
                parties={parties}
                setParties={setParties}
                quests={quests}
                setQuests={setQuests}
              />
            </Grid>

            {/* Right column */}
            <Grid xs={12} md={6} sx={{ pl: { md: 1 } }}>
              <StartQuest
                parties={parties}
                quests={quests}
                setQuests={setQuests}
              />
              <Box sx={{ mt: 3 }}>
                <MilestonesPanel
                  milestones={milestones}
                  setMilestones={setMilestones}
                />
              </Box>
            </Grid>
          </Grid>

          {/* Full-width workout card deck at bottom */}
          <Box sx={{ mt: 4 }}>
            <WorkoutDeck />
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
