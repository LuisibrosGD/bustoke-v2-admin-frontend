'use client';

import { FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { resetPasswordFormSchema } from '../domain/auth.schema';
import { Button, FieldSet } from '@/components/ui';
import { PasswordInput } from './password-input';
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks';
import { resetPasswordAction } from '../infraestructure/auth.actions';
import { Loader2Icon } from 'lucide-react';

import { useSearchParams } from 'next/navigation';

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const {
    form,
    handleSubmitWithAction,
    action: { isPending },
  } = useHookFormAction(
    resetPasswordAction,
    zodResolver(resetPasswordFormSchema),
    {
      formProps: {
        defaultValues: {
          password: '',
          confirmPassword: '',
          token: token,
        },
      },
    }
  );

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmitWithAction}>
        <FieldSet>
          <input type="hidden" {...form.register('token')} value={token} />
          <PasswordInput name="password" />
          <PasswordInput
            name="confirmPassword"
            label="Confirmar contraseña*"
            placeholder="Repetir contraseña"
          />
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Guardando nueva contraseña...
              </>
            ) : (
              'Guardar nueva contraseña'
            )}
          </Button>
        </FieldSet>
      </form>
    </FormProvider>
  );
}
