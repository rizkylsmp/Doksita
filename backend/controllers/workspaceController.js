const pool = require("../config/db");
const { deleteByUrl } = require("../config/cloudinary");

// CREATE WORKSPACE
exports.create = async (req, res) => {
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
    const photoMeta = safeParseJson(photo_data);
    const files = req.files || [];

    for (let i = 0; i < 4; i++) {
      const file = files[i];
      const meta = photoMeta[i] || {};

      await conn.query(
        "INSERT INTO workspace_photos (workspace_id, foto_path, keterangan, arah, pos_y, urutan) VALUES (?, ?, ?, ?, ?, ?)",
        [
          workspaceId,
          file ? file.path : null,
          meta.keterangan || "",
          meta.arah || "Kiri",
          meta.pos_y ?? 50,
          i,
        ],
      );
    }

    await conn.commit();
    res
      .status(201)
      .json({ message: "Workspace berhasil disimpan", id: workspaceId });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  } finally {
    conn.release();
  }
};

// GET ALL WORKSPACES (user's own)
exports.getAll = async (req, res) => {
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
};

// GET SINGLE WORKSPACE with photos
exports.getById = async (req, res) => {
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
};

// UPDATE WORKSPACE
exports.update = async (req, res) => {
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

    const photoMeta = safeParseJson(photo_data);
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
          meta.pos_y ?? 50,
          i,
        ],
      );
    }

    await conn.commit();

    // Clean up removed photos from Cloudinary
    for (const photo of oldPhotos) {
      if (photo.foto_path && !newPaths.has(photo.foto_path)) {
        deleteByUrl(photo.foto_path);
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
};

// DELETE WORKSPACE
exports.remove = async (req, res) => {
  try {
    const [photos] = await pool.query(
      "SELECT foto_path FROM workspace_photos WHERE workspace_id = ? AND foto_path IS NOT NULL",
      [req.params.id],
    );

    for (const photo of photos) {
      deleteByUrl(photo.foto_path);
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
};

// Helper
function safeParseJson(str) {
  try {
    return JSON.parse(str || "[]");
  } catch {
    return [];
  }
}
