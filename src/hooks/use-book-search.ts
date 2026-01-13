"use client";

import type React from "react";
import { useCallback, useState } from "react";
import { api } from "~/trpc/react";

interface UseBookSearchOptions {
  readonly enabled?: boolean;
  readonly includedInLibrary?: boolean;
}

export function useBookSearch({
  enabled = true,
  includedInLibrary = true,
}: UseBookSearchOptions = {}) {
  const [titleQuery, setTitleQuery] = useState("");
  const [authorQuery, setAuthorQuery] = useState("");

  const isQueryEnabled = enabled && titleQuery.trim().length > 0;

  const searchResults = api.bookSearch.searchAndAdd.useQuery(
    {
      title: titleQuery.trim(),
      author: authorQuery.trim() || undefined,
      includedInLibrary,
    },
    {
      enabled: isQueryEnabled,
    },
  );

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (titleQuery.trim()) {
        // Trigger search by refetching
        void searchResults.refetch();
      }
    },
    [titleQuery, searchResults],
  );

  const reset = useCallback(() => {
    setTitleQuery("");
    setAuthorQuery("");
  }, []);

  const getCoverUrl = useCallback((coverUrl: string | null) => {
    return coverUrl ?? "/placeholder-book.jpg";
  }, []);

  return {
    titleQuery,
    setTitleQuery,
    authorQuery,
    setAuthorQuery,
    searchResults,
    handleSearch,
    reset,
    getCoverUrl,
  };
}
