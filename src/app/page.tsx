import { PATHS } from '@/lib/constants/paths';
import { redirect } from 'next/navigation';

export default function Home() {
  // Redirige al módulo principal (dashboard) o al login si no hay sesión
  // Por ahora lo mandamos al login para forzar el flujo
  redirect(PATHS.signInPage);
}
