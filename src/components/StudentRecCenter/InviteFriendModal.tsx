"use client";

import * as React from "react";
import {
  Box,
  Dialog,
  DialogContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Backdrop,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { motion, AnimatePresence } from "framer-motion";

const SRC_RED = "#A80532";

interface InviteFriendModalProps {
  open: boolean;
  onClose: () => void;
  programTitle: string;
  /** Called with (senderEmail, friendEmail) after confirm */
  onConfirm: (senderEmail: string, friendEmail: string) => Promise<void>;
}

export default function InviteFriendModal({
  open,
  onClose,
  programTitle,
  onConfirm,
}: InviteFriendModalProps) {
  const [senderEmail, setSenderEmail] = React.useState("");
  const [friendEmail, setFriendEmail] = React.useState("");
  const [errors, setErrors] = React.useState<{ sender?: string; friend?: string }>({});
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const reset = () => {
    setSenderEmail("");
    setFriendEmail("");
    setErrors({});
    setLoading(false);
    setSuccess(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const validate = () => {
    const e: { sender?: string; friend?: string } = {};
    if (!senderEmail) e.sender = "Your email is required.";
    else if (!senderEmail.endsWith("@my.csun.edu")) e.sender = "Must use your @my.csun.edu email.";
    if (!friendEmail) e.friend = "Friend's email is required.";
    else if (!friendEmail.endsWith("@my.csun.edu")) e.friend = "Must be a @my.csun.edu address.";
    else if (friendEmail === senderEmail) e.friend = "Can't invite yourself!";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      await onConfirm(senderEmail, friendEmail);
      setSuccess(true);
      setTimeout(() => { handleClose(); }, 2400);
    } catch {
      setErrors({ friend: "Something went wrong. Please try again." });
      setLoading(false);
    }
  };

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      bgcolor: "rgba(255,255,255,0.05)",
      color: "#fff",
      fontSize: "0.9rem",
      "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
      "&.Mui-focused fieldset": { borderColor: SRC_RED },
    },
    "& .MuiFormHelperText-root": {
      color: "#ff6b8a",
      fontWeight: 600,
      fontSize: "0.72rem",
    },
    "& input::placeholder": { color: "rgba(255,255,255,0.28)", opacity: 1 },
  };

  return (
    <Dialog
      open={open}
      onClose={!loading ? handleClose : undefined}
      maxWidth="xs"
      fullWidth
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { style: { backdropFilter: "blur(8px)", background: "rgba(0,0,0,0.65)" } } }}
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: "linear-gradient(135deg, rgba(180, 52, 97, 0.97) 0%, rgba(240, 44, 44, 0.97) 100%)",
          border: "1.5px solid rgba(168,5,50,0.35)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(168,5,50,0.1)",
          overflow: "hidden",
        },
      }}
    >
      {/* Accent bar */}
      <Box sx={{ height: 3, background: `linear-gradient(90deg, ${SRC_RED}, #ff4d7a, ${SRC_RED})` }} />

      <DialogContent sx={{ p: 0 }}>
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <Box sx={{ p: { xs: 3, sm: 4 } }}>
                {/* Header */}
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 42, height: 42, borderRadius: 2.5,
                        bgcolor: "rgba(168,5,50,0.2)",
                        border: "1px solid rgba(168,5,50,0.45)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#ff6b8a",
                      }}
                    >
                      <PersonAddIcon sx={{ fontSize: 22 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", mb: 0.3 }}>
                        Invite a Friend
                      </Typography>
                      <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: "1.05rem", lineHeight: 1.15 }}>
                        {programTitle}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton
                    onClick={handleClose}
                    size="small"
                    disabled={loading}
                    aria-label="Close"
                    sx={{ color: "rgba(255,255,255,0.35)", "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.08)" } }}
                  >
                    <CloseIcon fontSize="small" aria-hidden="true" />
                  </IconButton>
                </Box>

                {/* Divider label */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
                  <Box sx={{ flex: 1, height: "1px", bgcolor: "rgba(255,255,255,0.08)" }} />
                  <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
                    From You
                  </Typography>
                  <Box sx={{ flex: 1, height: "1px", bgcolor: "rgba(255,255,255,0.08)" }} />
                </Box>

                {/* Sender email */}
                <Typography sx={{ color: "rgb(255, 255, 255)", fontSize: "0.78rem", fontWeight: 600, mb: 1, letterSpacing: 0.4 }}>
                  Your CSUN Email
                </Typography>
                <TextField
                  fullWidth
                  placeholder="yourid@my.csun.edu"
                  inputProps={{ "aria-label": "Your CSUN email address" }}
                  value={senderEmail}
                  onChange={(e) => { setSenderEmail(e.target.value); setErrors((prev) => ({ ...prev, sender: undefined })); }}
                  error={!!errors.sender}
                  helperText={errors.sender}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 3, ...fieldSx }}
                />

                {/* Divider label */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
                  <Box sx={{ flex: 1, height: "1px", bgcolor: "rgba(255,255,255,0.08)" }} />
                  <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
                    To Your Friend
                  </Typography>
                  <Box sx={{ flex: 1, height: "1px", bgcolor: "rgba(255,255,255,0.08)" }} />
                </Box>

                {/* Friend email */}
                <Typography sx={{ color: "rgb(255, 255, 255)", fontSize: "0.78rem", fontWeight: 600, mb: 1, letterSpacing: 0.4 }}>
                  Friend's CSUN Email
                </Typography>
                <TextField
                  fullWidth
                  placeholder="friendid@my.csun.edu"
                  inputProps={{ "aria-label": "Friend's CSUN email address" }}
                  value={friendEmail}
                  onChange={(e) => { setFriendEmail(e.target.value); setErrors((prev) => ({ ...prev, friend: undefined })); }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  error={!!errors.friend}
                  helperText={errors.friend}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 3, ...fieldSx }}
                />

                {/* Actions */}
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Button
                    onClick={handleClose}
                    disabled={loading}
                    fullWidth
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      borderColor: "rgba(224, 220, 220, 0.61)",
                      color: "rgba(255, 255, 255, 0.91)",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      py: 1.2,
                      "&:hover": { borderColor: "rgb(255, 255, 255)", bgcolor: "rgba(190, 15, 15, 0.84)" },
                    }}
                  >
                    Cancel
                  </Button>
                  <Button // Backend todo: replace with actual loading state
                    onClick={handleSubmit}
                    disabled={loading}
                    fullWidth
                    variant="contained"
                    sx={{
                      borderRadius: 2,
                      fontWeight: 800,
                      fontSize: "0.82rem",
                      py: 1.2,
                      background: `linear-gradient(135deg, ${SRC_RED} 0%, #cc0640 100%)`,
                      boxShadow: "0 4px 20px rgba(168,5,50,0.45)",
                      "&:hover": { background: `linear-gradient(135deg, #c0062a 0%, #e0073f 100%)` },
                      "&:disabled": { opacity: 0.5 },
                    }}
                  >
                    {loading ? "Sending…" : "Send Invite"}
                  </Button>
                </Box>
              </Box>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
            >
              <Box
                sx={{
                  p: 5,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                  textAlign: "center",
                }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
                >
                  <CheckCircleOutlineIcon sx={{ fontSize: 64, color: "#4ade80" }} />
                </motion.div>
                <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: "1.15rem" }}>
                  Invite Sent!
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: "0.82rem", lineHeight: 1.6 }}>
                  Your friend at{" "}
                  <strong style={{ color: "rgba(255,255,255,0.85)" }}>{friendEmail}</strong>{" "}
                  has been invited to{" "}
                  <strong style={{ color: "rgba(255,255,255,0.85)" }}>{programTitle}</strong>.
                </Typography>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
