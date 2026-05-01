"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "../../lib/axios";
import PasswordField from "@/components/authTools/ViewFilter";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle, XCircle } from "lucide-react";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must be less than 100 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

const smooth: [number, number, number, number] = [0.16, 1, 0.3, 1];
const GRAY = "#767676";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [tokenStatus, setTokenStatus] = useState<"checking" | "valid" | "invalid">("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setTokenStatus("invalid");
      return;
    }
    api
      .get(`/api/v1/users/validate-reset-token?token=${token}`)
      .then((res) => setTokenStatus(res.data.valid ? "valid" : "invalid"))
      .catch(() => setTokenStatus("invalid"));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

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
      setTimeout(() => router.push("/login"), 2500);
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
    <div className="bg-white text-[#111] min-h-screen selection:bg-[#CC0033] selection:text-white flex flex-col">

      {/* Nav */}
      <div className="flex items-center justify-between px-6 md:px-14 pt-8">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/ToroConnectLP.png" alt="Toro Campus Connect" width={36} height={36} className="w-9 h-9" />
          <span className="text-[13px] font-light tracking-wide" style={{ color: GRAY }}>
            Toro Campus Connect
          </span>
        </Link>
        <Link
          href="/login"
          className="text-[13px] font-semibold text-[#CC0033] hover:underline underline-offset-4 decoration-[#CC0033]"
        >
          Login
        </Link>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col md:flex-row min-h-0">

        {/* LEFT — headline */}
        <div className="flex-1 flex flex-col justify-center px-6 md:px-14 py-16 md:py-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: smooth }}
          >
            <div className="overflow-hidden">
              <motion.h1
                className="text-[3.5rem] md:text-[5rem] lg:text-[6.5rem] font-extralight leading-[0.92] tracking-tighter text-[#111]"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.8, delay: 0.1, ease: smooth }}
              >
                Reset your
              </motion.h1>
            </div>
            <div className="overflow-hidden">
              <motion.h1
                className="text-[3.5rem] md:text-[5rem] lg:text-[6.5rem] font-extrabold leading-[0.92] tracking-tighter text-[#CC0033]"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.8, delay: 0.2, ease: smooth }}
              >
                password.
              </motion.h1>
            </div>
            <motion.div
              className="flex flex-wrap gap-x-3 gap-y-1 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5, ease: smooth }}
            >
              {["8+ characters", "uppercase", "lowercase", "number", "special character"].map((req) => (
                <span key={req} className="text-[12px] font-light" style={{ color: GRAY }}>
                  · {req}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Vertical divider */}
        <motion.div
          className="hidden md:block w-px bg-[#eee] self-stretch my-20"
          initial={{ scaleY: 0, originY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: smooth }}
        />

        {/* RIGHT — dynamic content based on token status */}
        <div className="flex-1 flex flex-col justify-center px-6 md:px-14 pb-16 md:pb-0">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: smooth }}
            className="max-w-sm w-full"
          >
            <AnimatePresence mode="wait">

              {/* Checking — spinner */}
              {tokenStatus === "checking" && (
                <motion.div
                  key="checking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3"
                >
                  <div
                    className="w-5 h-5 rounded-full border-2 border-[#CC0033] border-t-transparent animate-spin"
                  />
                  <p className="text-[13px] font-light" style={{ color: GRAY }}>
                    Validating link&hellip;
                  </p>
                </motion.div>
              )}

              {/* Invalid token */}
              {tokenStatus === "invalid" && (
                <motion.div
                  key="invalid"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: smooth }}
                >
                  <XCircle className="w-8 h-8 mb-5" style={{ color: "#CC0033" }} />
                  <div className="overflow-hidden mb-0.5">
                    <motion.p
                      className="text-[2rem] font-extralight leading-[1] tracking-tight text-[#111]"
                      initial={{ y: "110%" }}
                      animate={{ y: "0%" }}
                      transition={{ duration: 0.6, ease: smooth }}
                    >
                      Link expired
                    </motion.p>
                  </div>
                  <div className="overflow-hidden mb-5">
                    <motion.p
                      className="text-[2rem] font-extrabold leading-[1] tracking-tight text-[#CC0033]"
                      initial={{ y: "110%" }}
                      animate={{ y: "0%" }}
                      transition={{ duration: 0.6, delay: 0.08, ease: smooth }}
                    >
                      or invalid.
                    </motion.p>
                  </div>
                  <p className="text-[13px] font-light mb-6 leading-relaxed" style={{ color: GRAY }}>
                    This reset link has already been used or has expired. Request a new one below.
                  </p>
                  <Link
                    href="/forgot-password"
                    className="group inline-flex items-center gap-2 bg-[#CC0033] text-white px-6 py-2.5 rounded-full text-[13px] font-semibold hover:opacity-90 transition-opacity"
                  >
                    Request new link
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <p className="mt-4 text-[13px] font-light" style={{ color: GRAY }}>
                    <Link href="/login" className="font-semibold text-[#CC0033] hover:underline underline-offset-4">
                      Back to login
                    </Link>
                  </p>
                </motion.div>
              )}

              {/* Valid token — show form */}
              {tokenStatus === "valid" && !isSuccess && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4, ease: smooth }}
                >
                  <AnimatePresence>
                    {errors.general && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-5 px-4 py-3 rounded-xl text-[13px] font-light border border-[#CC0033] text-[#CC0033] bg-[#fff5f5]"
                      >
                        {errors.general}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div>
                      <PasswordField
                        aria-label="New password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="New Password"
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: "999px",
                          border: errors.password ? "1.5px solid #CC0033" : "1.5px solid #e0e0e0",
                          background: "#f5f5f5",
                          fontSize: "14px",
                          fontWeight: 300,
                          color: "#111",
                          outline: "none",
                        }}
                      />
                      {errors.password && (
                        <p className="text-[12px] mt-1.5 ml-4 font-light" style={{ color: "#CC0033" }}>
                          {errors.password}
                        </p>
                      )}
                    </div>

                    <div>
                      <PasswordField
                        aria-label="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: "999px",
                          border: errors.confirmPassword ? "1.5px solid #CC0033" : "1.5px solid #e0e0e0",
                          background: "#f5f5f5",
                          fontSize: "14px",
                          fontWeight: 300,
                          color: "#111",
                          outline: "none",
                        }}
                      />
                      {errors.confirmPassword && (
                        <p className="text-[12px] mt-1.5 ml-4 font-light" style={{ color: "#CC0033" }}>
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group mt-1 w-full py-3 rounded-full text-[14px] font-semibold flex items-center justify-center gap-2 transition-opacity"
                      style={{
                        background: isSubmitting ? "#aaa" : "#CC0033",
                        color: "white",
                        cursor: isSubmitting ? "not-allowed" : "pointer",
                        opacity: isSubmitting ? 0.7 : 1,
                      }}
                    >
                      {isSubmitting ? "Resetting..." : "Reset Password"}
                      {!isSubmitting && (
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      )}
                    </button>
                  </form>

                  <p className="mt-6 text-[13px] font-light" style={{ color: GRAY }}>
                    <Link href="/login" className="font-semibold text-[#CC0033] hover:underline underline-offset-4">
                      Back to login
                    </Link>
                  </p>
                </motion.div>
              )}

              {/* Success */}
              {isSuccess && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: smooth }}
                >
                  <CheckCircle className="w-8 h-8 mb-5" style={{ color: "#CC0033" }} />
                  <div className="overflow-hidden mb-0.5">
                    <motion.p
                      className="text-[2.2rem] font-extralight leading-[1] tracking-tight text-[#111]"
                      initial={{ y: "110%" }}
                      animate={{ y: "0%" }}
                      transition={{ duration: 0.6, ease: smooth }}
                    >
                      Password
                    </motion.p>
                  </div>
                  <div className="overflow-hidden mb-5">
                    <motion.p
                      className="text-[2.2rem] font-extrabold leading-[1] tracking-tight text-[#CC0033]"
                      initial={{ y: "110%" }}
                      animate={{ y: "0%" }}
                      transition={{ duration: 0.6, delay: 0.08, ease: smooth }}
                    >
                      reset.
                    </motion.p>
                  </div>
                  <p className="text-[13px] font-light mb-6" style={{ color: GRAY }}>
                    You&apos;re all set. Redirecting to login&hellip;
                  </p>
                  <div className="w-full h-[2px] rounded-full overflow-hidden mb-6" style={{ background: "#f0f0f0" }}>
                    <motion.div
                      className="h-full rounded-full bg-[#CC0033]"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2.5, ease: "linear" }}
                    />
                  </div>
                  <Link
                    href="/login"
                    className="group inline-flex items-center gap-2 bg-[#CC0033] text-white px-6 py-2.5 rounded-full text-[13px] font-semibold hover:opacity-90 transition-opacity"
                  >
                    Go to login
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 md:px-14 pb-8 mt-auto">
        <div className="border-t border-black/[0.04] pt-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <p className="text-[11px] font-light" style={{ color: GRAY }}>
            © 2026 CampusConnect. Not affiliated with California State University, Northridge.
          </p>
          <p className="text-[11px] font-light" style={{ color: GRAY }}>
            COMP 490 Senior Design 2025–2026
          </p>
        </div>
      </div>

    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white min-h-screen flex items-center justify-center">
          <p className="text-[14px] font-light" style={{ color: "#767676" }}>Loading&hellip;</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}