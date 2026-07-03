'use client';

import { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { LockKeyhole } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
  Field,
  FieldLabel,
  LoadingButton,
  Button,
} from '@/components/ui';
import { PATHS } from '@/lib/constants/paths';

interface ReauthModalProps {
  isOpen: boolean;
}

export function ReauthModal({ isOpen }: ReauthModalProps) {
  const { data: session, update } = useSession();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogout = async () => {
    await signOut({
      callbackUrl: `${PATHS.signInPage}?reason=session-expired`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMessage('Por favor, ingresa tu contraseña.');
      return;
    }

    setIsPending(true);
    setErrorMessage(null);

    try {
      const email = session?.user?.email;
      if (!email) {
        setErrorMessage('No se encontró el correo del usuario.');
        setIsPending(false);
        return;
      }

      // Realizamos el login silencioso en background
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setErrorMessage(
          'La contraseña es incorrecta. Por favor, intenta de nuevo.'
        );
      } else {
        // Forzamos el update de next-auth para refrescar la sesión del lado del cliente
        await update();
        setPassword('');
        setShowPassword(false);
      }
    } catch (error) {
      console.error('[ReauthModal] Error al re-autenticar:', error);
      setErrorMessage(
        'Ocurrió un error inesperado al intentar reanudar la sesión.'
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-[440px] gap-6"
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="bg-primary/10 text-primary p-3 rounded-full mb-2 animate-pulse">
            <LockKeyhole className="size-6" />
          </div>
          <DialogTitle className="text-xl font-bold">
            Sesión Expirada
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2 text-center">
            Tu sesión ha expirado por seguridad. Ingresa tu contraseña para
            continuar trabajando sin perder tus cambios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <Field className="opacity-70">
              <FieldLabel className="text-xs font-semibold uppercase tracking-wider">
                Usuario
              </FieldLabel>
              <Input
                type="email"
                value={session?.user?.email ?? ''}
                disabled
                className="bg-accent/30 border-dashed cursor-not-allowed"
              />
            </Field>

            <Field>
              <FieldLabel
                htmlFor="reauth-password"
                className="text-xs font-semibold uppercase tracking-wider"
              >
                Contraseña
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="reauth-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Escribe tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isPending}
                  className="pr-16"
                  autoComplete="current-password"
                  autoFocus
                />
                {password && (
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      type="button"
                      className="font-semibold text-primary md:text-sm"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 'Ocultar' : 'Mostrar'}
                    </InputGroupButton>
                  </InputGroupAddon>
                )}
              </InputGroup>
            </Field>

            {errorMessage && (
              <span className="text-destructive text-sm font-medium animate-in fade-in-50 duration-200">
                {errorMessage}
              </span>
            )}
          </div>

          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleLogout}
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              Cerrar Sesión
            </Button>
            <LoadingButton
              type="submit"
              isLoading={isPending}
              className="w-full sm:w-auto px-6"
            >
              Continuar Sesión
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
