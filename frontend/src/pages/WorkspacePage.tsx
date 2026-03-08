import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

interface Workspace {
  id: number;
  judul: string;
  catatan: string;
  keterangan_atas: string;
  ukuran_kertas: string;
  orientasi: string;
  created_at: string;
}

const WorkspacePage = () => {
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
      console.error("Gagal memuat workspace");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus workspace ini?")) return;
    try {
      await api.delete(`/workspaces/${id}`);
      setWorkspaces((prev) => prev.filter((w) => w.id !== id));
    } catch {
      alert("Gagal menghapus workspace");
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
          catatan: data.catatan,
          keteranganAtas: data.keterangan_atas,
          ukuranKertas: data.ukuran_kertas,
          orientasi: data.orientasi,
        },
      });
    } catch {
      alert("Gagal membuka workspace");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workspace</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola dokumentasi situasi tanah
          </p>
        </div>
        <Link
          to="/workspace/create"
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Buat Baru
        </Link>
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
              <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM1.5 10.146V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.146A4.483 4.483 0 0019.5 9h-15a4.483 4.483 0 00-3 1.146z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Belum ada workspace
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Mulai buat dokumentasi baru dengan menekan tombol "Buat Baru"
          </p>
          <Link
            to="/workspace/create"
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            Buat Workspace Pertama
          </Link>
        </div>
      )}

      {/* Workspace List */}
      {!loading && workspaces.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="h-1.5 bg-linear-to-r from-brand-medium to-brand" />
              <div className="p-5">
                <h3 className="font-bold text-gray-900 mb-1 truncate">
                  {ws.judul}
                </h3>
                <p className="text-xs text-gray-400 mb-3">
                  {new Date(ws.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                {ws.catatan && (
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {ws.catatan}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpen(ws.id)}
                    className="flex-1 text-center py-2 bg-brand-lighter hover:bg-brand-light text-brand text-sm font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Buka
                  </button>
                  <button
                    onClick={() => navigate(`/workspace/edit/${ws.id}`)}
                    className="py-2 px-3 bg-warning-light hover:bg-amber-200 text-warning-dark text-sm font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(ws.id)}
                    className="py-2 px-3 bg-danger-light hover:bg-red-200 text-danger text-sm font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkspacePage;
