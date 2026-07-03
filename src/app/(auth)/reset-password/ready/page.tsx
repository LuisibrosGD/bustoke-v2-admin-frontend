import { Button } from '@/components/ui';
import Link from 'next/link';
import { PATHS } from '@/lib/constants/paths';

export default function ResetPasswordReadyPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <span className="mb-4 block text-2xl font-bold text-foreground">Bustoke</span>
        <h1 className="text-2xl xl:text-3xl font-semibold mb-2">
          Listo, tu contraseña fue actualizada
        </h1>
        <p className="text-muted-foreground">
          Tu contraseña se guardó correctamente. Ya puedes iniciar sesión con
          tus nuevos datos.
        </p>
      </div>
      <Button asChild size="lg">
        <Link href={PATHS.signInPage}>Iniciar Sesión</Link>
      </Button>
    </div>
  );
}
