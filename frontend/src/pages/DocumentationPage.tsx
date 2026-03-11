import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

interface Workspace {
  id: number;
  judul: string;
  catatan: string;
  ukuran_kertas: string;
  orientasi: string;
  created_at: string;
}

const DocumentationPage = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const res = await api.get("/workspaces");
      setWorkspaces(res.data);
    } catch {
      console.error("Gagal memuat dokumentasi");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus dokumentasi ini?")) return;
    try {
      await api.delete(`/workspaces/${id}`);
      setWorkspaces((prev) => prev.filter((w) => w.id !== id));
    } catch {
      alert("Gagal menghapus dokumentasi");
    }
  };

  const handleOpen = async (id: number) => {
    try {
      const res = await api.get(`/workspaces/${id}`);
      const data = res.data;
      navigate("/workspace/preview", {
        state: {
          judul: data.judul,
          photos: data.photos.map((p: any) => ({
            preview: p.foto_path
              ? p.foto_path.startsWith("http")
                ? p.foto_path
                : `http://localhost:5000${p.foto_path}`
              : "",
            keterangan: p.keterangan,
            arah: p.arah,
          })),
          noBerkas: data.no_berkas,
          catatan: data.catatan,
          keteranganAtas: data.keterangan_atas,
          ukuranKertas: data.ukuran_kertas,
          orientasi: data.orientasi,
          fromDocumentation: true,
        },
      });
    } catch {
      alert("Gagal membuka dokumentasi");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Documentation</h1>
        <p className="text-sm text-gray-500 mt-1">
          Arsip dokumentasi situasi tanah
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-16 text-gray-500">Memuat...</div>
      )}

      {/* Empty State */}
      {!loading && workspaces.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <div className="w-20 h-20 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-10 h-10 text-brand"
            >
              <path
                fillRule="evenodd"
                d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z"
                clipRule="evenodd"
              />
              <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Belum ada arsip dokumentasi
          </h3>
          <p className="text-sm text-gray-500">
            Dokumentasi yang sudah dibuat di Workspace akan muncul di sini
          </p>
        </div>
      )}

      {/* Archive List */}
      {!loading && workspaces.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {workspaces.map((ws) => (
              <div
                key={ws.id}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                {/* Info */}
                <button
                  onClick={() => handleOpen(ws.id)}
                  className="flex-1 min-w-0 text-left cursor-pointer"
                >
                  <h3 className="font-semibold text-gray-900 truncate">
                    {ws.judul}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(ws.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </button>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  {/* Edit */}
                  <button
                    onClick={() =>
                      navigate(`/workspace/edit/${ws.id}`, {
                        state: { fromDocumentation: true },
                      })
                    }
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-accent-light hover:bg-emerald-200 text-accent-dark transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                    </svg>
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(ws.id)}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-danger-light hover:bg-red-200 text-danger transition-colors cursor-pointer"
                    title="Hapus"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022 1.005 11.36A2.75 2.75 0 007.77 20h4.46a2.75 2.75 0 002.75-2.689l1.006-11.36.148.022a.75.75 0 10.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 01.78.72l.5 6a.75.75 0 01-1.49.12l-.5-6a.75.75 0 01.71-.84zm2.84 0a.75.75 0 01.71.84l-.5 6a.75.75 0 11-1.49-.12l.5-6a.75.75 0 01.78-.72z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentationPage;
