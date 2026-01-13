import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  idSchema,
  tagCreateSchema,
  tagUpdateSchema,
  movieTagSchema,
} from "~/lib/api-schemas";

export const tagRouter = createTRPCRouter({
  // Get all tags for user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.tag.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        _count: {
          select: { movieTags: true },
        },
      },
      orderBy: { name: "asc" },
    });
  }),

  // Create tag
  create: protectedProcedure
    .input(tagCreateSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if tag already exists
      const existing = await ctx.db.tag.findUnique({
        where: {
          userId_name: {
            userId: ctx.session.user.id,
            name: input.name,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Tag already exists",
        });
      }

      return await ctx.db.tag.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });
    }),

  // Update tag
  update: protectedProcedure
    .input(tagUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const tag = await ctx.db.tag.findFirst({
        where: {
          id,
          userId: ctx.session.user.id,
        },
      });

      if (!tag) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tag not found",
        });
      }

      if (updateData.name && updateData.name !== tag.name) {
        const existing = await ctx.db.tag.findUnique({
          where: {
            userId_name: {
              userId: ctx.session.user.id,
              name: updateData.name,
            },
          },
        });

        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Tag name already exists",
          });
        }
      }

      return await ctx.db.tag.update({
        where: { id },
        data: updateData,
      });
    }),

  // Delete tag
  delete: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const tag = await ctx.db.tag.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!tag) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tag not found",
        });
      }

      return await ctx.db.tag.delete({
        where: { id: input.id },
      });
    }),

  // Add tag to movie
  addToMovie: protectedProcedure
    .input(movieTagSchema)
    .mutation(async ({ ctx, input }) => {
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

      // Verify tag belongs to user
      const tag = await ctx.db.tag.findFirst({
        where: {
          id: input.tagId,
          userId: ctx.session.user.id,
        },
      });

      if (!tag) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tag not found",
        });
      }

      // Check if already exists
      const existing = await ctx.db.movieTag.findUnique({
        where: {
          movieId_tagId: {
            movieId: input.movieId,
            tagId: input.tagId,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Tag already added to movie",
        });
      }

      return await ctx.db.movieTag.create({
        data: input,
      });
    }),

  // Remove tag from movie
  removeFromMovie: protectedProcedure
    .input(movieTagSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const movieTag = await ctx.db.movieTag.findFirst({
        where: {
          movieId: input.movieId,
          tagId: input.tagId,
          movie: {
            userId: ctx.session.user.id,
          },
        },
      });

      if (!movieTag) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Movie tag not found",
        });
      }

      return await ctx.db.movieTag.delete({
        where: {
          movieId_tagId: {
            movieId: input.movieId,
            tagId: input.tagId,
          },
        },
      });
    }),

  // Get tags for a movie
  getByMovie: protectedProcedure
    .input(z.object({ movieId: z.string() }))
    .query(async ({ ctx, input }) => {
      const movieTags = await ctx.db.movieTag.findMany({
        where: {
          movieId: input.movieId,
          movie: {
            userId: ctx.session.user.id,
          },
        },
        include: {
          tag: true,
        },
      });

      return movieTags.map((mt) => mt.tag);
    }),
});

