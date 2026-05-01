"use client";

import * as React from "react";
import { Alert, Box, IconButton, Snackbar, TextField, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PhotoCameraBackIcon from "@mui/icons-material/PhotoCameraBack";
import { useAutoGrowGridStack } from "../hooks/useAutoGrowGridStack";

export const PhotoPinWidget: React.FC<{ id: string; onDelete?: () => void }> = ({ id, onDelete }) => {
  const polaroidRef = React.useRef<HTMLDivElement>(null);
  useAutoGrowGridStack(polaroidRef as React.RefObject<HTMLElement>);

  const [img, setImg] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState<string>("Photo Pin (click to add title)");
  const [note, setNote] = React.useState<string>("");
  const [persistWarn, setPersistWarn] = React.useState<string | null>(null);
  const fileRef     = React.useRef<HTMLInputElement>(null);
  const noteRef     = React.useRef<HTMLTextAreaElement>(null);
  const CHAR_LIMIT = 150;

  const fileToDataURL = (file: File) => new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });

  const downscaleDataUrl = (dataUrl: string, maxDim = 1400, quality = 0.85) =>
    new Promise<string>((resolve) => {
      const i = new Image();
      i.onload = () => {
        const { width, height } = i;
        const scale = Math.min(1, maxDim / Math.max(width, height));
        if (scale >= 1) return resolve(dataUrl);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(i, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      i.src = dataUrl;
    });

  React.useEffect(() => {
    const sImg   = localStorage.getItem(`photopin:${id}`);
    const sTitle = localStorage.getItem(`photopin-title:${id}`);
    const sNote  = localStorage.getItem(`photopin-note:${id}`);
    if (sImg) setImg(sImg);
    if (sTitle) setTitle(sTitle);
    if (sNote) setNote(sNote);
  }, [id]);

  React.useEffect(() => {
    try {
      if (img) localStorage.setItem(`photopin:${id}`, img);
      else localStorage.removeItem(`photopin:${id}`);
    } catch {
      setPersistWarn("Image is too large to save in browser storage. It will show until you refresh.");
    }
  }, [id, img]);

  React.useEffect(() => { localStorage.setItem(`photopin-title:${id}`, title); }, [id, title]);
  React.useEffect(() => { localStorage.setItem(`photopin-note:${id}`, note); }, [id, note]);

  const onPick = () => fileRef.current?.click();

  const onFiles = async (files?: FileList | null) => {
    if (!files?.[0]) return;
    try {
      const raw = await fileToDataURL(files[0]);
      const shrunk = await downscaleDataUrl(raw, 1400, 0.85);
      setImg(shrunk);
    } catch {
      setPersistWarn("Couldn’t read that image. Try a different file.");
    }
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    onFiles(e.dataTransfer.files);
  };

  const autoresize = () => {
    const el = noteRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };
  React.useEffect(() => { autoresize(); }, [note]);

  const onNoteChange = (v: string) => { setNote(v.slice(0, CHAR_LIMIT)); };

  const OFF_WHITE = "#f5f5f3";

  return (
    <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", p: 0 }}>
      <Box
        sx={{
          position: "absolute",
          bottom: 10,
          left: "50%",
          transform: "translateX(-50%)",
          width: "70%",
          height: 10,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.10)",
          filter: "blur(4px)",
          pointerEvents: "none",
        }}
      />

      <Box
        ref={polaroidRef}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 520,
          backgroundColor: OFF_WHITE,
          border: "1px solid #e0e0de",
          borderRadius: 1,
          boxShadow: "0 3px 10px rgba(0,0,0,0.12)",
          p: "10px 12px 30px 12px",
          cursor: "default",
        }}
      >
      {onDelete && (
        <IconButton
          size="small"
          onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
          onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
          sx={{ position: "absolute", top: 6, right: 6, zIndex: 2 }}
          aria-label={`delete ${title}`}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
        <TextField
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          variant="standard"
          placeholder="Title"
          inputProps={{ "aria-label": "Photo pin title" }}
          fullWidth
          InputProps={{
            disableUnderline: true,
            sx: { fontWeight: 700, fontSize: 14, color: "#222", mb: 1 },
          }}
        />

        <Box
          role="button"
          tabIndex={0}
          onClick={onPick}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick(); } }}
          aria-label="Upload a photo (click or drop image)"
          sx={{
            width: "100%",
            aspectRatio: "1 / 1",
            background: "#000",
            borderRadius: "2px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            userSelect: "none",
            cursor: "pointer",
          }}
        >
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt="Pinned" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", background: "#000" }} />
          ) : (
            <React.Fragment>
              <PhotoCameraBackIcon sx={{ color: "rgba(255,255,255,0.75)" }} />
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)", ml: 1 }}>Click to upload • or drop image</Typography>
            </React.Fragment>
          )}
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFiles(e.target.files)} />
        </Box>

        <textarea
          ref={noteRef}
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          aria-label="Photo pin note"
          placeholder="add a note... "
          style={{
            width: "100%",
            marginTop: 8,
            border: "none",
            outline: "none",
            resize: "none",
            overflow: "hidden",
            background: "transparent",
            color: "#444",
            fontSize: "0.9rem",
            fontStyle: "italic",
            lineHeight: 1.35,
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7 }} aria-live="polite">
          ({CHAR_LIMIT - note.length} characters left)
        </Typography>
      </Box>

      <Snackbar open={!!persistWarn} autoHideDuration={4000} onClose={() => setPersistWarn(null)}>
        <Alert severity="warning" sx={{ width: "100%" }}>{persistWarn}</Alert>
      </Snackbar>
    </Box>
  );
};
