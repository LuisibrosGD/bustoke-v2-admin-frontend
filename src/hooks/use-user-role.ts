'use client';

import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { jwtDecode } from 'jwt-decode';
import type { RolUsuario } from '@/infrastructure/domain/types';

interface AccessTokenPayload {
  rol?: RolUsuario;
  id_agencia?: number | string | null;
}

export interface UseUserRoleResult {
  role: RolUsuario | undefined;
  idAgencia: string | undefined;
  userId: string | undefined;
  isSuperadmin: boolean;
  isAdminAgencia: boolean;
  isLoading: boolean;
}

export function useUserRole(): UseUserRoleResult {
  const { data: session, status } = useSession();
  const accessToken = session?.user?.accessToken;
  const role = session?.user?.role as RolUsuario | undefined;

  const idAgencia = useMemo(() => {
    if (!accessToken) return undefined;
    try {
      const payload = jwtDecode<AccessTokenPayload>(accessToken);
      return payload.id_agencia != null ? String(payload.id_agencia) : undefined;
    } catch {
      return undefined;
    }
  }, [accessToken]);

  return {
    role,
    idAgencia,
    userId: session?.user?.id,
    isSuperadmin: role === 'superadmin',
    isAdminAgencia: role === 'admin_agencia',
    isLoading: status === 'loading',
  };
}
