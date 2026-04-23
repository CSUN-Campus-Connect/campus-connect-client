"use client";
// src/app/security/page.tsx

import * as React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Chip,
  Switch,
  Divider,
  Stack,
  Paper,
  Tabs,
  Tab,
} from "@mui/material";
import { api } from "@/lib/axios";
import DashboardSidebar from "@/components/dashboard/sidebar";
import { useRouter } from "next/navigation";

const drawerWidth = 220;

const REPORT_TYPES = [
  { value: "CRIMINAL", label: "Criminal Activity", description: "Theft, assault, vandalism, or other criminal behavior" },
  { value: "SAFETY_HAZARD", label: "Safety Hazard", description: "Broken equipment, spills, unsafe conditions" },
  { value: "DISCRIMINATION", label: "Discrimination", description: "Bias, discrimination, or civil rights concerns" },
  { value: "SEXUAL_VIOLENCE", label: "Sexual Violence / Title IX", description: "Sexual harassment, assault, stalking, or dating violence" },
  { value: "MISCONDUCT", label: "Student Misconduct", description: "Violations of student code of conduct" },
  { value: "ACADEMIC_DISHONESTY", label: "Academic Dishonesty", description: "Cheating, plagiarism, or academic fraud" },
  { value: "DISTURBANCE", label: "Disturbance", description: "Noise, disruptive behavior, or public disturbance" },
  { value: "SUSPICIOUS_ACTIVITY", label: "Suspicious Activity", description: "Unusual or concerning behavior on campus" },
  { value: "ESCORT_REQUEST", label: "Escort Request", description: "Request a safety escort on campus" },
  { value: "LOST_FOUND", label: "Lost & Found", description: "Report lost or found items on campus" },
  { value: "PARKING", label: "Parking Issue", description: "Parking violations, accidents, or concerns" },
  { value: "MENTAL_HEALTH", label: "Mental Health Concern", description: "Concern about someone's wellbeing" },
];

const RELATIONSHIPS = [
  { value: "VICTIM", label: "I am the person affected" },
  { value: "WITNESS", label: "I witnessed this incident" },
  { value: "BYSTANDER", label: "I heard about this from someone" },
  { value: "ON_BEHALF_OF", label: "I'm reporting on behalf of someone" },
];

const steps = ["Type", "Details", "Review"];

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "#b08800",
  ACKNOWLEDGED: "#1565c0",
  UNDER_REVIEW: "#1565c0",
  INVESTIGATION: "#7c3aed",
  ESCALATED: "#c94150",
  PENDING_RESOLUTION: "#b08800",
  RESOLVED: "#2d8a4e",
  CLOSED: "#666",
  REOPENED: "#c94150",
  Submitted: "#b08800",
  "In Progress": "#1565c0",
  Resolved: "#2d8a4e",
  Closed: "#666",
};

