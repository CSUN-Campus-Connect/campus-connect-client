"use client";

import * as React from "react";
import Link from "next/link";
import type { Club } from "./types";
import { CAT_COLORS, RED } from "./constants";
import CategoryIcon from "./CategoryIcon";

// ─── ClubImage ────────────────────────────────────────────────
function ClubImage({ src, name, cc }: { src: string; name: string; cc: string }) {
  const [attempt, setAttempt] = React.useState(0);
  const resolved =
    attempt === 0
      ? src
      : attempt === 1
      ? src.replace(/\.jpg$/i, (m) => (m === ".jpg" ? ".JPG" : ".jpg"))
      : null;

  if (!resolved)
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg,${cc}25,${cc}55)`,
        }}
      >
        <span style={{ fontSize: 34, opacity: 0.3 }}>🏅</span>
      </div>
    );

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={resolved}
      alt={name}
      onError={() => setAttempt((a) => Math.min(a + 1, 2))}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center",
        display: "block",
        transition: "transform 0.6s ease",
      }}
      className="sc-img"
    />
  );
}

// ─── ClubCard ─────────────────────────────────────────────────
export default function ClubCard({
  club,
  onTryout,
}: {
  club: Club;
  onTryout: (c: Club) => void;
}) {
  const cc = CAT_COLORS[club.category];
  const [hov, setHov] = React.useState(false);

  return (
    <article
      className="sc-card"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#fff",
        borderRadius: 18,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        border: `1.5px solid ${hov ? cc + "55" : "rgba(0,0,0,0.08)"}`,
        boxShadow: hov
          ? `0 20px 48px -8px ${cc}45,0 4px 16px rgba(0,0,0,0.1)`
          : "0 2px 12px rgba(0,0,0,0.07)",
        transform: hov ? "translateY(-6px)" : "translateY(0)",
        transition: "all 0.32s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      {/* image */}
      <div
        style={{
          position: "relative",
          height: 160,
          overflow: "hidden",
          background: "#f3f4f6",
          flexShrink: 0,
        }}
      >
        <div style={{ position: "absolute", inset: 0 }}>
          <ClubImage src={club.img} name={club.name} cc={cc} />
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top,rgba(0,0,0,0.72) 0%,transparent 55%)",
            opacity: hov ? 1 : 0.72,
            transition: "opacity 0.3s",
          }}
        />
        <span
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            backgroundColor: cc,
            color: "#fff",
            fontSize: 10,
            fontWeight: 800,
            padding: "3px 9px",
            borderRadius: 999,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            letterSpacing: "0.04em",
          }}
        >
          <CategoryIcon aria-hidden category={club.category} size={10} />
          {club.category}
        </span>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "8px 13px 11px",
          }}
        >
          <h3
            style={{
              color: "#fff",
              fontWeight: 900,
              fontSize: 14,
              lineHeight: 1.25,
              margin: 0,
              textShadow: "0 1px 6px rgba(0,0,0,0.5)",
            }}
          >
            {club.name}
          </h3>
        </div>
      </div>

      {/* body */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: "12px 13px 13px",
          gap: 9,
        }}
      >
        <p
          style={{
            color: "#6b7280",
            fontSize: 12,
            lineHeight: 1.55,
            margin: 0,
            flex: 1,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as const,
            overflow: "hidden",
          }}
        >
          {club.desc}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {club.tags.map((t) => (
            <span
              key={t}
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 999,
                backgroundColor: cc + "1a",
                color: cc,
                letterSpacing: "0.03em",
              }}
            >
              {t}
            </span>
          ))}
        </div>
        <div style={{ height: 1, backgroundColor: cc + "28" }} />
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => onTryout(club)}
            style={{
              flex: 1,
              border: "none",
              cursor: "pointer",
              background: `linear-gradient(135deg,${RED},#cc0640)`,
              color: "#fff",
              fontWeight: 800,
              fontSize: 10,
              padding: "8px 4px",
              borderRadius: 10,
              letterSpacing: "0.06em",
              boxShadow: hov ? "0 4px 14px rgba(168,5,50,0.4)" : "none",
              transition: "box-shadow 0.2s",
              fontFamily: "inherit",
            }}
          >
            {club.tryout.kind === "form" ? "APPLY" : "TRYOUT INFO"}
          </button>
          <Link
            href={`/clubs/${club.id}`}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              border: `2px solid ${RED}`,
              color: RED,
              fontWeight: 800,
              fontSize: 10,
              padding: "8px 4px",
              borderRadius: 10,
              letterSpacing: "0.06em",
            }}
          >
            VIEW CLUB
          </Link>
          <a
            href={club.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View ${club.name} on CSUN website (opens in new tab)`}
            style={{
              width: 34,
              height: 34,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1.5px solid #e5e7eb",
              borderRadius: 10,
              color: "#9ca3af",
              textDecoration: "none",
            }}
          >
            <svg aria-hidden="true" width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}
