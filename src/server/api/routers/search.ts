import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { db } from "~/server/db";

export const searchRouter = createTRPCRouter({
  // Unified search across all media types
  searchAll: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1).max(100),
        limit: z.number().int().min(1).max(20).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { query, limit } = input;
      const userId = ctx.session.user.id;
      const searchTerm = `%${query}%`;

      // Search movies
      const movies = await db.movie.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { overview: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          posterPath: true,
          releaseDate: true,
          overview: true,
          genres: { select: { genre: { select: { name: true } } } },
        },
        take: limit,
      });

      // Search TV shows
      const tvShows = await db.tvShow.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { overview: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          posterPath: true,
          firstAirDate: true,
          overview: true,
          genres: { select: { genre: { select: { name: true } } } },
        },
        take: limit,
      });

      // Search books
      const books = await db.book.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { synopsis: { contains: query, mode: "insensitive" } },
            { authors: { some: { author: { name: { contains: query, mode: "insensitive" } } } } },
          ],
        },
        select: {
          id: true,
          title: true,
          coverImage: true,
          publicationDate: true,
          synopsis: true,
          authors: { select: { author: { select: { name: true } } } },
          categories: { select: { category: { select: { name: true } } } },
        },
        take: limit,
      });

      return {
        movies: movies.map((m) => ({
          ...m,
          type: "movie" as const,
          genres: m.genres.map((g) => g.genre.name),
        })),
        tvShows: tvShows.map((t) => ({
          ...t,
          type: "tvshow" as const,
          genres: t.genres.map((g) => g.genre.name),
        })),
        books: books.map((b) => ({
          ...b,
          type: "book" as const,
          authors: b.authors.map((a) => a.author.name),
          categories: b.categories.map((c) => c.category.name),
        })),
      };
    }),

  // Search movies only
  searchMovies: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1).max(100),
        limit: z.number().int().min(1).max(100).default(20),
        skip: z.number().int().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { query, limit, skip } = input;
      const userId = ctx.session.user.id;

      const [movies, total] = await Promise.all([
        db.movie.findMany({
          where: {
            userId,
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { overview: { contains: query, mode: "insensitive" } },
            ],
          },
          select: {
            id: true,
            title: true,
            posterPath: true,
            releaseDate: true,
            overview: true,
            genres: { select: { genre: { select: { name: true } } } },
          },
          orderBy: { title: "asc" },
          skip,
          take: limit,
        }),
        db.movie.count({
          where: {
            userId,
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { overview: { contains: query, mode: "insensitive" } },
            ],
          },
        }),
      ]);

      return {
        items: movies.map((m) => ({
          ...m,
          type: "movie" as const,
          genres: m.genres.map((g) => g.genre.name),
        })),
        total,
        hasMore: skip + limit < total,
      };
    }),

  // Search TV shows only
  searchTVShows: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1).max(100),
        limit: z.number().int().min(1).max(100).default(20),
        skip: z.number().int().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { query, limit, skip } = input;
      const userId = ctx.session.user.id;

      const [tvShows, total] = await Promise.all([
        db.tvShow.findMany({
          where: {
            userId,
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { overview: { contains: query, mode: "insensitive" } },
            ],
          },
          select: {
            id: true,
            title: true,
            posterPath: true,
            firstAirDate: true,
            overview: true,
            genres: { select: { genre: { select: { name: true } } } },
          },
          orderBy: { title: "asc" },
          skip,
          take: limit,
        }),
        db.tvShow.count({
          where: {
            userId,
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { overview: { contains: query, mode: "insensitive" } },
            ],
          },
        }),
      ]);

      return {
        items: tvShows.map((t) => ({
          ...t,
          type: "tvshow" as const,
          genres: t.genres.map((g) => g.genre.name),
        })),
        total,
        hasMore: skip + limit < total,
      };
    }),

  // Search books only
  searchBooks: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1).max(100),
        limit: z.number().int().min(1).max(100).default(20),
        skip: z.number().int().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { query, limit, skip } = input;
      const userId = ctx.session.user.id;

      const [books, total] = await Promise.all([
        db.book.findMany({
          where: {
            userId,
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { synopsis: { contains: query, mode: "insensitive" } },
              { authors: { some: { author: { name: { contains: query, mode: "insensitive" } } } } },
            ],
          },
          select: {
            id: true,
            title: true,
            coverImage: true,
            publicationDate: true,
            synopsis: true,
            authors: { select: { author: { select: { name: true } } } },
            categories: { select: { category: { select: { name: true } } } },
          },
          orderBy: { title: "asc" },
          skip,
          take: limit,
        }),
        db.book.count({
          where: {
            userId,
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { synopsis: { contains: query, mode: "insensitive" } },
              { authors: { some: { author: { name: { contains: query, mode: "insensitive" } } } } },
            ],
          },
        }),
      ]);

      return {
        items: books.map((b) => ({
          ...b,
          type: "book" as const,
          authors: b.authors.map((a) => a.author.name),
          categories: b.categories.map((c) => c.category.name),
        })),
        total,
        hasMore: skip + limit < total,
      };
    }),
});
