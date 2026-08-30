// ─── V1 Standard Response Shapes ──────────────────────────────────────────────

export interface ApiValidationError {
  field: string;
  message: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  code?: string;
  details?: ApiValidationError[];
}

export interface ApiError {
  success: false;
  error: string;
  code: string;
  details?: ApiValidationError[];
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaginatedLeadsResponse<T> {
  success: boolean;
  data: {
    leads: T[];
    pagination: Pagination;
  };
  message?: string;
  error?: string;
  code?: string;
}

export interface PaginatedCallsResponse<T> {
  success: boolean;
  data: {
    calls: T[];
    pagination: Pagination;
  };
  message?: string;
  error?: string;
  code?: string;
}

// ─── Legacy compat (remove after full migration) ─────────────────────────────

/** @deprecated Use ApiError instead */
export interface LegacyApiError {
  success: boolean;
  error?: string;
  message?: string;
}

/** @deprecated Use Pagination instead */
export interface ApiMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
