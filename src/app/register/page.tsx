'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { api } from '../../lib/axios';
import PasswordField from '@/components/authTools/ViewFilter';
import { registerSchema, RegisterInput } from '@/lib/validators/auth.validators';
import { z } from 'zod';
import type { PublicUser } from '../../types/profile';

const smooth: [number, number, number, number] = [0.16, 1, 0.3, 1];
const GRAY = "#767676";

export default function RegisterPage() {
  const router = useRouter();

  const [registerData, setRegisterData] = useState<RegisterInput & { phoneNumber?: string }>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: '',
    phoneNumber: '',
  });

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    general?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (isSuccess && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isSuccess && countdown === 0) {
      router.push('/login');
    }
  }, [isSuccess, countdown, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    try {
      registerSchema.parse(registerData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: {
          email?: string; password?: string;
          confirmPassword?: string; firstName?: string; lastName?: string;
        } = {};
        error.issues.forEach((err) => {
          if (err.path[0]) fieldErrors[err.path[0] as keyof typeof fieldErrors] = err.message;
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const { confirmPassword, ...apiData } = registerData;
      if (!apiData.phoneNumber?.trim()) delete apiData.phoneNumber;
      await api.post<PublicUser>('/api/v1/users/register', apiData);
      setIsSuccess(true);
    } catch (error: any) {
      setErrors({ general: error?.response?.data?.message || 'Registration failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#111] flex flex-col">

      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.1 }}
        className="flex items-center justify-between px-6 md:px-14 pt-8"
      >
        <Link href="/" className="flex items-center gap-3">
          <Image src="/ToroConnectLP.png" alt="Toro Campus Connect" width={32} height={32} className="w-8 h-8" />
          <span className="text-[13px] font-light tracking-wide" style={{ color: GRAY }}>Toro Campus Connect</span>
        </Link>
        <Link href="/login" className="text-[13px] font-semibold text-[#CC0033] hover:underline underline-offset-4">
          Sign in
        </Link>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row max-w-6xl mx-auto w-full px-6 md:px-14 py-12 md:py-20 gap-16 md:gap-24">

        {/* LEFT — editorial headline */}
        <div className="flex flex-col justify-center md:w-[45%]">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: smooth }}
          >
            <p className="text-[11px] font-semibold tracking-[0.15em] text-[#CC0033] uppercase mb-6">
              Join CampusConnect
            </p>
            <div className="overflow-hidden mb-1">
              <motion.h1
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 0.8, delay: 0.25, ease: smooth }}
                className="text-[3.5rem] md:text-[5rem] font-extralight leading-[0.92] tracking-tighter"
              >
                Be part
              </motion.h1>
            </div>
            <div className="overflow-hidden mb-1">
              <motion.h1
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 0.8, delay: 0.35, ease: smooth }}
                className="text-[3.5rem] md:text-[5rem] font-extralight leading-[0.92] tracking-tighter"
              >
                of your
              </motion.h1>
            </div>
            <div className="overflow-hidden mb-6">
              <motion.h1
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 0.8, delay: 0.45, ease: smooth }}
                className="text-[3.5rem] md:text-[5rem] font-extrabold leading-[0.92] tracking-tighter text-[#CC0033]"
              >
                campus.
              </motion.h1>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6, ease: smooth }}
              className="text-[14px] font-light leading-relaxed max-w-xs"
              style={{ color: GRAY }}
            >
              One account. Your feed, clubs, marketplace, events, and everything CSUN in one place.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.75 }}
              className="mt-8 pt-6 border-t border-[#eee]"
            >
              <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-2" style={{ color: GRAY }}>
                Password requirements
              </p>
              <p className="text-[12px] font-light leading-relaxed" style={{ color: GRAY }}>
                8+ characters — uppercase, lowercase,<br />number, special character.
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* RIGHT — form or success */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: smooth }}
          className="flex flex-col justify-center md:w-[55%]"
        >
          {!isSuccess ? (
            <>
              {errors.general && (
                <motion.div
                  role="alert"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 px-4 py-3 border border-[#CC0033]/30 bg-[#CC0033]/5 text-[13px] text-[#CC0033]"
                >
                  {errors.general}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} aria-label="Create account" noValidate className="flex flex-col gap-0">

                {/* First + Last Name row */}
                <div className="border-t border-[#eee] pt-5 pb-5 grid grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="reg-first-name"
                      className="block text-[11px] font-semibold tracking-[0.12em] uppercase mb-2"
                      style={{ color: GRAY }}
                    >
                      First Name
                    </label>
                    <input
                      id="reg-first-name"
                      type="text"
                      autoComplete="given-name"
                      placeholder="Jane"
                      value={registerData.firstName}
                      onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                      aria-describedby={errors.firstName ? 'reg-first-name-error' : undefined}
                      aria-invalid={!!errors.firstName}
                      className="w-full bg-transparent text-[15px] font-light text-[#111] placeholder-[#ccc] border-0 border-b border-[#e0e0e0] focus:border-[#CC0033] focus:outline-none pb-2 transition-colors duration-200"
                    />
                    {errors.firstName && (
                      <p id="reg-first-name-error" role="alert" className="mt-2 text-[12px] text-[#CC0033]">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="reg-last-name"
                      className="block text-[11px] font-semibold tracking-[0.12em] uppercase mb-2"
                      style={{ color: GRAY }}
                    >
                      Last Name
                    </label>
                    <input
                      id="reg-last-name"
                      type="text"
                      autoComplete="family-name"
                      placeholder="Doe"
                      value={registerData.lastName}
                      onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                      aria-describedby={errors.lastName ? 'reg-last-name-error' : undefined}
                      aria-invalid={!!errors.lastName}
                      className="w-full bg-transparent text-[15px] font-light text-[#111] placeholder-[#ccc] border-0 border-b border-[#e0e0e0] focus:border-[#CC0033] focus:outline-none pb-2 transition-colors duration-200"
                    />
                    {errors.lastName && (
                      <p id="reg-last-name-error" role="alert" className="mt-2 text-[12px] text-[#CC0033]">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="border-t border-[#eee] pt-5 pb-5">
                  <label
                    htmlFor="reg-email"
                    className="block text-[11px] font-semibold tracking-[0.12em] uppercase mb-2"
                    style={{ color: GRAY }}
                  >
                    CSUN Email
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    placeholder="your.name@my.csun.edu"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    aria-describedby={errors.email ? 'reg-email-error' : undefined}
                    aria-invalid={!!errors.email}
                    className="w-full bg-transparent text-[15px] font-light text-[#111] placeholder-[#ccc] border-0 border-b border-[#e0e0e0] focus:border-[#CC0033] focus:outline-none pb-2 transition-colors duration-200"
                  />
                  {errors.email && (
                    <p id="reg-email-error" role="alert" className="mt-2 text-[12px] text-[#CC0033]">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="border-t border-[#eee] pt-5 pb-5">
                  <label
                    htmlFor="reg-phone"
                    className="block text-[11px] font-semibold tracking-[0.12em] uppercase mb-2"
                    style={{ color: GRAY }}
                  >
                    Phone Number{' '}
                    <span className="normal-case font-light tracking-normal" style={{ color: GRAY }}>— optional</span>
                  </label>
                  <input
                    id="reg-phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+1 (818) 555-0100"
                    value={registerData.phoneNumber || ''}
                    onChange={(e) => setRegisterData({ ...registerData, phoneNumber: e.target.value })}
                    aria-describedby={
                      errors.phoneNumber
                        ? 'reg-phone-hint reg-phone-error'
                        : 'reg-phone-hint'
                    }
                    aria-invalid={!!errors.phoneNumber}
                    className="w-full bg-transparent text-[15px] font-light text-[#111] placeholder-[#ccc] border-0 border-b border-[#e0e0e0] focus:border-[#CC0033] focus:outline-none pb-2 transition-colors duration-200"
                  />
                  <p id="reg-phone-hint" className="mt-2 text-[11px] font-light" style={{ color: GRAY }}>
                    Only used for emergency safety alerts. Never shared or used for marketing.
                  </p>
                  {errors.phoneNumber && (
                    <p id="reg-phone-error" role="alert" className="mt-1 text-[12px] text-[#CC0033]">
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="border-t border-[#eee] pt-5 pb-5">
                  <label
                    htmlFor="reg-password"
                    className="block text-[11px] font-semibold tracking-[0.12em] uppercase mb-2"
                    style={{ color: GRAY }}
                  >
                    Password
                  </label>
                  <PasswordField
                    id="reg-password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    aria-describedby={errors.password ? 'reg-password-error' : undefined}
                    aria-invalid={!!errors.password}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      fontSize: '15px',
                      fontWeight: 300,
                      color: '#111',
                      border: 'none',
                      borderBottom: errors.password ? '1px solid #CC0033' : '1px solid #e0e0e0',
                      borderRadius: 0,
                      padding: '0 0 8px 0',
                      outline: 'none',
                    }}
                  />
                  {errors.password && (
                    <p id="reg-password-error" role="alert" className="mt-2 text-[12px] text-[#CC0033]">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="border-t border-[#eee] pt-5 pb-5">
                  <label
                    htmlFor="reg-confirm-password"
                    className="block text-[11px] font-semibold tracking-[0.12em] uppercase mb-2"
                    style={{ color: GRAY }}
                  >
                    Confirm Password
                  </label>
                  <PasswordField
                    id="reg-confirm-password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    aria-describedby={errors.confirmPassword ? 'reg-confirm-password-error' : undefined}
                    aria-invalid={!!errors.confirmPassword}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      fontSize: '15px',
                      fontWeight: 300,
                      color: '#111',
                      border: 'none',
                      borderBottom: errors.confirmPassword ? '1px solid #CC0033' : '1px solid #e0e0e0',
                      borderRadius: 0,
                      padding: '0 0 8px 0',
                      outline: 'none',
                    }}
                  />
                  {errors.confirmPassword && (
                    <p id="reg-confirm-password-error" role="alert" className="mt-2 text-[12px] text-[#CC0033]">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <div className="border-t border-[#eee]" />

                {/* Submit */}
                <div className="flex items-center justify-between mt-8">
                  <p className="text-[13px] font-light" style={{ color: GRAY }}>
                    Already have an account?{' '}
                    <Link href="/login" className="text-[#CC0033] font-semibold hover:underline underline-offset-4">
                      Sign in
                    </Link>
                  </p>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    className="group inline-flex items-center gap-3 bg-[#CC0033] text-white px-8 py-4 text-[13px] font-semibold hover:bg-[#a80028] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Creating account…' : 'Create account'}
                    <ArrowRight aria-hidden="true" className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </motion.button>
                </div>

              </form>
            </>
          ) : (
            /* Success state */
            <motion.div
              role="status"
              aria-label="Account created successfully"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: smooth }}
            >
              <div className="overflow-hidden mb-1">
                <motion.h2
                  initial={{ y: '110%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 0.8, ease: smooth }}
                  className="text-[3rem] md:text-[4rem] font-extralight leading-[0.92] tracking-tighter"
                >
                  Account
                </motion.h2>
              </div>
              <div className="overflow-hidden mb-8">
                <motion.h2
                  initial={{ y: '110%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 0.8, delay: 0.1, ease: smooth }}
                  className="text-[3rem] md:text-[4rem] font-extrabold leading-[0.92] tracking-tighter text-[#CC0033]"
                >
                  created.
                </motion.h2>
              </div>

              <p className="text-[14px] font-light leading-relaxed mb-10" style={{ color: GRAY }}>
                Check your inbox and verify your email to get started.
                <br />
                <span className="text-[12px]" style={{ color: GRAY }}>
                  Heading to login in{' '}
                  <span aria-live="polite" className="text-[#CC0033] font-semibold tabular-nums">
                    {countdown}s
                  </span>…
                </span>
              </p>

              <motion.button
                onClick={() => router.push('/login')}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex items-center gap-3 bg-[#111] text-white px-8 py-4 text-[13px] font-semibold hover:bg-[#CC0033] transition-colors duration-300"
              >
                Go to login
                <ArrowRight aria-hidden="true" className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </motion.div>
          )}

        </motion.div>
      </div>

      {/* Bottom strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="px-6 md:px-14 py-6 border-t border-black/[0.04] flex items-center justify-between"
      >
        <p className="text-[11px] font-light" style={{ color: GRAY }}>© 2026 CampusConnect. COMP 490 Senior Design.</p>
        <p className="text-[11px] font-light" style={{ color: GRAY }}>Not affiliated with CSUN.</p>
      </motion.div>

    </div>
  );
}