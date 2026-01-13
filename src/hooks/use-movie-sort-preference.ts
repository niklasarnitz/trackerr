"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

type SortOption = "title" | "created" | "watched";

const SORT_COOKIE_NAME = "movies-sort-preference";

export function useMovieSortPreference() {
  const searchParams = useSearchParams();
  const [sortBy, setSortBy] = useState<SortOption>("created");

  // Load sort preference from URL or cookie on mount
  useEffect(() => {
    // First check URL parameters
    const urlSort = searchParams.get("sort") as SortOption;
    if (urlSort && ["title", "created", "watched"].includes(urlSort)) {
      setSortBy(urlSort);
      return;
    }

    // Then check cookie
    const savedSort = getCookie(SORT_COOKIE_NAME) as SortOption;
    if (savedSort && ["title", "created", "watched"].includes(savedSort)) {
      setSortBy(savedSort);
    }
  }, [searchParams]);

  const updateSortPreference = (newSort: SortOption) => {
    setSortBy(newSort);
    setCookie(SORT_COOKIE_NAME, newSort, 365); // Store for 1 year
  };

  return {
    sortBy,
    setSortBy: updateSortPreference,
  };
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() ?? null;
  }
  return null;
}

function setCookie(name: string, value: string, days: number): void {
  if (typeof document === "undefined") return;

  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}
