import { z } from "zod";

export const loanCreateSchema = z.object({
  mediaEntryId: z.string(),
  borrowerName: z.string().min(1),
  notes: z.string().optional(),
});

export const loanUpdateSchema = z.object({
  id: z.string(),
  returnedAt: z.date().nullable().optional(),
  notes: z.string().optional(),
});

export type LoanCreateInput = z.infer<typeof loanCreateSchema>;
export type LoanUpdateInput = z.infer<typeof loanUpdateSchema>;
