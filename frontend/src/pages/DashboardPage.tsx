import { Link } from "react-router-dom";

const menuItems = [
  {
    title: "Workspace",
    description:
      "Ruang kerja utama untuk mengelola proses dokumentasi, menyusun layout foto, melakukan penyimpanan arsip, dan menyiapkan hasil akhir secara terstruktur.",
    path: "/workspace",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-7 h-7"
      >
        <path
          fillRule="evenodd"
          d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z"
          clipRule="evenodd"
        />
        <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
      </svg>
    ),
    color: "from-warning to-orange-500",
    iconBg: "bg-warning-light text-warning-dark",
  },
  {
    title: "Documentation",
    description:
      "Fitur pengelolaan arsip dokumentasi kegiatan lapangan yang tersimpan sistematis, mudah ditelusuri, ditinjau ulang, dan diekspor sebagai dokumen resmi.",
    path: "/documentation",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-7 h-7"
      >
        <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM1.5 10.146V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.146A4.483 4.483 0 0019.5 9h-15a4.483 4.483 0 00-3 1.146z" />
      </svg>
    ),
    color: "from-brand-medium to-brand",
    iconBg: "bg-brand-light text-brand",
  },
  {
    title: "Information",
    description:
      "Menyajikan informasi, panduan penggunaan, dan perbaikan sistem.",
    path: "/information",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-7 h-7"
      >
        <path
          fillRule="evenodd"
          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
          clipRule="evenodd"
        />
      </svg>
    ),
    color: "from-accent to-teal-600",
    iconBg: "bg-accent-light text-accent-dark",
  },
];

const DashboardPage = () => {
  return (
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
            {/* Gradient accent top */}
            <div className={`h-1.5 bg-linear-to-r ${item.color}`} />

            <div className="p-6">
              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-xl ${item.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                {item.icon}
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {item.description}
              </p>

              {/* Arrow */}
              <div className="mt-4 flex items-center text-sm font-medium text-brand opacity-0 group-hover:opacity-100 transition-opacity">
                Buka
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4 ml-1"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-gray-400 mt-12">
        &copy; 2026 DOKSITA. All rights reserved.
      </p>
    </div>
  );
};

export default DashboardPage;
