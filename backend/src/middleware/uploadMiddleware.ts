import multer from "multer";
import path from "node:path";

export const allowedPosterTypes = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"]
]);

export const posterUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (allowedPosterTypes.get(extension) !== file.mimetype) {
      callback(new Error("Only matching JPG, JPEG, PNG, or WebP poster files are allowed"));
      return;
    }
    callback(null, true);
  }
});

export function isValidImageContent(buffer: Buffer, mimeType: string): boolean {
  if (mimeType === "image/png") {
    return buffer.length >= 33 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) && buffer.subarray(12, 16).toString("ascii") === "IHDR" && buffer.readUInt32BE(16) > 0 && buffer.readUInt32BE(20) > 0 && buffer.subarray(buffer.length - 8, buffer.length - 4).toString("ascii") === "IEND";
  }
  if (mimeType === "image/jpeg") {
    return buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[buffer.length - 2] === 0xff && buffer[buffer.length - 1] === 0xd9;
  }
  if (mimeType === "image/webp") {
    const riffLength = buffer.length >= 8 ? buffer.readUInt32LE(4) + 8 : 0;
    return buffer.length >= 16 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP" && riffLength <= buffer.length && ["VP8 ", "VP8L", "VP8X"].includes(buffer.subarray(12, 16).toString("ascii"));
  }
  return false;
}