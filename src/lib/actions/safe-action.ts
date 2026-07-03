import { authOptions } from '@/features/auth';
import { getServerSession } from 'next-auth';
import { createSafeActionClient } from 'next-safe-action';
import { z } from 'zod';
import { isAxiosError } from 'axios';
import { AuthSessionExpiredError } from '../http/auth-session-error';

export const actionClient = createSafeActionClient({
  defineMetadataSchema() {
    return z.object({
      actionName: z.string(),
    });
  },
  handleServerError(error) {
    if (isAxiosError(error)) {
      return error.response?.data || error.message;
    }
    return error.message;
  },
}).use(async ({ next, metadata }) => {
  const startLoggin = performance.now();
  const result = await next();
  const endLoggin = performance.now();
  const durationMs = endLoggin - startLoggin;
  console.log(
    `La acción [${metadata.actionName}] se ejecutó en ${
      durationMs < 1000
        ? `${durationMs.toFixed(2)} ms`
        : `${(durationMs / 1000).toFixed(2)} s`
    }`
  );
  return result;
});

export const getServerAuthSession = async () => {
  const session = await getServerSession(authOptions);
  return session;
};

export const authActionClient = actionClient.use(async ({ next }) => {
  const session = await getServerAuthSession();

  if (session?.error || !session?.user?.accessToken) {
    throw new AuthSessionExpiredError();
  }

  return next({ ctx: { session } });
});
