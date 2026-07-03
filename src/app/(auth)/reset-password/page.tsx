import { ResetPasswordForm } from '@/features/auth';
import { Suspense } from 'react';

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <span className="mb-4 block text-2xl font-bold text-foreground">Bustoke</span>
        <h1 className="text-2xl xl:text-3xl font-semibold mb-2">
          Crea una nueva contraseña
        </h1>
        <p className="text-muted-foreground">
          Escribe una contraseña nueva y segura para acceder a tu cuenta.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="text-center text-sm text-muted-foreground">
            Cargando...
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
