import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { unstable_cache } from "next/cache";

export const tmdbTop250Router = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const getCachedForUser = unstable_cache(
      async () => {
        const [top250Movies, watchedMovies] = await Promise.all([
          ctx.db.imdbTop250.findMany({ orderBy: { rank: "asc" } }),
          ctx.db.movie.findMany({
            where: { userId, watches: { some: {} } },
            select: { tmdbId: true },
          }),
        ]);

        const watchedTmdbIds = new Set(watchedMovies.map((m) => m.tmdbId));

        return top250Movies.map((movie) => ({
          id: movie.id,
          rank: movie.rank,
          title: movie.title,
          year: movie.year,
          posterPath: movie.posterPath,
          tmdbId: movie.tmdbId,
          isWatched: watchedTmdbIds.has(movie.tmdbId),
        }));
      },
      ["tmdbTop250", userId],
      { tags: [`tmdbTop250:${userId}`] },
    );

    return await getCachedForUser();
  }),
});
