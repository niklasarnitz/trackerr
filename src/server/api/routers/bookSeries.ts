import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  bookSeriesCreateSchema,
  bookSeriesUpdateSchema,
  bookSeriesSearchSchema,
  idSchema,
} from "~/lib/api-schemas";
import { TRPCError } from "@trpc/server";

export const bookSeriesRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(bookSeriesSearchSchema)
    .query(async ({ ctx, input }) => {
      const where = {
        userId: ctx.session.user.id,
        ...(input.query
          ? { name: { contains: input.query, mode: "insensitive" as const } }
          : {}),
      };

      const [series, total] = await Promise.all([
        ctx.db.bookSeries.findMany({
          where,
          orderBy: { name: "asc" },
          include: { _count: { select: { books: true } } },
          skip: input.skip,
          take: input.limit,
        }),
        ctx.db.bookSeries.count({ where }),
      ]);

      return {
        series,
        total,
        hasMore: input.skip + input.limit < total,
      };
    }),

  getById: protectedProcedure
    .input(idSchema)
    .query(async ({ ctx, input }) => {
      const series = await ctx.db.bookSeries.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        include: {
          books: {
            include: {
              bookAuthors: {
                include: {
                  author: true,
                },
              },
            },
            orderBy: { seriesNumber: "asc" },
          },
        },
      });

      if (!series) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Series not found",
        });
      }

      return series;
    }),

  create: protectedProcedure
    .input(bookSeriesCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.bookSeries.findUnique({
        where: {
          name_userId: {
            name: input.name,
            userId: ctx.session.user.id,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Series with this name already exists",
        });
      }

      return ctx.db.bookSeries.create({
        data: {
          name: input.name,
          userId: ctx.session.user.id,
        },
      });
    }),

  update: protectedProcedure
    .input(bookSeriesUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const series = await ctx.db.bookSeries.findFirst({
        where: {
          id,
          userId: ctx.session.user.id,
        },
      });

      if (!series) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Series not found",
        });
      }

      return ctx.db.bookSeries.update({
        where: { id },
        data,
      });
    }),

  delete: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const series = await ctx.db.bookSeries.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!series) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Series not found",
        });
      }

      return ctx.db.bookSeries.delete({
        where: { id: input.id },
      });
    }),
});