export default function SecurityReportPage() {
  const router = useRouter();
  const [tabIndex, setTabIndex] = React.useState(0);

  const handleLogout = React.useCallback(() => {
    localStorage.clear();
    router.push("/");
  }, [router]);

  return (
    <Box sx={{ display: "flex", bgcolor: "#fafafb", minHeight: "100vh" }}>
      <DashboardSidebar drawerWidth={drawerWidth} onLogout={handleLogout} />
      <Box component="main" sx={{ flexGrow: 1, p: 4, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
        <Box sx={{ maxWidth: 750, mx: "auto" }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
            Campus Safety
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Report incidents, track your submissions, or check the status of an anonymous report.
          </Typography>

          <Tabs
            value={tabIndex}
            onChange={(_, v) => setTabIndex(v)}
            sx={{
              mb: 3,
              "& .MuiTab-root": { textTransform: "none", fontWeight: 500, fontSize: "14px" },
              "& .Mui-selected": { color: "#A80532" },
              "& .MuiTabs-indicator": { bgcolor: "#A80532" },
            }}
          >
            <Tab label="Report" />
            <Tab label="My Reports" />
            <Tab label="Track Report" />
          </Tabs>

          {tabIndex === 0 && <ReportTab />}
          {tabIndex === 1 && <MyReportsTab />}
          {tabIndex === 2 && <TrackTab />}
        </Box>
      </Box>
    </Box>
  );
}

// ============================================================================
// REPORT TAB
// ============================================================================
function ReportTab() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [isAnonymous, setIsAnonymous] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState<{ caseNumber: string; trackingToken?: string } | null>(null);
  const [error, setError] = React.useState("");

  const [form, setForm] = React.useState({
    reportType: "", title: "", description: "", location: "", incidentDate: "", reporterRelationship: "VICTIM",
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { Authorization: `Bearer ${token}` };
  const updateForm = (field: string, value: string) => setForm({ ...form, [field]: value });
  const canProceedStep0 = form.reportType !== "";
  const canProceedStep1 = form.title && form.description && form.incidentDate;
  const selectedType = REPORT_TYPES.find((t) => t.value === form.reportType);

  const handleSubmit = async () => {
    setSubmitting(true); setError("");
    try {
      const endpoint = isAnonymous ? "/api/v1/security/reports/anonymous" : "/api/v1/security/reports";
      const authHeaders = isAnonymous ? {} : headers;
      const res = await api.post(endpoint, {
        reportType: form.reportType, title: form.title, description: form.description,
        location: form.location || undefined, incidentDate: new Date(form.incidentDate).toISOString(),
        reporterRelationship: form.reporterRelationship,
      }, { headers: authHeaders });
      setSubmitted({ caseNumber: res.data.caseNumber, trackingToken: res.data.trackingToken });
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to submit report. Please try again.");
    }
    setSubmitting(false);
  };

  const resetForm = () => {
    setSubmitted(null); setActiveStep(0); setIsAnonymous(false);
    setForm({ reportType: "", title: "", description: "", location: "", incidentDate: "", reporterRelationship: "VICTIM" });
  };

  if (submitted) {
    return (
      <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ bgcolor: "#2d8a4e", p: 3, color: "#fff" }}>
          <Typography variant="h5" fontWeight={700}>Report Submitted</Typography>
        </Box>
        <CardContent sx={{ p: 4 }}>
          <Alert severity="success" sx={{ mb: 3 }}>Your report has been submitted and routed to the appropriate department.</Alert>
          <Typography variant="body1" gutterBottom><strong>Case Number:</strong> {submitted.caseNumber}</Typography>
          {submitted.trackingToken && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>Save your tracking token — you'll need it to check your report status:</Typography>
              <Paper sx={{ p: 2, bgcolor: "#f5f5f5", fontFamily: "monospace", fontSize: "14px", wordBreak: "break-all", mt: 1 }}>{submitted.trackingToken}</Paper>
            </Alert>
          )}
          <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
            <Button variant="contained" onClick={resetForm} sx={{ bgcolor: "#A80532", "&:hover": { bgcolor: "#8a042a" } }}>Submit Another</Button>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Anonymous toggle */}
      <Card sx={{ mb: 3, borderRadius: 2, border: isAnonymous ? "2px solid #b08800" : "1px solid #e0e0e0" }}>
        <CardContent sx={{ py: 2, px: 2.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="body2" fontWeight={600}>Anonymous Reporting</Typography>
              <Typography variant="caption" color="text.secondary">
                {isAnonymous ? "Your identity will not be attached to this report" : "Your CSUN account will be linked to this report"}
              </Typography>
            </Box>
            <Switch checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)}
              inputProps={{ "aria-label": "Enable anonymous reporting" }}
              sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#b08800" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#b08800" } }} />
          </Box>
          {isAnonymous && (
            <Alert severity="info" sx={{ mt: 1.5, fontSize: "12px" }}>
              Your report is truly anonymous. Your name, email, and account information are not sent with this submission and cannot be traced back to you. You will receive a tracking token to check the status of your report — save it somewhere safe, as it is the only way to follow up.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel StepIconProps={{ sx: { "&.Mui-active": { color: "#A80532" }, "&.Mui-completed": { color: "#A80532" } } }}>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Step 0 */}
      {activeStep === 0 && (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>What are you reporting?</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Select the category that best describes your concern.</Typography>
            <Box role="radiogroup" aria-label="Report type" sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 1.5 }}>
              {REPORT_TYPES.map((type) => (
                <Card key={type.value}
                  role="radio"
                  aria-checked={form.reportType === type.value}
                  tabIndex={0}
                  onClick={() => updateForm("reportType", type.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); updateForm("reportType", type.value); } }}
                  sx={{ cursor: "pointer", borderRadius: 2, transition: "all 0.15s", border: form.reportType === type.value ? "2px solid #A80532" : "1px solid #e0e0e0", bgcolor: form.reportType === type.value ? "#fef2f3" : "#fff", "&:hover": { borderColor: "#A80532", bgcolor: "#fef8f8" } }}>
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>{type.label}</Typography>
                    <Typography variant="caption" color="text.secondary">{type.description}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
              <Button variant="contained" disabled={!canProceedStep0} onClick={() => setActiveStep(1)}
                sx={{ bgcolor: "#A80532", "&:hover": { bgcolor: "#8a042a" }, "&.Mui-disabled": { bgcolor: "#e0e0e0" } }}>Continue</Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Step 1 */}
      {activeStep === 1 && (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>Incident Details</Typography>
            {selectedType && <Chip label={selectedType.label} size="small" sx={{ mb: 2, bgcolor: "#fef2f3", color: "#A80532", fontWeight: 500 }} />}
            <Stack spacing={2.5}>
              <TextField label="Title" placeholder="Brief summary of the incident" fullWidth required value={form.title} onChange={(e) => updateForm("title", e.target.value)} InputLabelProps={{ shrink: true }} />
              <TextField label="Description" placeholder="Describe what happened in detail." fullWidth required multiline rows={5} value={form.description} onChange={(e) => updateForm("description", e.target.value)} InputLabelProps={{ shrink: true }} />
              <TextField label="Location" placeholder="Where did this happen?" fullWidth value={form.location} onChange={(e) => updateForm("location", e.target.value)} InputLabelProps={{ shrink: true }} />
              <TextField label="When did this happen?" type="datetime-local" fullWidth required value={form.incidentDate} onChange={(e) => updateForm("incidentDate", e.target.value)} InputLabelProps={{ shrink: true }} />
              <TextField label="Your relationship to this incident" select fullWidth value={form.reporterRelationship} onChange={(e) => updateForm("reporterRelationship", e.target.value)}>
                {RELATIONSHIPS.map((r) => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
              </TextField>
            </Stack>
            <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
              <Button variant="outlined" onClick={() => setActiveStep(0)} sx={{ color: "#666", borderColor: "#e0e0e0" }}>Back</Button>
              <Button variant="contained" disabled={!canProceedStep1} onClick={() => setActiveStep(2)}
                sx={{ bgcolor: "#A80532", "&:hover": { bgcolor: "#8a042a" }, "&.Mui-disabled": { bgcolor: "#e0e0e0" } }}>Review</Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Step 2 */}
      {activeStep === 2 && (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>Review Your Report</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Please review the information below before submitting.</Typography>
            <Stack spacing={2}>
              <Box><Typography variant="caption" color="text.secondary">Report Type</Typography><Typography variant="body1" fontWeight={500}>{selectedType?.label}</Typography></Box>
              {isAnonymous && <Alert severity="warning" variant="outlined">This report will be submitted anonymously. You will receive a tracking token.</Alert>}
              <Divider />
              <Box><Typography variant="caption" color="text.secondary">Title</Typography><Typography variant="body1">{form.title}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Description</Typography><Typography variant="body2" sx={{ whiteSpace: "pre-wrap", bgcolor: "#f5f5f5", p: 2, borderRadius: 1 }}>{form.description}</Typography></Box>
              {form.location && <Box><Typography variant="caption" color="text.secondary">Location</Typography><Typography variant="body1">{form.location}</Typography></Box>}
              <Box><Typography variant="caption" color="text.secondary">When</Typography><Typography variant="body1">{new Date(form.incidentDate).toLocaleString()}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Relationship</Typography><Typography variant="body1">{RELATIONSHIPS.find((r) => r.value === form.reporterRelationship)?.label}</Typography></Box>
            </Stack>
            <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
              <Button variant="outlined" onClick={() => setActiveStep(1)} sx={{ color: "#666", borderColor: "#e0e0e0" }}>Edit</Button>
              <Button variant="contained" onClick={handleSubmit} disabled={submitting}
                sx={{ bgcolor: "#A80532", "&:hover": { bgcolor: "#8a042a" }, px: 4 }}>{submitting ? "Submitting..." : "Submit Report"}</Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </>
  );
}

// ============================================================================
// MY REPORTS TAB
// ============================================================================
function MyReportsTab() {
  const [reports, setReports] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<any>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { Authorization: `Bearer ${token}` };

  React.useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get("/api/v1/security/reports/mine", { headers });
        setReports(res.data);
      } catch {}
      setLoading(false);
    };
    fetchReports();
  }, []);

  const openDetail = async (id: string) => {
    try {
      const res = await api.get(`/api/v1/security/reports/${id}`, { headers });
      setSelected(res.data);
    } catch {}
  };

  if (loading) return <Typography color="text.secondary">Loading your reports...</Typography>;

  if (reports.length === 0) {
    return (
      <Card sx={{ borderRadius: 3, textAlign: "center", py: 6 }}>
        <CardContent>
          <Typography variant="h6" color="text.secondary" gutterBottom>No reports yet</Typography>
          <Typography variant="body2" color="text.secondary">When you submit a report, it will appear here so you can track its progress.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ display: "flex", gap: 2.5 }}>
      <Box sx={{ flex: selected ? "0 0 45%" : "1" }}>
        <Stack spacing={1}>
          {reports.map((r: any) => {
            const sc = STATUS_COLORS[r.status] || "#666";
            return (
              <Card key={r.id} onClick={() => openDetail(r.id)}
                sx={{ borderRadius: 2, cursor: "pointer", border: selected?.id === r.id ? "2px solid #A80532" : "1px solid #e0e0e0", bgcolor: selected?.id === r.id ? "#fef2f3" : "#fff", "&:hover": { borderColor: "#A80532" } }}>
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">{r.caseNumber}</Typography>
                    <Chip label={r.status.replace(/_/g, " ")} size="small"
                      sx={{ bgcolor: `${sc}15`, color: sc, fontWeight: 600, fontSize: "10px", border: `1px solid ${sc}40` }} />
                  </Box>
                  <Typography variant="body2" fontWeight={600}>{r.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {r.reportType.replace(/_/g, " ").toLowerCase()} · {new Date(r.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      </Box>

      {selected && (
        <Card sx={{ flex: "0 0 53%", borderRadius: 3, maxHeight: "75vh", overflow: "auto" }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">{selected.caseNumber}</Typography>
                <Typography variant="h6" fontWeight={600}>{selected.title}</Typography>
              </Box>
              <Button size="small" onClick={() => setSelected(null)} aria-label="Close report details" sx={{ color: "#999", minWidth: "auto" }}>✕</Button>
            </Box>

            <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
              <Chip label={selected.status} size="small" sx={{ bgcolor: `${STATUS_COLORS[selected.status] || "#666"}15`, color: STATUS_COLORS[selected.status] || "#666", fontWeight: 600, border: `1px solid ${STATUS_COLORS[selected.status] || "#666"}40` }} />
              <Chip label={selected.reportType?.replace(/_/g, " ").toLowerCase() || selected.department} size="small" variant="outlined" />
            </Box>

            <Stack spacing={1.5} sx={{ mb: 2 }}>
              <InfoRow label="Department" value={selected.department || selected.assignedDepartment || "—"} />
              <InfoRow label="Incident Date" value={new Date(selected.incidentDate).toLocaleString()} />
              <InfoRow label="Submitted" value={new Date(selected.createdAt).toLocaleString()} />
              {selected.location && <InfoRow label="Location" value={selected.location} />}
            </Stack>

            {selected.description && (
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", bgcolor: "#f5f5f5", p: 2, borderRadius: 1, mb: 2 }}>
                {selected.description}
              </Typography>
            )}

            {selected.resolution && (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight={600}>Resolution</Typography>
                <Typography variant="body2">{selected.resolution}</Typography>
              </Alert>
            )}

            {selected.messages && selected.messages.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Messages</Typography>
                <Stack spacing={1}>
                  {selected.messages.map((m: any) => (
                    <Box key={m.id} sx={{
                      p: 1.5, borderRadius: 1.5,
                      bgcolor: m.senderRole === "REPORTER" ? "#f5f5f5" : "#f0f5ff",
                      borderLeft: `3px solid ${m.senderRole === "REPORTER" ? "#999" : "#1565c0"}`,
                    }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="caption" fontWeight={600} color={m.senderRole === "REPORTER" ? "text.secondary" : "primary"}>{m.senderRole.toLowerCase()}</Typography>
                        <Typography variant="caption" color="text.secondary">{new Date(m.createdAt).toLocaleString()}</Typography>
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
    </Box>
  );
}

// ============================================================================
// TRACK TAB
// ============================================================================
function TrackTab() {
  const [trackToken, setTrackToken] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [report, setReport] = React.useState<any>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackToken.trim()) return;
    setLoading(true); setError(""); setReport(null);
    try {
      const res = await api.get(`/api/v1/security/reports/track/${trackToken.trim()}`);
      setReport(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Invalid tracking token. Please check and try again.");
    }
    setLoading(false);
  };

  return (
    <>
      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>Track Anonymous Report</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter the tracking token you received when you submitted your anonymous report.
          </Typography>
          <form onSubmit={handleTrack}>
            <TextField label="Tracking Token" placeholder="paste your tracking token here" fullWidth
              value={trackToken} onChange={(e) => setTrackToken(e.target.value)}
              InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} />
            <Button type="submit" variant="contained" fullWidth disabled={loading || !trackToken.trim()}
              sx={{ bgcolor: "#A80532", "&:hover": { bgcolor: "#8a042a" }, "&.Mui-disabled": { bgcolor: "#e0e0e0" }, py: 1.2 }}>
              {loading ? "Looking up..." : "Track Report"}
            </Button>
          </form>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </CardContent>
      </Card>

      {report && (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>{report.caseNumber}</Typography>
              <Chip label={report.status} size="small"
                sx={{ bgcolor: `${STATUS_COLORS[report.status] || "#666"}15`, color: STATUS_COLORS[report.status] || "#666", fontWeight: 600, border: `1px solid ${STATUS_COLORS[report.status] || "#666"}40` }} />
            </Box>

            <Stack spacing={1.5}>
              <InfoRow label="Type" value={report.reportType.replace(/_/g, " ")} />
              <InfoRow label="Department" value={report.department} />
              <InfoRow label="Submitted" value={new Date(report.submittedAt).toLocaleString()} />
            </Stack>

            {report.resolution && (
              <>
                <Divider sx={{ my: 2 }} />
                <Alert severity="success">
                  <Typography variant="body2" fontWeight={600}>Resolution</Typography>
                  <Typography variant="body2">{report.resolution}</Typography>
                </Alert>
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
                        <Typography variant="caption" fontWeight={600} color={m.senderRole === "REPORTER" ? "text.secondary" : "primary"}>{m.senderRole.toLowerCase()}</Typography>
                        <Typography variant="caption" color="text.secondary">{new Date(m.createdAt).toLocaleString()}</Typography>
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
    </>
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