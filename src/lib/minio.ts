import { Client } from "minio";
import { env } from "~/env";

// Initialize Minio client
export const minioClient = new Client({
  endPoint: new URL(env.MINIO_ENDPOINT).hostname,
  port: parseInt(env.MINIO_PORT),
  useSSL: env.MINIO_USE_SSL === "true",
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY,
});

export const MINIO_BUCKET = env.MINIO_BUCKET;
export const TRACKERR_FOLDER = "trackerr";

// Helper to ensure bucket exists
export async function ensureBucketExists() {
  const exists = await minioClient.bucketExists(MINIO_BUCKET);
  if (!exists) {
    await minioClient.makeBucket(MINIO_BUCKET, "us-east-1");
  }
}

// Generate object name for covers
export function generateCoverObjectName(
  type: "movie" | "book" | "tvshow",
  id: string,
  extension = "jpg",
): string {
  return `${TRACKERR_FOLDER}/${type}s/${id}.${extension}`;
}

// Get public URL for an object
export function getPublicUrl(objectName: string): string {
  const endpoint = env.MINIO_ENDPOINT;
  const bucket = MINIO_BUCKET;
  return `${endpoint}/${bucket}/${objectName}`;
}

// Upload image from URL
export async function uploadImageFromUrl(
  url: string,
  objectName: string,
  contentType = "image/jpeg",
): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  const bufferData = Buffer.from(buffer);

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

  return getPublicUrl(objectName);
}

// Upload image from buffer
export async function uploadImageFromBuffer(
  buffer: Buffer,
  objectName: string,
  contentType = "image/jpeg",
): Promise<string> {
  await ensureBucketExists();

  await minioClient.putObject(MINIO_BUCKET, objectName, buffer, buffer.length, {
    "Content-Type": contentType,
  });

  return getPublicUrl(objectName);
}

// Delete an object
export async function deleteObject(objectName: string): Promise<void> {
  await minioClient.removeObject(MINIO_BUCKET, objectName);
}
