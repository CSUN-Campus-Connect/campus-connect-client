"use client";

import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { api } from "../../../lib/axios";
import { changePasswordSchema } from "@/lib/validators/auth.validators";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Fade from "@mui/material/Fade";
import Divider from "@mui/material/Divider";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

const darkRed = "#7A0A0A";

const textFieldSx = {
  "& .MuiFormHelperText-root": { marginLeft: 0, marginRight: 0 },
  "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: darkRed },
};

const fieldLabel = (text: string) => (
  <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary", mb: 0.5 }}>
    {text}
  </Typography>
);

//  Password requirements checklist 
const passwordRequirements = [
  { label: "At least 8 characters",  test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter",        test: (p: string) => /[A-Z]/.test(p) },
  { label: "Lowercase letter",        test: (p: string) => /[a-z]/.test(p) },
  { label: "Number",                  test: (p: string) => /[0-9]/.test(p) },
  { label: "Special character",       test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
];

function PasswordChecklist({ password }: { password: string }) {
  if (!password) return null;
  return (
    <Box sx={{ mt: 0.5, mb: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }}>
      {passwordRequirements.map(({ label, test }) => {
        const met = test(password);
        return (
          <Stack key={label} direction="row" alignItems="center" spacing={0.5}>
            {met
              ? <CheckCircleOutlineIcon sx={{ fontSize: 14, color: "#16A34A" }} />
              : <RadioButtonUncheckedIcon sx={{ fontSize: 14, color: "#D1D5DB" }} />
            }
            <Typography sx={{ fontSize: 12, color: met ? "#16A34A" : "#9CA3AF", transition: "color 0.2s" }}>
              {label}
            </Typography>
          </Stack>
        );
      })}
    </Box>
  );
}

// Delete account 
function DeleteAccountSection() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const CONFIRM_TEXT = "DELETE";
  // Requires both "DELETE" confirmation text and password before the button is enabled
  const isConfirmValid = confirmText === CONFIRM_TEXT && password.trim().length > 0;

  // Resets all form state when the user cancels or after a successful deletion
  const closeAndReset = () => {
    setOpen(false);
    setConfirmText("");
    setPassword("");
    setError(null);
    setIsDeleting(false);
  };

  const handleDeleteAccount = async () => {
    if (!isConfirmValid) return;
    setIsDeleting(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      await api.delete("/api/v1/users/me", {
        headers: { Authorization: `Bearer ${token}` },
        data: { password },
      });
      // Clears all auth data and redirects to home after successful account deletion
      localStorage.clear();
      router.push("/");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete account. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <Box
      sx={{
        border: "1px solid rgba(220,38,38,0.25)",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {/* Header row */}
      <Box sx={{ px: 3, py: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2}>
          <Box>
            <Typography sx={{ fontWeight: 700, color: "#DC2626", fontSize: 15, mb: 0.25 }}>
              Delete account
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
              Permanently remove your account and all associated data. This action cannot be undone.
            </Typography>
          </Box>
          {!open && (
            <Button
              variant="outlined"
              onClick={() => setOpen(true)}
              sx={{
                borderColor: "rgba(220,38,38,0.4)",
                color: "#DC2626",
                textTransform: "none",
                borderRadius: "20px",
                fontWeight: 700,
                fontSize: 13,
                px: 2.5,
                whiteSpace: "nowrap",
                flexShrink: 0,
                "&:hover": { borderColor: "#DC2626", background: "rgba(220,38,38,0.05)" },
              }}
            >
              Delete my account
            </Button>
          )}
        </Stack>
      </Box>

      {/* Confirmation form */}
      {open && (
        <>
          <Divider sx={{ borderColor: "rgba(220,38,38,0.15)" }} />
          <Box sx={{ px: 3, py: 2.5, background: "rgba(220,38,38,0.02)" }}>
            <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 2 }}>
              Type{" "}
              <Box component="span" sx={{ fontFamily: "monospace", fontWeight: 700, color: "#DC2626" }}>
                {CONFIRM_TEXT}
              </Box>{" "}
              and enter your password to confirm.
            </Typography>

            <Stack spacing={1.5} sx={{ maxWidth: 440 }}>
              <TextField
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE"
                size="small"
                fullWidth
                autoComplete="off"
                inputProps={{ "aria-label": "Type DELETE to confirm account deletion" }}
                sx={{
                  "& input": { fontFamily: "monospace" },
                  "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: "#DC2626" },
                }}
              />
              <TextField
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                type="password"
                placeholder="Your password"
                size="small"
                fullWidth
                autoComplete="current-password"
                inputProps={{ "aria-label": "Password to confirm account deletion" }}
                sx={{ "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: "#DC2626" } }}
              />

              {error && (
                <Typography sx={{ fontSize: 13, color: "#DC2626" }}>{error}</Typography>
              )}

              <Stack direction="row" spacing={1.5} pt={0.5}>
                <Button
                  variant="outlined"
                  onClick={closeAndReset}
                  disabled={isDeleting}
                  sx={{
                    borderColor: (t) => t.palette.divider,
                    color: "text.primary",
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: "20px",
                    fontSize: 13,
                    "&:hover": { borderColor: "text.disabled", bgcolor: "action.hover" },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  disableElevation
                  disabled={!isConfirmValid || isDeleting}
                  onClick={handleDeleteAccount}
                  sx={{
                    background: "#DC2626",
                    textTransform: "none",
                    borderRadius: "20px",
                    fontWeight: 700,
                    fontSize: 13,
                    "&:hover": { background: "#B91C1C" },
                    "&.Mui-disabled": { background: "rgba(220,38,38,0.3)", color: "rgba(255,255,255,0.7)" },
                  }}
                >
                  {isDeleting ? "Deleting..." : "Delete account"}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </>
      )}
    </Box>
  );
}

type ChangePasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export default function AccountPage() {
  const [form, setForm] = useState<ChangePasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof ChangePasswordForm, string>> & { general?: string }
  >({});

  const [success, setSuccess] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // Auto-hides the success alert after 3 seconds
  useEffect(() => {
    if (!showSuccess) return;
    const timer = setTimeout(() => setShowSuccess(false), 3000);
    return () => clearTimeout(timer);
  }, [showSuccess]);

  // Updates the typed field in the form, clears its error, and hides any success message
  const updateField = <K extends keyof ChangePasswordForm>(key: K, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.general;
      // clear the error for the field the user is currently editing
      delete next[key];
      return next;
    });
    if (showSuccess) setShowSuccess(false);
    if (success) setSuccess(null);
  };

  const handleChangePassword = async () => {
    setErrors({});
    setShowSuccess(false);
    setSuccess(null);

    // Validates against the schema before hitting the API
    try {
      changePasswordSchema.parse(form);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: typeof errors = {};
        err.issues.forEach((issue) => {
          const key = issue.path?.[0] as keyof ChangePasswordForm | undefined;
          if (key) fieldErrors[key] = issue.message;
        });
        setErrors(fieldErrors);
        return;
      }
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setErrors({ general: "You're not logged in. Please log in again." });
      return;
    }

    setSaving(true);
    try {
      await api.patch(
        "/api/v1/users/me/password",
        { currentPassword: form.currentPassword, newPassword: form.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Your password has been updated successfully.");
      setShowSuccess(true);
      setForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (error: any) {
      const backendMsg =
        error?.response?.data?.message ??
        error?.response?.data?.error ??
        "Failed to change password. Please try again.";
      setErrors({ general: backendMsg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 640 }}>
      {/* Page header */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: { xs: 28, sm: 30 }, fontWeight: 900, color: "text.primary", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
          Account
        </Typography>
        <Typography sx={{ color: "text.secondary", mt: 1, fontSize: 16, lineHeight: 1.6 }}>
          Manage your password and account settings.
        </Typography>
      </Box>

      <Stack spacing={2.5}>
        {/* ── Change password ── */}
        <Box
          sx={{
            border: (t) => `1px solid ${t.palette.divider}`,
            borderRadius: 2,
            bgcolor: "background.paper",
            overflow: "hidden",
          }}
        >
          {/* Section header */}
          <Box sx={{ px: 3, py: 2.5 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: "text.primary" }}>
              Change password
            </Typography>
            <Typography sx={{ fontSize: 14, color: "text.secondary", mt: 0.5, lineHeight: 1.5 }}>
              Choose a strong password you don't use anywhere else.
            </Typography>
          </Box>

          <Divider />

          {/* Form content */}
          <Box
            component="form"
            onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }}
            sx={{ px: 3, pt: 2, pb: 3, bgcolor: (t) => t.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "#FAFBFC" }}
          >
            <Stack spacing={1.5}>
              {errors.general && (
                <Alert
                  severity="error"
                  sx={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#7F1D1D", fontSize: 13 }}
                >
                  {errors.general}
                </Alert>
              )}

              <Fade in={showSuccess} timeout={300} onExited={() => setSuccess(null)}>
                <Box>
                  {success && (
                    <Alert
                      severity="success"
                      sx={{ background: "#ECFDF5", border: "1px solid #6EE7B7", color: "#065F46", fontSize: 13 }}
                    >
                      {success}
                    </Alert>
                  )}
                </Box>
              </Fade>

              <Box>
                {fieldLabel("Current password")}
                <TextField
                  value={form.currentPassword}
                  onChange={(e) => updateField("currentPassword", e.target.value)}
                  type="password"
                  placeholder="Enter current password"
                  size="small"
                  fullWidth
                  error={!!errors.currentPassword}
                  helperText={errors.currentPassword}
                  sx={textFieldSx}
                  inputProps={{ "aria-label": "Current password" }}
                />
              </Box>

              <Box>
                {fieldLabel("New password")}
                {/* Password requirements, only shown while the user is typing */}
                <PasswordChecklist password={form.newPassword} />
                <TextField
                  value={form.newPassword}
                  onChange={(e) => updateField("newPassword", e.target.value)}
                  type="password"
                  placeholder="Enter new password"
                  size="small"
                  fullWidth
                  error={!!errors.newPassword}
                  helperText={errors.newPassword}
                  sx={textFieldSx}
                  inputProps={{ "aria-label": "New password" }}
                />
              </Box>

              <Box>
                {fieldLabel("Confirm new password")}
                <TextField
                  value={form.confirmNewPassword}
                  onChange={(e) => updateField("confirmNewPassword", e.target.value)}
                  type="password"
                  placeholder="Confirm new password"
                  size="small"
                  fullWidth
                  error={!!errors.confirmNewPassword}
                  helperText={errors.confirmNewPassword}
                  sx={textFieldSx}
                  inputProps={{ "aria-label": "Confirm new password" }}
                />
              </Box>

              <Box pt={0.5}>
                <Button
                  type="submit"
                  disableElevation
                  disabled={saving}
                  sx={{
                    backgroundColor: darkRed,
                    color: "#fff",
                    textTransform: "none",
                    borderRadius: "20px",
                    py: 1,
                    px: 3,
                    fontWeight: 600,
                    fontSize: 14,
                    "&:hover": { backgroundColor: "#5E0808" },
                    "&:focus-visible": {
                      outline: "none",
                      boxShadow: "0 0 0 2px rgba(122,10,10,0.35), 0 0 0 4px white",
                    },
                  }}
                >
                  {saving ? "Saving..." : "Update password"}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Box>

        {/* ── Danger zone ── */}
        <Box
          sx={{
            border: (t) => `1px solid ${t.palette.divider}`,
            borderRadius: 2,
            bgcolor: "background.paper",
            overflow: "hidden",
          }}
        >
          {/* Section header */}
          <Box sx={{ px: 3, py: 2.5 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: "text.primary" }}>
              Danger zone
            </Typography>
            <Typography sx={{ fontSize: 14, color: "text.secondary", mt: 0.5, lineHeight: 1.5 }}>
              Irreversible actions for your account.
            </Typography>
          </Box>

          <Divider />

          <Box sx={{ px: 3, py: 3, bgcolor: (t) => t.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "#FAFBFC" }}>
            <DeleteAccountSection />
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}