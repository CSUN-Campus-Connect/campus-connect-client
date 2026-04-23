"use client";

import * as React from "react";
import { Alert, Card, CardContent, Box, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { Doughnut } from "react-chartjs-2";
import "../charts/setup";
import { CenterTextPlugin } from "../charts/plugins";
import { WidgetHeader } from "./WidgetHeader";

export const CanvasAssignmentsWidget: React.FC<{ onDelete?: () => void }> = ({ onDelete }) => {
  const [loading, setLoading] = React.useState(true);
  const [courses, setCourses] = React.useState<Array<{ id: string; name: string; done: number; left: number }>>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        // TODO: wire to backend/Canvas
        const mock = [
          { id: "cs201", name: "CS 201", done: 8, left: 3 },
          { id: "hist120", name: "HIST 120", done: 5, left: 5 },
          { id: "math230", name: "MATH 230", done: 10, left: 2 },
        ];
        setCourses(mock);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load assignments");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Card className="widget-card" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <WidgetHeader title="Class Assignments Tracker" onDelete={onDelete} />
      <CardContent sx={{ flex: 1, overflow: "auto" }}>
        {loading && <Typography variant="body2">Loading…</Typography>}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && (
          <Grid container spacing={2}>
            {courses.map((c) => {
              const total = c.done + c.left;
              return (
                <Grid key={c.id} item xs={12} sm={4}>
                  <Box
                    role="img"
                    aria-label={`${c.name}: ${c.done} of ${c.done + c.left} assignments completed`}
                    sx={{ height: 200 }}
                  >
                    <Doughnut
                      data={{ labels: ["Done", "Remaining"], datasets: [{ data: [c.done, c.left], backgroundColor: ["#22c55e", "#e71717ff"] }] }}
                      options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                      plugins={[CenterTextPlugin]}
                    />
                  </Box>
                  <Stack alignItems="center" mt={1}>
                    <Typography fontWeight={700}>{c.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{c.done}/{total} completed</Typography>
                  </Stack>
                </Grid>
              );
            })}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};
