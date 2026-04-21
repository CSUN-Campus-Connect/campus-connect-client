"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "../../lib/axios";
import DarkVeil from "@/components/Landingpage/DarkVeil";
import PasswordField from "@/components/authTools/ViewFilter";
import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must be less than 100 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!token) {
      setErrors({ general: "Invalid reset link. No token found." });
      return;
    }

    try {
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ password: error.issues[0].message });
        return;
      }
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/api/v1/users/reset-password", { token, password });
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/access/login");
      }, 2000);
    } catch (error: any) {
      setErrors({
        general:
          error?.response?.data?.message ||
          "Failed to reset password. The link may be invalid or expired.",
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
          width: "90vw",
          maxWidth: "500px",
          padding: "60px 40px",
          borderRadius: "28px",
          border: "4px solid rgba(255,255,255,0.9)",
          backgroundColor: "rgba(255,255,255,0.98)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
        }}
      >
        {!isSuccess ? (
          <>
            <h2
              style={{
                fontSize: "1.8rem",
                fontWeight: 700,
                color: "#333",
                marginBottom: "10px",
                textAlign: "center",
              }}
            >
              Reset Password
            </h2>

            <div
              style={{
                marginBottom: "20px",
                padding: "12px",
                backgroundColor: "#f0f8ff",
                borderLeft: "3px solid #0066cc",
                borderRadius: "4px",
                fontSize: "0.85rem",
                color: "#333",
              }}
            >
              <strong>Password must have:</strong> 8+ chars, uppercase,
              lowercase, number, special character
            </div>

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

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "15px" }}>
                <PasswordField
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New Password"
                  style={{
                    width: "100%",
                    padding: "12px 15px",
                    borderRadius: "999px",
                    border: errors.password
                      ? "2px solid crimson"
                      : "1px solid #d0d0d0",
                    backgroundColor: "#f5f5f5",
                    fontSize: "1rem",
                  }}
                />
                {errors.password && (
                  <p
                    style={{
                      color: "crimson",
                      fontSize: "0.85rem",
                      marginTop: "5px",
                      marginLeft: "15px",
                    }}
                  >
                    {errors.password}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: "20px" }}>
                <PasswordField
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm New Password"
                  style={{
                    width: "100%",
                    padding: "12px 15px",
                    borderRadius: "999px",
                    border: errors.confirmPassword
                      ? "2px solid crimson"
                      : "1px solid #d0d0d0",
                    backgroundColor: "#f5f5f5",
                    fontSize: "1rem",
                  }}
                />
                {errors.confirmPassword && (
                  <p
                    style={{
                      color: "crimson",
                      fontSize: "0.85rem",
                      marginTop: "5px",
                      marginLeft: "15px",
                    }}
                  >
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  padding: "14px",
                  backgroundColor: isSubmitting ? "#999" : "crimson",
                  color: "white",
                  border: "none",
                  borderRadius: "999px",
                  fontSize: "1rem",
                  fontWeight: 600,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "4rem", color: "crimson", marginBottom: "20px" }}>
              ✓
            </div>
            <h2
              style={{
                fontSize: "1.8rem",
                fontWeight: 700,
                color: "crimson",
                marginBottom: "10px",
              }}
            >
              Password Reset!
            </h2>
            <p style={{ color: "#666", fontSize: "1rem", marginBottom: "20px" }}>
              Your password has been successfully reset.
              <br />
              Redirecting to login...
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
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
        <DarkVeil />
        <div style={{ color: "white", fontSize: "1.2rem" }}>Loading...</div>
      </main>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}