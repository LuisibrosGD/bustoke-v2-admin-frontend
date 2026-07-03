import Image from 'next/image';
import { SignInForm } from '@/features/auth';

export default function LoginPage() {
  return (
    <div className="flex w-full max-w-140 flex-col gap-7">
      <div>
        <Image
          src="/icons/bustokelogocompleto.svg"
          alt="Bustoke"
          width={140}
          height={24}
          className="mb-4 xl:hidden"
          priority
        />
        <Image
          src="/icons/bustokelogocompleto.svg"
          alt="Bustoke"
          width={140}
          height={24}
          className="mb-4 max-xl:hidden"
          priority
        />
        <h1 className="mb-2 text-3xl font-semibold md:text-4xl xl:text-3xl">
          Iniciar sesión
        </h1>
        <p className="text-muted-foreground text-base md:text-lg xl:text-base">
          Bienvenido de nuevo, por favor ingrese sus datos.
        </p>
      </div>
      <SignInForm />
    </div>
  );
}
