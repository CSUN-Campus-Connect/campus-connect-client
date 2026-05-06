"use client";

// Shown when the server invalidates the current session (e.g. signed out from another device).
// Clears auth tokens, then redirects to /login after a short delay.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { useSessionExpired } from "@/contexts/SessionExpiredContext";

export function SessionExpiredDialog() {
  const { show, reset } = useSessionExpired();
  const router = useRouter();

  useEffect(() => {
    if (!show) return;

    // Clear all auth state immediately when dialog opens
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("sessionId");

    const timer = setTimeout(() => {
      router.replace("/login");
      reset();
    }, 1500);

    return () => clearTimeout(timer);
  }, [show, router, reset]);

  return (
    <Dialog
      open={show}
      // prevent dismissing so user must be redirected (not left on a dead session)
      disableEscapeKeyDown
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        You&apos;ve been signed out
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          This session was ended from another device. Redirecting you to the
          login page...
        </DialogContentText>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress size={24} sx={{ color: "#B11226" }} />
        </Box>
      </DialogContent>
    </Dialog>
  );
}
