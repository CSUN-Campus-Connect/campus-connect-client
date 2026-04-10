"use client";

import React from "react";
import { RED } from "./constants";

export function LoadingState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        minHeight: "60vh",
        padding: "2rem",
      }}
    >
      <div
        className="animate-spin"
        style={{
          width: "48px",
          height: "48px",
          border: `4px solid rgba(168, 5, 50, 0.1)`,
          borderTop: `4px solid ${RED}`,
          borderRadius: "50%",
        }}
      />
      <p style={{ color: "#6B7280", fontSize: "1rem", fontWeight: 500 }}>Loading messages...</p>
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div style={{ maxWidth: "480px", margin: "2rem auto", padding: "2rem", textAlign: "center" }}>
      <div
        style={{
          background: "rgba(220, 38, 38, 0.05)",
          border: "2px solid rgba(220, 38, 38, 0.2)",
          borderRadius: 12,
          padding: "2rem",
          display: "inline-block",
        }}
      >
        <h3 style={{ color: "#DC2626", marginBottom: "0.5rem", fontSize: "1.25rem", fontWeight: 700 }}>
          Failed to load messages
        </h3>
        <p style={{ color: "#6B7280", marginBottom: "1.5rem", fontSize: "0.95rem" }}>{error}</p>
        <button
          type="button"
          onClick={onRetry}
          style={{
            background: RED,
            color: "white",
            padding: "0.75rem 1.5rem",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.95rem",
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
