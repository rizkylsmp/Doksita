import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { label: "Dashboard", path: "/" },
  { label: "Workspace", path: "/workspace" },
  { label: "Documentation", path: "/documentation" },
  { label: "Information", path: "/information" },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-brand-dark text-white shadow-lg print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="./bpn.svg" alt="Logo" className="w-8 h-8" />
            <span className="text-xl font-bold italic">DOKSITA</span>
          </Link>

          {/* Nav Links - Desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-brand text-white"
                      : "text-sky-100 hover:bg-sky-700 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Profile Info - Desktop */}
            <div className="hidden lg:block text-right mr-1 max-w-[160px]">
              <p className="text-sm font-medium leading-tight truncate">
                {user?.nama}
              </p>
              <p className="text-xs text-sky-300 truncate">{user?.username}</p>
            </div>

            {/* Profile Dropdown - Desktop */}
            <div className="hidden lg:block relative group">
              <button className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-sm font-bold hover:bg-brand-medium transition-colors cursor-pointer">
                {user?.nama?.charAt(0).toUpperCase() || "U"}
              </button>
              <div className="absolute right-0 mt-2 w-44 bg-white text-gray-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <Link
                  to="/profile"
                  className="block px-4 py-2.5 text-sm hover:bg-gray-100 rounded-t-lg"
                >
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-gray-100 rounded-b-lg cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Hamburger - Mobile */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-sky-700 transition-colors cursor-pointer"
              aria-label="Menu"
            >
              {mobileOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-sky-700 bg-brand-dark">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-brand text-white"
                      : "text-sky-100 hover:bg-sky-700"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="border-t border-sky-700 px-4 py-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-sm font-bold">
                {user?.nama?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <p className="text-sm font-medium">{user?.nama}</p>
                <p className="text-xs text-sky-300">{user?.username}</p>
              </div>
            </div>
            <Link
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2 text-sm text-sky-100 hover:bg-sky-700 rounded-lg mb-1"
            >
              Profile
            </Link>
            <button
              onClick={() => {
                logout();
                setMobileOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-300 hover:bg-sky-700 rounded-lg cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
