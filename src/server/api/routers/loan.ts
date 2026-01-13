import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import {
  idSchema,
  loanCreateSchema,
  loanUpdateSchema,
} from "~/lib/api-schemas";

export const loanRouter = createTRPCRouter({
  // Get all loans for user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const loans = await ctx.db.loan.findMany({
      where: {
        mediaEntry: {
          userId: ctx.session.user.id,
        },
      },
      include: {
        mediaEntry: {
          include: {
            movie: true,
          },
        },
      },
      orderBy: { loanedAt: "desc" },
    });

    return loans;
  }),

  // Get active loans (not returned)
  getActive: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.loan.findMany({
      where: {
        mediaEntry: {
          userId: ctx.session.user.id,
        },
        returnedAt: null,
      },
      include: {
        mediaEntry: {
          include: {
            movie: true,
          },
        },
      },
      orderBy: { loanedAt: "desc" },
    });
  }),

  // Create loan
  create: protectedProcedure
    .input(loanCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const parsedInput = loanCreateSchema.parse(input);

      // Verify media entry belongs to user
      const mediaEntry = await ctx.db.mediaEntry.findFirst({
        where: {
          id: parsedInput.mediaEntryId,
          userId: ctx.session.user.id,
        },
      });

      if (!mediaEntry) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Media entry not found",
        });
      }

      // Check if already loaned
      const existing = await ctx.db.loan.findUnique({
        where: {
          mediaEntryId: parsedInput.mediaEntryId,
        },
      });

      if (existing) {
        if (!existing.returnedAt) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Media entry is already loaned",
          });
        }

        // Re-loan: reuse the existing row (mediaEntryId is unique)
        return await ctx.db.loan.update({
          where: { id: existing.id },
          data: {
            borrowerName: parsedInput.borrowerName,
            notes: parsedInput.notes,
            returnedAt: null,
            loanedAt: new Date(),
          },
        });
      }

      return await ctx.db.loan.create({
        data: {
          ...parsedInput,
          returnedAt: null,
        },
      });
    }),

  // Update loan (mark as returned)
  update: protectedProcedure
    .input(loanUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const parsedInput = loanUpdateSchema.parse(input);
      const { id, ...updateData } = parsedInput;

      const loan = await ctx.db.loan.findFirst({
        where: {
          id,
          mediaEntry: {
            userId: ctx.session.user.id,
          },
        },
      });

      if (!loan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Loan not found",
        });
      }

      return await ctx.db.loan.update({
        where: { id },
        data: updateData,
      });
    }),

  // Delete loan
  delete: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const parsedInput = idSchema.parse(input);
      const loan = await ctx.db.loan.findFirst({
        where: {
          id: parsedInput.id,
          mediaEntry: {
            userId: ctx.session.user.id,
          },
        },
      });

      if (!loan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Loan not found",
        });
      }

      return await ctx.db.loan.delete({
        where: { id: parsedInput.id },
      });
    }),
});
