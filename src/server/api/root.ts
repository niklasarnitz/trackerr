import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { movieRouter } from "./routers/movie";
import { mediaEntryRouter } from "./routers/mediaEntry";
import { movieWatchRouter } from "./routers/movieWatch";
import { tmdbRouter } from "./routers/tmdb";
import { authRouter } from "./routers/auth";
import { tagRouter } from "./routers/tag";
import { movieListRouter } from "./routers/movieList";
import { loanRouter } from "./routers/loan";
import { exportRouter } from "./routers/export";
import { recommendationRouter } from "./routers/recommendation";
import { bookRouter } from "./routers/book";
import { readingProgressRouter } from "./routers/readingProgress";
import { bookCategoryRouter } from "./routers/bookCategory";
import { bookSearchRouter } from "./routers/bookSearch";
import { userPreferencesRouter } from "./routers/userPreferences";
import { tvShowRouter } from "./routers/tvShow";
import { tvShowWatchRouter } from "./routers/tvShowWatch";
import { tvdbRouter } from "./routers/tvdb";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  movie: movieRouter,
  mediaEntry: mediaEntryRouter,
  movieWatch: movieWatchRouter,
  tmdb: tmdbRouter,
  auth: authRouter,
  tag: tagRouter,
  movieList: movieListRouter,
  loan: loanRouter,
  export: exportRouter,
  recommendation: recommendationRouter,
  book: bookRouter,
  readingProgress: readingProgressRouter,
  bookCategory: bookCategoryRouter,
  bookSearch: bookSearchRouter,
  userPreferences: userPreferencesRouter,
  tvShow: tvShowRouter,
  tvShowWatch: tvShowWatchRouter,
  tvdb: tvdbRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.health.ping();
 *       ^? string
 */
export const createCaller = createCallerFactory(appRouter);
