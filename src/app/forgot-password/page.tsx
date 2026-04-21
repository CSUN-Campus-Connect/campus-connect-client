"use client";

import React, { useState } from "react";
import { api } from "../../lib/axios";
import DarkVeil from "@/components/Landingpage/DarkVeil";
import { z } from "zod";

// Email validation schema
const emailSchema = z.object({
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .refine((email) => email.toLowerCase().endsWith("@my.csun.edu"), {
      message: "Only @my.csun.edu email addresses are allowed",
    }),
});

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    general?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate email with Zod
    try {
      emailSchema.parse({ email });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { email?: string } = {};
        error.issues.forEach((issue) => {
          if (issue.path[0] === "email") {
            fieldErrors.email = issue.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Request password reset - backend will send email
      await api.post("/api/v1/users/request-password-reset", { email });

      // Show success message
      setIsSuccess(true);
    } catch (error: any) {
      setErrors({
        general:
          error?.response?.data?.message ||
          "Failed to send reset email. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <DarkVeil />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          width: "70vw",
          maxWidth: "950px",
          height: "500px",
          borderRadius: "28px",
          border: "4px solid rgba(255,255,255,0.85)",
          overflow: "hidden",
          backgroundColor: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
        }}
      >
        {/* LEFT: translucent logo panel */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRight: "2px solid rgba(255,255,255,0.35)",
          }}
        >
          <img
            src="/ToroSeal.png"
            alt="Toro Seal"
            style={{
              width: "300px",
              height: "300px",
              objectFit: "contain",
              opacity: 0.96,
            }}
          />
        </div>

        {/* RIGHT: solid white form panel */}
        <div
          style={{
            flex: 1,
            backgroundColor: "rgba(255,255,255,0.98)",
            padding: "40px 50px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {!isSuccess ? (
            <>
              <h2
                style={{
                  fontSize: "1.7rem",
                  fontWeight: 700,
                  marginBottom: "12px",
                }}
              >
                Forgot Password?
              </h2>
              <p
                style={{
                  marginTop: 0,
                  marginBottom: "18px",
                  fontSize: "0.9rem",
                  color: "#555",
                }}
              >
                Enter your email and we'll send you a link to reset your
                password.
              </p>

              {/* Error Message */}
              {errors.general && (
                <div
                  style={{
                    marginBottom: "15px",
                    padding: "12px",
                    backgroundColor: "#fee",
                    color: "crimson",
                    borderRadius: "12px",
                    fontSize: "0.9rem",
                    border: "1px solid crimson",
                  }}
                >
                  {errors.general}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 15px",
                      borderRadius: "999px",
                      border: errors.email
                        ? "2px solid crimson"
                        : "1px solid #d0d0d0",
                      backgroundColor: "#f5f5f5",
                      fontSize: "0.95rem",
                    }}
                  />
                  {errors.email && (
                    <p
                      style={{
                        color: "crimson",
                        fontSize: "0.85rem",
                        marginTop: "5px",
                        marginLeft: "15px",
                      }}
                    >
                      {errors.email}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    marginTop: "12px",
                    padding: "12px",
                    borderRadius: "999px",
                    border: "none",
                    backgroundColor: isSubmitting ? "#999" : "crimson",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "1rem",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </button>

                <p
                  style={{
                    marginTop: "14px",
                    fontSize: "0.9rem",
                    color: "#000000ff",
                  }}
                >
                  Remember your password?{" "}
                  <a
                    href="/access/login"
                    style={{
                      color: "crimson",
                      fontWeight: 500,
                      textDecoration: "none",
                    }}
                  >
                    Login
                  </a>
                </p>
              </form>
            </>
          ) : (
            // Success State
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "3rem",
                  color: "#28a745",
                  marginBottom: "20px",
                }}
              >
                ✓
              </div>
              <h2
                style={{
                  fontSize: "1.7rem",
                  fontWeight: 700,
                  marginBottom: "12px",
                  color: "#111",
                }}
              >
                Check Your Email
              </h2>
              <p
                style={{
                  fontSize: "0.95rem",
                  color: "#555",
                  marginBottom: "24px",
                  lineHeight: "1.5",
                }}
              >
                We've sent a password reset link to{" "}
                <strong style={{ color: "#111" }}>{email}</strong>
                <br />
                Click the link in the email to reset your password.
              </p>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#777",
                  marginBottom: "20px",
                }}
              >
                Didn't receive the email? Check your spam folder or{" "}
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "crimson",
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontWeight: 500,
                  }}
                >
                  try again
                </button>
              </p>
              <a
                href="/access/login"
                style={{
                  display: "inline-block",
                  marginTop: "10px",
                  padding: "10px 24px",
                  borderRadius: "999px",
                  backgroundColor: "crimson",
                  color: "white",
                  fontWeight: 600,
                  textDecoration: "none",
                  fontSize: "0.95rem",
                }}
              >
                Back to Login
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}