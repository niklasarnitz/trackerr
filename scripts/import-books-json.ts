import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// Helper to map status
function mapStatus(
  readDate: string | null | undefined,
): "UNREAD" | "READING" | "READ" {
  if (readDate) return "READ";
  return "UNREAD";
}

async function main() {
  const exportPath = path.join(
    process.cwd(),
    "../bookworm/bookworm-export.json",
  );

  if (!fs.existsSync(exportPath)) {
    console.error(`Export file not found at ${exportPath}`);
    console.error("Please run the export script in 'bookworm' project first.");
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(exportPath, "utf-8"));
  const books = data.books;

  console.log(`Found ${books.length} books to import.`);

  // Get all users
  const users = await prisma.user.findMany();

  if (users.length === 0) {
    console.error(
      "No users found in Trackerr database. Please create a user first.",
    );
    process.exit(1);
  }

  console.log("\nAvailable Users:");
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name || "No Name"} (${user.email})`);
  });

  const readline = await import("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(query, resolve);
    });
  };

  let selectedUserIndex = -1;
  while (selectedUserIndex < 0 || selectedUserIndex >= users.length) {
    const answer = await question(
      `\nSelect a user to import into (1-${users.length}): `,
    );
    const parsed = parseInt(answer, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= users.length) {
      selectedUserIndex = parsed - 1;
    } else {
      console.log("Invalid selection. Please try again.");
    }
  }

  rl.close();

  const user = users[selectedUserIndex];
  const userId = user?.id;
  console.log(
    `\nImporting for user: ${user?.name || user?.email} (${userId})\n`,
  );

  if (!userId) {
    console.error("Selected user has no ID. Exiting.");
    process.exit(1);
  }

  for (const book of books) {
    console.log(`Importing: ${book.name}`);

    // 1. Handle Series
    let seriesId = null;
    if (book.series) {
      const seriesName = book.series.name;
      const existingSeries = await prisma.bookSeries.findFirst({
        where: {
          name: seriesName,
          userId: userId,
        },
      });

      if (existingSeries) {
        seriesId = existingSeries.id;
      } else {
        const newSeries = await prisma.bookSeries.create({
          data: {
            name: seriesName,
            userId: userId,
          },
        });
        seriesId = newSeries.id;
      }
    }

    // 2. Handle Category
    let categoryId = null;
    if (book.category) {
      const categoryName = book.category.name;
      const existingCategory = await prisma.bookCategory.findFirst({
        where: {
          userId: userId,
          name: categoryName,
        },
      });

      if (existingCategory) {
        categoryId = existingCategory.id;
      } else {
        const newCategory = await prisma.bookCategory.create({
          data: {
            name: categoryName,
            userId: userId,
          },
        });
        categoryId = newCategory.id;
      }
    }

    // 3. Create Book
    // Check if book exists
    const existingBook = await prisma.book.findFirst({
      where: {
        userId: userId,
        title: book.name,
      },
    });

    let bookId = existingBook?.id;

    if (!existingBook) {
      const newBook = await prisma.book.create({
        data: {
          userId: userId,
          title: book.name,
          subtitle: book.subtitle,
          isbn: book.isbn,
          publisher: book.publisher,
          pages: book.pages,
          coverUrl: book.coverUrl,
          seriesId: seriesId,
          seriesName: book.series?.name,
          seriesNumber: book.seriesNumber,
          categoryId: categoryId,
          isEbook: book.isEbook,
          status: mapStatus(book.readDate),
          createdAt: book.createdAt ? new Date(book.createdAt) : undefined,
          updatedAt: book.updatedAt ? new Date(book.updatedAt) : undefined,
        },
      });
      bookId = newBook.id;
    } else {
      console.log(`Book "${book.name}" already exists. Skipping creation.`);
    }

    // 4. Handle Authors
    if (book.bookAuthors && bookId) {
      // Clear existing authors if any? Or just add missing?
      // Let's add missing.
      for (const ba of book.bookAuthors) {
        const authorName = ba.author.name;

        // Find or create global author
        let author = await prisma.author.findUnique({
          where: { name: authorName },
        });

        if (!author) {
          author = await prisma.author.create({
            data: { name: authorName },
          });
        }

        // Link to book
        try {
          await prisma.bookAuthor.create({
            data: {
              bookId: bookId!,
              authorId: author.id,
              role: ba.tag, // Map tag to role
            },
          });
        } catch (e) {
          // Ignore if already linked
        }
      }
    }

    // 5. Handle Quotes
    if (book.quotes && bookId) {
      for (const quote of book.quotes) {
        // Check if quote exists (duplicates might be hard to detect perfectly, check text)
        const existingQuote = await prisma.quote.findFirst({
          where: {
            bookId: bookId!,
            text: quote.text,
          },
        });

        if (!existingQuote) {
          await prisma.quote.create({
            data: {
              bookId: bookId!,
              userId: userId,
              text: quote.text,
              pageStart: quote.pageStart,
              pageEnd: quote.pageEnd,
              title: quote.title,
            },
          });
        }
      }
    }
  }

  console.log("Import completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
