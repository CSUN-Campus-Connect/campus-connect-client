// src/app/admin/security/page.tsx
"use client";

export default function SecurityAdminPage() {
  return (
    <div>
      <h1 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "4px" }}>security</h1>
      <p style={{ fontSize: "13px", color: "#666", marginBottom: "32px" }}>campus security case management</p>
      <div style={{
        border: "1px solid #1a1a1a",
        padding: "40px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "13px", color: "#444", marginBottom: "16px" }}>
          security portal coming soon — incident reports, case management, secure messaging, escort requests
        </div>
        <div style={{ fontSize: "11px", color: "#333" }}>
          routed to: DPS, OEC (Title IX), OSCED, Housing, UCS
        </div>
      </div>
    </div>
  );
}