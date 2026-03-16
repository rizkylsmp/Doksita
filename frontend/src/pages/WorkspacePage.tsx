import { Link } from "react-router-dom";
import { useWorkspaces } from "../hooks/useWorkspaces";
import { PlusIcon, FolderIcon } from "../components/icons";

const WorkspacePage = () => {
  const { workspaces, loading, handleDelete, handleOpen, navigate } =
    useWorkspaces();

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
          <PlusIcon />
          Buat Baru
        </Link>
      </div>

      {loading && (
        <div className="text-center py-16 text-gray-500">Memuat...</div>
      )}

      {!loading && workspaces.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <div className="w-20 h-20 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-5">
            <FolderIcon className="w-10 h-10 text-brand" />
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
                {ws.no_berkas && (
                  <p className="text-xs text-brand font-medium mb-1">
                    No Berkas : {ws.no_berkas}
                  </p>
                )}
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
