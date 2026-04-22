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
      // Strip empty phone number so the backend treats it as null
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
          <span className="text-[13px] font-light tracking-wide text-[#999]">Toro Campus Connect</span>
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
              className="text-[14px] text-[#aaa] font-light leading-relaxed max-w-xs"
            >
              One account. Your feed, clubs, marketplace, events, and everything CSUN in one place.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.75 }}
              className="mt-8 pt-6 border-t border-[#eee]"
            >
              <p className="text-[11px] font-semibold tracking-[0.12em] text-[#bbb] uppercase mb-2">
                Password requirements
              </p>
              <p className="text-[12px] text-[#ccc] font-light leading-relaxed">
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
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 px-4 py-3 border border-[#CC0033]/30 bg-[#CC0033]/5 text-[13px] text-[#CC0033]"
                >
                  {errors.general}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-0">

                {/* First + Last Name row */}
                <div className="border-t border-[#eee] pt-5 pb-5 grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-semibold tracking-[0.12em] text-[#999] uppercase mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      placeholder="Jane"
                      value={registerData.firstName}
                      onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                      className="w-full bg-transparent text-[15px] font-light text-[#111] placeholder-[#ccc] border-0 border-b border-[#e0e0e0] focus:border-[#CC0033] focus:outline-none pb-2 transition-colors duration-200"
                    />
                    {errors.firstName && <p className="mt-2 text-[12px] text-[#CC0033]">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold tracking-[0.12em] text-[#999] uppercase mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      placeholder="Doe"
                      value={registerData.lastName}
                      onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                      className="w-full bg-transparent text-[15px] font-light text-[#111] placeholder-[#ccc] border-0 border-b border-[#e0e0e0] focus:border-[#CC0033] focus:outline-none pb-2 transition-colors duration-200"
                    />
                    {errors.lastName && <p className="mt-2 text-[12px] text-[#CC0033]">{errors.lastName}</p>}
                  </div>
                </div>

                {/* Email */}
                <div className="border-t border-[#eee] pt-5 pb-5">
                  <label className="block text-[11px] font-semibold tracking-[0.12em] text-[#999] uppercase mb-2">
                    CSUN Email
                  </label>
                  <input
                    type="email"
                    placeholder="your.name@my.csun.edu"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="w-full bg-transparent text-[15px] font-light text-[#111] placeholder-[#ccc] border-0 border-b border-[#e0e0e0] focus:border-[#CC0033] focus:outline-none pb-2 transition-colors duration-200"
                  />
                  {errors.email && <p className="mt-2 text-[12px] text-[#CC0033]">{errors.email}</p>}
                </div>

                {/* Phone Number */}
                <div className="border-t border-[#eee] pt-5 pb-5">
                  <label className="block text-[11px] font-semibold tracking-[0.12em] text-[#999] uppercase mb-2">
                    Phone Number{' '}
                    <span className="text-[#ccc] normal-case font-light tracking-normal">— optional</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (818) 555-0100"
                    value={registerData.phoneNumber || ''}
                    onChange={(e) => setRegisterData({ ...registerData, phoneNumber: e.target.value })}
                    className="w-full bg-transparent text-[15px] font-light text-[#111] placeholder-[#ccc] border-0 border-b border-[#e0e0e0] focus:border-[#CC0033] focus:outline-none pb-2 transition-colors duration-200"
                  />
                  <p className="mt-2 text-[11px] text-[#ccc] font-light">
                    Only used for emergency safety alerts. Never shared or used for marketing.
                  </p>
                  {errors.phoneNumber && <p className="mt-1 text-[12px] text-[#CC0033]">{errors.phoneNumber}</p>}
                </div>

                {/* Password */}
                <div className="border-t border-[#eee] pt-5 pb-5">
                  <label className="block text-[11px] font-semibold tracking-[0.12em] text-[#999] uppercase mb-2">
                    Password
                  </label>
                  <PasswordField
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    placeholder="••••••••"
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
                  {errors.password && <p className="mt-2 text-[12px] text-[#CC0033]">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div className="border-t border-[#eee] pt-5 pb-5">
                  <label className="block text-[11px] font-semibold tracking-[0.12em] text-[#999] uppercase mb-2">
                    Confirm Password
                  </label>
                  <PasswordField
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
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
                  {errors.confirmPassword && <p className="mt-2 text-[12px] text-[#CC0033]">{errors.confirmPassword}</p>}
                </div>

                <div className="border-t border-[#eee]" />

                {/* Submit */}
                <div className="flex items-center justify-between mt-8">
                  <p className="text-[13px] text-[#aaa] font-light">
                    Already have an account?{' '}
                    <Link href="/login" className="text-[#CC0033] font-semibold hover:underline underline-offset-4">
                      Sign in
                    </Link>
                  </p>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    className="group inline-flex items-center gap-3 bg-[#CC0033] text-white px-8 py-4 text-[13px] font-semibold hover:bg-[#a80028] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Creating account…' : 'Create account'}
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </motion.button>
                </div>

              </form>
            </>
          ) : (
            <motion.div
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

              <p className="text-[14px] text-[#aaa] font-light leading-relaxed mb-10">
                Check your inbox and verify your email to get started.
                <br />
                <span className="text-[12px] text-[#ccc]">
                  Heading to login in{' '}
                  <span className="text-[#CC0033] font-semibold tabular-nums">{countdown}s</span>…
                </span>
              </p>

              <motion.button
                onClick={() => router.push('/login')}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex items-center gap-3 bg-[#111] text-white px-8 py-4 text-[13px] font-semibold hover:bg-[#CC0033] transition-colors duration-300"
              >
                Go to login
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
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
        <p className="text-[11px] text-[#ccc] font-light">© 2026 CampusConnect. COMP 490 Senior Design.</p>
        <p className="text-[11px] text-[#ccc] font-light">Not affiliated with CSUN.</p>
      </motion.div>

    </div>
  );
}