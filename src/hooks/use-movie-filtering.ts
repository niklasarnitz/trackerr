import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { RouterOutputs } from "~/trpc/react";

type Movie = RouterOutputs["movie"]["getAll"]["movies"][number];

export function useMovieFiltering(movies: Movie[] | undefined) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get("search") ?? "";
  const initialSort =
    (searchParams.get("sort") as "title" | "created" | "watched") ?? "title";

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<"title" | "created" | "watched">(
    initialSort,
  );

  // Update URL when search or sort changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchInput) params.set("search", searchInput);
    if (sortBy !== "title") params.set("sort", sortBy);

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/movies${newUrl}`, { scroll: false });
  }, [searchInput, sortBy, router]);

  const getLastWatchDate = (watches: Movie["watches"]) => {
    if (!watches || watches.length === 0) return null;
    const firstWatch = watches[0];
    return firstWatch ? new Date(firstWatch.watchedAt) : null;
  };

  const sortedAndFilteredMovies = useMemo(() => {
    if (!movies) return [];

    return [...movies].sort((a, b) => {
      switch (sortBy) {
        case "created":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "watched":
          const aLastWatch = getLastWatchDate(a.watches);
          const bLastWatch = getLastWatchDate(b.watches);
          if (!aLastWatch && !bLastWatch) return 0;
          if (!aLastWatch) return 1;
          if (!bLastWatch) return -1;
          return bLastWatch.getTime() - aLastWatch.getTime();
        case "title":
        default:
          return a.title.localeCompare(b.title);
      }
    });
  }, [movies, sortBy]);

  return {
    searchInput,
    setSearchInput,
    sortBy,
    setSortBy,
    sortedMovies: sortedAndFilteredMovies,
  };
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
