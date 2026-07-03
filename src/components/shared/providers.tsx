'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthSessionSyncProvider } from '@/features/auth/components/auth-session-sync-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthSessionSyncProvider>{children}</AuthSessionSyncProvider>
    </SessionProvider>
  );
}
