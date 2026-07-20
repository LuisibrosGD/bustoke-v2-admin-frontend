import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PATHS } from '@/lib/constants/paths';
import { ENV_NEXTAUTH_SECRET, ENV_URL_API } from '@/lib/constants/environments';
import { authEndpoints } from './auth.endpoints';
import * as jwt from 'jsonwebtoken';

const ACCESS_TOKEN_REFRESH_BUFFER_MS = 60 * 1000;

type BackendAuthResponse = {
  accessToken: string;
  accessTokenExpiresAt?: string;
  refreshToken: string;
  refreshTokenExpiresAt?: string;
  sessionId?: string;
  rol?: string;
  idUsuario?: number;
  idAgencia?: number;
  user?: {
    id?: string;
    email?: string;
    name?: string;
    role?: string;
    avatarUrl?: string;
  };
};

type DecodedAccessToken = {
  sub: string;
  email: string;
  name?: string;
  rol?: string;
  role?: string;
  avatarUrl?: string;
  exp?: number;
};

function getAccessTokenExpiresAt(data: BackendAuthResponse) {
  const parsedExpiresAt = data.accessTokenExpiresAt
    ? Date.parse(data.accessTokenExpiresAt)
    : NaN;
  if (!Number.isNaN(parsedExpiresAt)) return parsedExpiresAt;

  const decoded = jwt.decode(data.accessToken) as DecodedAccessToken | null;
  return decoded?.exp ? decoded.exp * 1000 : Date.now();
}

function mapAuthResponseToToken(token: JWT, data: BackendAuthResponse): JWT {
  const decoded = jwt.decode(data.accessToken) as DecodedAccessToken | null;

  return {
    ...token,
    id: data.user?.id ?? decoded?.sub,
    email: data.user?.email ?? decoded?.email,
    name: data.user?.name ?? decoded?.name,
    role: data.user?.role ?? data.rol ?? decoded?.rol ?? decoded?.role,
    avatarUrl: data.user?.avatarUrl ?? decoded?.avatarUrl,
    accessToken: data.accessToken,
    accessTokenExpiresAt: getAccessTokenExpiresAt(data),
    refreshToken: data.refreshToken,
    refreshTokenExpiresAt: data.refreshTokenExpiresAt
      ? Date.parse(data.refreshTokenExpiresAt)
      : undefined,
    sessionId: data.sessionId,
    error: undefined,
  };
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    if (!token.refreshToken) {
      throw new Error('Missing refresh token');
    }

    const response = await fetch(`${ENV_URL_API}${authEndpoints.refresh}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Refresh failed with status ${response.status}`);
    }

    const data = (await response.json()) as BackendAuthResponse;
    return mapAuthResponseToToken(token, data);
  } catch (error) {
    console.error('[refreshAccessToken]:', error);
    return {
      ...token,
      accessToken: undefined,
      refreshToken: undefined,
      error: 'RefreshAccessTokenError',
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await fetch(
            `${ENV_URL_API}${authEndpoints.login}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
              cache: 'no-store',
            }
          );

          if (!response.ok) {
            return null;
          }

          const data = (await response.json()) as BackendAuthResponse;
          const payload = jwt.decode(data.accessToken) as DecodedAccessToken;

          return {
            accessToken: data.accessToken,
            accessTokenExpiresAt: getAccessTokenExpiresAt(data),
            refreshToken: data.refreshToken,
            refreshTokenExpiresAt: data.refreshTokenExpiresAt
      ? Date.parse(data.refreshTokenExpiresAt)
      : undefined,
            sessionId: data.sessionId,
            email: data.user?.email ?? payload.email,
            id: data.user?.id ?? payload.sub,
            name: data.user?.name ?? payload.name,
            role: data.user?.role ?? data.rol ?? payload.rol ?? payload.role,
            avatarUrl: data.user?.avatarUrl ?? payload.avatarUrl,
          };
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Falló el inicio de sesión';
          console.error('[signInAction]:', errorMessage);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: PATHS.signInPage,
    error: PATHS.signInPage,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.avatarUrl = user.avatarUrl;
        token.accessToken = user.accessToken;
        token.accessTokenExpiresAt = user.accessTokenExpiresAt;
        token.refreshToken = user.refreshToken;
        token.refreshTokenExpiresAt = user.refreshTokenExpiresAt;
        token.sessionId = user.sessionId;
        token.error = undefined;
        return token;
      }

      if (!token.accessTokenExpiresAt || !token.refreshToken) {
        return {
          ...token,
          accessToken: undefined,
          error: 'RefreshAccessTokenError',
        };
      }

      if (
        Date.now() <
        Number(token.accessTokenExpiresAt) - ACCESS_TOKEN_REFRESH_BUFFER_MS
      ) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as 'superadmin' | 'admin_agencia' | 'admin_terminal';
        session.user.avatarUrl = token.avatarUrl as string;
        session.user.accessToken = token.accessToken as string | undefined;
        session.user.accessTokenExpiresAt = token.accessTokenExpiresAt as
          | number
          | undefined;
        session.user.sessionId = token.sessionId as string | undefined;
      }
      session.error = token.error;
      return session;
    },
  },
  events: {
    async signOut(message) {
      try {
        const token = 'token' in message ? message.token : undefined;
        const refreshToken = token?.refreshToken as string | undefined;
        const accessToken = token?.accessToken as string | undefined;

        if (refreshToken) {
          await fetch(`${ENV_URL_API}${authEndpoints.logoutSession}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
            cache: 'no-store',
          });
          return;
        }

        if (accessToken) {
          await fetch(`${ENV_URL_API}${authEndpoints.logout}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}` },
            cache: 'no-store',
          });
        }
      } catch {
        // Logout endpoint failure should not block session destruction
      }
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: ENV_NEXTAUTH_SECRET,
};
