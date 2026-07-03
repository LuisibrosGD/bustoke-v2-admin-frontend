'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Repository } from '../repositories/repository.interface';

interface UseRepositoryResult<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRepository<T extends { id: string }>(
  repository: Repository<T>,
  deps: unknown[] = []
): UseRepositoryResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const repoRef = useRef(repository);
  repoRef.current = repository;

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await repoRef.current.list();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, isLoading, error, refetch: fetch };
}
