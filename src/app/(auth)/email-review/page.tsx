import { Button } from '@/components/ui';
import { PATHS } from '@/lib/constants/paths';
import Link from 'next/link';

export default async function EmailReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ email: string }>;
}) {
  const { email } = await searchParams;
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <span className="mb-4 block text-2xl font-bold text-foreground">Bustoke</span>
        <h2 className="text-2xl xl:text-3xl font-semibold mb-2">
          Revisa tu correo
        </h2>
        <p className="text-balance text-muted-foreground">
          Te enviamos un enlace al correo{' '}
          <span className="text-gray-800 font-">{email}</span> para restablecer
          tu contraseña.
        </p>
      </div>
      <Button asChild size="lg" className="w-full">
        <Link href={PATHS.signInPage}>Volver a iniciar sesión</Link>
      </Button>
    </div>
  );
}
