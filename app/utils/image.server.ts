import sharp from "sharp";

/**
 * Compress and resize image to 500x500px
 * @param buffer - Image buffer from uploaded file
 * @returns Compressed image buffer
 */
export async function compressProfilePicture(buffer: Buffer): Promise<Buffer> {
  return await sharp(buffer)
    .resize(500, 500, {
      fit: "cover",
      position: "center",
    })
    .jpeg({ quality: 85 })
    .toBuffer();
}

/**
 * Convert base64 data URL to Buffer
 * @param dataUrl - Base64 encoded image data URL
 * @returns Image buffer
 */
export function dataUrlToBuffer(dataUrl: string): Buffer {
  const base64Data = dataUrl.split(",")[1];
  return Buffer.from(base64Data, "base64");
}
