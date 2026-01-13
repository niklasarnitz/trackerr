import { useMemo } from "react";

interface UsePaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  itemsPerPage: number;
}

interface UsePaginationReturn {
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startIndex: number;
  endIndex: number;
  isFirstPage: boolean;
  isLastPage: boolean;
}

export function usePagination({
  currentPage,
  totalPages,
  total,
  itemsPerPage,
}: UsePaginationProps): UsePaginationReturn {
  return useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, total);

    return {
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      startIndex,
      endIndex,
      isFirstPage: currentPage === 1,
      isLastPage: currentPage === totalPages,
    };
  }, [currentPage, totalPages, total, itemsPerPage]);
}

/**
 * Calculate pagination info from server data
 */
export function calculatePaginationInfo(
  currentPage: number,
  limit: number,
  total: number,
  hasMore?: boolean,
) {
  const totalPages = Math.ceil(total / limit);
  const startIndex = (currentPage - 1) * limit + 1;
  const endIndex = Math.min(currentPage * limit, total);

  return {
    currentPage,
    totalPages,
    hasNextPage: hasMore ?? currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    startIndex,
    endIndex,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages,
    showingCount: endIndex - startIndex + 1,
  };
}
