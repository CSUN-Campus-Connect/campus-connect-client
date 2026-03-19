"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/axios";
import DarkVeil from "@/components/Landingpage/DarkVeil";
import PasswordField from "@/components/authTools/ViewFilter";
import { PublicUser } from "@/types/profile";
import { loginSchema, LoginInput } from "@/lib/validators/auth.validators";
import { z } from "zod";

export default function LoginPage() {
  const router = useRouter();

  React.useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (user && token) {
      console.log("Stored user: ", user);
      router.push("/dashboard");
    }
  }, [router]);

  const [loginData, setLoginData] = useState<LoginInput>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendSuccess(false);

    try {
      await api.post("/api/v1/users/resend-verification", {
        email: loginData.email,
      });
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000); // Hide after 5s
    } catch (error: any) {
      setErrors({
        general: error?.response?.data?.message || "Failed to resend verification email",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});
    setShowResendButton(false);
    setResendSuccess(false);

    // Validate form data with Zod
    try {
      loginSchema.parse(loginData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { email?: string; password?: string } = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as keyof typeof fieldErrors] =
              issue.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const response = await api.post<{ token: string; user: PublicUser }>(
        "/api/v1/users/login",
        loginData
      );
      const user: PublicUser = response.data.user;

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(user));
      router.push("/dashboard");
    } catch (error: any) {
      // Get backend error message
      const backendError =
        error?.response?.data?.message || error?.response?.data?.error || "";

      console.log("Backend error:", backendError);
      console.log("Includes verify?", backendError.toLowerCase().includes("verify"));

      // Show user-friendly message based on error type
      let userMessage = "Something went wrong. Please try again.";

      // Check if it's an email verification error
      if (
        backendError.toLowerCase().includes("verify") ||
        backendError.toLowerCase().includes("verification")
      ) {
        userMessage =
          "Please verify your email before logging in. Check your inbox for the verification link.";
        setShowResendButton(true); // Show resend button
        console.log("SHOULD SHOW RESEND BUTTON"); // Debug
      }
      // Check if it's wrong credentials
      else if (
        backendError.toLowerCase().includes("invalid") ||
        backendError.toLowerCase().includes("incorrect") ||
        backendError.toLowerCase().includes("password")
      ) {
        userMessage = "Invalid email or password. Please try again.";
        console.log("Wrong credentials"); // Debug
      }
      // Otherwise show backend message if available
      else if (backendError) {
        userMessage = backendError;
        console.log("Using raw message"); // Debug
      }

      console.log("showResendButton state:", showResendButton); // Debug

      setErrors({
        general: userMessage,
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
        color: "white",
      }}
    >
      <DarkVeil />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          width: "80vw",
          maxWidth: "1100px",
          height: "520px",
          borderRadius: "28px",
          border: "4px solid rgba(255,255,255,0.9)",
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
            justifyContent: "center",
            alignItems: "center",
            borderRight: "2px solid rgba(255,255,255,0.4)",
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

        {/* RIGHT: solid white content panel */}
        <div
          style={{
            flex: 1,
            backgroundColor: "rgba(255,255,255,0.98)",
            padding: "40px 56px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            color: "#111",
          }}
        >
          <h2
            style={{
              fontSize: "1.9rem",
              fontWeight: 700,
              marginBottom: "22px",
            }}
          >
            Login
          </h2>

          {/* General Error Message */}
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

          {/* Success Message for Resend */}
          {resendSuccess && (
            <div
              style={{
                marginBottom: "15px",
                padding: "12px",
                backgroundColor: "#fff5f5",
                color: "crimson",
                borderRadius: "12px",
                fontSize: "0.9rem",
                border: "1px solid crimson",
              }}
            >
              ✓ Verification email sent! Check your inbox.
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {/* Email Input */}
            <div>
              <input
                type="email"
                placeholder="Email"
                value={loginData.email}
                onChange={(e) =>
                  setLoginData({ ...loginData, email: e.target.value })
                }
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

            {/* Password Input */}
            <div>
              <PasswordField
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                placeholder="Password"
                style={{
                  width: "100%",
                  padding: "10px 15px",
                  borderRadius: "999px",
                  border: errors.password
                    ? "2px solid crimson"
                    : "1px solid #d0d0d0",
                  backgroundColor: "#f5f5f5",
                  fontSize: "0.95rem",
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

            <div
              style={{
                marginTop: "4px",
                marginBottom: "4px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {/* Resend Verification Button (only shows on verification error) */}
              {showResendButton ? (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isResending}
                  style={{
                    fontSize: "0.75rem",
                    color: "crimson",
                    background: "none",
                    border: "1px solid crimson",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    cursor: isResending ? "not-allowed" : "pointer",
                    opacity: isResending ? 0.5 : 1,
                    fontWeight: 500,
                  }}
                >
                  {isResending ? "Sending..." : "Resend email"}
                </button>
              ) : (
                <span></span>
              )}
                <a
                href="/forgot-password"
                style={{
                  fontSize: "0.85rem",
                  color: "crimson",
                  textDecoration: "none",
                }}
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                marginTop: "8px",
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
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>

          <p
            style={{
              marginTop: "16px",
              fontSize: "0.9rem",
            }}
          >
            Don't have an account?{" "}
            <a
              href="/register"
              style={{
                color: "crimson",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}