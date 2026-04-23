"use client";

import * as React from "react";
import { Card, CardContent, TextField } from "@mui/material";
import { WidgetHeader } from "./WidgetHeader";

export const StickyNoteWidget: React.FC<{ id: string; onDelete?: () => void }> = ({ id, onDelete }) => {
  const [text, setText] = React.useState<string>("");

  React.useEffect(() => {
    const saved = localStorage.getItem(`sticky-${id}`);
    if (saved) setText(saved);
  }, [id]);

  React.useEffect(() => {
    localStorage.setItem(`sticky-${id}`, text);
  }, [id, text]);

  return (
    <Card className="widget-card" sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "#fffbe6" }}>
      <WidgetHeader title="Sticky Note" onDelete={onDelete} />
      <CardContent sx={{ flex: 1, overflow: "auto" }}>
        <TextField
          value={text}
          onChange={(e)=>setText(e.target.value)}
          placeholder="Write something and it will stick…"
          inputProps={{ "aria-label": "Sticky note content" }}
          multiline
          minRows={6}
          fullWidth
          variant="outlined"
        />
      </CardContent>
    </Card>
  );
};
