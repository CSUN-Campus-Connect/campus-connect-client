"use client";

// ═══════════════════════════════════════════════════════════════════════
// BACKEND INTEGRATION — TryoutModal / Interest Form
// ═══════════════════════════════════════════════════════════════════════
//
// SUBMIT APPLICATION — InterestForm handleSubmit():
//   POST /api/clubs/:clubId/applications
//   Auth: require active session (student must be logged in)
//   Body: {
//     email: string,          // applicant's @my.csun.edu address
//     experience: string,     // years-of-experience bucket
//     contact: string,        // preferred contact method
//     phone?: string,
//     age?: number,
//     major?: string,
//   }
//   On success → 201 { applicationId, status: 'pending' }
//   On duplicate (same student + club) → 409 Conflict
//
// NOTIFY CLUB LEADERSHIP:
//   After saving the application row, trigger a server-side notification
//   to every club_member where role IN ('President','VP','Officer'):
//
//     SELECT user_id FROM club_members
//     WHERE club_id = :clubId
//       AND role IN ('President', 'VP', 'Officer')
//       AND blocked = false;
//
//   Then for each leader:
//     INSERT INTO notifications (user_id, type, payload, created_at)
//     VALUES (:leaderId, 'new_application', { clubId, applicationId, applicantEmail }, NOW())
//
//   Optionally also send an email via Resend / SendGrid:
//     POST https://api.resend.com/emails
//     to: leader's email, subject: "New applicant for {clubName}"
//
// READ APPLICATIONS (club dashboard / ClubEditPage):
//   GET /api/clubs/:clubId/applications
//   Auth: verify requesting user has role IN ('President','VP','Officer')
//   Returns: Application[] sorted by created_at DESC
//
// UPDATE APPLICATION STATUS:
//   PATCH /api/clubs/:clubId/applications/:applicationId
//   Body: { status: 'accepted' | 'rejected' | 'waitlisted' }
//   Auth: President / VP / Officer only
//   Side-effect: notify applicant via notification + email
//
// SUPABASE RLS SUGGESTION:
//   - Students can INSERT their own application (auth.uid() = applicant_user_id)
//   - Students can SELECT only their own applications
//   - Club leaders (role IN President/VP/Officer) can SELECT/UPDATE all
//     applications for clubs they manage
// ═══════════════════════════════════════════════════════════════════════

import * as React from "react";
import type { Club } from "./types";
import { CAT_COLORS, RED } from "./constants";
import CategoryIcon from "./CategoryIcon";

// ─── InfoRow ──────────────────────────────────────────────────
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div
        style={{
          flexShrink: 0,
          width: 34,
          height: 34,
          borderRadius: 9,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: RED + "15",
          color: RED,
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            fontSize: 9,
            fontWeight: 800,
            textTransform: "uppercase" as const,
            letterSpacing: "0.14em",
            color: "#9ca3af",
            margin: "0 0 3px",
          }}
        >
          {label}
        </p>
        <p style={{ fontSize: 13, color: "#111827", lineHeight: 1.45, margin: 0 }}>{value}</p>
      </div>
    </div>
  );
}

