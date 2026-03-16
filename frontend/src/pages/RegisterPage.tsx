import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import AuthLayout, { AuthFooterLink } from "../components/AuthLayout";
import FormInput from "../components/FormInput";
import SubmitButton from "../components/SubmitButton";
import Alert from "../components/Alert";
import {
  UserIcon,
  UserCircleIcon,
  EmailIcon,
  LockIcon,
} from "../components/icons";

const RegisterPage = () => {
  const [nama, setNama] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nama || !username || !email || !password || !confirmPassword) {
      setError("Semua field harus diisi");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak sama");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", { nama, username, email, password });
      navigate("/login", { state: { registered: true } });
    } catch (err: any) {
      setError(err.response?.data?.message || "Registrasi gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Buat Akun Baru"
      subtitle="Isi data berikut untuk mendaftar"
    >
      {error && <Alert type="error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Nama Lengkap"
          placeholder="Masukkan nama lengkap"
          value={nama}
          onChange={setNama}
          icon={<UserIcon />}
        />
        <FormInput
          label="Username"
          placeholder="Masukkan username"
          value={username}
          onChange={setUsername}
          icon={<UserCircleIcon />}
        />
        <FormInput
          label="Email"
          type="email"
          placeholder="Masukkan email"
          value={email}
          onChange={setEmail}
          icon={<EmailIcon />}
        />
        <FormInput
          label="Password"
          type="password"
          placeholder="Minimal 6 karakter"
          value={password}
          onChange={setPassword}
          icon={<LockIcon />}
        />
        <FormInput
          label="Konfirmasi Password"
          type="password"
          placeholder="Ulangi password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          icon={<LockIcon />}
        />

        <SubmitButton
          loading={loading}
          loadingText="Mendaftar..."
          text="Daftar"
        />
      </form>

      <AuthFooterLink
        text="Sudah punya akun?"
        linkText="Masuk di sini"
        to="/login"
      />
    </AuthLayout>
  );
};

export default RegisterPage;
