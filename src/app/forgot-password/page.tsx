"use client";

import React, { useState } from "react";
import { api } from "../../lib/axios";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail, CheckCircle } from "lucide-react";

const emailSchema = z.object({
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .refine((email) => email.toLowerCase().endsWith("@my.csun.edu"), {
      message: "Only @my.csun.edu email addresses are allowed",
    }),
});

const smooth: [number, number, number, number] = [0.16, 1, 0.3, 1];
const GRAY = "#767676";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ email?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    try {
      emailSchema.parse({ email });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { email?: string } = {};
        error.issues.forEach((issue) => {
          if (issue.path[0] === "email") fieldErrors.email = issue.message;
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await api.post("/api/v1/users/request-password-reset", { email });
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
    <div className="bg-white text-[#111] min-h-screen selection:bg-[#CC0033] selection:text-white flex flex-col">

      {/* Nav — matches homepage top bar exactly */}
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

      {/* Body — two column like homepage hero */}
      <div className="flex flex-1 flex-col md:flex-row min-h-0">

        {/* LEFT — big editorial headline */}
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
                Forgot
              </motion.h1>
            </div>
            <div className="overflow-hidden">
              <motion.h1
                className="text-[3.5rem] md:text-[5rem] lg:text-[6.5rem] font-extrabold leading-[0.92] tracking-tighter text-[#CC0033]"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.8, delay: 0.2, ease: smooth }}
              >
                password?
              </motion.h1>
            </div>
            <motion.p
              className="text-[14px] md:text-[15px] max-w-xs leading-relaxed font-light mt-6"
              style={{ color: GRAY }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5, ease: smooth }}
            >
              Enter your CSUN email and we&apos;ll send you a link to reset your password.
            </motion.p>
          </motion.div>
        </div>

        {/* Vertical divider */}
        <motion.div
          className="hidden md:block w-px bg-[#eee] self-stretch my-20"
          initial={{ scaleY: 0, originY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: smooth }}
        />

        {/* RIGHT — form */}
        <div className="flex-1 flex flex-col justify-center px-6 md:px-14 pb-16 md:pb-0">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: smooth }}
            className="max-w-sm w-full"
          >
            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
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
                      <div className="relative">
                        <Mail
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                          style={{ color: errors.email ? "#CC0033" : GRAY }}
                        />
                        <input
                          type="email"
                          placeholder="yourname@my.csun.edu"
                          aria-label="Email address"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 rounded-full text-[14px] font-light outline-none transition-all"
                          style={{
                            background: "#f5f5f5",
                            border: errors.email ? "1.5px solid #CC0033" : "1.5px solid #e0e0e0",
                            color: "#111",
                          }}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-[12px] mt-1.5 ml-4 font-light" style={{ color: "#CC0033" }}>
                          {errors.email}
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
                      {isSubmitting ? "Sending..." : "Send Reset Link"}
                      {!isSubmitting && (
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      )}
                    </button>
                  </form>

                  <p className="mt-6 text-[13px] font-light" style={{ color: GRAY }}>
                    Remember it?{" "}
                    <Link
                      href="/login"
                      className="font-semibold text-[#CC0033] hover:underline underline-offset-4"
                    >
                      Back to login
                    </Link>
                  </p>
                </motion.div>
              ) : (
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
                      Check your
                    </motion.p>
                  </div>
                  <div className="overflow-hidden mb-5">
                    <motion.p
                      className="text-[2.2rem] font-extrabold leading-[1] tracking-tight text-[#CC0033]"
                      initial={{ y: "110%" }}
                      animate={{ y: "0%" }}
                      transition={{ duration: 0.6, delay: 0.08, ease: smooth }}
                    >
                      email.
                    </motion.p>
                  </div>
                  <p className="text-[13px] font-light mb-1" style={{ color: GRAY }}>
                    We sent a reset link to
                  </p>
                  <p className="text-[14px] font-semibold text-[#111] mb-5">{email}</p>
                  <p className="text-[12px] font-light mb-6" style={{ color: GRAY }}>
                    Didn&apos;t get it? Check spam or{" "}
                    <button
                      onClick={() => { setIsSuccess(false); setEmail(""); }}
                      className="font-semibold text-[#CC0033] hover:underline underline-offset-4 bg-transparent border-none cursor-pointer p-0"
                    >
                      try again
                    </button>
                  </p>
                  <Link
                    href="/access/login"
                    className="group inline-flex items-center gap-2 bg-[#CC0033] text-white px-6 py-2.5 rounded-full text-[13px] font-semibold hover:opacity-90 transition-opacity"
                  >
                    Back to login
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Footer — matches homepage */}
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