'use client';

import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { jwtDecode } from 'jwt-decode';
import type { RolUsuario } from '@/infrastructure/domain/types';

interface AccessTokenPayload {
  rol?: RolUsuario;
  id_agencia?: number | string | null;
  id_terminal?: number | string | null;
}

export interface UseUserRoleResult {
  role: RolUsuario | undefined;
  idAgencia: string | undefined;
  idTerminal: string | undefined;
  userId: string | undefined;
  isSuperadmin: boolean;
  isAdminAgencia: boolean;
  isAdminTerminal: boolean;
  isLoading: boolean;
}

export function useUserRole(): UseUserRoleResult {
  const { data: session, status } = useSession();
  const accessToken = session?.user?.accessToken;
  const role = session?.user?.role as RolUsuario | undefined;

  const { idAgencia, idTerminal } = useMemo(() => {
    if (!accessToken) return { idAgencia: undefined, idTerminal: undefined };
    try {
      const payload = jwtDecode<AccessTokenPayload>(accessToken);
      return {
        idAgencia: payload.id_agencia != null ? String(payload.id_agencia) : undefined,
        idTerminal: payload.id_terminal != null ? String(payload.id_terminal) : undefined,
      };
    } catch {
      return { idAgencia: undefined, idTerminal: undefined };
    }
  }, [accessToken]);

  return {
    role,
    idAgencia,
    idTerminal,
    userId: session?.user?.id,
    isSuperadmin: role === 'superadmin',
    isAdminAgencia: role === 'admin_agencia',
    isAdminTerminal: role === 'admin_terminal',
    isLoading: status === 'loading',
  };
}
