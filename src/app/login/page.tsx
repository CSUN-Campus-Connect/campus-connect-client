'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { api } from '../../lib/axios';
import PasswordField from '@/components/authTools/ViewFilter';
import { PublicUser } from '@/types/profile';
import { loginSchema, LoginInput } from '@/lib/validators/auth.validators';
import { z } from 'zod';

const smooth: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function LoginPage() {
  const router = useRouter();
  React.useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (user && token) router.push('/dashboard');
  }, [router]);

  const [loginData, setLoginData] = useState<LoginInput>({ email: '', password: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendSuccess(false);
    try {
      await api.post('/api/v1/users/resend-verification', { email: loginData.email });
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (error: any) {
      setErrors({ general: error?.response?.data?.message || 'Failed to resend verification email' });
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setShowResendButton(false);
    setResendSuccess(false);
    try {
      loginSchema.parse(loginData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { email?: string; password?: string } = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) fieldErrors[issue.path[0] as keyof typeof fieldErrors] = issue.message;
        });
        setErrors(fieldErrors);
        return;
      }
    }
    setIsSubmitting(true);
    try {
      const response = await api.post<{ token: string; user: PublicUser }>('/api/v1/users/login', loginData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setIsLoading(true);
      setTimeout(() => router.push('/dashboard'), 1800);
    } catch (error: any) {
      const backendError = error?.response?.data?.message || error?.response?.data?.error || '';
      let userMessage = 'Something went wrong. Please try again.';
      if (backendError.toLowerCase().includes('verify') || backendError.toLowerCase().includes('verification')) {
        userMessage = 'Please verify your email before logging in. Check your inbox.';
        setShowResendButton(true);
      } else if (backendError.toLowerCase().includes('invalid') || backendError.toLowerCase().includes('incorrect') || backendError.toLowerCase().includes('password')) {
        userMessage = 'Invalid email or password.';
      } else if (backendError) {
        userMessage = backendError;
      }
      setErrors({ general: userMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#111] flex flex-col">

      {/* Login loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            role="status"
            aria-label="Signing in, please wait"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center gap-10"
          >
            {/* Wordmark — decorative in this context */}
            <motion.div
              aria-hidden="true"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: smooth }}
              className="flex items-center gap-3"
            >
              <Image src="/ToroConnectLP.png" alt="" width={28} height={28} className="w-7 h-7" />
              <span className="text-[13px] font-light tracking-wide text-[#999]">Toro Campus Connect</span>
            </motion.div>

            {/* Three-dot pulse — decorative */}
            <div aria-hidden="true" className="flex items-center gap-3">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[#CC0033]"
                  animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
                />
              ))}
            </div>

            {/* Animated red line — decorative */}
            <motion.div
              aria-hidden="true"
              className="absolute bottom-0 left-0 h-[3px] bg-[#CC0033]"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.6, ease: smooth }}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
        <Link href="/register" className="text-[13px] font-semibold text-[#CC0033] hover:underline underline-offset-4">
          Sign up
        </Link>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row max-w-6xl mx-auto w-full px-6 md:px-14 py-16 md:py-24 gap-16 md:gap-24">

        {/* LEFT — headline editorial block */}
        <div className="flex flex-col justify-center md:w-[45%]">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: smooth }}
          >
            <p className="text-[11px] font-semibold tracking-[0.15em] text-[#CC0033] uppercase mb-6">
              Welcome back
            </p>
            <div className="overflow-hidden mb-1">
              <motion.h1
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 0.8, delay: 0.25, ease: smooth }}
                className="text-[3.5rem] md:text-[5rem] font-extralight leading-[0.92] tracking-tighter"
              >
                Your
              </motion.h1>
            </div>
            <div className="overflow-hidden mb-1">
              <motion.h1
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 0.8, delay: 0.35, ease: smooth }}
                className="text-[3.5rem] md:text-[5rem] font-extralight leading-[0.92] tracking-tighter"
              >
                campus
              </motion.h1>
            </div>
            <div className="overflow-hidden mb-6">
              <motion.h1
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 0.8, delay: 0.45, ease: smooth }}
                className="text-[3.5rem] md:text-[5rem] font-extrabold leading-[0.92] tracking-tighter text-[#CC0033]"
              >
                awaits.
              </motion.h1>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6, ease: smooth }}
              className="text-[14px] text-[#aaa] font-light leading-relaxed max-w-xs"
            >
              Sign in to access your feed, messages, clubs, marketplace, and everything CSUN.
            </motion.p>
          </motion.div>
        </div>

        {/* RIGHT — form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: smooth }}
          className="flex flex-col justify-center md:w-[55%]"
        >
          {/* Error banner — role="alert" announces it to screen readers immediately */}
          {errors.general && (
            <motion.div
              role="alert"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 px-4 py-3 border border-[#CC0033]/30 bg-[#CC0033]/5 text-[13px] text-[#CC0033]"
            >
              {errors.general}
              {showResendButton && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="ml-3 text-[12px] underline underline-offset-2 opacity-80 hover:opacity-100 transition-opacity disabled:opacity-40"
                >
                  {isResending ? 'Sending…' : 'Resend email'}
                </button>
              )}
            </motion.div>
          )}

          {/* Success banner — role="status" announces politely without interrupting */}
          {resendSuccess && (
            <motion.div
              role="status"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 px-4 py-3 border border-[#111]/10 bg-[#FAFAF7] text-[13px] text-[#555]"
            >
              Verification email sent — check your inbox.
            </motion.div>
          )}

          <form onSubmit={handleSubmit} aria-label="Sign in" noValidate className="flex flex-col gap-0">

            {/* Email */}
            <div className="border-t border-[#eee] pt-5 pb-5">
              <label
                htmlFor="login-email"
                className="block text-[11px] font-semibold tracking-[0.12em] text-[#999] uppercase mb-2"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="your.name@my.csun.edu"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                aria-describedby={errors.email ? 'login-email-error' : undefined}
                aria-invalid={!!errors.email}
                className="w-full bg-transparent text-[15px] font-light text-[#111] placeholder-[#ccc] border-0 border-b border-[#e0e0e0] focus:border-[#CC0033] focus:outline-none pb-2 transition-colors duration-200"
              />
              {errors.email && (
                <p id="login-email-error" role="alert" className="mt-2 text-[12px] text-[#CC0033]">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="border-t border-[#eee] pt-5 pb-5">
              <label
                htmlFor="login-password"
                className="block text-[11px] font-semibold tracking-[0.12em] text-[#999] uppercase mb-2"
              >
                Password
              </label>
              <PasswordField
                id="login-password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                placeholder="••••••••"
                aria-describedby={errors.password ? 'login-password-error' : undefined}
                aria-invalid={!!errors.password}
                autoComplete="current-password"
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
                <p id="login-password-error" role="alert" className="mt-2 text-[12px] text-[#CC0033]">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="border-t border-[#eee]" />

            {/* Actions row */}
            <div className="flex items-center justify-between mt-8">
              <Link
                href="/forgot-password"
                className="text-[12px] text-[#bbb] hover:text-[#CC0033] transition-colors underline-offset-4"
              >
                Forgot password?
              </Link>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex items-center gap-3 bg-[#111] text-white px-8 py-4 text-[13px] font-semibold hover:bg-[#CC0033] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Signing in…' : 'Sign in'}
                <ArrowRight aria-hidden="true" className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </div>
          </form>

          <p className="mt-10 text-[13px] text-[#aaa] font-light">
            New to CampusConnect?{' '}
            <Link href="/register" className="text-[#CC0033] font-semibold hover:underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Bottom strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="px-6 md:px-14 py-6 border-t border-black/4 flex items-center justify-between"
      >
        <p className="text-[11px] text-[#ccc] font-light">© 2026 CampusConnect. COMP 490 Senior Design.</p>
        <p className="text-[11px] text-[#ccc] font-light">Not affiliated with CSUN.</p>
      </motion.div>
    </div>
  );
}