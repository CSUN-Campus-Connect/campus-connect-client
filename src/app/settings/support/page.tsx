"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import CloseIcon from "@mui/icons-material/Close";

import { api } from "../../../lib/axios";

const red = "#B11226";
const border = "#E5E7EB";
const subtleBorder = "#F3F4F6";
const primaryText = "#111827";
const secondaryText = "#6B7280";

type BugFormData = {
  title: string;
  category: string;
  severity: string;
  description: string;
  steps: string;
  browser: string;
};

type BugFormErrors = {
  title?: string;
  category?: string;
  severity?: string;
  description?: string;
};

const initialFormData: BugFormData = {
  title: "",
  category: "",
  severity: "",
  description: "",
  steps: "",
  browser: "",
};

const initialErrors: BugFormErrors = {};

function RequiredLabel({
  label,
  required = false,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <Box component="span">
      {label}
      {required && (
        <Box
          component="span"
          sx={{
            color: red,
            ml: 0.5,
            fontWeight: 700,
          }}
        >
          *
        </Box>
      )}
    </Box>
  );
}

function ActionRow({
  title,
  description,
  isOpen,
  onToggle,
  external,
  onExternalClick,
  children,
  isLast,
}: {
  title: string;
  description: string;
  isOpen?: boolean;
  onToggle?: () => void;
  external?: boolean;
  onExternalClick?: () => void;
  children?: React.ReactNode;
  isLast?: boolean;
}) {
  const handleClick = () => {
    if (external && onExternalClick) {
      onExternalClick();
    } else if (onToggle) {
      onToggle();
    }
  };

  return (
    <Box>
      <Box
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2.5,
          py: 2.5,
          cursor: "pointer",
          transition: "background-color 0.15s ease",
          "&:hover": { backgroundColor: "#F6F7F9" },
          "&:focus-visible": {
            outline: "2px solid #E5E7EB",
            outlineOffset: "-2px",
          },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, color: primaryText }}>
            {title}
          </Typography>

          <Typography sx={{ fontSize: 14, color: secondaryText, mt: 0.5 }}>
            {description}
          </Typography>
        </Box>

        {external ? (
          <OpenInNewIcon sx={{ color: "#9CA3AF" }} />
        ) : (
          <ExpandMoreIcon
            sx={{
              color: "#9CA3AF",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          />
        )}
      </Box>

      {!external && isOpen && (
        <Box
          sx={{
            px: 2.5,
            pb: 2.5,
            pt: 2,
            borderTop: `1px solid ${subtleBorder}`,
            background: "#FAFAFA",
          }}
        >
          {children}
        </Box>
      )}

      {!isLast && <Divider sx={{ borderColor: subtleBorder }} />}
    </Box>
  );
}

