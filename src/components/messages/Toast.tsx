"use client";

import * as React from "react";
import { Snackbar, Alert } from "@mui/material";

export type ToastSeverity = "info" | "warning" | "error" | "success";

export function useToast() {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [severity, setSeverity] = React.useState<ToastSeverity>("info");

  const show = React.useCallback((msg: string, sev: ToastSeverity = "info") => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  }, []);

  const close = React.useCallback(() => setOpen(false), []);

  return { open, message, severity, show, close };
}

export function Toast({
  open,
  message,
  severity,
  onClose,
}: {
  open: boolean;
  message: string;
  severity: ToastSeverity;
  onClose: () => void;
}) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert onClose={onClose} severity={severity} variant="filled" sx={{ fontWeight: 800, borderRadius: 2 }}>
        {message}
      </Alert>
    </Snackbar>
  );
}