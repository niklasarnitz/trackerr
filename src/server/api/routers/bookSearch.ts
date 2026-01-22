import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  searchBooksByIsbn as amazonSearchByIsbn,
  getBookDetailFromAmazon,
} from "~/helpers/amazon-scraper";
import {
  searchGoogleBooks,
  searchGoogleBooksByIsbn,
  extractIsbn,
  getLargestCover,
} from "~/helpers/google-books-api";
import {
  searchOpenLibraryByIsbn,
  searchOpenLibraryByTitle,
  getOpenLibraryAuthorNames,
} from "~/helpers/open-library-api";

export const bookSearchRouter = createTRPCRouter({
  // Search books using Google Books API
  searchGoogleBooks: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        author: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const response = await searchGoogleBooks(input.title, input.author);

        if (!response.items || response.items.length === 0) {
          return {
            results: [],
            totalItems: 0,
          };
        }

        const results = response.items
          .map((item) => {
            const { volumeInfo } = item;

            // Extract published year
            const publishedYear = volumeInfo.publishedDate
              ? parseInt(volumeInfo.publishedDate.split("-")[0] ?? "0", 10) ||
                null
              : null;

            return {
              id: item.id,
              title: volumeInfo.title,
              subtitle: volumeInfo.subtitle ?? null,
              authors: volumeInfo.authors
                ? volumeInfo.authors.map((author) => ({
                    name: author,
                    role: null as string | null,
                  }))
                : [],
              publisher: volumeInfo.publisher ?? null,
              publishedYear,
              description: volumeInfo.description ?? null,
              coverUrl: getLargestCover(volumeInfo.imageLinks),
              categories: volumeInfo.categories ?? null,
              isbn: extractIsbn(volumeInfo.industryIdentifiers),
              pages: volumeInfo.pageCount ?? null,
              language: volumeInfo.language ?? null,
            };
          })
          .filter((result) => result.title); // Filter out any results without a title

        return {
          results,
          totalItems: response.totalItems,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to search Google Books",
          cause: error,
        });
      }
    }),

  // Search and add books - checks if books are already in library
  searchAndAdd: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        author: z.string().optional(),
        includedInLibrary: z.boolean().default(true),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const response = await searchGoogleBooks(input.title, input.author);

        if (!response.items || response.items.length === 0) {
          return {
            results: [],
            totalItems: 0,
          };
        }

        // Get user's existing books if requested
        const existingBooksMap = new Map<string, string>();
        const existingBooksByTitle = new Map<string, string>();

        if (input.includedInLibrary) {
          const userBooks = await ctx.db.book.findMany({
            where: { userId: ctx.session.user.id },
            select: { id: true, isbn: true, title: true },
          });

          // Create maps for ISBN and title matching
          userBooks.forEach((book) => {
            if (book.isbn) {
              existingBooksMap.set(book.isbn, book.id);
            }
            // Normalize title for comparison
            const normalizedTitle = book.title.toLowerCase().trim();
            existingBooksByTitle.set(normalizedTitle, book.id);
          });
        }

        const results = response.items
          .map((item) => {
            const { volumeInfo } = item;

            // Extract published year
            const publishedYear = volumeInfo.publishedDate
              ? parseInt(volumeInfo.publishedDate.split("-")[0] ?? "0", 10) ||
                null
              : null;

            const isbn = extractIsbn(volumeInfo.industryIdentifiers);

            // Check if book is already in library
            let inLibrary = false;
            let bookId: string | null = null;

            if (input.includedInLibrary) {
              // First try to match by ISBN
              if (isbn && existingBooksMap.has(isbn)) {
                inLibrary = true;
                bookId = existingBooksMap.get(isbn)!;
              }
              // Fallback to title matching
              else {
                const normalizedSearchTitle = volumeInfo.title
                  .toLowerCase()
                  .trim();
                if (existingBooksByTitle.has(normalizedSearchTitle)) {
                  inLibrary = true;
                  bookId = existingBooksByTitle.get(normalizedSearchTitle)!;
                }
              }
            }

            return {
              id: item.id,
              title: volumeInfo.title,
              subtitle: volumeInfo.subtitle ?? null,
              authors: volumeInfo.authors
                ? volumeInfo.authors.map((author) => ({
                    name: author,
                    role: null as string | null,
                  }))
                : [],
              publisher: volumeInfo.publisher ?? null,
              publishedYear,
              description: volumeInfo.description ?? null,
              coverUrl: getLargestCover(volumeInfo.imageLinks),
              categories: volumeInfo.categories ?? null,
              isbn,
              pages: volumeInfo.pageCount ?? null,
              language: volumeInfo.language ?? null,
              inLibrary,
              bookId,
            };
          })
          .filter((result) => result.title);

        return {
          results,
          totalItems: response.totalItems,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to search Google Books",
          cause: error,
        });
      }
    }),

  // Search by ISBN using Google Books
  searchByIsbnGoogle: protectedProcedure
    .input(z.object({ isbn: z.string().min(1) }))
    .query(async ({ input }) => {
      try {
        const response = await searchGoogleBooksByIsbn(input.isbn);

        if (!response.items || response.items.length === 0) {
          return null;
        }

        const item = response.items[0];
        if (!item) return null;

        const { volumeInfo } = item;
        const publishedYear = volumeInfo.publishedDate
          ? parseInt(volumeInfo.publishedDate.split("-")[0] ?? "0", 10) || null
          : null;

        return {
          id: item.id,
          title: volumeInfo.title,
          subtitle: volumeInfo.subtitle ?? null,
          authors: volumeInfo.authors
            ? volumeInfo.authors.map((author) => ({
                name: author,
                role: null as string | null,
              }))
            : [],
          publisher: volumeInfo.publisher ?? null,
          publishedYear,
          description: volumeInfo.description ?? null,
          coverUrl: getLargestCover(volumeInfo.imageLinks),
          categories: volumeInfo.categories ?? null,
          isbn: extractIsbn(volumeInfo.industryIdentifiers) ?? input.isbn,
          pages: volumeInfo.pageCount ?? null,
          language: volumeInfo.language ?? null,
          source: "google" as const,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to search Google Books by ISBN",
          cause: error,
        });
      }
    }),

  // Search by ISBN using Open Library
  searchByIsbnOpenLibrary: protectedProcedure
    .input(z.object({ isbn: z.string().min(1) }))
    .query(async ({ input }) => {
      try {
        const data = await searchOpenLibraryByIsbn(input.isbn);

        if (!data || !data.title) {
          return null;
        }

        // Fetch author names if available
        const authorNames = data.authors
          ? await getOpenLibraryAuthorNames(data.authors)
          : [];

        // Extract published year
        const publishedYear = data.publish_date
          ? parseInt(data.publish_date.split(" ").pop() ?? "0", 10) || null
          : null;

        // Get cover URL
        const coverUrl = data.covers?.[0]
          ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`
          : null;

        // Handle description (can be string or object)
        const description =
          typeof data.description === "string"
            ? data.description
            : (data.description?.value ?? null);

        return {
          id: `ol-${input.isbn}`,
          title: data.title,
          subtitle: null,
          authors: authorNames.map((name) => ({
            name,
            role: null as string | null,
          })),
          publisher: data.publishers?.[0] ?? null,
          publishedYear,
          description,
          coverUrl,
          categories: data.dewey_decimal_class
            ? [data.dewey_decimal_class[0] ?? ""]
            : null,
          isbn: data.isbn_13?.[0] ?? data.isbn_10?.[0] ?? input.isbn,
          pages: data.number_of_pages ?? null,
          language: null,
          source: "openlibrary" as const,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to search Open Library",
          cause: error,
        });
      }
    }),

  // Search by ISBN using Amazon
  searchByIsbnAmazon: protectedProcedure
    .input(z.object({ isbn: z.string().min(1) }))
    .query(async ({ input }) => {
      try {
        const results = await amazonSearchByIsbn(input.isbn);

        if (!results || results.length === 0) {
          return null;
        }

        // Get details from the first result
        const firstResult = results[0];
        if (!firstResult) return null;

        const bookDetail = await getBookDetailFromAmazon(firstResult.detailUrl);

        return {
          id: `amazon-${input.isbn}`,
          title: bookDetail.title,
          subtitle: bookDetail.subtitle ?? null,
          authors: bookDetail.authors.map((author) => ({
            name: author,
            role: null as string | null,
          })),
          publisher: bookDetail.publisher ?? null,
          publishedYear: null,
          description: null,
          coverUrl: bookDetail.coverImageUrl ?? null,
          categories: null,
          isbn: bookDetail.isbn ?? input.isbn,
          pages: null,
          language: null,
          source: "amazon" as const,
        };
      } catch (error) {
        console.error("Amazon ISBN search failed:", error);
        return null;
      }
    }),

  // Combined ISBN search - tries multiple sources
  searchByIsbn: protectedProcedure
    .input(z.object({ isbn: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      // Check if book is already in library
      const existingBook = await ctx.db.book.findFirst({
        where: {
          userId: ctx.session.user.id,
          isbn: input.isbn,
        },
        select: { id: true },
      });

      // Try Google Books first (usually more comprehensive)
      try {
        const googleResult = await searchGoogleBooksByIsbn(input.isbn);
        if (googleResult.items && googleResult.items.length > 0) {
          const item = googleResult.items[0];
          if (!item) return null;

          const { volumeInfo } = item;
          const publishedYear = volumeInfo.publishedDate
            ? parseInt(volumeInfo.publishedDate.split("-")[0] ?? "0", 10) ||
              null
            : null;

          return {
            id: item.id,
            title: volumeInfo.title,
            subtitle: volumeInfo.subtitle ?? null,
            authors: volumeInfo.authors
              ? volumeInfo.authors.map((author) => ({
                  name: author,
                  role: null as string | null,
                }))
              : [],
            publisher: volumeInfo.publisher ?? null,
            publishedYear,
            description: volumeInfo.description ?? null,
            coverUrl: getLargestCover(volumeInfo.imageLinks),
            categories: volumeInfo.categories ?? null,
            isbn: extractIsbn(volumeInfo.industryIdentifiers) ?? input.isbn,
            pages: volumeInfo.pageCount ?? null,
            language: volumeInfo.language ?? null,
            source: "google" as const,
            inLibrary: !!existingBook,
            bookId: existingBook?.id ?? null,
          };
        }
      } catch (error) {
        console.error("Google Books ISBN search failed:", error);
      }

      // Fallback to Open Library
      try {
        const olData = await searchOpenLibraryByIsbn(input.isbn);
        if (olData && olData.title) {
          const authorNames = olData.authors
            ? await getOpenLibraryAuthorNames(olData.authors)
            : [];

          const publishedYear = olData.publish_date
            ? parseInt(olData.publish_date.split(" ").pop() ?? "0", 10) || null
            : null;

          const coverUrl = olData.covers?.[0]
            ? `https://covers.openlibrary.org/b/id/${olData.covers[0]}-L.jpg`
            : null;

          const description =
            typeof olData.description === "string"
              ? olData.description
              : (olData.description?.value ?? null);

          return {
            id: `ol-${input.isbn}`,
            title: olData.title,
            subtitle: null,
            authors: authorNames.map((name) => ({
              name,
              role: null as string | null,
            })),
            publisher: olData.publishers?.[0] ?? null,
            publishedYear,
            description,
            coverUrl,
            categories: olData.dewey_decimal_class
              ? [olData.dewey_decimal_class[0] ?? ""]
              : null,
            isbn: olData.isbn_13?.[0] ?? olData.isbn_10?.[0] ?? input.isbn,
            pages: olData.number_of_pages ?? null,
            language: null,
            source: "openlibrary" as const,
            inLibrary: !!existingBook,
            bookId: existingBook?.id ?? null,
          };
        }
      } catch (error) {
        console.error("Open Library ISBN search failed:", error);
      }

      // Last fallback - try Amazon
      try {
        const amazonResult = await amazonSearchByIsbn(input.isbn);
        if (amazonResult && amazonResult.length > 0) {
          const firstResult = amazonResult[0];
          if (!firstResult) return null;

          const bookDetail = await getBookDetailFromAmazon(
            firstResult.detailUrl,
          );

          return {
            id: `amazon-${input.isbn}`,
            title: bookDetail.title,
            subtitle: bookDetail.subtitle ?? null,
            authors: bookDetail.authors.map((author) => ({
              name: author,
              role: null as string | null,
            })),
            publisher: bookDetail.publisher ?? null,
            publishedYear: null,
            description: null,
            coverUrl: bookDetail.coverImageUrl ?? null,
            categories: null,
            isbn: bookDetail.isbn ?? input.isbn,
            pages: null,
            language: null,
            source: "amazon" as const,
            inLibrary: !!existingBook,
            bookId: existingBook?.id ?? null,
          };
        }
      } catch (error) {
        console.error("Amazon ISBN search fallback failed:", error);
      }

      return null;
    }),

  searchByTitle: protectedProcedure
    .input(z.object({ title: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      // Check if book is already in library (by title match)
      const existingBook = await ctx.db.book.findFirst({
        where: {
          userId: ctx.session.user.id,
          title: {
            contains: input.title,
            mode: "insensitive",
          },
        },
        select: { id: true },
      });

      // Try Google Books first
      try {
        const googleResult = await searchGoogleBooks(input.title);

        if (googleResult.items && googleResult.items.length > 0) {
          const item = googleResult.items[0];
          if (!item) return null;

          const { volumeInfo } = item;
          const publishedYear = volumeInfo.publishedDate
            ? parseInt(volumeInfo.publishedDate.split("-")[0] ?? "0", 10) ||
              null
            : null;

          return {
            id: item.id,
            title: volumeInfo.title,
            subtitle: volumeInfo.subtitle ?? null,
            authors: volumeInfo.authors
              ? volumeInfo.authors.map((author) => ({
                  name: author,
                  role: null as string | null,
                }))
              : [],
            publisher: volumeInfo.publisher ?? null,
            publishedYear,
            description: volumeInfo.description ?? null,
            coverUrl: getLargestCover(volumeInfo.imageLinks),
            categories: volumeInfo.categories ?? null,
            isbn: extractIsbn(volumeInfo.industryIdentifiers) ?? null,
            pages: volumeInfo.pageCount ?? null,
            language: volumeInfo.language ?? null,
            source: "google" as const,
            inLibrary: !!existingBook,
            bookId: existingBook?.id ?? null,
          };
        }
      } catch (error) {
        console.error("Google Books title search failed:", error);
      }

      // Fallback to Open Library search
      try {
        const olSearchResult = await searchOpenLibraryByTitle(input.title);

        if (olSearchResult?.docs && olSearchResult.docs.length > 0) {
          const doc = olSearchResult.docs[0];
          if (!doc) return null;

          const authorNames = doc.author_name ? doc.author_name : [];

          const publishedYear = doc.first_publish_year;
          const coverUrl = doc.cover_i
            ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
            : null;

          return {
            id: `ol-${doc.key}`,
            title: doc.title,
            subtitle: null,
            authors: authorNames.map((name) => ({
              name,
              role: null as string | null,
            })),
            publisher: doc.publisher?.[0] ?? null,
            publishedYear,
            description: doc.description ?? null,
            coverUrl,
            categories: doc.dewey_decimal_class
              ? [doc.dewey_decimal_class[0] ?? ""]
              : null,
            isbn: doc.isbn?.[0] ?? null,
            pages: null,
            language: null,
            source: "openlibrary" as const,
            inLibrary: !!existingBook,
            bookId: existingBook?.id ?? null,
          };
        }
      } catch (error) {
        console.error("Open Library title search failed:", error);
      }

      return null;
    }),
});
