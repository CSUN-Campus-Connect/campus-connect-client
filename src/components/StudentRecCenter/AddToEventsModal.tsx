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
  Fade,
  Backdrop,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { motion, AnimatePresence } from "framer-motion";

const SRC_RED = "#A80532";

interface AddToEventsModalProps {
  open: boolean;
  onClose: () => void;
  programTitle: string;
  /** Called with the user's @my.csun.edu email after confirm */
  onConfirm: (email: string) => Promise<void>;
}

export default function AddToEventsModal({
  open,
  onClose,
  programTitle,
  onConfirm,
}: AddToEventsModalProps) {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const reset = () => {
    setEmail("");
    setError("");
    setLoading(false);
    setSuccess(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const validate = (val: string) => {
    if (!val) return "Email is required.";
    if (!val.endsWith("@my.csun.edu"))
      return "Must use your @my.csun.edu email.";
    return "";
  };

  const handleSubmit = async () => {
    const err = validate(email);
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      await onConfirm(email);
      setSuccess(true);
      setTimeout(() => { handleClose(); }, 2200);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
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
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(216, 113, 17, 0.1)",
          overflow: "hidden",
          position: "relative",
        },
      }}
    >
      {/* Top accent bar */}
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
                      <EventAvailableIcon sx={{ fontSize: 22 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", mb: 0.3 }}>
                        Add to Events
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

                {/* Email field */}
                <Typography sx={{ color: "rgb(255, 255, 255)", fontSize: "0.78rem", fontWeight: 600, mb: 1, letterSpacing: 0.4 }}>
                  Your CSUN Email
                </Typography>
                <TextField
                  fullWidth
                  placeholder="yourid@my.csun.edu"
                  inputProps={{ "aria-label": "Your CSUN email address" }}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  error={!!error}
                  helperText={error}
                  variant="outlined"
                  size="small"
                  sx={{
                    mb: 3,
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
                  }}
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
                  <Button 
                    onClick={handleSubmit} //backend todo: replace with actual loading state
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
                    {loading ? "Adding…" : "Add to My Events"}
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
                  Added to Your Events!
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: "0.82rem", lineHeight: 1.5 }}>
                  <strong style={{ color: "rgba(255,255,255,0.8)" }}>{programTitle}</strong> has been added to your calendar. Check your CSUN email for confirmation.
                </Typography>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
