import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout, { AuthFooterLink } from "../components/AuthLayout";
import FormInput from "../components/FormInput";
import SubmitButton from "../components/SubmitButton";
import Alert from "../components/Alert";
import { UserIcon, LockIcon } from "../components/icons";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const registered = location.state?.registered;
  const resetSuccess = location.state?.resetSuccess;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Username/email dan password harus diisi");
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Selamat Datang"
      subtitle="Masuk ke akun untuk melanjutkan"
    >
      {registered && (
        <Alert type="success" message="Registrasi berhasil! Silakan login." />
      )}
      {resetSuccess && (
        <Alert
          type="success"
          message="Password berhasil direset! Silakan login dengan password baru."
        />
      )}
      {error && <Alert type="error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormInput
          label="Email atau Username"
          placeholder="Masukkan email atau username"
          value={username}
          onChange={setUsername}
          icon={<UserIcon />}
        />
        <FormInput
          label="Password"
          type="password"
          placeholder="Masukkan password"
          value={password}
          onChange={setPassword}
          icon={<LockIcon />}
        />

        <div className="text-right">
          <Link
            to="/forgot-password"
            className="text-sm text-brand hover:text-brand-dark hover:underline"
          >
            Lupa Password?
          </Link>
        </div>

        <SubmitButton
          loading={loading}
          loadingText="Memproses..."
          text="Masuk"
        />
      </form>

      <AuthFooterLink
        text="Belum punya akun?"
        linkText="Daftar di sini"
        to="/register"
      />
    </AuthLayout>
  );
};

export default LoginPage;
