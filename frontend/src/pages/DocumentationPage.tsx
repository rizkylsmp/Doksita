import { useWorkspaces } from "../hooks/useWorkspaces";
import { DocumentIcon, EditIcon, TrashIcon } from "../components/icons";

const DocumentationPage = () => {
  const { workspaces, loading, handleDelete, handleOpen, navigate } =
    useWorkspaces();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Documentation</h1>
        <p className="text-sm text-gray-500 mt-1">
          Arsip dokumentasi situasi tanah
        </p>
      </div>

      {loading && (
        <div className="text-center py-16 text-gray-500">Memuat...</div>
      )}

      {!loading && workspaces.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <div className="w-20 h-20 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-5">
            <DocumentIcon className="w-10 h-10 text-brand" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Belum ada arsip dokumentasi
          </h3>
          <p className="text-sm text-gray-500">
            Dokumentasi yang sudah dibuat di Workspace akan muncul di sini
          </p>
        </div>
      )}

      {!loading && workspaces.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {workspaces.map((ws) => (
              <div
                key={ws.id}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <button
                  onClick={() => handleOpen(ws.id, true)}
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

                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <button
                    onClick={() =>
                      navigate(`/workspace/edit/${ws.id}`, {
                        state: { fromDocumentation: true },
                      })
                    }
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-accent-light hover:bg-emerald-200 text-accent-dark transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={() => handleDelete(ws.id)}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-danger-light hover:bg-red-200 text-danger transition-colors cursor-pointer"
                    title="Hapus"
                  >
                    <TrashIcon />
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
