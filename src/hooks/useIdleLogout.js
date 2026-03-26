// src/hooks/useIdleLogout.js
import { useEffect, useRef, useCallback } from "react";

const IDLE_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "click",
];

/**
 * useIdleLogout
 *
 * Logs the user out after `timeoutMs` of inactivity.
 * Resets the timer on any mouse, keyboard, or touch event.
 *
 * @param {Function} onLogout  – call your authContext logout() here
 * @param {number}   timeoutMs – idle timeout in ms (default: 30 minutes)
 */
export function useIdleLogout(onLogout, timeoutMs = 30 * 60 * 1000) {
  const timerRef = useRef(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onLogout();
    }, timeoutMs);
  }, [onLogout, timeoutMs]);

  useEffect(() => {
    // Start the timer immediately on mount
    resetTimer();

    // Reset on any user activity
    IDLE_EVENTS.forEach((event) =>
      window.addEventListener(event, resetTimer, { passive: true }),
    );

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      IDLE_EVENTS.forEach((event) =>
        window.removeEventListener(event, resetTimer),
      );
    };
  }, [resetTimer]);
}
