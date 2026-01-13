import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";

const registrationSchema = z.object({
  username: z
    .string()
    .min(3, "Benutzername muss mindestens 3 Zeichen lang sein"),
  email: z.email("Ungültige E-Mail-Adresse"),
  password: z.string().min(6, "Passwort muss mindestens 6 Zeichen lang sein"),
  name: z.string().min(1, "Name ist erforderlich"),
});

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(registrationSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if username already exists
        const existingUsername = await ctx.db.user.findUnique({
          where: { username: input.username },
        });

        if (existingUsername) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Benutzername bereits vergeben",
          });
        }

        // Check if email already exists
        const existingEmail = await ctx.db.user.findUnique({
          where: { email: input.email },
        });

        if (existingEmail) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "E-Mail-Adresse bereits registriert",
          });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(input.password, 12);

        // Create user
        const user = await ctx.db.user.create({
          data: {
            username: input.username,
            email: input.email,
            name: input.name,
            password: hashedPassword,
            role: "USER",
          },
          select: {
            id: true,
            username: true,
            email: true,
            name: true,
            role: true,
          },
        });

        return {
          message: "Benutzer erfolgreich registriert",
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Registration error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Ein Fehler ist aufgetreten",
        });
      }
    }),
});
