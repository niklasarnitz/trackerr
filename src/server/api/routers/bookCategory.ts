import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import {
  bookCategoryCreateSchema,
  bookCategoryUpdateSchema,
  idSchema,
} from "~/lib/api-schemas";

export const bookCategoryRouter = createTRPCRouter({
  // Get all book categories for user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.bookCategory.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        _count: {
          select: { books: true },
        },
      },
      orderBy: { name: "asc" },
    });
  }),

  // Get single category by ID
  getById: protectedProcedure.input(idSchema).query(async ({ ctx, input }) => {
    const category = await ctx.db.bookCategory.findFirst({
      where: {
        id: input.id,
        userId: ctx.session.user.id,
      },
      include: {
        _count: {
          select: { books: true },
        },
      },
    });

    if (!category) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Category not found",
      });
    }

    return category;
  }),

  // Create category
  create: protectedProcedure
    .input(bookCategoryCreateSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if category with same name already exists for user
      const existing = await ctx.db.bookCategory.findUnique({
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
          message: "A category with this name already exists",
        });
      }

      return await ctx.db.bookCategory.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });
    }),

  // Update category
  update: protectedProcedure
    .input(bookCategoryUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const category = await ctx.db.bookCategory.findFirst({
        where: {
          id,
          userId: ctx.session.user.id,
        },
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      // If name is being updated, check for duplicates
      if (updateData.name && updateData.name !== category.name) {
        const existing = await ctx.db.bookCategory.findUnique({
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
            message: "A category with this name already exists",
          });
        }
      }

      return await ctx.db.bookCategory.update({
        where: { id },
        data: updateData,
      });
    }),

  // Delete category
  delete: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.db.bookCategory.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        include: {
          _count: {
            select: { books: true },
          },
        },
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      if (category._count.books > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Cannot delete category with ${category._count.books} book(s). Remove books from category first.`,
        });
      }

      await ctx.db.bookCategory.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
