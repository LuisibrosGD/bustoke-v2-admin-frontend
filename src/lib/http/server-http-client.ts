import axios, { InternalAxiosRequestConfig } from 'axios';
import { ENV_URL_API } from '../constants/environments';
import { getServerAuthSession } from '../actions/safe-action';
import { AuthSessionExpiredError } from './auth-session-error';

declare module 'axios' {
  interface AxiosRequestConfig {
    requiresAuth?: boolean;
  }
}

export interface ServerRequestConfig extends InternalAxiosRequestConfig {
  requiresAuth?: boolean;
}

const serverHttpClient = axios.create({
  baseURL: ENV_URL_API,
});

type DynamicServerErrorLike = {
  digest?: string;
  message?: string;
};

function isDynamicServerError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const candidate = error as DynamicServerErrorLike;

  return (
    candidate.digest === 'DYNAMIC_SERVER_USAGE' ||
    (typeof candidate.message === 'string' &&
      candidate.message.includes('Dynamic server usage'))
  );
}

serverHttpClient.interceptors.request.use(
  async (config: ServerRequestConfig) => {
    if (config.requiresAuth !== false) {
      try {
        const session = await getServerAuthSession();

        if (session?.error || !session?.user?.accessToken) {
          throw new AuthSessionExpiredError();
        }

        config.headers.Authorization = `Bearer ${session.user.accessToken}`;
      } catch (error: unknown) {
        if (error instanceof AuthSessionExpiredError) {
          throw error;
        }

        if (isDynamicServerError(error)) {
          throw error;
        }

        console.error(
          '[serverHttpClient] Error crítico de comunicación:',
          error
        );
      }
    }

    return config;
  }
);

serverHttpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      return Promise.reject(new AuthSessionExpiredError());
    }

    return Promise.reject(error);
  }
);

export { serverHttpClient };