#!/usr/bin/env bun
/**
 * Migration script to download all existing movie posters from TMDB
 * and upload them to Minio, then update the database URLs
 */

import { PrismaClient } from "@prisma/client";
import {
  uploadImageFromUrl,
  generateCoverObjectName,
  ensureBucketExists,
} from "../src/lib/minio";
import { isMinioUrl } from "../src/helpers/image-upload";

const db = new PrismaClient();

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/original";
const BATCH_SIZE = 10; // Process 10 movies at a time to avoid rate limits

async function migrateMoviePosters() {
  console.log("🎬 Starting movie poster migration to Minio...\n");

  // Ensure bucket exists
  await ensureBucketExists();
  console.log("✓ Minio bucket verified\n");

  // Get all movies with poster paths that are not already in Minio
  const movies = await db.movie.findMany({
    where: {
      posterPath: {
        not: null,
      },
    },
    select: {
      id: true,
      title: true,
      posterPath: true,
    },
  });

  console.log(`Found ${movies.length} movies with posters\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  const errors: Array<{ movieId: string; title: string; error: string }> = [];

  // Process in batches
  for (let i = 0; i < movies.length; i += BATCH_SIZE) {
    const batch = movies.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (movie) => {
        try {
          if (!movie.posterPath) {
            skipCount++;
            return;
          }

          // Skip if already in Minio
          if (isMinioUrl(movie.posterPath)) {
            console.log(`⏭️  Skipping "${movie.title}" - already in Minio`);
            skipCount++;
            return;
          }

          // Determine if posterPath is a full URL or TMDB path
          const imageUrl = movie.posterPath.startsWith("http")
            ? movie.posterPath
            : `${TMDB_IMAGE_BASE}${movie.posterPath}`;

          // Generate object name
          const objectName = generateCoverObjectName("movie", movie.id);

          console.log(`📥 Downloading: "${movie.title}"`);

          // Download and upload to Minio
          const response = await fetch(imageUrl);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const buffer = await response.arrayBuffer();
          const bufferData = Buffer.from(buffer);

          const { minioClient, MINIO_BUCKET } =
            await import("../src/lib/minio");
          await minioClient.putObject(
            MINIO_BUCKET,
            objectName,
            bufferData,
            bufferData.length,
            {
              "Content-Type": "image/jpeg",
            },
          );

          // Generate new URL
          const { getPublicUrl } = await import("../src/lib/minio");
          const newUrl = getPublicUrl(objectName);

          // Update database
          await db.movie.update({
            where: { id: movie.id },
            data: { posterPath: newUrl },
          });

          console.log(`✓ Migrated: "${movie.title}"`);
          successCount++;
        } catch (error) {
          console.error(`✗ Error migrating "${movie.title}":`, error);
          errorCount++;
          errors.push({
            movieId: movie.id,
            title: movie.title,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }),
    );

    // Add delay between batches to be nice to TMDB servers
    if (i + BATCH_SIZE < movies.length) {
      console.log(`\n⏸️  Waiting 2 seconds before next batch...\n`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 Migration Summary:");
  console.log("=".repeat(60));
  console.log(`✓ Successfully migrated: ${successCount}`);
  console.log(`⏭️  Skipped (already in Minio): ${skipCount}`);
  console.log(`✗ Errors: ${errorCount}`);
  console.log("=".repeat(60));

  if (errors.length > 0) {
    console.log("\n⚠️  Errors encountered:");
    errors.forEach(({ title, error }) => {
      console.log(`  - "${title}": ${error}`);
    });
  }

  await db.$disconnect();
}

// Run the migration
migrateMoviePosters()
  .then(() => {
    console.log("\n✅ Migration complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  });
