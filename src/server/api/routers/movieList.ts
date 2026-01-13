import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  idSchema,
  movieListCreateSchema,
  movieListUpdateSchema,
  movieListEntrySchema,
} from "~/lib/api-schemas";

export const movieListRouter = createTRPCRouter({
  // Get all lists for user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.movieList.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        _count: {
          select: { listEntries: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Get list by ID
  getById: protectedProcedure
    .input(idSchema)
    .query(async ({ ctx, input }) => {
      const list = await ctx.db.movieList.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        include: {
          listEntries: {
            include: {
              movie: {
                include: {
                  _count: {
                    select: {
                      watches: true,
                      mediaEntries: true,
                    },
                  },
                },
              },
            },
            orderBy: { order: "asc" },
          },
        },
      });

      if (!list) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "List not found",
        });
      }

      return list;
    }),

  // Create list
  create: protectedProcedure
    .input(movieListCreateSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.movieList.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });
    }),

  // Update list
  update: protectedProcedure
    .input(movieListUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const list = await ctx.db.movieList.findFirst({
        where: {
          id,
          userId: ctx.session.user.id,
        },
      });

      if (!list) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "List not found",
        });
      }

      return await ctx.db.movieList.update({
        where: { id },
        data: updateData,
      });
    }),

  // Delete list
  delete: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.db.movieList.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!list) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "List not found",
        });
      }

      return await ctx.db.movieList.delete({
        where: { id: input.id },
      });
    }),

  // Add movie to list
  addMovie: protectedProcedure
    .input(movieListEntrySchema)
    .mutation(async ({ ctx, input }) => {
      // Verify list belongs to user
      const list = await ctx.db.movieList.findFirst({
        where: {
          id: input.listId,
          userId: ctx.session.user.id,
        },
      });

      if (!list) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "List not found",
        });
      }

      // Verify movie belongs to user
      const movie = await ctx.db.movie.findFirst({
        where: {
          id: input.movieId,
          userId: ctx.session.user.id,
        },
      });

      if (!movie) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Movie not found",
        });
      }

      // Check if already in list
      const existing = await ctx.db.movieListEntry.findUnique({
        where: {
          listId_movieId: {
            listId: input.listId,
            movieId: input.movieId,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Movie already in list",
        });
      }

      return await ctx.db.movieListEntry.create({
        data: input,
      });
    }),

  // Remove movie from list
  removeMovie: protectedProcedure
    .input(movieListEntrySchema)
    .mutation(async ({ ctx, input }) => {
      const entry = await ctx.db.movieListEntry.findFirst({
        where: {
          listId: input.listId,
          movieId: input.movieId,
          movieList: {
            userId: ctx.session.user.id,
          },
        },
      });

      if (!entry) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Movie not in list",
        });
      }

      return await ctx.db.movieListEntry.delete({
        where: {
          listId_movieId: {
            listId: input.listId,
            movieId: input.movieId,
          },
        },
      });
    }),

  // Update movie order in list
  updateOrder: protectedProcedure
    .input(
      idSchema.extend({
        entries: z.array(
          z.object({
            id: z.string(),
            order: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.db.movieList.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!list) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "List not found",
        });
      }

      await Promise.all(
        input.entries.map((entry) =>
          ctx.db.movieListEntry.update({
            where: { id: entry.id },
            data: { order: entry.order },
          }),
        ),
      );

      return { success: true };
    }),
});

