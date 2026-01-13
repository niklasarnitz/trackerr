import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { randomBytes } from "crypto";

const movieSortEnum = z.enum([
  "created",
  "title",
  "watched",
  "releaseYear",
  "rating",
  "runtime",
]);

const movieSortToDbEnum: Record<
  string,
  "CREATED" | "TITLE" | "WATCHED" | "RELEASE_YEAR" | "RATING" | "RUNTIME"
> = {
  created: "CREATED",
  title: "TITLE",
  watched: "WATCHED",
  releaseYear: "RELEASE_YEAR",
  rating: "RATING",
  runtime: "RUNTIME",
};

const dbEnumToMovieSort: Record<string, string> = {
  CREATED: "created",
  TITLE: "title",
  WATCHED: "watched",
  RELEASE_YEAR: "releaseYear",
  RATING: "rating",
  RUNTIME: "runtime",
};

export const userPreferencesRouter = createTRPCRouter({
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const preferences = await ctx.db.userPreferences.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!preferences) {
      throw new Error(
        "User preferences not found. Run the backfill script and ensure DB trigger is installed.",
      );
    }

    return {
      ...preferences,
      movieSort: dbEnumToMovieSort[preferences.movieSort] || "created",
    };
  }),

  updatePreferences: protectedProcedure
    .input(
      z.object({
        movieSort: movieSortEnum.optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const dbEnum = input.movieSort
        ? movieSortToDbEnum[input.movieSort]
        : "CREATED";

      const preferences = await ctx.db.userPreferences.update({
        where: { userId: ctx.session.user.id },
        data: {
          ...(input.movieSort && { movieSort: dbEnum }),
        },
      });

      return {
        ...preferences,
        movieSort: dbEnumToMovieSort[preferences.movieSort] || "created",
      };
    }),

  // Get Jellyfin webhook configuration
  getWebhookConfig: protectedProcedure.query(async ({ ctx }) => {
    const preferences = await ctx.db.userPreferences.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!preferences) {
      throw new Error(
        "User preferences not found. Run the backfill script and ensure DB trigger is installed.",
      );
    }

    const webhook = await ctx.db.jellyfinWebhookConfig.findUnique({
      where: { userPreferencesId: preferences.id },
    });

    if (!webhook) {
      return null;
    }

    return {
      id: webhook.id,
      webhookApiKey: webhook.webhookApiKey,
      usernameFilter: webhook.usernameFilter,
      isEnabled: webhook.isEnabled,
      createdAt: webhook.createdAt,
    };
  }),

  // Enable Jellyfin webhook
  enableWebhook: protectedProcedure
    .input(
      z.object({
        usernameFilter: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const preferences = await ctx.db.userPreferences.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!preferences) {
        throw new Error(
          "User preferences not found. Run the backfill script and ensure DB trigger is installed.",
        );
      }

      let webhookConfig = await ctx.db.jellyfinWebhookConfig.findUnique({
        where: { userPreferencesId: preferences.id },
      });

      if (webhookConfig) {
        // Update existing config
        webhookConfig = await ctx.db.jellyfinWebhookConfig.update({
          where: { id: webhookConfig.id },
          data: {
            isEnabled: true,
            usernameFilter: input.usernameFilter || null,
          },
        });
      } else {
        // Create new config
        webhookConfig = await ctx.db.jellyfinWebhookConfig.create({
          data: {
            userPreferencesId: preferences.id,
            webhookApiKey: randomBytes(32).toString("hex"),
            isEnabled: true,
            usernameFilter: input.usernameFilter || null,
          },
        });
      }

      return {
        id: webhookConfig.id,
        webhookApiKey: webhookConfig.webhookApiKey,
        usernameFilter: webhookConfig.usernameFilter,
        isEnabled: webhookConfig.isEnabled,
        createdAt: webhookConfig.createdAt,
      };
    }),

  // Disable Jellyfin webhook
  disableWebhook: protectedProcedure.mutation(async ({ ctx }) => {
    const preferences = await ctx.db.userPreferences.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!preferences) {
      throw new Error(
        "User preferences not found. Run the backfill script and ensure DB trigger is installed.",
      );
    }
    const webhook = await ctx.db.jellyfinWebhookConfig.findUnique({
      where: { userPreferencesId: preferences.id },
    });

    if (!webhook) {
      throw new Error("Webhook not found");
    }

    const updated = await ctx.db.jellyfinWebhookConfig.update({
      where: { id: webhook.id },
      data: { isEnabled: false },
    });

    return {
      id: updated.id,
      webhookApiKey: updated.webhookApiKey,
      usernameFilter: updated.usernameFilter,
      isEnabled: updated.isEnabled,
      createdAt: updated.createdAt,
    };
  }),

  // Update Jellyfin webhook username filter
  updateWebhookUsernameFilter: protectedProcedure
    .input(
      z.object({
        usernameFilter: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const preferences = await ctx.db.userPreferences.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!preferences) {
        throw new Error(
          "User preferences not found. Run the backfill script and ensure DB trigger is installed.",
        );
      }
      const webhook = await ctx.db.jellyfinWebhookConfig.findUnique({
        where: { userPreferencesId: preferences.id },
      });

      if (!webhook) {
        throw new Error("Webhook not found");
      }

      const updated = await ctx.db.jellyfinWebhookConfig.update({
        where: { id: webhook.id },
        data: {
          usernameFilter: input.usernameFilter || null,
        },
      });

      return {
        id: updated.id,
        webhookApiKey: updated.webhookApiKey,
        usernameFilter: updated.usernameFilter,
        isEnabled: updated.isEnabled,
        createdAt: updated.createdAt,
      };
    }),

  // Regenerate Jellyfin webhook API key
  regenerateWebhookApiKey: protectedProcedure.mutation(async ({ ctx }) => {
    const preferences = await ctx.db.userPreferences.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!preferences) {
      throw new Error(
        "User preferences not found. Run the backfill script and ensure DB trigger is installed.",
      );
    }
    const webhook = await ctx.db.jellyfinWebhookConfig.findUnique({
      where: { userPreferencesId: preferences.id },
    });

    if (!webhook) {
      throw new Error("Webhook not found");
    }

    // Generate a new random API key
    const newApiKey = randomBytes(32).toString("hex");

    const updated = await ctx.db.jellyfinWebhookConfig.update({
      where: { id: webhook.id },
      data: {
        webhookApiKey: newApiKey,
      },
    });

    return {
      id: updated.id,
      webhookApiKey: updated.webhookApiKey,
      usernameFilter: updated.usernameFilter,
      isEnabled: updated.isEnabled,
      createdAt: updated.createdAt,
    };
  }),
});
