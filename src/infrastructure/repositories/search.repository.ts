import type { SearchResponse } from '@/infrastructure/domain/types';
import { request } from '@/lib/http/api-request';

export class SearchRepository {
  async search(query: string, signal?: AbortSignal): Promise<SearchResponse> {
    const params = new URLSearchParams({ q: query });
    return request<SearchResponse>(`/admin/search?${params.toString()}`, { signal });
  }
}

export const searchRepository = new SearchRepository();
