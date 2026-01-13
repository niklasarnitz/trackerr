import sharp from "sharp";

/**
 * Generate a blur data URL from an image URL
 * Downloads the image, resizes to 10x10, and converts to base64
 * @param imageUrl - URL of the image to process
 * @returns Base64 data URL for use as blur placeholder
 */
export async function generateBlurDataUrl(
  imageUrl: string,
): Promise<string | null> {
  try {
    // Download image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.statusText}`);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate 10x10 blur placeholder
    const blurBuffer = await sharp(buffer)
      .resize(10, 10, {
        fit: "cover",
      })
      .jpeg({
        quality: 50,
        mozjpeg: true,
      })
      .toBuffer();

    // Convert to base64 data URL
    const base64 = blurBuffer.toString("base64");
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error("Error generating blur data URL:", error);
    return null;
  }
}

/**
 * Generate blur data URL from a buffer
 * @param buffer - Image buffer
 * @returns Base64 data URL for use as blur placeholder
 */
export async function generateBlurDataUrlFromBuffer(
  buffer: Buffer,
): Promise<string | null> {
  try {
    const blurBuffer = await sharp(buffer)
      .resize(10, 10, {
        fit: "cover",
      })
      .jpeg({
        quality: 50,
        mozjpeg: true,
      })
      .toBuffer();

    const base64 = blurBuffer.toString("base64");
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error("Error generating blur data URL from buffer:", error);
    return null;
  }
}
