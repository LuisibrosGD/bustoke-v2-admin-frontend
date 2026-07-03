'use client';

import { Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { recoverEmailFormSchema } from '../domain/auth.schema';
import {
  Button,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  Input,
} from '@/components/ui';
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks';
import { recoverEmailAction } from '../infraestructure/auth.actions';
import { Loader2Icon } from 'lucide-react';

export function RecoverEmailForm() {
  const {
    form,
    handleSubmitWithAction,
    action: { isPending },
  } = useHookFormAction(
    recoverEmailAction,
    zodResolver(recoverEmailFormSchema),
    {
      formProps: {
        defaultValues: {
          email: '',
        },
      },
    }
  );
  return (
    <form onSubmit={handleSubmitWithAction}>
      <FieldSet>
        <FieldGroup>
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email">Correo*</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="Escribe tu correo"
                  aria-invalid={fieldState.invalid}
                  {...field}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
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
                Enviando enlace...
              </>
            ) : (
              'Enviar enlace de inicio de sesión'
            )}
          </Button>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
