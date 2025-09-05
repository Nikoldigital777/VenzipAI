import { useState, useCallback } from 'react';

export interface PaginationState {
  limit: number;
  offset: number;
  page: number;
}

export interface PaginationResponse<T> {
  items: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    page: number;
    totalPages: number;
  };
}

export interface UsePaginationOptions {
  initialLimit?: number;
  maxLimit?: number;
}

export function usePagination(options: UsePaginationOptions = {}) {
  const { initialLimit = 20, maxLimit = 100 } = options;
  
  const [paginationState, setPaginationState] = useState<PaginationState>({
    limit: initialLimit,
    offset: 0,
    page: 1,
  });

  const setPage = useCallback((page: number) => {
    setPaginationState(prev => ({
      ...prev,
      page: Math.max(1, page),
      offset: (Math.max(1, page) - 1) * prev.limit,
    }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    const validLimit = Math.min(Math.max(1, limit), maxLimit);
    setPaginationState(prev => ({
      ...prev,
      limit: validLimit,
      offset: 0, // Reset to first page when changing limit
      page: 1,
    }));
  }, [maxLimit]);

  const nextPage = useCallback(() => {
    setPaginationState(prev => ({
      ...prev,
      page: prev.page + 1,
      offset: prev.page * prev.limit,
    }));
  }, []);

  const prevPage = useCallback(() => {
    setPaginationState(prev => ({
      ...prev,
      page: Math.max(1, prev.page - 1),
      offset: Math.max(0, (prev.page - 2) * prev.limit),
    }));
  }, []);

  const reset = useCallback(() => {
    setPaginationState({
      limit: initialLimit,
      offset: 0,
      page: 1,
    });
  }, [initialLimit]);

  const goToFirstPage = useCallback(() => {
    setPaginationState(prev => ({
      ...prev,
      page: 1,
      offset: 0,
    }));
  }, []);

  const goToLastPage = useCallback((totalPages: number) => {
    setPaginationState(prev => ({
      ...prev,
      page: Math.max(1, totalPages),
      offset: Math.max(0, (totalPages - 1) * prev.limit),
    }));
  }, []);

  // Get query parameters for API calls
  const getQueryParams = useCallback(() => {
    return {
      limit: paginationState.limit,
      offset: paginationState.offset,
    };
  }, [paginationState]);

  // Build URL search params
  const getUrlSearchParams = useCallback((additionalParams: Record<string, string> = {}) => {
    const params = new URLSearchParams();
    params.set('limit', paginationState.limit.toString());
    params.set('offset', paginationState.offset.toString());
    
    Object.entries(additionalParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    
    return params;
  }, [paginationState]);

  return {
    // State
    ...paginationState,
    
    // Actions
    setPage,
    setLimit,
    nextPage,
    prevPage,
    reset,
    goToFirstPage,
    goToLastPage,
    
    // Helpers
    getQueryParams,
    getUrlSearchParams,
  };
}

// Pagination info component helper
export function getPaginationInfo(response: PaginationResponse<any>) {
  const { pagination } = response;
  const startItem = pagination.offset + 1;
  const endItem = Math.min(pagination.offset + pagination.limit, pagination.total);
  
  return {
    startItem,
    endItem,
    totalItems: pagination.total,
    currentPage: pagination.page,
    totalPages: pagination.totalPages,
    hasNextPage: pagination.hasMore,
    hasPrevPage: pagination.page > 1,
    isFirstPage: pagination.page === 1,
    isLastPage: pagination.page === pagination.totalPages,
  };
}