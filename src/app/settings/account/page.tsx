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
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const red = "#B11226";
const darkRed = "#7A0A0A";

const outlineNeutralSx = {
  borderColor: "#D1D5DB",
  color: "#111827",
  textTransform: "none",
  fontWeight: 600,
  borderRadius: 2,
  "&:hover": {
    borderColor: "#9CA3AF",
    background: "#F9FAFB",
  },
};

const textFieldSx = {
  "& .MuiFormHelperText-root": {
    marginLeft: 0,
    marginRight: 0,
  },
};

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        background: "#ffffff",
        border: "1px solid #EEF1F5",
        borderRadius: 2,
        p: 3,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" mb={2}>
        <Box sx={{ color: red, display: "flex", alignItems: "center" }}>
          {icon}
        </Box>
        <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>
          {title}
        </Typography>
      </Stack>
      {children}
    </Box>
  );
}

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
      setError(
        err?.response?.data?.message || "Failed to delete account. Please try again."
      );
      setIsDeleting(false);
    }
  };

  return (
    <Box sx={{ borderTop: "1px solid #E5E7EB", pt: 0.5 }}>
      <Box
        sx={{
          mt: 1.5,
          background: "#fff",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                <DeleteOutlineIcon sx={{ color: "#DC2626" }} />
                <Typography sx={{ fontWeight: 900, color: "#DC2626", fontSize: 16 }}>
                  Delete account
                </Typography>
              </Stack>
              <Typography sx={{ color: "#6B7280", fontSize: 14, mt: 1 }}>
                Permanently remove your account and all associated data.
              </Typography>
            </Box>

            {!open && (
              <Button
                variant="outlined"
                onClick={() => setOpen(true)}
                sx={{
                  borderColor: "rgba(220,38,38,0.45)",
                  color: "#DC2626",
                  textTransform: "none",
                  borderRadius: 2,
                  fontWeight: 800,
                  px: 2.5,
                  whiteSpace: "nowrap",
                  "&:hover": {
                    borderColor: "#DC2626",
                    background: "rgba(220,38,38,0.06)",
                  },
                }}
              >
                Delete my account
              </Button>
            )}
          </Stack>

          {open && (
            <Box
              sx={{
                mt: 2,
                background: "rgba(220,38,38,0.04)",
                border: "1px solid rgba(220,38,38,0.20)",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <Box sx={{ p: 3, borderBottom: "1px solid rgba(220,38,38,0.18)" }}>
                <Typography sx={{ fontWeight: 900, color: "#DC2626", fontSize: 15, mb: 0.75 }}>
                  Confirm deletion
                </Typography>
                <Typography sx={{ color: "#6B7280", fontSize: 14 }}>
                  To confirm, type{" "}
                  <Box component="span" sx={{ fontFamily: "monospace" }}>
                    {CONFIRM_TEXT}
                  </Box>{" "}
                  in exactly all caps and enter your password. This cannot be undone.
                </Typography>
              </Box>

              <Box sx={{ p: 3 }}>
                <Stack spacing={2} sx={{ maxWidth: 520 }}>
                  <TextField
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Type DELETE"
                    size="small"
                    fullWidth
                    autoComplete="off"
                    sx={{
                      ...textFieldSx,
                      "& input": { fontFamily: "monospace" },
                      "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                        borderColor: "#DC2626",
                      },
                    }}
                  />

                  <TextField
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    type="password"
                    placeholder="Enter your password to confirm"
                    size="small"
                    fullWidth
                    autoComplete="current-password"
                    sx={{
                      ...textFieldSx,
                      "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                        borderColor: "#DC2626",
                      },
                    }}
                  />

                  {error && (
                    <Typography sx={{ fontSize: 13, color: "#DC2626" }}>
                      {error}
                    </Typography>
                  )}

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={outlineNeutralSx}
                      onClick={closeAndReset}
                      disabled={isDeleting}
                    >
                      Cancel
                    </Button>

                    <Button
                      variant="contained"
                      fullWidth
                      disableElevation
                      disabled={!isConfirmValid || isDeleting}
                      onClick={handleDeleteAccount}
                      sx={{
                        background: "#DC2626",
                        textTransform: "none",
                        borderRadius: 2,
                        fontWeight: 900,
                        "&:hover": { background: "#B91C1C" },
                        "&.Mui-disabled": {
                          background: "rgba(220,38,38,0.35)",
                          color: "rgba(255,255,255,0.85)",
                        },
                      }}
                    >
                      {isDeleting ? "Deleting..." : "Delete Account"}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
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
    const timer = setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [showSuccess]);

  // Updates the typed field in the form, clears its error, and hides any success message
  const updateField = <K extends keyof ChangePasswordForm>(key: K, value: string) => {
    // keep all existing field values, only update the one that changed
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
        {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 26, fontWeight: 900, color: "#111827" }}>
          Account Management
        </Typography>
        <Typography sx={{ color: "#6B7280", mt: 0.5, fontSize: 16 }}>
          Manage your password and account options
        </Typography>
      </Box>

      <Stack spacing={3} sx={{ maxWidth: 820 }}>
        <SectionCard icon={<LockOutlinedIcon />} title="Password">
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleChangePassword();
            }}
          >
            <Stack spacing={2}>
              {errors.general && (
                <Alert
                  severity="error"
                  sx={{
                    background: "#FEF2F2",
                    border: "1px solid #FCA5A5",
                    color: "#7F1D1D",
                  }}
                >
                  {errors.general}
                </Alert>
              )}

              <Fade in={showSuccess} timeout={300} onExited={() => setSuccess(null)}>
                <Box>
                  {success && (
                    <Alert
                      severity="success"
                      sx={{
                        background: "#ECFDF5",
                        border: "1px solid #6EE7B7",
                        color: "#065F46",
                      }}
                    >
                      {success}
                    </Alert>
                  )}
                </Box>
              </Fade>

              <Box>
                <Typography sx={{ fontSize: 13, color: "#6B7280", mb: 0.5 }}>
                  Current Password
                </Typography>
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
                />
              </Box>

              <Box>
                <Typography sx={{ fontSize: 13, color: "#6B7280", mb: 0.5 }}>
                  New Password
                </Typography>
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
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: 13, color: "#6B7280", mb: 0.5 }}>
                  Confirm New Password
                </Typography>
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
                />
              </Box>

              <Box sx={{ display: "flex", justifyContent: "left", pt: 1.3 }}>
                <Button
                  type="submit"
                  disableElevation
                  disabled={saving}
                  sx={{
                    backgroundColor: darkRed,
                    color: "#fff",
                    textTransform: "none",
                    borderRadius: "60px",
                    py: 1,
                    px: 2.25,
                    fontWeight: 600,
                    transition: "all 0.2s",
                    "&:hover": { backgroundColor: "#5E0808" },
                    "&:focus-visible": {
                      outline: "none",
                      boxShadow: "0 0 0 2px rgba(122,10,10,0.35), 0 0 0 4px white",
                    },
                  }}
                >
                  {saving ? "Saving..." : "Change Password"}
                </Button>
              </Box>
            </Stack>
          </Box>
        </SectionCard>

        <DeleteAccountSection />
      </Stack>
    </Box>
  );
}