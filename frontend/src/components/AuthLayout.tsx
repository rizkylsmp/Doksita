import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

const AuthLayout = ({ title, subtitle, children, footer }: AuthLayoutProps) => (
  <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-brand-light via-white to-brand-light">
    <div className="w-full max-w-md px-6 py-8">
      {/* Logo & Title */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 mb-3">
          <img src="./bpn.svg" alt="Logo" className="w-full h-full" />
        </div>
        <h1 className="text-3xl font-bold italic text-brand-dark">DOKSITA</h1>
        <p className="text-sm text-muted mt-1">Dokumentasi Situasi Tanah</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-muted mt-1">{subtitle}</p>
        </div>
        {children}
      </div>

      {footer || (
        <p className="text-center text-xs text-muted mt-6">
          &copy; 2026 BPN Kota Pekalongan
        </p>
      )}
    </div>
  </div>
);

export const AuthFooterLink = ({
  text,
  linkText,
  to,
}: {
  text: string;
  linkText: string;
  to: string;
}) => (
  <p className="text-center text-sm text-muted mt-6">
    {text}{" "}
    <Link
      to={to}
      className="font-semibold text-brand hover:text-brand-dark hover:underline"
    >
      {linkText}
    </Link>
  </p>
);

export default AuthLayout;
