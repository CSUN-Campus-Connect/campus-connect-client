"use client";

// Globally intercepts 401 responses and triggers the session-expired dialog
// when the server indicates the current session has been revoked or expired.

import { useEffect } from "react";
import { api } from "@/lib/axios";
import { useSessionExpired } from "@/contexts/SessionExpiredContext";

export function AxiosSessionInterceptor() {
  const { show, trigger } = useSessionExpired();

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        
        const hasToken = !!localStorage.getItem("token");
        const status = error?.response?.status;
        const message: string = error?.response?.data?.message ?? "";

        if (
          hasToken &&
          !show &&
          status === 401 &&
          (message === "Session has been invalidated" ||
            message === "Token expired" ||
            message === "Invalid token" ||
            message === "No token provided")
        ) {
          trigger();
        }

        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, [trigger, show]);

  return null;
}
