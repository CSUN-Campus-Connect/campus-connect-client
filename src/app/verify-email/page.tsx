"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "../../lib/axios";

type Status = "verifying" | "verified" | "error";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link. No token found.");
        return;
      }

      try {
        await api.get(`/api/v1/users/verify?token=${token}`);
        setStatus("verified");
        setMessage("Email verified successfully!");
      } catch (error: any) {
        setStatus("error");
        setMessage(
          error?.response?.data?.message ||
            "Verification failed. The link may be invalid or expired."
        );
      }
    };

    verifyEmail();
  }, [token]);

  useEffect(() => {
    if (status === "verified" && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (status === "verified" && countdown === 0) {
      router.push("/access/login");
    }
  }, [status, countdown, router]);

  const isVerified = status === "verified";
  const isVerifying = status === "verifying";
  const isError = status === "error";

  return (
    <main
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #0f0f0f 0%, #1a0a0e 50%, #0f0f0f 100%)", zIndex: 0 }} />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "90vw",
          maxWidth: "500px",
          padding: "60px 40px",
          borderRadius: "28px",
          border: "4px solid rgba(255,255,255,0.9)",
          backgroundColor: "rgba(255,255,255,0.98)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
          textAlign: "center",
        }}
      >
        {isVerifying && (
          <>
            <div
              style={{
                fontSize: "4rem",
                marginBottom: "20px",
                animation: "spin 1s linear infinite",
              }}
            >
              ⏳
            </div>
            <h2
              style={{
                fontSize: "1.8rem",
                fontWeight: 700,
                color: "#333",
                marginBottom: "10px",
              }}
            >
              Verifying Email...
            </h2>
            <p style={{ color: "#666", fontSize: "1rem" }}>
              Please wait while we verify your email address.
            </p>
          </>
        )}

        {isVerified && (
          <>
            <div
              style={{
                fontSize: "5rem",
                color: "crimson",
                marginBottom: "20px",
              }}
            >
              ✓
            </div>
            <h2
              style={{
                fontSize: "1.8rem",
                fontWeight: 700,
                color: "crimson",
                marginBottom: "16px",
              }}
            >
              Email Verified!
            </h2>
            <p
              style={{
                color: "#333",
                fontSize: "1rem",
                marginBottom: "30px",
                lineHeight: "1.6",
              }}
            >
              Your email has been successfully verified.
              <br />
              You can now log in to your account.
            </p>
            <p
              style={{
                color: "#666",
                fontSize: "0.9rem",
                marginBottom: "20px",
              }}
            >
              Redirecting to login in{" "}
              <strong style={{ color: "crimson" }}>{countdown}</strong> seconds...
            </p>
            <button
              onClick={() => router.push("/login")}
              style={{
                padding: "12px 40px",
                backgroundColor: "crimson",
                color: "white",
                border: "none",
                borderRadius: "999px",
                fontWeight: 600,
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              Go to Login Now
            </button>
          </>
        )}

        {isError && (
          <>
            <div
              style={{
                fontSize: "5rem",
                color: "crimson",
                marginBottom: "20px",
              }}
            >
              ✗
            </div>
            <h2
              style={{
                fontSize: "1.8rem",
                fontWeight: 700,
                color: "crimson",
                marginBottom: "16px",
              }}
            >
              Verification Failed
            </h2>
            <p
              style={{
                color: "#333",
                fontSize: "1rem",
                marginBottom: "30px",
                lineHeight: "1.6",
              }}
            >
              {message}
            </p>
            <button
              onClick={() => router.push("/login")}
              style={{
                padding: "12px 40px",
                backgroundColor: "crimson",
                color: "white",
                border: "none",
                borderRadius: "999px",
                fontWeight: 600,
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              Back to Login
            </button>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <main style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #0f0f0f 0%, #1a0a0e 50%, #0f0f0f 100%)", zIndex: 0 }} />
        <div style={{ color: "white", fontSize: "1.2rem" }}>Loading...</div>
      </main>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}