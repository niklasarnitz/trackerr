import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import {
  bookSearchSchema,
  idSchema,
  bookIdSchema,
  bookCreateSchema,
  bookUpdateSchema,
  bookTagSchema,
  type BookAuthorInput,
} from "~/lib/api-schemas";
import { downloadAndUploadBookCover } from "~/helpers/image-upload";

// Helper function to find or create an author
async function findOrCreateAuthor(
  db: any,
  name: string,
): Promise<{ id: string; name: string }> {
  // Try to find existing author
  let author = await db.author.findUnique({
    where: { name },
  });

  // If not found, create new author
  if (!author) {
    author = await db.author.create({
      data: { name },
    });
  }

  return author;
}

// Helper function to handle author updates for a book
async function updateBookAuthors(
  db: any,
  bookId: string,
  authors: BookAuthorInput[] | undefined,
) {
  if (!authors) return;

  // Get current book authors to find orphaned authors later
  const currentBookAuthors = await db.bookAuthor.findMany({
    where: { bookId },
    include: { author: true },
  });

  const currentAuthorIds = currentBookAuthors.map((ba: any) => ba.authorId);

  // Delete all current book-author relations
  await db.bookAuthor.deleteMany({
    where: { bookId },
  });

  // Create new book-author relations
  for (const authorData of authors) {
    const author = await findOrCreateAuthor(db, authorData.name);

    await db.bookAuthor.create({
      data: {
        bookId,
        authorId: author.id,
        role: authorData.role,
      },
    });
  }

  // Clean up orphaned authors (authors with no books)
  for (const authorId of currentAuthorIds) {
    const bookCount = await db.bookAuthor.count({
      where: { authorId },
    });

    if (bookCount === 0) {
      await db.author.delete({
        where: { id: authorId },
      });
    }
  }
}

