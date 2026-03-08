const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pool = require("../config/db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "..", "uploads", "workspace");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
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
        "INSERT INTO workspaces (user_id, judul, catatan, keterangan_atas, ukuran_kertas, orientasi) VALUES (?, ?, ?, ?, ?, ?)",
        [
          userId,
          judul,
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
        const fotoPath = file ? `/uploads/workspace/${file.filename}` : null;

        await conn.query(
          "INSERT INTO workspace_photos (workspace_id, foto_path, keterangan, arah, urutan) VALUES (?, ?, ?, ?, ?)",
          [
            workspaceId,
            fotoPath,
            meta.keterangan || "",
            meta.arah || "Kiri",
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
      "SELECT id, judul, catatan, keterangan_atas, ukuran_kertas, orientasi, created_at, updated_at FROM workspaces WHERE user_id = ? ORDER BY updated_at DESC",
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
      "SELECT id, foto_path, keterangan, arah, urutan FROM workspace_photos WHERE workspace_id = ? ORDER BY urutan",
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
        "UPDATE workspaces SET judul = ?, catatan = ?, keterangan_atas = ?, ukuran_kertas = ?, orientasi = ? WHERE id = ? AND user_id = ?",
        [
          judul,
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
          fotoPath = `/uploads/workspace/${files[fileIndex].filename}`;
          fileIndex++;
        } else if (meta.existingPath) {
          fotoPath = meta.existingPath;
        }

        if (fotoPath) newPaths.add(fotoPath);

        await conn.query(
          "INSERT INTO workspace_photos (workspace_id, foto_path, keterangan, arah, urutan) VALUES (?, ?, ?, ?, ?)",
          [
            workspaceId,
            fotoPath,
            meta.keterangan || "",
            meta.arah || "Kiri",
            i,
          ],
        );
      }

      await conn.commit();

      for (const photo of oldPhotos) {
        if (photo.foto_path && !newPaths.has(photo.foto_path)) {
          const filePath = path.join(__dirname, "..", photo.foto_path);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
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

// DELETE WORKSPACE
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const [photos] = await pool.query(
      "SELECT foto_path FROM workspace_photos WHERE workspace_id = ? AND foto_path IS NOT NULL",
      [req.params.id],
    );

    // Delete photo files
    for (const photo of photos) {
      const filePath = path.join(__dirname, "..", photo.foto_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
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