export default function HelpSupportPage() {
  const [helpOpen, setHelpOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState<BugFormData>(initialFormData);
  const [errors, setErrors] = useState<BugFormErrors>(initialErrors);
  const [submitErrorOpen, setSubmitErrorOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof BugFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field in errors) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);

    // TODO: Align these client-side file checks with the final backend upload rules.
    // Current UI assumptions: max 10MB per file, image/* and .pdf accepted.
    const validFiles = newFiles.filter((file) => file.size <= 10 * 1024 * 1024);

    setFiles((prev) => [...prev, ...validFiles]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearBugForm = () => {
    setFormData(initialFormData);
    setFiles([]);
    setErrors(initialErrors);
  };

  const validateBugForm = () => {
    const newErrors: BugFormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Field required";
    }

    if (!formData.category.trim()) {
      newErrors.category = "Field required";
    }

    if (!formData.severity.trim()) {
      newErrors.severity = "Field required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Field required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBugSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validateBugForm();
    if (!isValid) return;

    try {
      setIsSubmitting(true);

      const token = localStorage.getItem("token");

      await api.post(
        "/api/v1/settings/bug-report",
        {
          title: formData.title,
          category: formData.category,
          severity: formData.severity,
          description: formData.description,
          steps: formData.steps || undefined,
          browser: formData.browser || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

setReportSubmitted(true);
    } catch (error) {
      console.error("Failed to submit bug report", error);
      setSubmitErrorOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleReport = () => {
    if (reportOpen) {
      setReportOpen(false);
      return;
    }
    // Reset the success state when reopening so the user sees a fresh form.
    if (reportSubmitted) {
      setReportSubmitted(false);
      clearBugForm();
    }

    setReportOpen(true);
  };

  return (
    <>
      <Box
        sx={{
          minHeight: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box>
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontSize: 26, fontWeight: 900, color: primaryText }}>
              Help & Support
            </Typography>

            <Typography sx={{ color: secondaryText, mt: 0.5 }}>
              Get help, find answers, or contact support
            </Typography>
          </Box>

          <Stack spacing={1} sx={{ maxWidth: 760 }}>
            <Box
              sx={{
                background: "#fff",
                border: `1px solid ${border}`,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <ActionRow
                title="Help Center"
                description="Browse FAQs and common solutions"
                isOpen={helpOpen}
                onToggle={() => setHelpOpen((prev) => !prev)}
              >
                {/* TODO: Replace this placeholder with the final help-center content or link. */}
                <Typography sx={{ fontSize: 14, color: secondaryText }}>
                  FAQ drop down (or link)
                </Typography>
              </ActionRow>

              <ActionRow
                title="Report a Problem"
                description="Let us know what went wrong"
                isOpen={reportOpen}
                onToggle={handleToggleReport}
              >
                {reportSubmitted ? (
                  <Box
                    sx={{
                      border: "1px solid #BBF7D0",
                      backgroundColor: "#F0FDF4",
                      borderRadius: 2,
                      p: 3,
                    }}
                  >
                    <Box sx={{ textAlign: "center", py: 2 }}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: "50%",
                          backgroundColor: "#DCFCE7",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mx: "auto",
                          mb: 2,
                        }}
                      >
                        <BugReportOutlinedIcon sx={{ color: "#16A34A", fontSize: 28 }} />
                      </Box>

                      <Typography
                        sx={{
                          fontSize: 20,
                          fontWeight: 800,
                          color: primaryText,
                          mb: 1,
                        }}
                      >
                        Bug Report Submitted
                      </Typography>

                      <Typography sx={{ color: secondaryText, fontSize: 14 }}>
                        Thank you for helping us improve CampusConnect.
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    component="form"
                    onSubmit={handleBugSubmit}
                    sx={{
                      background: "#FFFFFF",
                      border: `1px solid ${border}`,
                      borderRadius: 2,
                      p: { xs: 2, sm: 3 },

                      "& .MuiFormHelperText-root": {
                        marginLeft: 0,
                        marginRight: 0,
                      },
                    }}
                  >
                    <Stack spacing={3}>
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            backgroundColor: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <BugReportOutlinedIcon sx={{ color: "#9CA3AF" }} />
                        </Box>

                        <Box>
                          <Typography
                            sx={{
                              fontSize: 18,
                              fontWeight: 800,
                              color: primaryText,
                              lineHeight: 1.25,
                            }}
                          >
                            Report a Bug
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: 14,
                              color: secondaryText,
                              mt: 0.5,
                              lineHeight: 1.5,
                            }}
                          >
                            Found something not working right? Let us know so we can
                            fix it.
                          </Typography>
                        </Box>
                      </Box>

                      <TextField
                        label={<RequiredLabel label="Bug Title" required />}
                        placeholder="e.g., Can't send messages to study group members"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        error={!!errors.title}
                        helperText={errors.title}
                        fullWidth
                      />

                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                          gap: 2,
                        }}
                      >
                        <TextField
                          select
                          label={<RequiredLabel label="Feature Affected" required />}
                          value={formData.category}
                          onChange={(e) => handleInputChange("category", e.target.value)}
                          error={!!errors.category}
                          helperText={errors.category}
                          fullWidth
                        >
                    
                          <MenuItem value="profile">Student Profile</MenuItem>
                          <MenuItem value="messaging">Messaging & Chat</MenuItem>
                          <MenuItem value="events">Events & Calendar</MenuItem>
                          <MenuItem value="groups">Study Groups & Clubs</MenuItem>
                          <MenuItem value="search">Search & Discovery</MenuItem>
                          <MenuItem value="notifications">Notifications</MenuItem>
                          <MenuItem value="connections">Friend Connections</MenuItem>
                          <MenuItem value="resources">Resources & Files</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </TextField>

                        <TextField
                          select
                          label={<RequiredLabel label="How bad is it?" required />}
                          value={formData.severity}
                          onChange={(e) => handleInputChange("severity", e.target.value)}
                          error={!!errors.severity}
                          helperText={errors.severity}
                          fullWidth
                        >
                        
                          <MenuItem value="critical">
                            Critical - Can't use the site
                          </MenuItem>
                          <MenuItem value="high">
                            High - Important feature broken
                          </MenuItem>
                          <MenuItem value="medium">
                            Medium - Annoying but manageable
                          </MenuItem>
                          <MenuItem value="low">
                            Low - Small visual or text issue
                          </MenuItem>
                        </TextField>
                      </Box>

                      <TextField
                        label={<RequiredLabel label="What happened?" required />}
                        placeholder="Describe what went wrong and when you first noticed it"
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        error={!!errors.description}
                        helperText={errors.description}
                        multiline
                        rows={4}
                        fullWidth
                      />

                      <Box>
                        <TextField
                          label="How can we recreate this bug?"
                          placeholder={
                            "1. Go to my profile page\n2. Click Edit\n3. Try to save\n4. Error appears"
                          }
                          value={formData.steps}
                          onChange={(e) => handleInputChange("steps", e.target.value)}
                          multiline
                          rows={4}
                          fullWidth
                        />
                        <Typography
                          sx={{ fontSize: 12, color: secondaryText, mt: 1 }}
                        >
                          Step-by-step instructions help fix the issue faster.
                        </Typography>
                      </Box>

                      <TextField
                        label="Device & Browser"
                        placeholder="e.g., iPhone Safari, Chrome on Windows"
                        value={formData.browser}
                        onChange={(e) => handleInputChange("browser", e.target.value)}
                        fullWidth
                      />

                      <Box>
                        <Typography
                          sx={{ fontWeight: 700, color: primaryText, mb: 1 }}
                        >
                          Screenshots (Optional but helpful)
                        </Typography>

                        <Box
                          sx={{
                            border: `2px dashed ${border}`,
                            borderRadius: 2,
                            p: 3,
                            textAlign: "center",
                            "&:hover": {
                              borderColor: "#9CA3AF",
                            },
                          }}
                        >
                          <input
                            type="file"
                            id="attachments"
                            multiple
                            hidden
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                          />

                          <label
                            htmlFor="attachments"
                            style={{ cursor: "pointer", display: "block" }}
                          >
                            <UploadFileOutlinedIcon
                              sx={{ fontSize: 34, color: "#9CA3AF", mb: 1 }}
                            />
                            <Typography
                              sx={{
                                fontSize: 14,
                                color: primaryText,
                                fontWeight: 600,
                              }}
                            >
                              Upload screenshots of the issue
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: 12,
                                color: secondaryText,
                                mt: 0.5,
                              }}
                            >
                              PNG, JPG, or PDF (max 10MB each)
                            </Typography>
                          </label>
                        </Box>

                        {files.length > 0 && (
                          <Stack spacing={1.25} sx={{ mt: 2 }}>
                            {files.map((file, index) => (
                              <Box
                                key={`${file.name}-${index}`}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: 1,
                                  px: 1.5,
                                  py: 1,
                                  borderRadius: 2,
                                  backgroundColor: "#F9FAFB",
                                  border: `1px solid ${subtleBorder}`,
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: 14,
                                    color: primaryText,
                                    minWidth: 0,
                                    flex: 1,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {file.name}
                                </Typography>

                                <IconButton
                                  size="small"
                                  onClick={() => removeFile(index)}
                                  aria-label={`Remove ${file.name}`}
                                >
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            ))}
                          </Stack>
                        )}
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 1.5,
                          pt: 1,
                          flexDirection: { xs: "column", sm: "row" },
                        }}
                      >
                        <Button
                          type="button"
                          variant="outlined"
                          onClick={clearBugForm}
                          disabled={isSubmitting}
                          sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            borderRadius: 2,
                            borderColor: border,
                            color: primaryText,
                            "&:hover": {
                              borderColor: "#D1D5DB",
                              backgroundColor: "#F9FAFB",
                            },
                          }}
                        >
                          Clear Form
                        </Button>

                        <Button
                          type="submit"
                          variant="contained"
                          disabled={isSubmitting}
                          sx={{
                            textTransform: "none",
                            fontWeight: 700,
                            borderRadius: 2,
                            py: 1.15,
                            px: 2.5,
                            backgroundColor: red,
                            "&:hover": {
                              backgroundColor: "#970F20",
                            },
                          }}
                        >
                          {isSubmitting ? "Submitting..." : "Submit Bug Report"}
                        </Button>
                      </Box>
                    </Stack>
                  </Box>
                )}
              </ActionRow>

              <ActionRow
                title="Terms of Service"
                description="Read our terms and policies"
                external
                isLast
                onExternalClick={() => {
                  
                  window.open("/terms", "_blank");
                }}
              />
            </Box>
          </Stack>
        </Box>

        <Box sx={{ mt: "auto", pt: 6 }}>
          <Divider sx={{ mb: 3, borderColor: "#EEF1F5" }} />

          <Box sx={{ textAlign: "center", color: secondaryText }}>
           
            {} 
            <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
              App Version 1.1.1
            </Typography>

            <Typography sx={{ fontSize: 12, mt: 0.5, color: "#9CA3AF" }}>
              © 2025 CampusConnect. All rights reserved.
            </Typography>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={submitErrorOpen}
        autoHideDuration={4000}
        onClose={() => setSubmitErrorOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSubmitErrorOpen(false)}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          We couldn’t submit your bug report.
        </Alert>
      </Snackbar>
    </>
  );
}