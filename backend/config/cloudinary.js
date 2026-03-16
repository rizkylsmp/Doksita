const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Extract Cloudinary public_id from a full URL.
 * Returns null if the URL is not a Cloudinary URL.
 */
function extractPublicId(url) {
  if (!url || !url.includes("cloudinary")) return null;
  const parts = url.split("/upload/");
  if (parts.length < 2) return null;
  const afterUpload = parts[1].replace(/^v\d+\//, "");
  return afterUpload.replace(/\.[^.]+$/, "");
}

/**
 * Delete a file from Cloudinary by URL (fire-and-forget).
 */
function deleteByUrl(url) {
  const publicId = extractPublicId(url);
  if (publicId) {
    cloudinary.uploader.destroy(publicId).catch(() => {});
  }
}

module.exports = { cloudinary, extractPublicId, deleteByUrl };
