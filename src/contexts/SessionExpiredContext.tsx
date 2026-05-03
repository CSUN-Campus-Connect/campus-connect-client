"use client";

// Tracks whether the session-expired dialog should be shown.
// Once triggered, subsequent trigger() calls are ignored.

import { createContext, useCallback, useContext, useState } from "react";
import React from "react";

interface SessionExpiredContextValue {
  show: boolean;
  trigger: () => void;
  reset: () => void;
}

const SessionExpiredContext = createContext<SessionExpiredContextValue>({
  show: false,
  trigger: () => {},
  reset: () => {},
});

export function SessionExpiredProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  const trigger = useCallback(
    () => setShow((prev) => (prev ? prev : true)),
    []
  );

  // Called after redirect so the dialog closes even if the route didn't change
  const reset = useCallback(() => setShow(false), []);

  return (
    <SessionExpiredContext.Provider value={{ show, trigger, reset }}>
      {children}
    </SessionExpiredContext.Provider>
  );
}

export const useSessionExpired = () => useContext(SessionExpiredContext);
