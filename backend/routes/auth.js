const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const pool = require("../config/db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// REGISTER
router.post("/register", async (req, res) => {
  const { nama, username, email, password } = req.body;

  if (!nama || !username || !email || !password) {
    return res.status(400).json({ message: "Semua field harus diisi" });
  }

  try {
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username, email],
    );

    if (existing.length > 0) {
      return res
        .status(409)
        .json({ message: "Username atau email sudah terdaftar" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (nama, username, email, password) VALUES (?, ?, ?, ?)",
      [nama, username, email, hashedPassword],
    );

    res.status(201).json({ message: "Registrasi berhasil" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username/email dan password harus diisi" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, username],
    );

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ message: "Username/email atau password salah" });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res
        .status(401)
        .json({ message: "Username/email atau password salah" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        nama: user.nama,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

// CHANGE PASSWORD
router.put("/change-password", authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Semua field harus diisi" });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "Password baru minimal 6 karakter" });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [
      req.user.id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const match = await bcrypt.compare(currentPassword, rows[0].password);
    if (!match) {
      return res
        .status(401)
        .json({ message: "Password saat ini tidak sesuai" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      req.user.id,
    ]);

    res.json({ message: "Password berhasil diubah" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

// FORGOT PASSWORD - Send OTP
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email harus diisi" });
  }

  try {
    const [users] = await pool.query(
      "SELECT id, nama FROM users WHERE email = ?",
      [email],
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "Email tidak terdaftar" });
    }

    // Generate 6-digit OTP
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate previous OTPs for this email
    await pool.query(
      "UPDATE password_resets SET used = 1 WHERE email = ? AND used = 0",
      [email],
    );

    // Save OTP
    await pool.query(
      "INSERT INTO password_resets (email, otp_code, expires_at) VALUES (?, ?, ?)",
      [email, otpCode, expiresAt],
    );

    // Send email
    await transporter.sendMail({
      from: `"DOKSITA BPN" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Kode OTP Reset Password - DOKSITA",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #0369a1; text-align: center;">DOKSITA</h2>
          <p>Halo <strong>${users[0].nama}</strong>,</p>
          <p>Anda menerima email ini karena ada permintaan reset password untuk akun Anda.</p>
          <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px;">Kode OTP Anda:</p>
            <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0369a1; margin: 0;">${otpCode}</p>
          </div>
          <p style="color: #64748b; font-size: 13px;">Kode ini berlaku selama <strong>10 menit</strong>. Jangan bagikan kode ini kepada siapapun.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">Jika Anda tidak meminta reset password, abaikan email ini.</p>
        </div>
      `,
    });

    res.json({ message: "Kode OTP telah dikirim ke email Anda" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Gagal mengirim OTP. Periksa konfigurasi email." });
  }
});

// VERIFY OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email dan kode OTP harus diisi" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM password_resets WHERE email = ? AND otp_code = ? AND used = 0 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
      [email, otp],
    );

    if (rows.length === 0) {
      return res
        .status(400)
        .json({ message: "Kode OTP tidak valid atau sudah kedaluwarsa" });
    }

    res.json({ message: "Kode OTP valid", valid: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

// RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "Semua field harus diisi" });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "Password baru minimal 6 karakter" });
  }

  try {
    // Verify OTP again
    const [rows] = await pool.query(
      "SELECT * FROM password_resets WHERE email = ? AND otp_code = ? AND used = 0 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
      [email, otp],
    );

    if (rows.length === 0) {
      return res
        .status(400)
        .json({ message: "Kode OTP tidak valid atau sudah kedaluwarsa" });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = ? WHERE email = ?", [
      hashedPassword,
      email,
    ]);

    // Mark OTP as used
    await pool.query("UPDATE password_resets SET used = 1 WHERE id = ?", [
      rows[0].id,
    ]);

    res.json({ message: "Password berhasil direset" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

module.exports = router;
