import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Alert from "../components/Alert";
import {
  UserIcon,
  UserCircleIcon,
  EmailIcon,
  LockIcon,
} from "../components/icons";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMessage(null);

    if (passwords.newPassword.length < 6) {
      setPwMessage({ type: "error", text: "Password baru minimal 6 karakter" });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPwMessage({ type: "error", text: "Konfirmasi password tidak cocok" });
      return;
    }

    setPwLoading(true);
    try {
      await api.put("/auth/change-password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPwMessage({ type: "success", text: "Password berhasil diubah" });
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      setPwMessage({
        type: "error",
        text: err.response?.data?.message || "Gagal mengubah password",
      });
    } finally {
      setPwLoading(false);
    }
  };

  const infoFields = [
    {
      label: "Nama Lengkap",
      value: user?.nama,
      icon: <UserIcon className="w-5 h-5 text-gray-400" />,
    },
    {
      label: "Username",
      value: user?.username,
      icon: <UserCircleIcon className="w-5 h-5 text-gray-400" />,
    },
    {
      label: "Email",
      value: user?.email,
      icon: <EmailIcon className="w-5 h-5 text-gray-400" />,
    },
  ];

  const passwordFields = [
    {
      label: "Password Saat Ini",
      key: "currentPassword" as const,
      placeholder: "Masukkan password saat ini",
    },
    {
      label: "Password Baru",
      key: "newPassword" as const,
      placeholder: "Minimal 6 karakter",
    },
    {
      label: "Konfirmasi Password Baru",
      key: "confirmPassword" as const,
      placeholder: "Ulangi password baru",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Informasi akun dan pengaturan
        </p>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="h-1.5 bg-linear-to-r from-brand-medium to-brand" />
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-brand flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {user?.nama?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900 truncate">
                {user?.nama}
              </h2>
              <p className="text-sm text-gray-500 truncate">
                @{user?.username}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {infoFields.map((field) => (
              <div
                key={field.label}
                className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg"
              >
                <span className="shrink-0">{field.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">{field.label}</p>
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {field.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="h-1.5 bg-linear-to-r from-warning to-orange-500" />
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <LockIcon className="w-5 h-5 text-warning" />
            Ubah Password
          </h2>

          {pwMessage && (
            <Alert type={pwMessage.type} message={pwMessage.text} />
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            {passwordFields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                <input
                  type="password"
                  value={passwords[field.key]}
                  onChange={(e) =>
                    setPasswords({ ...passwords, [field.key]: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-light focus:border-brand outline-none transition-colors"
                  placeholder={field.placeholder}
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={pwLoading}
              className="w-full py-2.5 bg-brand hover:bg-brand-dark disabled:bg-sky-300 text-white font-medium text-sm rounded-lg transition-colors cursor-pointer"
            >
              {pwLoading ? "Menyimpan..." : "Ubah Password"}
            </button>
          </form>
        </div>
      </div>

      {/* Logout */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Keluar dari akun</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Anda akan diarahkan ke halaman login
              </p>
            </div>
            <button
              onClick={logout}
              className="px-5 py-2.5 bg-danger-light hover:bg-red-200 text-danger font-medium text-sm rounded-lg transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
