"use client";

import * as React from "react";
import Header from "@/components/StudentRecCenter/srcHeader";
import SrcAuroraBg from "@/components/StudentRecCenter/SrcBg";
import ClubCard from "@/components/StudentRecCenter/SportClubs/ClubCard";
import TryoutModal from "@/components/StudentRecCenter/SportClubs/TryoutModal";
import { CLUBS } from "@/components/StudentRecCenter/SportClubs/data";
import { ALL_CATS, CAT_COLORS, RED } from "@/components/StudentRecCenter/SportClubs/constants";
import type { CatFilter } from "@/components/StudentRecCenter/SportClubs/constants";
import CategoryIcon from "@/components/StudentRecCenter/SportClubs/CategoryIcon";
import type { Club, Category } from "@/components/StudentRecCenter/SportClubs/types";

export default function SportClubsPage() {
  const [modal,  setModal]  = React.useState<Club | null>(null);
  const [search, setSearch] = React.useState("");
  const [cat,    setCat]    = React.useState<CatFilter>("All");

  const filtered = React.useMemo(
    () =>
      CLUBS.filter((c) => {
        const q  = search.toLowerCase();
        const ok = !q || c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q) || c.tags.some((t) => t.toLowerCase().includes(q));
        return ok && (cat === "All" || c.category === cat);
      }),
    [search, cat]
  );

  return (
    <>
      <style>{`.sc-card:hover .sc-img{transform:scale(1.09);} .sc-search::placeholder{color:rgba(255,255,255,0.5)!important;}`}</style>

      {/* Full-page aurora background — same as home */}
      <SrcAuroraBg />

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
        <Header value="/StudentRecCenter/SportClubs" />

        {/* ── HERO ─────────────────────────────────────────────── */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 16px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ height: 1, width: 20, background: "rgba(255,255,255,0.35)" }} />
            <span
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 10,
                fontWeight: 800,
                textTransform: "uppercase" as const,
                letterSpacing: "0.22em",
              }}
            >
              CSUN · Associated Students
            </span>
          </div>
          <h1
            style={{
              color: "#fff",
              fontSize: "clamp(2.4rem,5vw,3.5rem)",
              fontWeight: 900,
              lineHeight: 1,
              margin: "0 0 10px",
              letterSpacing: "-0.02em",
              textShadow: "0 2px 32px rgba(0,0,0,0.25)",
            }}
          >
            Sport Clubs
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.68)",
              fontSize: 14,
              maxWidth: 420,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Student-led competitive &amp; recreational organizations at CSUN. Separate from SRC
            classes and services.
          </p>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 32, marginTop: 20, flexWrap: "wrap" }}>
            {(
              [
                ["Clubs", CLUBS.length],
                ["Categories", 8],
                ["Showing", filtered.length],
              ] as [string, number][]
            ).map(([l, v]) => (
              <div key={l}>
                <div
                  style={{
                    color: "#fff",
                    fontSize: 28,
                    fontWeight: 900,
                    fontVariantNumeric: "tabular-nums",
                    textShadow: "0 0 20px rgba(255,255,255,0.15)",
                  }}
                >
                  {v}
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: 9,
                    fontWeight: 800,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.18em",
                    marginTop: 2,
                  }}
                >
                  {l}
                </div>
              </div>
            ))}
            {/* ── View All Clubs button — links to the main clubs hub ── */}
            <a
              href="/clubs"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                background: "rgba(255,255,255,0.12)",
                border: "1.5px solid rgba(255,255,255,0.28)",
                borderRadius: 999,
                padding: "8px 18px",
                color: "#fff",
                fontWeight: 800,
                fontSize: 12,
                letterSpacing: "0.04em",
                textDecoration: "none",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                transition: "background 0.18s, border-color 0.18s",
                marginBottom: 4,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.22)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.5)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.12)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.28)";
              }}
            >
              View all clubs
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>

        {/* ── FILTER BAR ───────────────────────────────────────── */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 30,
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(24px) saturate(1.8)",
            WebkitBackdropFilter: "blur(24px) saturate(1.8)",
            borderTop: "1px solid rgba(255,255,255,0.12)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            padding: "10px 16px",
          }}
        >
          <div
            style={{
              maxWidth: 1280,
              margin: "0 auto",
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {/* search */}
            <div style={{ position: "relative", width: 220, flexShrink: 0 }}>
              <svg
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 14,
                  height: 14,
                  color: "rgb(255, 255, 255)",
                  pointerEvents: "none",
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                className="sc-search"
                aria-label="Search sport clubs or tags"
                placeholder="Search clubs or tags…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  boxSizing: "border-box" as const,
                  paddingLeft: 30,
                  paddingRight: search ? 28 : 12,
                  paddingTop: 7,
                  paddingBottom: 7,
                  borderRadius: 10,
                  fontSize: 12,
                  color: "#fff",
                  caretColor: "#fff",
                  background: "rgba(146, 146, 146, 0.12)",
                  border: `1px solid ${search ? "rgba(255,255,255,0.5)" : "rgba(255, 255, 255, 0.2)"}`,
                  outline: "none",
                  fontFamily: "inherit",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.5)",
                    padding: 0,
                    display: "flex",
                  }}
                >
                  <svg aria-hidden="true" width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* category pills */}
            <div
              style={{
                display: "flex",
                gap: 6,
                overflowX: "auto",
                flex: 1,
                scrollbarWidth: "none" as const,
              }}
            >
              {ALL_CATS.map((c) => {
                const active = cat === c;
                const color  = c === "All" ? RED : CAT_COLORS[c as keyof typeof CAT_COLORS];
                return (
                  <button
                    key={c}
                    onClick={() => setCat(c)}
                    style={{
                      flexShrink: 0,
                      cursor: "pointer",
                      border: "none",
                      fontFamily: "inherit",
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "6px 10px",
                      borderRadius: 999,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      transition: "all 0.18s ease",
                      ...(active
                        ? {
                            backgroundColor: c === "All" ? "#fff" : color,
                            color: c === "All" ? RED : "#fff",
                            boxShadow: `0 2px 10px ${color}55`,
                            transform: "scale(1.06)",
                          }
                        : {
                            backgroundColor: "rgba(255,255,255,0.1)",
                            color: "rgba(255,255,255,0.6)",
                          }),
                    }}
                  >
                    {c !== "All" && (
                      <CategoryIcon
                        category={c as Category}
                        size={10}
                        style={{ flexShrink: 0 }}
                      />
                    )}
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── GRID ─────────────────────────────────────────────── */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 16px 60px" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  margin: "0 auto 14px",
                }}
              >
                🔍
              </div>
              <p
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontWeight: 900,
                  fontSize: 18,
                  margin: "0 0 6px",
                }}
              >
                No clubs found
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.35)",
                  fontSize: 13,
                  margin: "0 0 14px",
                }}
              >
                Try different search terms or a different category
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setCat("All");
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                  fontFamily: "inherit",
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: 16,
                gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
              }}
            >
              {filtered.map((club) => (
                <ClubCard key={club.id} club={club} onTryout={setModal} />
              ))}
            </div>
          )}
        </div>

        <TryoutModal club={modal} onClose={() => setModal(null)} />
      </div>
    </>
  );
}