// ─── InterestForm ─────────────────────────────────────────────
function InterestForm({ club, onClose }: { club: Club; onClose: () => void }) {
  const cc = CAT_COLORS[club.category];
  const [f, setF] = React.useState({
    email: "",
    experience: "",
    contact: "",
    phone: "",
    major: "",
    age: "",
  });
  const [touched, setTouched] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const set =
    (k: keyof typeof f) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setF((p) => ({ ...p, [k]: e.target.value }));

  const emailOk = /^[^\s@]+@my\.csun\.edu$/.test(f.email);
  const valid = emailOk && f.experience && f.contact.trim();

  const base: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box" as const,
    border: "1.5px solid #e5e7eb",
    borderRadius: 10,
    padding: "9px 12px",
    fontSize: 13,
    color: "#111827",
    background: "#fff",
    outline: "none",
    fontFamily: "inherit",
  };
  const errS: React.CSSProperties = { ...base, borderColor: "#fca5a5" };
  const lbl: React.CSSProperties = {
    fontSize: 9,
    fontWeight: 800,
    textTransform: "uppercase" as const,
    letterSpacing: "0.14em",
    color: "#9ca3af",
    display: "block",
    marginBottom: 4,
  };
  const opt: React.CSSProperties = {
    fontSize: 9,
    fontWeight: 400,
    color: "#d1d5db",
    textTransform: "none" as const,
    letterSpacing: 0,
  };

  if (done)
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "36px 24px 32px",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            backgroundColor: cc + "22",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
            marginBottom: 16,
          }}
        >
          ✅
        </div>
        <h3 style={{ fontSize: 21, fontWeight: 900, color: "#111827", margin: "0 0 10px" }}>
          You&apos;re on the list!
        </h3>
        <p
          style={{
            fontSize: 13,
            color: "#6b7280",
            lineHeight: 1.6,
            maxWidth: 280,
            margin: "0 0 22px",
          }}
        >
          The <strong style={{ color: "#111827" }}>{club.name}</strong> team will reach out to{" "}
          <strong style={{ color: "#111827" }}>{f.email}</strong> with next steps.
        </p>
        <button
          onClick={onClose}
          style={{
            backgroundColor: RED,
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontWeight: 800,
            fontSize: 13,
            padding: "11px 30px",
            borderRadius: 11,
            fontFamily: "inherit",
          }}
        >
          Done
        </button>
      </div>
    );

  return (
    <div
      style={{
        padding: "6px 24px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 13,
        overflowY: "auto",
        maxHeight: "58vh",
      }}
    >
      <div>
        <label htmlFor="tryout-email" style={lbl}>
          CSUN Email <span style={{ color: RED }}>*</span>
        </label>
        <input
          id="tryout-email"
          type="email"
          placeholder="yourname@my.csun.edu"
          value={f.email}
          onChange={set("email")}
          style={touched && !emailOk ? errS : base}
        />
        {touched && !emailOk && (
          <p style={{ fontSize: 10, color: "#ef4444", margin: "3px 0 0", fontWeight: 600 }}>
            Must be a @my.csun.edu address.
          </p>
        )}
      </div>
      <div>
        <label htmlFor="tryout-experience" style={lbl}>
          Years of Experience <span style={{ color: RED }}>*</span>
        </label>
        <select
          id="tryout-experience"
          value={f.experience}
          onChange={set("experience")}
          style={{ ...(touched && !f.experience ? errS : base), cursor: "pointer" }}
        >
          <option value="">Select…</option>
          <option value="none">None — complete beginner</option>
          <option value="<1">Less than 1 year</option>
          <option value="1-2">1 – 2 years</option>
          <option value="2-5">2 – 5 years</option>
          <option value="5+">5+ years</option>
        </select>
      </div>
      <div>
        <label htmlFor="tryout-contact" style={lbl}>
          Best Way to Reach You <span style={{ color: RED }}>*</span>
        </label>
        <textarea
          id="tryout-contact"
          rows={2}
          value={f.contact}
          onChange={set("contact")}
          placeholder="e.g. Text 818-555-0199 · DM @handle · Reply to email"
          style={{ ...(touched && !f.contact.trim() ? errS : base), resize: "none" }}
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label htmlFor="tryout-phone" style={lbl}>
            Cell <span style={opt}>(optional)</span>
          </label>
          <input
            id="tryout-phone"
            type="tel"
            placeholder="818-555-0199"
            value={f.phone}
            onChange={set("phone")}
            style={base}
          />
        </div>
        <div>
          <label htmlFor="tryout-age" style={lbl}>
            Age <span style={opt}>(optional)</span>
          </label>
          <input
            id="tryout-age"
            type="number"
            min={17}
            max={40}
            placeholder="21"
            value={f.age}
            onChange={set("age")}
            style={base}
          />
        </div>
      </div>
      <div>
        <label htmlFor="tryout-major" style={lbl}>
          Major <span style={opt}>(optional)</span>
        </label>
        <input
          id="tryout-major"
          type="text"
          placeholder="e.g. Kinesiology"
          value={f.major}
          onChange={set("major")}
          style={base}
        />
      </div>
      {club.tryout.kind === "form" && club.tryout.notes && (
        <div
          style={{
            display: "flex",
            gap: 8,
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: 10,
            padding: "10px 12px",
          }}
        >
          <svg
            width="15"
            height="15"
            fill="none"
            stroke="#d97706"
            viewBox="0 0 24 24"
            style={{ flexShrink: 0, marginTop: 1 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p style={{ fontSize: 11, color: "#92400e", margin: 0, lineHeight: 1.5 }}>
            {club.tryout.notes}
          </p>
        </div>
      )}
      <button
        onClick={() => {
          setTouched(true);
          if (valid) {
            // BACKEND: Replace setDone(true) with an API call:
            //   const res = await fetch(`/api/clubs/${club.id}/applications`, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(f),
            //   });
            //   if (res.status === 409) { /* show "already applied" message */ return; }
            //   if (!res.ok) { /* show generic error toast */ return; }
            //   Server will notify all President/VP/Officer members via
            //   the notifications table + optional email (see top-of-file comments).
            setDone(true);
          }
        }}
        style={{
          width: "100%",
          border: "none",
          cursor: valid ? "pointer" : "not-allowed",
          backgroundColor: RED,
          color: "#fff",
          fontWeight: 800,
          fontSize: 13,
          padding: "12px",
          borderRadius: 11,
          opacity: valid ? 1 : 0.4,
          boxShadow: valid ? "0 4px 14px rgba(168,5,50,0.35)" : "none",
          transition: "all 0.2s",
          letterSpacing: "0.04em",
          fontFamily: "inherit",
        }}
      >
        Submit Interest →
      </button>
    </div>
  );
}

// ─── TryoutModal ──────────────────────────────────────────────
export default function TryoutModal({
  club,
  onClose,
}: {
  club: Club | null;
  onClose: () => void;
}) {
  const [vis, setVis] = React.useState(false);

  React.useEffect(() => {
    if (club) {
      requestAnimationFrame(() => requestAnimationFrame(() => setVis(true)));
    } else {
      setVis(false);
    }
  }, [club]);

  React.useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  if (!club) return null;

  const cc = CAT_COLORS[club.category];
  const isInfo = club.tryout.kind === "info";

  const CAL = (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
  const PIN = (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
  const USD = (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
  const NFO = (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  return (
    <>
      <style>{`@media(min-width:640px){.tm-sheet{border-radius:24px!important;max-width:448px!important;margin:auto!important;align-self:center!important;}}`}</style>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          backgroundColor: vis ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0)",
          backdropFilter: vis ? "blur(5px)" : "none",
          WebkitBackdropFilter: vis ? "blur(5px)" : "none",
          transition: "background-color 0.22s ease",
        }}
      >
        <div
          className="tm-sheet"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "relative",
            background: "#fff",
            width: "100%",
            borderRadius: "24px 24px 0 0",
            overflow: "hidden",
            boxShadow: "0 -4px 40px rgba(0,0,0,0.2)",
            transform: vis ? "translateY(0)" : "translateY(60px)",
            opacity: vis ? 1 : 0,
            transition:
              "transform 0.32s cubic-bezier(0.34,1.56,0.64,1),opacity 0.22s ease",
            maxHeight: "92dvh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              height: 5,
              background: `linear-gradient(90deg,${cc},${RED})`,
              flexShrink: 0,
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "10px 0 0",
              flexShrink: 0,
            }}
          >
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "#e5e7eb" }} />
          </div>

          {/* header */}
          <div
            style={{
              padding: "12px 24px 14px",
              borderBottom: "1px solid #f3f4f6",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "3px 10px",
                      borderRadius: 999,
                      backgroundColor: cc,
                      color: "#fff",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <CategoryIcon category={club.category} size={11} />
                    {club.category}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 800,
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.14em",
                      color: "#9ca3af",
                    }}
                  >
                    {isInfo ? "Tryout Info" : "Express Interest"}
                  </span>
                </div>
                <h2
                  style={{
                    fontSize: 21,
                    fontWeight: 900,
                    color: "#111827",
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {club.name}
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                style={{
                  flexShrink: 0,
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#f3f4f6",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6b7280",
                }}
              >
                <svg aria-hidden="true" width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* body */}
          {isInfo ? (
            <div
              style={{
                padding: "18px 24px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                overflowY: "auto",
              }}
            >
              {club.tryout.kind === "info" && (
                <>
                  {club.tryout.schedule && (
                    <InfoRow label="Schedule" value={club.tryout.schedule} icon={CAL} />
                  )}
                  {club.tryout.location && (
                    <InfoRow label="Location" value={club.tryout.location} icon={PIN} />
                  )}
                  {club.tryout.cost && (
                    <InfoRow label="Cost" value={club.tryout.cost} icon={USD} />
                  )}
                  {club.tryout.notes && (
                    <InfoRow label="Notes" value={club.tryout.notes} icon={NFO} />
                  )}
                </>
              )}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                  borderRadius: 10,
                  padding: "10px 12px",
                }}
              >
                <svg
                  width="15"
                  height="15"
                  fill="none"
                  stroke="#d97706"
                  viewBox="0 0 24 24"
                  style={{ flexShrink: 0, marginTop: 1 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p style={{ fontSize: 11, color: "#92400e", margin: 0, lineHeight: 1.5 }}>
                  Always confirm details on the official club page — schedules may change.
                </p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={onClose}
                  style={{
                    flex: 1,
                    background: "#fff",
                    border: "2px solid #e5e7eb",
                    borderRadius: 11,
                    padding: "11px",
                    fontWeight: 700,
                    fontSize: 13,
                    color: "#4b5563",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Close
                </button>
                <a
                  href={club.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    backgroundColor: RED,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 13,
                    padding: "11px",
                    borderRadius: 11,
                    textDecoration: "none",
                  }}
                >
                  Club Page
                  <svg
                    width="12"
                    height="12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
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
          ) : (
            <InterestForm club={club} onClose={onClose} />
          )}
        </div>
      </div>
    </>
  );
}
