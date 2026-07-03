'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PaginationResponse } from '@/types/common.types';

export function useInfiniteScroll<T>(
  initialData: PaginationResponse<T>,
  fetchMore?: (page: number) => Promise<PaginationResponse<T>>
) {
  const [items, setItems] = useState<T[]>(initialData.items);
  const [meta, setMeta] = useState(initialData.meta);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    setItems(initialData.items);
    setMeta(initialData.meta);
  }, [initialData]);

  const loadMore = useCallback(async () => {
    if (!meta.hasNextPage || isLoadingRef.current || !fetchMore) return;
    isLoadingRef.current = true;
    setIsLoading(true);
    try {
      const nextPage = meta.currentPage + 1;
      const response = await fetchMore(nextPage);
      setItems((prev) => [...prev, ...response.items]);
      setMeta(response.meta);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [meta.hasNextPage, meta.currentPage, fetchMore]);

  useEffect(() => {
    if (!fetchMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, fetchMore]);

  return { items, meta, isLoading, sentinelRef };
}
