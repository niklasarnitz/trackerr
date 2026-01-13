"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";

interface ListDetailContentProps {
  listId: string;
}

export function ListDetailContent({ listId }: ListDetailContentProps) {
  const router = useRouter();
  const utils = api.useUtils();

  const {
    data: list,
    isLoading,
    error,
  } = api.movieList.getById.useQuery({ id: listId });

  const [search, setSearch] = useState("");
  const moviesQuery = api.movie.getAll.useQuery(
    {
      search: search.trim() ? search.trim() : undefined,
      sort: "title",
      skip: 0,
      limit: 20,
    },
    { enabled: search.trim().length > 0 },
  );

  const addMovie = api.movieList.addMovie.useMutation({
    onSuccess: async () => {
      toast.success("Movie added to list");
      await utils.movieList.getById.invalidate({ id: listId });
    },
    onError: (e) => toast.error(e.message),
  });

  const removeMovie = api.movieList.removeMovie.useMutation({
    onSuccess: async () => {
      toast.success("Movie removed from list");
      await utils.movieList.getById.invalidate({ id: listId });
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteList = api.movieList.delete.useMutation({
    onSuccess: async () => {
      toast.success("List deleted");
      await utils.movieList.getAll.invalidate();
      router.push("/lists");
      router.refresh();
    },
    onError: (e) => toast.error(e.message),
  });

  const movieIdsInList = useMemo(() => {
    const ids = new Set<string>();
    (list?.listEntries ?? []).forEach((e) => {
      if (e.movie?.id) ids.add(e.movie.id);
    });
    return ids;
  }, [list]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">Loading list...</CardContent>
      </Card>
    );
  }

  if (error || !list) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-8">
          {error?.message ?? "List not found"}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="heading-lg mb-1">{list.name}</h1>
          {list.description && (
            <p className="text-muted-foreground body-md">{list.description}</p>
          )}
          <p className="text-muted-foreground mt-2 text-sm">
            {list.listEntries.length} movie
            {list.listEntries.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/lists">Back</Link>
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteList.mutate({ id: list.id })}
            disabled={deleteList.isPending}
          >
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add a movie</CardTitle>
          <CardDescription>
            Search in your collection and add to this list.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Search your movies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search.trim().length === 0 && (
            <p className="text-muted-foreground text-sm">Type to search.</p>
          )}

          {moviesQuery.isFetching && (
            <p className="text-muted-foreground text-sm">Searching...</p>
          )}

          {moviesQuery.data?.movies && moviesQuery.data.movies.length > 0 && (
            <div className="grid gap-2">
              {moviesQuery.data.movies.map((movie) => (
                <div
                  key={movie.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <Link
                    href={`/movies/${movie.id}`}
                    className="hover:underline"
                  >
                    {movie.title}
                  </Link>
                  <Button
                    size="sm"
                    onClick={() =>
                      addMovie.mutate({
                        listId: list.id,
                        movieId: movie.id,
                        order: list.listEntries.length,
                      })
                    }
                    disabled={
                      addMovie.isPending || movieIdsInList.has(movie.id)
                    }
                    variant={
                      movieIdsInList.has(movie.id) ? "secondary" : "default"
                    }
                  >
                    {movieIdsInList.has(movie.id) ? "Added" : "Add"}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {moviesQuery.data?.movies && moviesQuery.data.movies.length === 0 && (
            <p className="text-muted-foreground text-sm">No movies found.</p>
          )}

          {moviesQuery.error && (
            <p className="text-destructive text-sm">
              {moviesQuery.error.message}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        {list.listEntries.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex flex-col">
                <Link
                  href={entry.movie ? `/movies/${entry.movie.id}` : "#"}
                  className="font-medium hover:underline"
                >
                  {entry.movie?.title ?? "(Missing movie)"}
                </Link>
                {entry.movie?.releaseYear && (
                  <span className="text-muted-foreground text-sm">
                    {entry.movie.releaseYear}
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  removeMovie.mutate({
                    listId: list.id,
                    movieId: entry.movieId,
                    order: entry.order,
                  })
                }
                disabled={removeMovie.isPending}
              >
                Remove
              </Button>
            </CardContent>
          </Card>
        ))}

        {list.listEntries.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No movies in this list</CardTitle>
              <CardDescription>
                Add some from your collection above.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
