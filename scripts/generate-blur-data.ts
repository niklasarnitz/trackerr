#!/usr/bin/env bun
/**
 * Migration script to generate blur data for all existing movie posters and book covers
 */

import { PrismaClient } from "@prisma/client";
import { generateBlurDataUrl } from "../src/helpers/blur-data";

const db = new PrismaClient();

const BATCH_SIZE = 5; // Process 5 items at a time

async function generateBlurDataForMovies() {
  console.log("🎬 Generating blur data for movie posters...\n");

  const movies = await db.movie.findMany({
    where: {
      posterPath: { not: null },
      blurDataUrl: null,
    },
    select: {
      id: true,
      title: true,
      posterPath: true,
    },
  });

  console.log(`Found ${movies.length} movies without blur data\n`);

  let successCount = 0;
  let errorCount = 0;
  const errors: Array<{ movieId: string; title: string; error: string }> = [];

  for (let i = 0; i < movies.length; i += BATCH_SIZE) {
    const batch = movies.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (movie) => {
        try {
          if (!movie.posterPath) {
            return;
          }

          console.log(`📸 Processing: "${movie.title}"`);

          const blurDataUrl = await generateBlurDataUrl(movie.posterPath);

          if (blurDataUrl) {
            await db.movie.update({
              where: { id: movie.id },
              data: { blurDataUrl },
            });
            console.log(`✓ Generated blur data for: "${movie.title}"`);
            successCount++;
          } else {
            throw new Error("Failed to generate blur data");
          }
        } catch (error) {
          console.error(`✗ Error processing "${movie.title}":`, error);
          errorCount++;
          errors.push({
            movieId: movie.id,
            title: movie.title,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }),
    );
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 Movie Blur Data Generation Summary:");
  console.log("=".repeat(60));
  console.log(`✓ Successfully processed: ${successCount}`);
  console.log(`✗ Errors: ${errorCount}`);
  console.log("=".repeat(60));

  if (errors.length > 0) {
    console.log("\n⚠️  Errors encountered:");
    errors.forEach(({ title, error }) => {
      console.log(`  - "${title}": ${error}`);
    });
  }
}

async function generateBlurDataForBooks() {
  console.log("\n📚 Generating blur data for book covers...\n");

  const books = await db.book.findMany({
    where: {
      coverUrl: { not: null },
      blurDataUrl: null,
    },
    select: {
      id: true,
      title: true,
      coverUrl: true,
    },
  });

  console.log(`Found ${books.length} books without blur data\n`);

  let successCount = 0;
  let errorCount = 0;
  const errors: Array<{ bookId: string; title: string; error: string }> = [];

  for (let i = 0; i < books.length; i += BATCH_SIZE) {
    const batch = books.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (book) => {
        try {
          if (!book.coverUrl) {
            return;
          }

          console.log(`📸 Processing: "${book.title}"`);

          const blurDataUrl = await generateBlurDataUrl(book.coverUrl);

          if (blurDataUrl) {
            await db.book.update({
              where: { id: book.id },
              data: { blurDataUrl },
            });
            console.log(`✓ Generated blur data for: "${book.title}"`);
            successCount++;
          } else {
            throw new Error("Failed to generate blur data");
          }
        } catch (error) {
          console.error(`✗ Error processing "${book.title}":`, error);
          errorCount++;
          errors.push({
            bookId: book.id,
            title: book.title,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }),
    );

    // Add delay between batches
    if (i + BATCH_SIZE < books.length) {
      console.log(`\n⏸️  Waiting 1 second before next batch...\n`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 Book Blur Data Generation Summary:");
  console.log("=".repeat(60));
  console.log(`✓ Successfully processed: ${successCount}`);
  console.log(`✗ Errors: ${errorCount}`);
  console.log("=".repeat(60));

  if (errors.length > 0) {
    console.log("\n⚠️  Errors encountered:");
    errors.forEach(({ title, error }) => {
      console.log(`  - "${title}": ${error}`);
    });
  }
}

async function main() {
  console.log("🚀 Starting blur data generation...\n");

  await generateBlurDataForMovies();
  await generateBlurDataForBooks();

  await db.$disconnect();

  console.log("\n✅ Blur data generation complete!");
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  });
