import { z } from "zod";
import {
  uploadImageFromUrl,
  generateCoverObjectName,
  getPublicUrl,
} from "~/lib/minio";
import { generateBlurDataUrlFromBuffer } from "~/helpers/blur-data";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/original";

/**
 * Downloads a movie poster from TMDB and uploads it to Minio
 * @param movieId - Internal movie ID from database
 * @param posterPath - TMDB poster path (e.g., "/abc123.jpg")
 * @returns The Minio URL and blur data URL of the uploaded poster
 */
export async function downloadAndUploadMoviePoster(
  movieId: string,
  posterPath: string,
): Promise<{ url: string; blurDataUrl: string | null }> {
  const tmdbUrl = `${TMDB_IMAGE_BASE}${posterPath}`;
  const objectName = generateCoverObjectName("movie", movieId);

  // Download image
  const response = await fetch(tmdbUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  const bufferData = Buffer.from(buffer);

  // Generate blur data
  const blurDataUrl = await generateBlurDataUrlFromBuffer(bufferData);

  // Upload to Minio
  const { minioClient, MINIO_BUCKET, ensureBucketExists, getPublicUrl } =
    await import("~/lib/minio");
  await ensureBucketExists();
  await minioClient.putObject(
    MINIO_BUCKET,
    objectName,
    bufferData,
    bufferData.length,
    {
      "Content-Type": "image/jpeg",
    },
  );

  return {
    url: getPublicUrl(objectName),
    blurDataUrl,
  };
}

/**
 * Downloads a TV show poster from TVDB and uploads it to Minio
 * @param tvShowId - Internal TV show ID from database
 * @param posterPath - TVDB poster path URL
 * @returns The Minio URL and blur data URL of the uploaded poster
 */
export async function downloadAndUploadTvShowPoster(
  tvShowId: string,
  posterPath: string,
): Promise<{ url: string; blurDataUrl: string | null }> {
  const objectName = generateCoverObjectName("tvshow", tvShowId);

  // Download image
  const response = await fetch(posterPath);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  const bufferData = Buffer.from(buffer);

  // Generate blur data
  const blurDataUrl = await generateBlurDataUrlFromBuffer(bufferData);

  // Upload to Minio
  const { minioClient, MINIO_BUCKET, ensureBucketExists, getPublicUrl } =
    await import("~/lib/minio");
  await ensureBucketExists();
  await minioClient.putObject(
    MINIO_BUCKET,
    objectName,
    bufferData,
    bufferData.length,
    {
      "Content-Type": "image/jpeg",
    },
  );

  return {
    url: getPublicUrl(objectName),
    blurDataUrl,
  };
}

/**
 * Downloads a book cover from external URL and uploads it to Minio
 * @param bookId - Internal book ID from database
 * @param coverUrl - External cover URL (e.g., Google Books, Open Library)
 * @returns The Minio URL and blur data URL of the uploaded cover
 */
export async function downloadAndUploadBookCover(
  bookId: string,
  coverUrl: string,
): Promise<{ url: string; blurDataUrl: string | null }> {
  const objectName = generateCoverObjectName("book", bookId);

  // Detect content type from URL if possible
  let contentType = "image/jpeg";
  if (coverUrl.toLowerCase().endsWith(".png")) {
    contentType = "image/png";
  } else if (coverUrl.toLowerCase().endsWith(".webp")) {
    contentType = "image/webp";
  }

  // Download image
  const response = await fetch(coverUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  const bufferData = Buffer.from(buffer);

  // Generate blur data
  const blurDataUrl = await generateBlurDataUrlFromBuffer(bufferData);

  // Upload to Minio
  const { minioClient, MINIO_BUCKET, ensureBucketExists, getPublicUrl } =
    await import("~/lib/minio");
  await ensureBucketExists();
  await minioClient.putObject(
    MINIO_BUCKET,
    objectName,
    bufferData,
    bufferData.length,
    {
      "Content-Type": contentType,
    },
  );

  return {
    url: getPublicUrl(objectName),
    blurDataUrl,
  };
}

/**
 * Check if a cover URL is already stored in Minio
 */
export function isMinioUrl(url: string | null): boolean {
  if (!url) return false;
  return url.includes("/bookworm/trackerr/");
}

/**
 * Extract object name from Minio URL
 */
export function extractObjectNameFromUrl(url: string): string | null {
  const match = url.match(/\/bookworm\/(trackerr\/.+)$/);
  return match?.[1] ?? null;
}
