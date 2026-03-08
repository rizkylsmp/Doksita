import { useState } from "react";

const steps = [
  {
    title: "Buat Workspace Baru",
    desc: "Klik tombol 'Buat Baru' di halaman Workspace untuk memulai dokumentasi baru.",
  },
  {
    title: "Isi Data Dokumen",
    desc: "Masukkan judul dokumen, unggah hingga 4 foto situasi tanah beserta keterangan arah dan deskripsi masing-masing foto.",
  },
  {
    title: "Preview & Cetak",
    desc: "Gunakan tombol Preview untuk melihat tampilan dokumen sebelum dicetak atau diekspor ke PDF.",
  },
  {
    title: "Simpan & Arsipkan",
    desc: "Simpan dokumen ke database. Dokumen yang tersimpan dapat dilihat kembali di halaman Documentation.",
  },
];

const faqs = [
  {
    q: "Apa itu DOKSITA?",
    a: "DOKSITA (Dokumentasi Situasi Tanah) adalah aplikasi berbasis web yang dirancang untuk membantu pegawai BPN Kota Pekalongan dalam mendokumentasikan kondisi situasi tanah secara digital, terstruktur, dan siap cetak.",
  },
  {
    q: "Format dokumen apa saja yang didukung?",
    a: "Aplikasi mendukung ukuran kertas A4, A3, dan Letter dengan orientasi Portrait maupun Landscape. Dokumen dapat diekspor dalam format PDF.",
  },
  {
    q: "Berapa jumlah foto maksimal per dokumen?",
    a: "Setiap dokumen workspace dapat memuat hingga 4 foto situasi tanah, masing-masing dilengkapi keterangan arah (Utara, Selatan, Timur, Barat) dan deskripsi.",
  },
  {
    q: "Apakah data tersimpan dengan aman?",
    a: "Ya, semua data disimpan di database server dan dilindungi dengan sistem autentikasi. Hanya pengguna yang login yang dapat mengakses dokumen miliknya.",
  },
  {
    q: "Bagaimana cara mengedit dokumen yang sudah disimpan?",
    a: "Buka halaman Workspace atau Documentation, lalu klik tombol Edit pada dokumen yang ingin diubah. Anda akan diarahkan ke form untuk memperbarui data.",
  },
];

const InformationPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Information</h1>
        <p className="text-sm text-gray-500 mt-1">
          Panduan penggunaan dan informasi aplikasi
        </p>
      </div>

      {/* About */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="h-1.5 bg-linear-to-r from-brand-medium to-brand" />
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-brand-light rounded-xl flex items-center justify-center shrink-0">
              <img src="./bpn.svg" alt="Logo BPN" className="w-9 h-9" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-dark italic">
                DOKSITA
              </h2>
              <p className="text-xs text-gray-400">Dokumentasi Situasi Tanah</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Aplikasi DOKSITA dikembangkan untuk mendukung kegiatan dokumentasi
            situasi tanah di lingkungan Kantor Pertanahan Kota Pekalongan.
            Dengan aplikasi ini, petugas lapangan dapat menyusun dokumentasi
            foto situasi tanah secara digital, lengkap dengan kop surat resmi,
            dan mengekspornya dalam format PDF yang siap cetak.
          </p>
        </div>
      </section>

      {/* Panduan Penggunaan */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="h-1.5 bg-linear-to-r from-accent to-teal-600" />
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 text-accent"
            >
              <path
                fillRule="evenodd"
                d="M2 3.5A1.5 1.5 0 013.5 2h9A1.5 1.5 0 0114 3.5v11.75A2.75 2.75 0 0016.75 18h-12A2.75 2.75 0 012 15.25V3.5zm3.75 7a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5zm0 3a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5zM5 5.75A.75.75 0 015.75 5h4.5a.75.75 0 01.75.75v2.5a.75.75 0 01-.75.75h-4.5A.75.75 0 015 8.25v-2.5z"
                clipRule="evenodd"
              />
              <path d="M16.5 6.5h-1v8.75a1.25 1.25 0 102.5 0V8a1.5 1.5 0 00-1.5-1.5z" />
            </svg>
            Panduan Penggunaan
          </h2>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-accent-light text-accent-dark font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="h-1.5 bg-linear-to-r from-warning to-orange-500" />
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 text-warning"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3.75 3.75 0 015.3 0l.006.006a3.063 3.063 0 01-.712 4.802A2.172 2.172 0 0011.5 12.5v.5a.75.75 0 01-1.5 0v-.5a3.672 3.672 0 011.588-2.958 1.563 1.563 0 00.364-2.45l-.005-.006a2.25 2.25 0 00-3.007-.141zM10 17a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            Pertanyaan Umum (FAQ)
          </h2>
          <div className="divide-y divide-gray-100">
            {faqs.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-3.5 text-left cursor-pointer group"
                >
                  <span className="text-sm font-medium text-gray-800 group-hover:text-brand transition-colors pr-4">
                    {faq.q}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {openFaq === i && (
                  <p className="text-sm text-gray-500 pb-4 leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info Instansi */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="h-1.5 bg-linear-to-r from-violet-400 to-purple-600" />
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 text-violet-500"
            >
              <path
                fillRule="evenodd"
                d="M1 2.75A.75.75 0 011.75 2h10.5a.75.75 0 010 1.5H2.403l2.023 2.023a4.5 4.5 0 005.14.919l3.747-1.874a.75.75 0 01.67 1.342l-3.747 1.874a6 6 0 01-6.854-1.225L1.36 4.537V6.75a.75.75 0 01-1.5 0V2.75zM1 14.75a.75.75 0 01.75-.75H12.5a.75.75 0 010 1.5H2.403l2.023 2.023a4.5 4.5 0 005.14.919l3.747-1.874a.75.75 0 01.67 1.342l-3.747 1.874a6 6 0 01-6.854-1.225L1.36 16.537v2.213a.75.75 0 01-1.5 0V14.75z"
                clipRule="evenodd"
              />
            </svg>
            Informasi Instansi
          </h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5 text-gray-400 shrink-0 mt-0.5"
              >
                <path
                  fillRule="evenodd"
                  d="M4 16.5v-13h-.25a.75.75 0 010-1.5h12.5a.75.75 0 010 1.5H16v13h.25a.75.75 0 010 1.5h-3.5a.75.75 0 01-.75-.75v-2.5a.75.75 0 00-.75-.75h-2.5a.75.75 0 00-.75.75v2.5a.75.75 0 01-.75.75h-3.5a.75.75 0 010-1.5H4zm3-11a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-1zm.5 3.5a.5.5 0 00-.5.5v1a.5.5 0 00.5.5h1a.5.5 0 00.5-.5v-1a.5.5 0 00-.5-.5h-1zm3.5-3.5a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-1zm.5 3.5a.5.5 0 00-.5.5v1a.5.5 0 00.5.5h1a.5.5 0 00.5-.5v-1a.5.5 0 00-.5-.5h-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="font-medium text-gray-800">
                  Kantor Pertanahan Kota Pekalongan
                </p>
                <p className="text-gray-500">Badan Pertanahan Nasional (BPN)</p>
              </div>
            </div>
            <div className="flex gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5 text-gray-400 shrink-0 mt-0.5"
              >
                <path
                  fillRule="evenodd"
                  d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
                  clipRule="evenodd"
                />
              </svg>
              <p>Jl. Merdeka No. 1, Kota Pekalongan, Jawa Tengah 51111</p>
            </div>
            <div className="flex gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5 text-gray-400 shrink-0 mt-0.5"
              >
                <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
              </svg>
              <p>kantah.kotapekalongan@atrbpn.go.id</p>
            </div>
          </div>
        </div>
      </section>

      {/* App Info Footer */}
      <div className="text-center text-xs text-gray-400 pt-2 pb-4">
        <p>DOKSITA v1.0.0 &mdash; &copy; 2026 BPN Kota Pekalongan</p>
      </div>
    </div>
  );
};

export default InformationPage;
