"use client";
// src/app/security/track/page.tsx

import * as React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";

export default function TrackReportPage() {
  const router = useRouter();
  const [token, setToken] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [report, setReport] = React.useState<any>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    setLoading(true);
    setError("");
    setReport(null);

    try {
      const res = await api.get(`/api/v1/security/reports/track/${token.trim()}`);
      setReport(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Invalid tracking token. Please check and try again.");
    }
    setLoading(false);
  };

  const STATUS_COLORS: Record<string, string> = {
    Submitted: "#b08800",
    "In Progress": "#1565c0",
    Resolved: "#2d8a4e",
    Closed: "#666",
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fafafb", display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
      <Box sx={{ maxWidth: 560, width: "100%" }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box component="img" src="/ToroConnectLogoCircle.png" alt="Toro Campus Connect" sx={{ width: 80, height: 80, mb: 2, mx: "auto", display: "block" }} />
          <Typography variant="h5" fontWeight={700}>Track Your Report</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Enter the tracking token you received when you submitted your anonymous report.
          </Typography>
        </Box>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <form onSubmit={handleTrack}>
              <TextField
                label="Tracking Token"
                placeholder="paste your tracking token here"
                fullWidth
                value={token}
                onChange={(e) => setToken(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
              <Button type="submit" variant="contained" fullWidth disabled={loading || !token.trim()}
                sx={{ bgcolor: "#A80532", "&:hover": { bgcolor: "#8a042a" }, "&.Mui-disabled": { bgcolor: "#e0e0e0" }, py: 1.2 }}>
                {loading ? "Looking up..." : "Track Report"}
              </Button>
            </form>

            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </CardContent>
        </Card>

        {report && (
          <Card sx={{ borderRadius: 3, mt: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>{report.caseNumber}</Typography>
                <Chip
                  label={report.status}
                  size="small"
                  sx={{
                    bgcolor: `${STATUS_COLORS[report.status] || "#666"}15`,
                    color: STATUS_COLORS[report.status] || "#666",
                    fontWeight: 600,
                    border: `1px solid ${STATUS_COLORS[report.status] || "#666"}40`,
                  }}
                />
              </Box>

              <Stack spacing={1.5}>
                <InfoRow label="Type" value={report.reportType.replace(/_/g, " ")} />
                <InfoRow label="Department" value={report.department} />
                <InfoRow label="Submitted" value={new Date(report.submittedAt).toLocaleString()} />
              </Stack>

              {report.resolution && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Resolution</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>{report.resolution}</Typography>
                  </Box>
                </>
              )}

              {report.messages && report.messages.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Messages</Typography>
                  <Stack spacing={1}>
                    {report.messages.map((m: any, i: number) => (
                      <Box key={i} sx={{
                        p: 1.5, borderRadius: 1.5,
                        bgcolor: m.senderRole === "REPORTER" ? "#f5f5f5" : "#f0f5ff",
                        borderLeft: `3px solid ${m.senderRole === "REPORTER" ? "#999" : "#1565c0"}`,
                      }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                          <Typography variant="caption" fontWeight={600} color={m.senderRole === "REPORTER" ? "text.secondary" : "primary"}>
                            {m.senderRole.toLowerCase()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(m.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                        <Typography variant="body2">{m.content}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </>
              )}
            </CardContent>
          </Card>
        )}

        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Button variant="text" onClick={() => router.push("/security")} sx={{ color: "#A80532" }}>
            Submit a new report
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ mx: 1 }}>·</Typography>
          <Button variant="text" onClick={() => router.push("/")} sx={{ color: "#666" }}>
            Back to home
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={500}>{value}</Typography>
    </Box>
  );
}