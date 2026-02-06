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
          releaseYear: true,
          overview: true,
          genres: true,
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
          genres: true,
        },
        take: limit,
      });

      // Search books
      const books = await db.book.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            {
              bookAuthors: {
                some: {
                  author: { name: { contains: query, mode: "insensitive" } },
                },
              },
            },
          ],
        },
        select: {
          id: true,
          title: true,
          coverUrl: true,
          publishedYear: true,
          description: true,
          bookAuthors: { select: { author: { select: { name: true } } } },
        },
        take: limit,
      });

      return {
        movies: movies.map((m) => ({
          ...m,
          type: "movie" as const,
        })),
        tvShows: tvShows.map((t) => ({
          ...t,
          type: "tvshow" as const,
        })),
        books: books.map((b) => ({
          ...b,
          type: "book" as const,
          coverImage: b.coverUrl,
          authors: b.bookAuthors.map((a) => a.author.name),
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
            releaseYear: true,
            overview: true,
            genres: true,
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
            genres: true,
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
              { description: { contains: query, mode: "insensitive" } },
              {
                bookAuthors: {
                  some: {
                    author: { name: { contains: query, mode: "insensitive" } },
                  },
                },
              },
            ],
          },
          select: {
            id: true,
            title: true,
            coverUrl: true,
            publishedYear: true,
            description: true,
            bookAuthors: { select: { author: { select: { name: true } } } },
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
              { description: { contains: query, mode: "insensitive" } },
              {
                bookAuthors: {
                  some: {
                    author: { name: { contains: query, mode: "insensitive" } },
                  },
                },
              },
            ],
          },
        }),
      ]);

      return {
        items: books.map((b) => ({
          ...b,
          type: "book" as const,
          coverImage: b.coverUrl,
          authors: b.bookAuthors.map((a) => a.author.name),
        })),
        total,
        hasMore: skip + limit < total,
      };
    }),
});
