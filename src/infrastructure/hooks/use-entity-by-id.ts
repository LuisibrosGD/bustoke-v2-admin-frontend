'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Repository } from '../repositories/repository.interface';

interface UseEntityByIdResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useEntityById<T extends { id: string }>(
  repository: Repository<T>,
  id: string
): UseEntityByIdResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const repoRef = useRef(repository);
  repoRef.current = repository;

  const fetch = useCallback(async () => {
    if (!id) { setData(null); setIsLoading(false); return; }
    setIsLoading(true);
    setError(null);
    try {
      const result = await repoRef.current.getById(id);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, isLoading, error, refetch: fetch };
}
