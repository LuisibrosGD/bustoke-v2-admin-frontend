import type { SearchResponse } from '@/infrastructure/domain/types';

const API = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export class SearchRepository {
  async search(query: string, signal?: AbortSignal): Promise<SearchResponse> {
    const params = new URLSearchParams({ q: query });
    return request<SearchResponse>(`/admin/search?${params.toString()}`, { signal });
  }
}

export const searchRepository = new SearchRepository();
