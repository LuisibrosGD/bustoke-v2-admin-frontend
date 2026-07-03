export enum Status {
  ACTIVE = 'ACTIVO',
  INACTIVE = 'INACTIVO',
}

export enum Currency {
  PEN = 'PEN',
}

export type ComboboxOption = {
  value: string;
  label: string;
};

export type MetaPagination = {
  /**
   * Página actual
   */
  currentPage: number;
  /**
   * Items por página
   */
  itemsPerPage: number;
  /**
   * Total de items
   */
  totalItems: number;
  /**
   * Total de páginas
   */
  totalPages: number;
  /**
   * Tiene página anterior
   */
  hasPrevPage: boolean;
  /**
   * Tiene página siguiente
   */
  hasNextPage: boolean;
  /**
   * Página anterior
   */
  prevPage: number | null;
  /**
   * Página siguiente
   */
  nextPage: number | null;
};

export type PaginationResponse<T> = {
  /**
   * Items de la página actual
   */
  items: T[];
  /**
   * Metadatos de la paginación
   */
  meta: MetaPagination;
};

export interface BulkUploadError {
  row: number;
  column?: string;
  message: string;
}

export interface BulkUploadResponse {
  file: {
    resourceId: string;
    originalName: string;
    uploadedBy: string;
    uploadedAt: string;
  };
  totalProcessed: number;
  successCount: number;
  skippedCount: number;
  errorCount: number;
  errors: BulkUploadError[];
}
