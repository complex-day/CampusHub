import { cloudinary } from "../config/cloudinary.js";

export function uploadPoster(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "campushub/posters", resource_type: "image" },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error("Cloudinary did not return a poster URL"));
          return;
        }
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}