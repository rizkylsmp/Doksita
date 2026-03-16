import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import AuthLayout from "../components/AuthLayout";
import FormInput from "../components/FormInput";
import SubmitButton from "../components/SubmitButton";
import Alert from "../components/Alert";
import {
  EmailIcon,
  TagIcon,
  LockIcon,
  ArrowLeftIcon,
} from "../components/icons";

const ForgotPasswordPage = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Email harus diisi");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setSuccess(res.data.message);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal mengirim OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!otp) {
      setError("Kode OTP harus diisi");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/verify-otp", { email, otp });
      setSuccess("Kode OTP valid! Silakan buat password baru.");
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || "Kode OTP tidak valid");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!newPassword || !confirmPassword) {
      setError("Semua field harus diisi");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { email, otp, newPassword });
      navigate("/login", { state: { resetSuccess: true }, replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal mereset password");
    } finally {
      setLoading(false);
    }
  };

  const subtitles = {
    1: "Masukkan email yang terdaftar untuk menerima kode OTP",
    2: "Masukkan kode OTP yang dikirim ke email Anda",
    3: "Buat password baru untuk akun Anda",
  };

  return (
    <AuthLayout title="Lupa Password" subtitle={subtitles[step]}>
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                step >= s ? "bg-brand text-white" : "bg-gray-200 text-muted"
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`w-8 h-0.5 ${step > s ? "bg-brand" : "bg-gray-200"}`}
              />
            )}
          </div>
        ))}
      </div>

      {success && step !== 3 && <Alert type="success" message={success} />}
      {error && <Alert type="error" message={error} />}

      {/* Step 1: Email */}
      {step === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-5">
          <FormInput
            label="Email"
            type="email"
            placeholder="Masukkan email terdaftar"
            value={email}
            onChange={setEmail}
            icon={<EmailIcon />}
          />
          <SubmitButton
            loading={loading}
            loadingText="Mengirim..."
            text="Kirim Kode OTP"
          />
        </form>
      )}

      {/* Step 2: OTP */}
      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <div>
            <FormInput
              label="Kode OTP"
              placeholder="Masukkan 6 digit kode OTP"
              value={otp}
              onChange={(val) => setOtp(val.replace(/\D/g, "").slice(0, 6))}
              icon={<TagIcon />}
              maxLength={6}
              className="text-lg tracking-widest text-center font-mono"
            />
            <p className="text-xs text-muted mt-2">
              Kode dikirim ke <span className="font-semibold">{email}</span>.
              Berlaku 10 menit.
            </p>
          </div>
          <SubmitButton
            loading={loading}
            loadingText="Memverifikasi..."
            text="Verifikasi OTP"
            disabled={otp.length !== 6}
          />
          <button
            type="button"
            onClick={() => {
              setStep(1);
              setOtp("");
              setError("");
              setSuccess("");
            }}
            className="w-full text-sm text-muted hover:text-brand cursor-pointer transition-colors"
          >
            Kirim ulang kode OTP
          </button>
        </form>
      )}

      {/* Step 3: New Password */}
      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-5">
          <FormInput
            label="Password Baru"
            type="password"
            placeholder="Minimal 6 karakter"
            value={newPassword}
            onChange={setNewPassword}
            icon={<LockIcon />}
          />
          <FormInput
            label="Konfirmasi Password Baru"
            type="password"
            placeholder="Ulangi password baru"
            value={confirmPassword}
            onChange={setConfirmPassword}
            icon={<LockIcon />}
          />
          <SubmitButton
            loading={loading}
            loadingText="Memproses..."
            text="Reset Password"
          />
        </form>
      )}

      {/* Back to Login */}
      <p className="text-center text-sm text-muted mt-6">
        <Link
          to="/login"
          className="font-semibold text-brand hover:text-brand-dark hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Kembali ke Login
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