export const bookRouter = createTRPCRouter({
  // Get all books with filtering
  getAll: protectedProcedure
    .input(bookSearchSchema)
    .query(async ({ ctx, input }) => {
      const where = {
        userId: ctx.session.user.id,
        ...(input.search && {
          OR: [
            { title: { contains: input.search, mode: "insensitive" as const } },
            {
              bookAuthors: {
                some: {
                  author: {
                    name: {
                      contains: input.search,
                      mode: "insensitive" as const,
                    },
                  },
                },
              },
            },
            {
              subtitle: {
                contains: input.search,
                mode: "insensitive" as const,
              },
            },
          ],
        }),
        ...(input.status && { status: input.status }),
        ...(input.categoryId && { categoryId: input.categoryId }),
        ...(input.tagIds &&
          input.tagIds.length > 0 && {
            bookTags: {
              some: {
                tagId: { in: input.tagIds },
              },
            },
          }),
        isOnWishlist: input.isOnWishlist ?? false,
      };

      const orderBy = (() => {
        switch (input.sort) {
          case "title":
            return { title: "asc" as const };
          case "updated":
            return { updatedAt: "desc" as const };
          case "created":
          default:
            return { createdAt: "desc" as const };
        }
      })();

      const [books, total] = await Promise.all([
        ctx.db.book.findMany({
          where,
          include: {
            category: true,
            series: true,
            bookTags: {
              include: {
                tag: true,
              },
            },
            bookAuthors: {
              include: {
                author: true,
              },
            },
            readingProgress: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
            _count: {
              select: { readingProgress: true },
            },
          },
          orderBy,
          skip: input.skip,
          take: input.limit,
        }),
        ctx.db.book.count({ where }),
      ]);

      return {
        books,
        total,
        hasMore: input.skip + input.limit < total,
      };
    }),

  // Get single book by ID
  getById: protectedProcedure.input(idSchema).query(async ({ ctx, input }) => {
    const book = await ctx.db.book.findFirst({
      where: {
        id: input.id,
        userId: ctx.session.user.id,
      },
      include: {
        category: true,
        series: true,
        bookTags: {
          include: {
            tag: true,
          },
        },
        bookAuthors: {
          include: {
            author: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        readingProgress: {
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { readingProgress: true },
        },
      },
    });

    if (!book) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Book not found",
      });
    }

    return book;
  }),

  // Create new book
  create: protectedProcedure
    .input(bookCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const { authors, coverUrl, seriesId, seriesName, ...bookData } = input;

      // Resolve series
      let finalSeriesId = seriesId;
      if (!finalSeriesId && seriesName) {
        // Try to find existing series by name for this user
        const existingSeries = await ctx.db.bookSeries.findFirst({
          where: {
            name: seriesName,
            userId: ctx.session.user.id,
          },
        });

        if (existingSeries) {
          finalSeriesId = existingSeries.id;
        } else {
          // Create new series
          const newSeries = await ctx.db.bookSeries.create({
            data: {
              name: seriesName,
              userId: ctx.session.user.id,
            },
          });
          finalSeriesId = newSeries.id;
        }
      }

      // Create the book first without cover URL
      const book = await ctx.db.book.create({
        data: {
          ...bookData,
          seriesName,
          ...(finalSeriesId && { series: { connect: { id: finalSeriesId } } }),
          userId: ctx.session.user.id,
          status: "UNREAD",
          coverUrl: null,
        } as any,
      });

      // Try to fetch a higher quality cover from bookcover-api
      let finalCoverUrl = coverUrl;
      if (input.title || input.isbn) {
        try {
          const bookCoverApiUrl = "https://bookcover.longitood.com";
          let apiCoverUrl: string | null = null;

          // Try ISBN first if available
          if (input.isbn) {
            try {
              const response = await fetch(
                `${bookCoverApiUrl}/bookcover/${input.isbn}`,
                { signal: AbortSignal.timeout(5000) },
              );
              if (response.ok) {
                const data = (await response.json()) as { url: string };
                apiCoverUrl = data.url;
              }
            } catch (error) {
              console.error("Failed to fetch cover by ISBN:", error);
            }
          }

          // Fall back to title and author search if ISBN didn't work
          if (!apiCoverUrl && input.title && authors && authors.length > 0) {
            try {
              const params = new URLSearchParams();
              params.set("book_title", input.title);
              params.set("author_name", authors[0]!.name);

              const response = await fetch(
                `${bookCoverApiUrl}/bookcover?${params.toString()}`,
                { signal: AbortSignal.timeout(5000) },
              );
              if (response.ok) {
                const data = (await response.json()) as { url: string };
                apiCoverUrl = data.url;
              }
            } catch (error) {
              console.error("Failed to fetch cover by title/author:", error);
            }
          }

          // Use the API cover if found, otherwise fall back to provided cover
          if (apiCoverUrl) {
            finalCoverUrl = apiCoverUrl;
          }
        } catch (error) {
          console.error("Failed to fetch cover from bookcover-api:", error);
          // Continue with the original cover if API call fails
        }
      }

      // Download and upload cover to Minio if available
      if (finalCoverUrl) {
        try {
          const { url, blurDataUrl } = await downloadAndUploadBookCover(
            book.id,
            finalCoverUrl,
          );
          await ctx.db.book.update({
            where: { id: book.id },
            data: {
              coverUrl: url,
              blurDataUrl,
            },
          });
        } catch (error) {
          console.error("Failed to upload book cover to Minio:", error);
          // Keep the book but without cover - don't fail the whole operation
        }
      }

      // Handle authors if provided
      if (authors && authors.length > 0) {
        for (const authorData of authors) {
          const author = await findOrCreateAuthor(ctx.db, authorData.name);

          await ctx.db.bookAuthor.create({
            data: {
              bookId: book.id,
              authorId: author.id,
              role: authorData.role,
            },
          });
        }
      }

      // Return book with all relations
      return await ctx.db.book.findUnique({
        where: { id: book.id },
        include: {
          category: true,
          series: true,
          bookTags: {
            include: {
              tag: true,
            },
          },
          bookAuthors: {
            include: {
              author: true,
            },
          },
        },
      });
    }),

  // Update book
  update: protectedProcedure
    .input(bookUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, authors, seriesId, seriesName, ...updateData } = input;

      const book = await ctx.db.book.findFirst({
        where: {
          id,
          userId: ctx.session.user.id,
        },
      });

      if (!book) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Book not found",
        });
      }

      // Resolve series
      let finalSeriesId = seriesId;
      if (!finalSeriesId && seriesName) {
        // Try to find existing series by name for this user
        const existingSeries = await ctx.db.bookSeries.findFirst({
          where: {
            name: seriesName,
            userId: ctx.session.user.id,
          },
        });

        if (existingSeries) {
          finalSeriesId = existingSeries.id;
        } else {
          // Create new series
          const newSeries = await ctx.db.bookSeries.create({
            data: {
              name: seriesName,
              userId: ctx.session.user.id,
            },
          });
          finalSeriesId = newSeries.id;
        }
      }

      // Update book data
      await ctx.db.book.update({
        where: { id },
        data: {
          ...updateData,
          seriesName,
          ...(finalSeriesId && { series: { connect: { id: finalSeriesId } } }),
        } as any,
      });

      // Update authors if provided
      if (authors !== undefined) {
        await updateBookAuthors(ctx.db, id, authors);
      }

      // Return updated book with all relations
      return await ctx.db.book.findUnique({
        where: { id },
        include: {
          category: true,
          series: true,
          bookTags: {
            include: {
              tag: true,
            },
          },
          bookAuthors: {
            include: {
              author: true,
            },
          },
        },
      });
    }),

  // Delete book
  delete: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const book = await ctx.db.book.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        include: {
          bookAuthors: true,
        },
      });

      if (!book) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Book not found",
        });
      }

      // Get author IDs before deleting book
      const authorIds = book.bookAuthors.map((ba) => ba.authorId);

      // Delete the book (cascades to bookAuthors)
      await ctx.db.book.delete({
        where: { id: input.id },
      });

      // Clean up orphaned authors
      for (const authorId of authorIds) {
        const bookCount = await ctx.db.bookAuthor.count({
          where: { authorId },
        });

        if (bookCount === 0) {
          await ctx.db.author.delete({
            where: { id: authorId },
          });
        }
      }

      return { success: true };
    }),

  // Add tag to book
  addTag: protectedProcedure
    .input(bookTagSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify book belongs to user
      const book = await ctx.db.book.findFirst({
        where: {
          id: input.bookId,
          userId: ctx.session.user.id,
        },
      });

      if (!book) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Book not found",
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

      // Check if tag is already added
      const existing = await ctx.db.bookTag.findUnique({
        where: {
          bookId_tagId: {
            bookId: input.bookId,
            tagId: input.tagId,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Tag already added to book",
        });
      }

      return await ctx.db.bookTag.create({
        data: {
          bookId: input.bookId,
          tagId: input.tagId,
        },
        include: {
          tag: true,
        },
      });
    }),

  // Remove tag from book
  removeTag: protectedProcedure
    .input(bookTagSchema)
    .mutation(async ({ ctx, input }) => {
      const bookTag = await ctx.db.bookTag.findUnique({
        where: {
          bookId_tagId: {
            bookId: input.bookId,
            tagId: input.tagId,
          },
        },
        include: {
          book: true,
        },
      });

      if (!bookTag || bookTag.book.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Book tag not found",
        });
      }

      await ctx.db.bookTag.delete({
        where: {
          bookId_tagId: {
            bookId: input.bookId,
            tagId: input.tagId,
          },
        },
      });

      return { success: true };
    }),
});
