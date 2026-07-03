'use server';

import { actionClient } from '@/lib/actions/safe-action';
import {
  recoverEmailFormSchema,
  resetPasswordFormSchema,
} from '../domain/auth.schema';
import { returnValidationErrors } from 'next-safe-action';
import { redirect } from 'next/navigation';
import { PATHS } from '@/lib/constants/paths';
import { serverHttpClient } from '@/lib/http/server-http-client';
import { authEndpoints } from './auth.endpoints';

export const recoverEmailAction = actionClient
  .metadata({
    actionName: 'recoverEmailAction',
  })
  .inputSchema(recoverEmailFormSchema)
  .action(async ({ parsedInput: { email } }) => {
    try {
      await serverHttpClient.post(
        authEndpoints.recoverEmail,
        { email },
        { requiresAuth: false }
      );
    } catch {
      returnValidationErrors(recoverEmailFormSchema, {
        email: {
          _errors: [
            'No pudimos enviar el enlace. Verifica el correo o intenta nuevamente.',
          ],
        },
      });
    }

    redirect(PATHS.emailReviewPage + '?email=' + email);
  });

export const resetPasswordAction = actionClient
  .metadata({
    actionName: 'resetPasswordAction',
  })
  .inputSchema(resetPasswordFormSchema)
  .action(async ({ parsedInput: { password, token } }) => {
    await serverHttpClient.post(
      authEndpoints.resetPassword,
      {
        password,
        token,
      },
      { requiresAuth: false }
    );

    redirect(PATHS.resetPasswordReadyPage);
  });
