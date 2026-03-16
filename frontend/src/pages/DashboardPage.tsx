import { Link } from "react-router-dom";
import {
  DocumentIcon,
  FolderIcon,
  InfoCircleIcon,
  ArrowRightIcon,
} from "../components/icons";

const menuItems = [
  {
    title: "Workspace",
    description:
      "Ruang kerja utama untuk mengelola proses dokumentasi, menyusun layout foto, melakukan penyimpanan arsip, dan menyiapkan hasil akhir secara terstruktur.",
    path: "/workspace",
    icon: <DocumentIcon />,
    color: "from-warning to-orange-500",
    iconBg: "bg-warning-light text-warning-dark",
  },
  {
    title: "Documentation",
    description:
      "Fitur pengelolaan arsip dokumentasi kegiatan lapangan yang tersimpan sistematis, mudah ditelusuri, ditinjau ulang, dan diekspor sebagai dokumen resmi.",
    path: "/documentation",
    icon: <FolderIcon />,
    color: "from-brand-medium to-brand",
    iconBg: "bg-brand-light text-brand",
  },
  {
    title: "Information",
    description:
      "Menyajikan informasi, panduan penggunaan, dan perbaikan sistem.",
    path: "/information",
    icon: <InfoCircleIcon />,
    color: "from-accent to-teal-600",
    iconBg: "bg-accent-light text-accent-dark",
  },
];

const DashboardPage = () => (
  <div className="max-w-5xl mx-auto px-4 py-10">
    {/* Header */}
    <div className="text-center mb-10">
      <div className="flex justify-center mb-4">
        <img src="./bpn.svg" alt="Logo" className="w-20 h-20" />
      </div>
      <h1 className="text-3xl font-bold italic text-brand-dark">DOKSITA</h1>
      <p className="text-gray-500 mt-1 text-sm">Dokumentasi Situasi Tanah</p>
    </div>

    {/* Menu Cards */}
    <div className="grid gap-5 md:grid-cols-3">
      {menuItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1"
        >
          <div className={`h-1.5 bg-linear-to-r ${item.color}`} />
          <div className="p-6">
            <div
              className={`w-14 h-14 rounded-xl ${item.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
            >
              {item.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {item.title}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {item.description}
            </p>
            <div className="mt-4 flex items-center text-sm font-medium text-brand opacity-0 group-hover:opacity-100 transition-opacity">
              Buka
              <ArrowRightIcon className="w-4 h-4 ml-1" />
            </div>
          </div>
        </Link>
      ))}
    </div>

    <p className="text-center text-xs text-gray-400 mt-12">
      &copy; 2026 DOKSITA. All rights reserved.
    </p>
  </div>
);

export default DashboardPage;
