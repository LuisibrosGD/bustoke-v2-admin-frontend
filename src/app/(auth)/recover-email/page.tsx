import { RecoverEmailForm } from '@/features/auth';

export default function RecoverEmailPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <span className="mb-4 block text-2xl font-bold text-foreground">Bustoke</span>
        <h2 className="text-2xl xl:text-3xl font-semibold mb-2">
          ¿Tienes problema para iniciar sesión?
        </h2>
        <p className="text-balance text-muted-foreground">
          Te enviaremos un enlace a tu correo para que vuelvas a entrar en tu
          cuenta.
        </p>
      </div>
      <RecoverEmailForm />
    </div>
  );
}
