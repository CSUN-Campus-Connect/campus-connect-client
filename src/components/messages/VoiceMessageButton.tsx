/*

Voice Message System 

1. Recording (Client Side)
- Voice messages are recorded in the browser using MediaRecorder.
- Supported formats depend on the browser: webm, ogg, or mp4.
- Max recording length: 15 seconds.
- The recording is stored as a File object in memory (e.g., voice-<timestamp>.webm).
- The component does NOT upload the file; it only passes the File and duration to the UI.

2. Draft Handling
- The voice File is added to the message draft like any other attachment.
- The draft stores:
  - files: array of File objects
  - duration: stored separately by file name for playback.

3. Sending Messages (Current Behavior)
- When the user clicks "Send", the client:
  - Creates temporary blob URLs from the files.
  - Stores duration and file references for playback.
  - Calls onSend(threadId, text, urls).
- Only URLs (blob URLs or GIF URLs) are sent — NOT the actual file data.

4. What the Backend Currently Receives
- In the current implementation the backend only receives:
  - threadId
  - message text
- Voice files are never uploaded.
- In mock mode the voice message exists only in local memory using blob URLs (lost on refresh).

5. Current State
- Voice files are recorded and stored temporarily on the client.
- They are not uploaded or persisted by the backend yet.


6. Requirements to Support Voice Messages

- File upload endpoint (e.g., POST /api/v1/messages/upload)
  - Accept multipart/form-data
  - Validate audio type (webm/ogg/mp4) and size
  - Store file and return a stable URL.

- Message creation endpoint that supports attachments



*/



"use client";

import * as React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import { RED } from "./constants";

const MAX_DURATION_SEC = 15;

export type VoiceMessageButtonProps = {
  disabled?: boolean;
  onVoiceRecorded: (file: File, durationSec: number) => void;
};

export default function VoiceMessageButton({ disabled, onVoiceRecorded }: VoiceMessageButtonProps) {
  const [recording, setRecording] = React.useState(false);
  const [seconds, setSeconds] = React.useState(0);
  const chunksRef = React.useRef<Blob[]>([]);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const durationAtStopRef = React.useRef(0);
  const secondsRef = React.useRef(0);
  const startTimeRef = React.useRef(0);
  const recordingMimeRef = React.useRef<{ mime: string; ext: string }>({ mime: "audio/webm", ext: "webm" });

  const stopRecording = React.useCallback(() => {
    const elapsedSec = startTimeRef.current ? Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000)) : secondsRef.current;
    durationAtStopRef.current = elapsedSec;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecording(false);
    setSeconds(0);
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") {
      mr.stop();
    }
    mediaRecorderRef.current = null;
  }, []);

  React.useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => {
      setSeconds((s) => {
        const next = s >= MAX_DURATION_SEC - 1 ? MAX_DURATION_SEC : s + 1;
        secondsRef.current = next;
        durationAtStopRef.current = next;
        if (s >= MAX_DURATION_SEC - 1) stopRecording();
        return next;
      });
    }, 1000);
    timerRef.current = id;
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recording, stopRecording]);

  const handleDataAvailable = React.useCallback((e: BlobEvent) => {
    if (e.data.size > 0) chunksRef.current.push(e.data);
  }, []);

  const getPreferredMimeType = React.useCallback((): { mime: string; ext: string } => {
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/ogg",
      "audio/mp4",
    ];
    for (const mime of types) {
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(mime)) {
        if (mime.startsWith("audio/ogg")) return { mime, ext: "ogg" };
        if (mime.startsWith("audio/mp4")) return { mime, ext: "mp4" };
        return { mime, ext: "webm" };
      }
    }
    return { mime: "audio/webm", ext: "webm" };
  }, []);

  const handleStop = React.useCallback(() => {
    const chunks = chunksRef.current;
    chunksRef.current = [];
    const durationSec = durationAtStopRef.current || 1;
    if (chunks.length === 0) return;
    const { mime, ext } = recordingMimeRef.current;
    const blob = new Blob(chunks, { type: mime });
    const file = new File([blob], `voice-${Date.now()}.${ext}`, { type: mime });
    onVoiceRecorded(file, durationSec);
  }, [onVoiceRecorded]);

  const startRecording = React.useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingMimeRef.current = getPreferredMimeType();
      const { mime } = recordingMimeRef.current;
      const options = mime ? { mimeType: mime } : undefined;
      const mr = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = handleDataAvailable;
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        handleStop();
      };
      mr.start(200);
      startTimeRef.current = Date.now();
      setRecording(true);
      setSeconds(0);
      secondsRef.current = 0;
      durationAtStopRef.current = 0;
    } catch (err) {
      console.error("Voice recording failed:", err);
    }
  }, [handleDataAvailable, handleStop]);

  const handleClick = React.useCallback(() => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [recording, startRecording, stopRecording]);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <IconButton
        onClick={handleClick}
        disabled={disabled}
        title={recording ? "Stop recording (max 15s)" : "Record voice message (max 15s)"}
        sx={{
          color: recording ? "#b91c1c" : RED,
          "&:disabled": { color: "rgba(0,0,0,0.26)" },
        }}
        aria-label={recording ? "Stop recording" : "Record voice message"}
      >
        {recording ? <StopIcon /> : <MicIcon />}
      </IconButton>
      {recording && (
        <Typography sx={{ fontSize: 12, fontWeight: 800, color: "rgba(0,0,0,0.7)", minWidth: 32 }}>
          {seconds}s / {MAX_DURATION_SEC}s
        </Typography>
      )}
    </Box>
  );

}
