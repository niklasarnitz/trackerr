import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { minioClient, MINIO_BUCKET, getPublicUrl } from "~/lib/minio";
import { auth } from "~/server/auth";

const cropDataSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const cropDataString = formData.get("cropData") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!cropDataString) {
      return NextResponse.json(
        { error: "No crop data provided" },
        { status: 400 },
      );
    }

    let cropData;
    try {
      cropData = cropDataSchema.parse(JSON.parse(cropDataString));
    } catch (e) {
      return NextResponse.json({ error: "Invalid crop data" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split(".").pop() ?? "jpg";
    const objectName = `covers/${uuidv4()}.${fileExt}`;

    // Note: In a real implementation, you would perform server-side cropping here using sharp
    // based on cropData. For now, we are uploading the full image.
    // Ideally, the client sends the cropped image blob, or we crop here.
    // The bookworm implementation uploaded the file and cropData.
    // Let's stick to simple upload for now, or use sharp if available.

    // Check if sharp is available
    const sharp = (await import("sharp")).default;

    let processedBuffer: Buffer = buffer;
    if (sharp) {
      // Simple resize to reasonable max width, keeping aspect ratio if no crop applied
      // But we have cropData!
      // The cropData from client (react-image-crop) is usually in px relative to the image.
      // Let's try to crop.
      try {
        const sharpBuffer = await sharp(buffer)
          .extract({
            left: Math.round(cropData.x),
            top: Math.round(cropData.y),
            width: Math.round(cropData.width),
            height: Math.round(cropData.height),
          })
          .resize({ width: 800 }) // Resize to reasonable width after crop
          .toBuffer();
        processedBuffer = Buffer.from(sharpBuffer);
      } catch (cropError) {
        console.error("Cropping failed, uploading original", cropError);
      }
    }

    await minioClient.putObject(
      MINIO_BUCKET,
      objectName,
      processedBuffer,
      processedBuffer.length,
      {
        "Content-Type": file.type,
      },
    );

    const url = getPublicUrl(objectName);

    return NextResponse.json({
      success: true,
      url,
      objectName,
      etag: "uploaded", // MinIO putObject doesn't return etag directly in some versions/wrappers
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
