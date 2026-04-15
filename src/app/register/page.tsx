"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/axios";
import type { PublicUser } from "../../types/profile";
import DarkVeil from "@/components/Landingpage/DarkVeil";
import PasswordField from "@/components/authTools/ViewFilter";
import { registerSchema, RegisterInput } from "@/lib/validators/auth.validators";
import { z } from "zod";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 15px",
  margin: "6px 0",
  borderRadius: "999px",
  border: "1px solid #d0d0d0",
  backgroundColor: "#f5f5f5",
  fontSize: "0.95rem",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  marginTop: "12px",
  backgroundColor: "crimson",
  color: "white",
  border: "none",
  padding: "12px",
  borderRadius: "999px",
  fontWeight: 600,
  fontSize: "1rem",
  cursor: "pointer",
};

export default function RegisterPage() {
  const router = useRouter();

  const [registerData, setRegisterData] = useState<RegisterInput>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    firstName?: string;
    lastName?: string;
    general?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Countdown timer
  useEffect(() => {
    if (isSuccess && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isSuccess && countdown === 0) {
      router.push("/login");
    }
  }, [isSuccess, countdown, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form data with Zod
    try {
      registerSchema.parse(registerData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: {
          email?: string;
          password?: string;
          confirmPassword?: string;
          firstName?: string;
          lastName?: string;
        } = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof typeof fieldErrors] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const { confirmPassword, ...apiData } = registerData;
      await api.post<PublicUser>("/api/v1/users/register", apiData);
      setIsSuccess(true);
    } catch (error: any) {
      setErrors({
        general:
          error?.response?.data?.message ||
          "Registration failed. Please try again.",
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
          width: "82vw",
          maxWidth: "1200px",
          height: "680px",
          borderRadius: "28px",
          border: "4px solid rgba(255,255,255,0.9)",
          overflow: "hidden",
          backgroundColor: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
        }}
      >
        {/* LEFT: solid white content side */}
        <div
          style={{
            flex: 1,
            backgroundColor: "rgba(255,255,255,0.98)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "40px 56px",
            color: "#111",
          }}
        >
          {!isSuccess ? (
            <>
              <h2
                style={{
                  marginBottom: "18px",
                  fontSize: "1.9rem",
                  fontWeight: 700,
                }}
              >
                Create Account
              </h2>

              {/* Password Requirements Box */}
              <div
                style={{
                  marginBottom: "15px",
                  padding: "10px 14px",
                  backgroundColor: "#fff5f5",
                  borderLeft: "3px solid crimson",
                  borderRadius: "4px",
                  fontSize: "0.8rem",
                  color: "#333",
                }}
              >
                <strong style={{ color: "crimson" }}>Password must have:</strong> 8+ chars, uppercase, lowercase, number, special character
              </div>

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

              <form
                onSubmit={handleSubmit}
                style={{ display: "flex", flexDirection: "column" }}
              >
                {/* First Name Input */}
                <div>
                  <input
                    type="text"
                    placeholder="First Name"
                    style={{
                      ...inputStyle,
                      border: errors.firstName
                        ? "2px solid crimson"
                        : "1px solid #d0d0d0",
                    }}
                    required
                    value={registerData.firstName}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        firstName: e.target.value,
                      })
                    }
                  />
                  {errors.firstName && (
                    <p
                      style={{
                        color: "crimson",
                        fontSize: "0.85rem",
                        marginTop: "2px",
                        marginLeft: "15px",
                      }}
                    >
                      {errors.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name Input */}
                <div>
                  <input
                    type="text"
                    placeholder="Last Name"
                    style={{
                      ...inputStyle,
                      border: errors.lastName
                        ? "2px solid crimson"
                        : "1px solid #d0d0d0",
                    }}
                    required
                    value={registerData.lastName}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, lastName: e.target.value })
                    }
                  />
                  {errors.lastName && (
                    <p
                      style={{
                        color: "crimson",
                        fontSize: "0.85rem",
                        marginTop: "2px",
                        marginLeft: "15px",
                      }}
                    >
                      {errors.lastName}
                    </p>
                  )}
                </div>

                {/* Email Input */}
                <div>
                  <input
                    type="email"
                    placeholder="CSUN Email Address"
                    style={{
                      ...inputStyle,
                      border: errors.email
                        ? "2px solid crimson"
                        : "1px solid #d0d0d0",
                    }}
                    required
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, email: e.target.value })
                    }
                  />
                  {errors.email && (
                    <p
                      style={{
                        color: "crimson",
                        fontSize: "0.85rem",
                        marginTop: "2px",
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
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, password: e.target.value })
                    }
                    placeholder="Password"
                    style={{
                      ...inputStyle,
                      border: errors.password
                        ? "2px solid crimson"
                        : "1px solid #d0d0d0",
                    }}
                  />
                  {errors.password && (
                    <p
                      style={{
                        color: "crimson",
                        fontSize: "0.85rem",
                        marginTop: "2px",
                        marginLeft: "15px",
                      }}
                    >
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div>
                  <PasswordField
                    value={registerData.confirmPassword}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Re-enter Password"
                    style={{
                      ...inputStyle,
                      border: errors.confirmPassword
                        ? "2px solid crimson"
                        : "1px solid #d0d0d0",
                    }}
                  />
                  {errors.confirmPassword && (
                    <p
                      style={{
                        color: "crimson",
                        fontSize: "0.85rem",
                        marginTop: "2px",
                        marginLeft: "15px",
                      }}
                    >
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <button
                  style={{
                    ...buttonStyle,
                    backgroundColor: isSubmitting ? "#999" : "crimson",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Account..." : "Sign-up"}
                </button>

                <p
                  style={{
                    marginTop: "10px",
                    fontSize: "0.9rem",
                  }}
                >
                  Already have an account?{" "}
                  <a
                    href="/login"
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
            // Success State - CSUN Red & White Theme
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "4rem",
                  color: "crimson",
                  marginBottom: "20px",
                }}
              >
                ✓
              </div>
              <h2
                style={{
                  fontSize: "1.9rem",
                  fontWeight: 700,
                  marginBottom: "16px",
                  color: "crimson",
                }}
              >
                Account Created!
              </h2>
              <p
                style={{
                  fontSize: "1rem",
                  color: "#333",
                  marginBottom: "30px",
                  lineHeight: "1.6",
                }}
              >
                Welcome to CampusConnect, <strong>{registerData.firstName}</strong>!
                <br />
                Redirecting to login in <strong style={{ color: "crimson" }}>{countdown}</strong> seconds...
              </p>

              <button
                onClick={() => router.push("/login")}
                style={{
                  ...buttonStyle,
                  backgroundColor: "crimson",
                  maxWidth: "300px",
                  margin: "0 auto",
                }}
              >
                Go to Login Now
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: translucent logo side with CSUN seal */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "24px",
            borderLeft: "2px solid rgba(255,255,255,0.4)",
          }}
        >
          <img
            src="/CSUNSeal-.png"
            alt="CSUN Seal"
            style={{ width: "190px", opacity: 0.96 }}
          />
        </div>
      </div>
    </main>
  );
}