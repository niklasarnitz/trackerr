import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { tmdbTvClient } from "~/server/api/utils/tmdb-tv-client";

export const tmdbTvRouter = createTRPCRouter({
  // Search TV series on TMDB
  search: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
        page: z.number().min(1).default(1),
      }),
    )
    .query(async ({ input }) => {
      const results = await tmdbTvClient.search(input.query, input.page);
      return {
        results,
      };
    }),

  // Get TV series details from TMDB (for creation UI if needed)
  getSeries: protectedProcedure
    .input(z.object({ tmdbId: z.string() }))
    .query(async ({ input }) => tmdbTvClient.getSeries(input.tmdbId)),

  // Get seasons for a TV series
  getSeasons: protectedProcedure
    .input(z.object({ tmdbId: z.string() }))
    .query(async ({ input }) => tmdbTvClient.getSeasons(input.tmdbId)),

  // Get episodes for a given season
  getEpisodes: protectedProcedure
    .input(z.object({ tmdbId: z.string(), seasonNumber: z.number().min(0) }))
    .query(async ({ input }) =>
      tmdbTvClient.getEpisodes(input.tmdbId, input.seasonNumber),
    ),
});
