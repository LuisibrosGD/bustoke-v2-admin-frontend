'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { signInFormSchema, type SignInFormSchema } from '../domain/auth.schema';
import { signIn } from 'next-auth/react';
import {
  Input,
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldSet,
  Checkbox,
  LoadingButton,
} from '@/components/ui';
import { PATHS } from '@/lib/constants/paths';
import Link from 'next/link';
import { useAlertDialogStore } from '@/stores/use-alert-dialog-store';
import { PasswordInput } from './password-input';

export function SignInForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  // El botón queda deshabilitado hasta que React termine de hidratar y
  // enganchar el onSubmit: si el usuario alcanza a clickear antes de eso
  // (dispositivos/conexiones lentas), el <form> sin handler cae al submit
  // nativo del navegador — un GET a esta misma URL con el email y la
  // contraseña como query params, visibles en el historial y en logs.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const { openDialog, closeDialog } = useAlertDialogStore();
  const form = useForm<SignInFormSchema>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignInFormSchema) => {
    setIsPending(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        openDialog({
          dialogProps: {
            title: 'Error al iniciar sesión',
            description:
              'Hemos detectado un intento fallido de inicio de sesión. Asegúrate de ingresar tu contraseña correctamente. <br /> <br /> Si no recuerda tu contraseña, elige la opción ”Recuperar contraseña.”',
            cancelLabel: 'Entendido',
            confirmLabel: 'Recuperar contraseña',
            handleConfirm: () => {
              router.push(PATHS.recoverEmailPage);
              closeDialog();
            },
            handleCancel: () => {
              closeDialog();
            },
          },
        });
      } else {
        router.push(PATHS.dashboardPage);
      }
    } catch (error) {
      const msg = 'Ocurrió un error inesperado, por favor intenta nuevamente.';
      console.log(error, msg);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldSet className="gap-5 md:gap-6 xl:gap-5">
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email" className="md:text-base xl:text-sm">
                  Correo
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="Escribe tu correo"
                  aria-invalid={fieldState.invalid}
                  className="md:h-12 md:text-base xl:h-11 xl:text-sm"
                  {...field}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <PasswordInput name="password" />
          <div className="flex items-center justify-between">
            <FieldGroup>
              <Field orientation="horizontal">
                <Checkbox id="remember-me" name="remember-me" />
                <FieldLabel htmlFor="remember-me">Recordar cuenta</FieldLabel>
              </Field>
            </FieldGroup>
            <Link
              href={PATHS.recoverEmailPage}
              className="font-semibold text-sm md:text-base xl:text-sm text-nowrap hover:underline text-primary"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <LoadingButton
            type="submit"
            className="w-full md:h-12 md:text-base xl:h-10 xl:text-sm"
            isLoading={isPending}
            disabled={!mounted}
          >
            Iniciar Sesión
          </LoadingButton>
        </FieldSet>
      </form>
    </FormProvider>
  );
}
