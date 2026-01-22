/**
 * Script to generate blur data for all books with cover URLs
 * This script will:
 * 1. Find all books with a coverUrl but no blurDataUrl
 * 2. Generate blur data for each book's cover
 * 3. Update the database with the generated blur data
 */

import { PrismaClient } from "@prisma/client";
import { generateBlurDataUrl } from "../src/helpers/blur-data";

const db = new PrismaClient();

const BATCH_SIZE = 5; // Process 5 books at a time to avoid overwhelming the system

interface BookProcessingResult {
  bookId: string;
  title: string;
  status: "success" | "error" | "skipped";
  error?: string;
}

async function backfillBookBlurData() {
  console.log("📚 Book Blur Data Backfill Script\n");
  console.log("=".repeat(70));

  // Find all books with coverUrl but no blurDataUrl
  const books = await db.book.findMany({
    where: {
      coverUrl: { not: null },
    },
    select: {
      id: true,
      title: true,
      coverUrl: true,
      blurDataUrl: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const booksNeedingBlurData = books.filter((book) => !book.blurDataUrl);

  console.log("📊 Statistics:");
  console.log(`  • Total books with covers: ${books.length}`);
  console.log(`  • Books needing blur data: ${booksNeedingBlurData.length}`);
  console.log(
    `  • Books with blur data: ${books.length - booksNeedingBlurData.length}`,
  );
  console.log(`${"=".repeat(70)}\n`);

  if (booksNeedingBlurData.length === 0) {
    console.log("✅ All books already have blur data!");
    return;
  }

  const results: BookProcessingResult[] = [];

  // Process books in batches
  for (let i = 0; i < booksNeedingBlurData.length; i += BATCH_SIZE) {
    const batch = booksNeedingBlurData.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(booksNeedingBlurData.length / BATCH_SIZE);

    console.log(
      `\n🔄 Processing batch ${batchNumber}/${totalBatches} (${batch.length} books)`,
    );
    console.log("-".repeat(70));

    await Promise.all(
      batch.map(async (book) => {
        try {
          if (!book.coverUrl) {
            results.push({
              bookId: book.id,
              title: book.title,
              status: "skipped",
              error: "No cover URL",
            });
            return;
          }

          process.stdout.write(`  ⏳ Processing: "${book.title}"... `);

          const blurDataUrl = await generateBlurDataUrl(book.coverUrl);

          if (blurDataUrl) {
            await db.book.update({
              where: { id: book.id },
              data: { blurDataUrl },
            });
            console.log("✓");
            results.push({
              bookId: book.id,
              title: book.title,
              status: "success",
            });
          } else {
            console.log("✗");
            results.push({
              bookId: book.id,
              title: book.title,
              status: "error",
              error: "Failed to generate blur data",
            });
          }
        } catch (error) {
          console.log("✗");
          results.push({
            bookId: book.id,
            title: book.title,
            status: "error",
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }),
    );

    // Add delay between batches (except for the last batch)
    if (i + BATCH_SIZE < booksNeedingBlurData.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Print summary
  console.log(`\n${"=".repeat(70)}`);
  console.log("📊 Summary:");
  console.log("=".repeat(70));

  const successCount = results.filter((r) => r.status === "success").length;
  const errorCount = results.filter((r) => r.status === "error").length;
  const skippedCount = results.filter((r) => r.status === "skipped").length;

  console.log(
    `✓ Successfully processed: ${successCount}/${booksNeedingBlurData.length}`,
  );
  console.log(`✗ Errors: ${errorCount}/${booksNeedingBlurData.length}`);
  if (skippedCount > 0) {
    console.log(`⊘ Skipped: ${skippedCount}/${booksNeedingBlurData.length}`);
  }
  console.log("=".repeat(70));

  // Print errors if any
  const errors = results.filter((r) => r.status === "error");
  if (errors.length > 0) {
    console.log("\n⚠️  Errors encountered:");
    errors.forEach(({ title, error }) => {
      console.log(`  • "${title}": ${error}`);
    });
  }

  // Print success summary
  if (successCount > 0) {
    console.log(
      `\n✅ Successfully generated blur data for ${successCount} books!`,
    );
  }
}

async function main() {
  try {
    await backfillBookBlurData();
  } catch (error) {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

main().then(() => {
  process.exit(0);
});
