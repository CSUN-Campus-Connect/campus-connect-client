"use client";

import * as React from "react";

const MAILTO =
  "mailto:vram.ghazourian.747@my.csun.edu?subject=Campus%20Connect%20Help&body=Hi%20Vram,%0A%0AI%20need%20help%20with:%0A%0A";

export function EmailAgentButton({ label = "Email Agent" }: { label?: string }) {
  return (
    <a
      href={MAILTO}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px 12px",
        borderRadius: 8,
        border: "1px solid rgba(0,0,0,0.15)",
        background: "#fff",
        color: "rgba(0,0,0,0.85)",
        fontWeight: 800,
        textDecoration: "none",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      {label}
    </a>
  );
}
