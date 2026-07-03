'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { ReauthModal } from './reauth-modal';

const ACCESS_TOKEN_REFRESH_BUFFER_MS = 60 * 1000;

export function AuthSessionSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, update } = useSession();
  const accessTokenExpiresAt = session?.user?.accessTokenExpiresAt;
  const isExpired = session?.error === 'RefreshAccessTokenError';
  const [shouldShowReauth, setShouldShowReauth] = useState(false);

  // Reset reauth state during render phase if isExpired transitions to false
  const [prevIsExpired, setPrevIsExpired] = useState(isExpired);
  if (isExpired !== prevIsExpired) {
    setPrevIsExpired(isExpired);
    if (!isExpired) {
      setShouldShowReauth(false);
    }
  }

  // 1. Sync on window focus (effective for inactive laptops and tab waking)
  useEffect(() => {
    if (!accessTokenExpiresAt || isExpired) return;

    const handleFocus = () => {
      const timeRemaining = accessTokenExpiresAt - Date.now();
      if (timeRemaining < ACCESS_TOKEN_REFRESH_BUFFER_MS) {
        void update();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [accessTokenExpiresAt, isExpired, update]);

  // 2. Active Heartbeat: Keep session alive based on physical user interaction
  useEffect(() => {
    if (!accessTokenExpiresAt || isExpired) return;

    let lastInteractionTime = Date.now();
    const THROTTLE_MS = 30 * 1000; // Throttle checks every 30 seconds

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastInteractionTime < THROTTLE_MS) return;
      lastInteractionTime = now;

      const timeRemaining = accessTokenExpiresAt - now;
      if (timeRemaining < ACCESS_TOKEN_REFRESH_BUFFER_MS) {
        void update();
      }
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, [accessTokenExpiresAt, isExpired, update]);

  // 3. Dynamic background timer based on expiration time
  useEffect(() => {
    if (!accessTokenExpiresAt || isExpired) return;

    const refreshInMs = Math.max(
      accessTokenExpiresAt - Date.now() - ACCESS_TOKEN_REFRESH_BUFFER_MS,
      0
    );

    const timeoutId = window.setTimeout(() => {
      void update();
    }, refreshInMs);

    return () => window.clearTimeout(timeoutId);
  }, [accessTokenExpiresAt, isExpired, update]);

  // 4. Deferred Reauth Modal opening when user is actively typing in a form input/textarea
  useEffect(() => {
    if (!isExpired) return;

    let timeoutId: number;

    const checkAndShow = () => {
      const activeEl = document.activeElement;
      const isUserTyping =
        activeEl &&
        (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

      if (isUserTyping) {
        // Debounce: check again in 5 seconds
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(checkAndShow, 5000);
      } else {
        setShouldShowReauth(true);
      }
    };

    checkAndShow();

    // Interrupt delay if they press Enter (usually submits) or click outside
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        setShouldShowReauth(true);
        return;
      }

      const activeEl = document.activeElement;
      const isUserTyping =
        activeEl &&
        (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

      if (isUserTyping) {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          setShouldShowReauth(true);
        }, 5000); // Delay opening modal for 5 seconds after last keypress
      }
    };

    const handleMouseClick = () => {
      const activeEl = document.activeElement;
      const isUserTyping =
        activeEl &&
        (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

      // If they click on something that is NOT an input/textarea, show the modal immediately
      if (!isUserTyping) {
        setShouldShowReauth(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleMouseClick);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleMouseClick);
    };
  }, [isExpired]);

  return (
    <>
      {children}
      <ReauthModal isOpen={shouldShowReauth} />
    </>
  );
}
