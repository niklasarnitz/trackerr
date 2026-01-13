"use client";

import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { api } from "~/trpc/react";

interface UseTmdbMovieSearchOptions {
  readonly enabled?: boolean;
  readonly includedInCollection?: boolean;
}

export function useTmdbMovieSearch({
  enabled = true,
  includedInCollection = true,
}: UseTmdbMovieSearchOptions = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const isQueryEnabled = enabled && searchQuery.length > 0;

  const searchResults = api.tmdb.searchAndAdd.useQuery(
    {
      query: searchQuery,
      page: currentPage,
      includedInCollection,
    },
    {
      enabled: isQueryEnabled,
    },
  );

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        setCurrentPage(1);
      }
    },
    [searchQuery],
  );

  const reset = useCallback(() => {
    setSearchQuery("");
    setCurrentPage(1);
  }, []);

  const getPosterUrl = useCallback((posterPath: string | null) => {
    return posterPath ? `${posterPath}` : "/placeholder-movie.jpg";
  }, []);

  const formatRating = useCallback((rating: number) => {
    return (rating / 2).toFixed(1);
  }, []);

  const pagination = useMemo(
    () => ({
      currentPage,
      setCurrentPage,
    }),
    [currentPage],
  );

  return {
    searchQuery,
    setSearchQuery,
    currentPage: pagination.currentPage,
    setCurrentPage: pagination.setCurrentPage,
    searchResults,
    handleSearch,
    reset,
    getPosterUrl,
    formatRating,
  };
}
