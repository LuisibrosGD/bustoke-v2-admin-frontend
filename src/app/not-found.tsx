import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button/button';

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
        <FileQuestion className="size-8" />
      </div>
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Página no encontrada</h1>
        <p className="mt-1 text-sm text-neutral-500">
          La página que buscas no existe o fue movida.
        </p>
      </div>
      <Button asChild>
        <Link href="/dashboard">Volver al panel</Link>
      </Button>
    </div>
  );
}
