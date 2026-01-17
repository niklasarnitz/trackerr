import { useCallback } from "react";
import { api, type RouterInputs } from "~/trpc/react";
import { toast } from "sonner";
import {
  normalizeWatchDate,
  normalizeWatchDateOrToday,
} from "~/lib/watch-date";

interface UseDataMutationOptions<TData> {
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useMovieMutations() {
  const utils = api.useUtils();

  const normalizeCreateWatchInput = (
    input: RouterInputs["movieWatch"]["create"],
  ) => ({
    ...input,
    watchedAt: normalizeWatchDateOrToday(input.watchedAt),
  });

  const normalizeUpdateWatchInput = (
    input: RouterInputs["movieWatch"]["update"],
  ) => ({
    ...input,
    ...(input.watchedAt
      ? { watchedAt: normalizeWatchDate(input.watchedAt) }
      : {}),
  });

  // Granular invalidation functions - only invalidate what changed
  const invalidateMoviesList = useCallback(() => {
    void utils.movie.getAll.invalidate();
  }, [utils]);

  const invalidateWatchQueries = useCallback(() => {
    void utils.movieWatch.getAll.invalidate();
    void utils.movieWatch.getRecent.invalidate();
    void utils.movieWatch.getStats.invalidate();
  }, [utils]);

  const invalidateMediaEntryQueries = useCallback(() => {
    void utils.mediaEntry.getAll.invalidate();
    void utils.mediaEntry.getCollectionGroupedByMovie.invalidate();
  }, [utils]);

  const invalidateMovieQueries = useCallback(() => {
    invalidateMoviesList();
    invalidateWatchQueries();
    invalidateMediaEntryQueries();
    // Note: getById is invalidated separately when a specific movie changes
  }, [
    invalidateMoviesList,
    invalidateWatchQueries,
    invalidateMediaEntryQueries,
  ]);

  const createMovie = api.movie.create.useMutation({
    onSuccess: (movie) => {
      toast.success(`"${movie.title}" was added to your collection!`);
      invalidateMoviesList();
      invalidateMediaEntryQueries();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMovie = api.movie.delete.useMutation({
    onSuccess: () => {
      toast.success("Movie removed from collection!");
      invalidateMoviesList();
      invalidateMediaEntryQueries();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createWatchMutation = api.movieWatch.create.useMutation({
    onSuccess: () => {
      toast.success("Watch recorded successfully!");
      invalidateWatchQueries();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createWatch = {
    ...createWatchMutation,
    mutate: (
      input: RouterInputs["movieWatch"]["create"],
      options?: Parameters<typeof createWatchMutation.mutate>[1],
    ) => createWatchMutation.mutate(normalizeCreateWatchInput(input), options),
    mutateAsync: (
      input: RouterInputs["movieWatch"]["create"],
      options?: Parameters<typeof createWatchMutation.mutateAsync>[1],
    ) =>
      createWatchMutation.mutateAsync(
        normalizeCreateWatchInput(input),
        options,
      ),
  } as typeof createWatchMutation;

  const updateWatchMutation = api.movieWatch.update.useMutation({
    onSuccess: () => {
      toast.success("Watch updated!");
      invalidateWatchQueries();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateWatch = {
    ...updateWatchMutation,
    mutate: (
      input: RouterInputs["movieWatch"]["update"],
      options?: Parameters<typeof updateWatchMutation.mutate>[1],
    ) => updateWatchMutation.mutate(normalizeUpdateWatchInput(input), options),
    mutateAsync: (
      input: RouterInputs["movieWatch"]["update"],
      options?: Parameters<typeof updateWatchMutation.mutateAsync>[1],
    ) =>
      updateWatchMutation.mutateAsync(
        normalizeUpdateWatchInput(input),
        options,
      ),
  } as typeof updateWatchMutation;

  const deleteWatch = api.movieWatch.delete.useMutation({
    onSuccess: () => {
      toast.success("Watch entry deleted!");
      invalidateWatchQueries();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createMediaEntry = api.mediaEntry.create.useMutation({
    onSuccess: () => {
      toast.success("Media entry added!");
      invalidateMediaEntryQueries();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMediaEntry = api.mediaEntry.update.useMutation({
    onSuccess: () => {
      toast.success("Media entry updated!");
      invalidateMediaEntryQueries();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMediaEntry = api.mediaEntry.delete.useMutation({
    onSuccess: () => {
      toast.success("Media entry deleted!");
      invalidateMediaEntryQueries();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    createMovie,
    deleteMovie,
    createWatch,
    updateWatch,
    deleteWatch,
    createMediaEntry,
    updateMediaEntry,
    deleteMediaEntry,
    invalidateMovieQueries,
    invalidateMoviesList,
    invalidateWatchQueries,
    invalidateMediaEntryQueries,
  };
}

// Utility function for consistent mutation handling
export function createMutationHandlers<TData>(
  options: UseDataMutationOptions<TData> = {},
) {
  return {
    onSuccess: (data: TData) => {
      if (options.successMessage) {
        toast.success(options.successMessage);
      }
      options.onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast.error(options.errorMessage ?? error.message);
      options.onError?.(error);
    },
  };
}
