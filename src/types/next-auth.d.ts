import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      email?: string;
      name?: string;
      role?: 'superadmin' | 'admin_agencia';
      avatarUrl?: string;
      accessToken?: string;
      accessTokenExpiresAt?: number;
      sessionId?: string;
    } & DefaultSession['user'];
    error?: 'RefreshAccessTokenError';
  }

  interface User {
    id?: string;
    email?: string;
    name?: string;
    role?: string;
    avatarUrl?: string;
    accessToken?: string;
    accessTokenExpiresAt?: number;
    refreshToken?: string;
    refreshTokenExpiresAt?: number;
    sessionId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    accessTokenExpiresAt?: number;
    refreshToken?: string;
    refreshTokenExpiresAt?: number;
    sessionId?: string;
    role?: string;
    avatarUrl?: string;
    error?: 'RefreshAccessTokenError';
  }
}
