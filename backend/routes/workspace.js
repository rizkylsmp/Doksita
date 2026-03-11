const express = require("express");
const multer = require("multer");
const path = require("path");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const pool = require("../config/db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "doksita/workspace",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ quality: "auto" }],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error("Hanya file gambar yang diperbolehkan"));
  },
});

// CREATE WORKSPACE
router.post(
  "/",
  authMiddleware,
  upload.array("photos", 4),
  async (req, res) => {
    const {
      judul,
      no_berkas,
      catatan,
      keterangan_atas,
      ukuran_kertas,
      orientasi,
      photo_data,
    } = req.body;
    const userId = req.user.id;

    if (!judul) {
      return res.status(400).json({ message: "Judul harus diisi" });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.query(
        "INSERT INTO workspaces (user_id, judul, no_berkas, catatan, keterangan_atas, ukuran_kertas, orientasi) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          userId,
          judul,
          no_berkas || null,
          catatan || null,
          keterangan_atas || null,
          ukuran_kertas || "A4",
          orientasi || "Portrait",
        ],
      );

      const workspaceId = result.insertId;

      // Parse photo metadata
      let photoMeta = [];
      try {
        photoMeta = JSON.parse(photo_data || "[]");
      } catch {
        photoMeta = [];
      }

      const files = req.files || [];
      for (let i = 0; i < 4; i++) {
        const file =
          files.find(
            (f) => f.fieldname === "photos" && files.indexOf(f) === i,
          ) || files[i];
        const meta = photoMeta[i] || {};
        const fotoPath = file ? file.path : null;

        await conn.query(
          "INSERT INTO workspace_photos (workspace_id, foto_path, keterangan, arah, pos_y, urutan) VALUES (?, ?, ?, ?, ?, ?)",
          [
            workspaceId,
            fotoPath,
            meta.keterangan || "",
            meta.arah || "Kiri",
            meta.pos_y != null ? meta.pos_y : 50,
            i,
          ],
        );
      }

      await conn.commit();

      res.status(201).json({
        message: "Workspace berhasil disimpan",
        id: workspaceId,
      });
    } catch (err) {
      await conn.rollback();
      console.error(err);
      res.status(500).json({ message: "Terjadi kesalahan server" });
    } finally {
      conn.release();
    }
  },
);

// GET ALL WORKSPACES (user's own)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, judul, no_berkas, catatan, keterangan_atas, ukuran_kertas, orientasi, created_at, updated_at FROM workspaces WHERE user_id = ? ORDER BY updated_at DESC",
      [req.user.id],
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

// GET SINGLE WORKSPACE with photos
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const [workspaces] = await pool.query(
      "SELECT * FROM workspaces WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id],
    );

    if (workspaces.length === 0) {
      return res.status(404).json({ message: "Workspace tidak ditemukan" });
    }

    const [photos] = await pool.query(
      "SELECT id, foto_path, keterangan, arah, pos_y, urutan FROM workspace_photos WHERE workspace_id = ? ORDER BY urutan",
      [req.params.id],
    );

    res.json({ ...workspaces[0], photos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

// UPDATE WORKSPACE
router.put(
  "/:id",
  authMiddleware,
  upload.array("photos", 4),
  async (req, res) => {
    const {
      judul,
      no_berkas,
      catatan,
      keterangan_atas,
      ukuran_kertas,
      orientasi,
      photo_data,
    } = req.body;
    const userId = req.user.id;
    const workspaceId = req.params.id;

    if (!judul) {
      return res.status(400).json({ message: "Judul harus diisi" });
    }

    const conn = await pool.getConnection();
    try {
      const [existing] = await conn.query(
        "SELECT id FROM workspaces WHERE id = ? AND user_id = ?",
        [workspaceId, userId],
      );
      if (existing.length === 0) {
        return res.status(404).json({ message: "Workspace tidak ditemukan" });
      }

      await conn.beginTransaction();

      await conn.query(
        "UPDATE workspaces SET judul = ?, no_berkas = ?, catatan = ?, keterangan_atas = ?, ukuran_kertas = ?, orientasi = ? WHERE id = ? AND user_id = ?",
        [
          judul,
          no_berkas || null,
          catatan || null,
          keterangan_atas || null,
          ukuran_kertas || "A4",
          orientasi || "Portrait",
          workspaceId,
          userId,
        ],
      );

      const [oldPhotos] = await conn.query(
        "SELECT foto_path FROM workspace_photos WHERE workspace_id = ?",
        [workspaceId],
      );

      await conn.query("DELETE FROM workspace_photos WHERE workspace_id = ?", [
        workspaceId,
      ]);

      let photoMeta = [];
      try {
        photoMeta = JSON.parse(photo_data || "[]");
      } catch {
        photoMeta = [];
      }

      const files = req.files || [];
      let fileIndex = 0;
      const newPaths = new Set();

      for (let i = 0; i < 4; i++) {
        const meta = photoMeta[i] || {};
        let fotoPath = null;

        if (meta.hasNewFile && files[fileIndex]) {
          fotoPath = files[fileIndex].path;
          fileIndex++;
        } else if (meta.existingPath) {
          fotoPath = meta.existingPath;
        }

        if (fotoPath) newPaths.add(fotoPath);

        await conn.query(
          "INSERT INTO workspace_photos (workspace_id, foto_path, keterangan, arah, pos_y, urutan) VALUES (?, ?, ?, ?, ?, ?)",
          [
            workspaceId,
            fotoPath,
            meta.keterangan || "",
            meta.arah || "Kiri",
            meta.pos_y != null ? meta.pos_y : 50,
            i,
          ],
        );
      }

      await conn.commit();

      for (const photo of oldPhotos) {
        if (photo.foto_path && !newPaths.has(photo.foto_path)) {
          // Extract Cloudinary public_id from URL and delete
          const publicId = extractPublicId(photo.foto_path);
          if (publicId) {
            cloudinary.uploader.destroy(publicId).catch(() => {});
          }
        }
      }

      res.json({ message: "Workspace berhasil diupdate" });
    } catch (err) {
      await conn.rollback();
      console.error(err);
      res.status(500).json({ message: "Terjadi kesalahan server" });
    } finally {
      conn.release();
    }
  },
);

// Helper: extract Cloudinary public_id from URL
function extractPublicId(url) {
  if (!url || !url.includes("cloudinary")) return null;
  const parts = url.split("/upload/");
  if (parts.length < 2) return null;
  // Remove version prefix (v1234567890/) and file extension
  const afterUpload = parts[1].replace(/^v\d+\//, "");
  return afterUpload.replace(/\.[^.]+$/, "");
}

// DELETE WORKSPACE
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const [photos] = await pool.query(
      "SELECT foto_path FROM workspace_photos WHERE workspace_id = ? AND foto_path IS NOT NULL",
      [req.params.id],
    );

    // Delete photo files from Cloudinary
    for (const photo of photos) {
      const publicId = extractPublicId(photo.foto_path);
      if (publicId) {
        cloudinary.uploader.destroy(publicId).catch(() => {});
      }
    }

    await pool.query("DELETE FROM workspaces WHERE id = ? AND user_id = ?", [
      req.params.id,
      req.user.id,
    ]);

    res.json({ message: "Workspace berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

module.exports = router;
