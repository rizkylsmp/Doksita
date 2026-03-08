import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import api from "../api/axios";

interface PhotoSlot {
  file: File | null;
  preview: string;
  keterangan: string;
  arah: string;
  existingPath?: string | null;
}

const defaultSlot = (): PhotoSlot => ({
  file: null,
  preview: "",
  keterangan: "",
  arah: "Kiri",
  existingPath: null,
});

const arahOptions = [
  "Kiri",
  "Kanan",
  "Depan",
  "Belakang",
  "Utara",
  "Selatan",
  "Timur",
  "Barat",
];

const WorkspaceFormPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const initialState = location.state as any;

  const [judul, setJudul] = useState(initialState?.judul || "");
  const [photos, setPhotos] = useState<PhotoSlot[]>(
    initialState?.photos
      ? initialState.photos.map((p: any) => ({
          file: null,
          preview: p.preview || "",
          keterangan: p.keterangan || "",
          arah: p.arah || "Kiri",
          existingPath: p.existingPath || null,
        }))
      : [defaultSlot(), defaultSlot(), defaultSlot(), defaultSlot()],
  );
  const [catatan, setCatatan] = useState(initialState?.catatan || "");
  const [ukuranKertas, setUkuranKertas] = useState(
    initialState?.ukuranKertas || "A4",
  );
  const [orientasi, setOrientasi] = useState(
    initialState?.orientasi || "Portrait",
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [loading, setLoading] = useState(isEditing && !initialState);

  useEffect(() => {
    if (isEditing && !initialState) {
      const fetchWorkspace = async () => {
        try {
          const res = await api.get(`/workspaces/${id}`);
          const data = res.data;
          setJudul(data.judul);
          setCatatan(data.catatan || "");
          setUkuranKertas(data.ukuran_kertas || "A4");
          setOrientasi(data.orientasi || "Portrait");
          setPhotos(
            data.photos.map((p: any) => ({
              file: null,
              preview: p.foto_path
                ? p.foto_path.startsWith("http")
                  ? p.foto_path
                  : `http://localhost:5000${p.foto_path}`
                : "",
              keterangan: p.keterangan || "",
              arah: p.arah || "Kiri",
              existingPath: p.foto_path || null,
            })),
          );
        } catch {
          alert("Gagal memuat workspace");
          navigate("/workspace");
        } finally {
          setLoading(false);
        }
      };
      fetchWorkspace();
    }
  }, []);

  const handleSave = async () => {
    if (!judul.trim()) {
      setSaveError("Judul harus diisi");
      return;
    }

    setSaving(true);
    setSaveError("");

    try {
      const formData = new FormData();
      formData.append("judul", judul);
      formData.append("catatan", catatan);
      formData.append("ukuran_kertas", ukuranKertas);
      formData.append("orientasi", orientasi);

      const photoMeta = photos.map((p) => ({
        keterangan: p.keterangan,
        arah: p.arah,
        hasNewFile: !!p.file,
        existingPath: p.existingPath || null,
      }));
      formData.append("photo_data", JSON.stringify(photoMeta));

      photos.forEach((p) => {
        if (p.file) {
          formData.append("photos", p.file);
        }
      });

      if (isEditing) {
        await api.put(`/workspaces/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/workspaces", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      navigate("/workspace");
    } catch (err: any) {
      setSaveError(err.response?.data?.message || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (index: number, file: File) => {
    const updated = [...photos];
    updated[index] = {
      ...updated[index],
      file,
      preview: URL.createObjectURL(file),
    };
    setPhotos(updated);
  };

  const handleFieldChange = (
    index: number,
    field: "keterangan" | "arah",
    value: string,
  ) => {
    const updated = [...photos];
    updated[index] = { ...updated[index], [field]: value };
    setPhotos(updated);
  };

  const handleRemovePhoto = (index: number) => {
    const updated = [...photos];
    if (updated[index].preview && !updated[index].existingPath) {
      URL.revokeObjectURL(updated[index].preview);
    }
    updated[index] = defaultSlot();
    setPhotos(updated);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-500">
        Memuat...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate("/workspace")}
        className="flex items-center gap-1 text-sm text-brand hover:text-brand-dark font-medium mb-6 cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path
            fillRule="evenodd"
            d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
            clipRule="evenodd"
          />
        </svg>
        Kembali
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Error */}
        {saveError && (
          <p className="text-sm bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2">
            {saveError}
          </p>
        )}

        {/* Judul */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Judul
          </label>
          <input
            type="text"
            placeholder="Masukan judul dokumentasi"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          />
        </div>

        {/* Photo Grid */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Foto Dokumentasi
          </label>
          <div className="grid grid-cols-2 gap-4">
            {photos.map((slot, i) => (
              <div
                key={i}
                className="border border-gray-300 rounded-xl overflow-hidden bg-brand-lighter"
              >
                {/* Upload area */}
                <div className="relative h-36 flex items-center justify-center bg-brand-light border-b border-gray-300">
                  {slot.preview ? (
                    <>
                      <img
                        src={slot.preview}
                        alt={`Foto ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleRemovePhoto(i)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <label className="flex flex-col items-center gap-1 cursor-pointer text-brand hover:text-brand-dark transition-colors">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-8 h-8"
                      >
                        <path
                          fillRule="evenodd"
                          d="M11.47 2.47a.75.75 0 011.06 0l3.75 3.75a.75.75 0 01-1.06 1.06l-2.47-2.47V15a.75.75 0 01-1.5 0V4.81L8.78 7.28a.75.75 0 01-1.06-1.06l3.75-3.75zM3 15.75a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs font-medium">Upload Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handlePhotoChange(i, f);
                        }}
                      />
                    </label>
                  )}
                </div>

                {/* Keterangan & Arah */}
                <div className="p-3 space-y-2">
                  <input
                    type="text"
                    placeholder="Keterangan ........."
                    value={slot.keterangan}
                    onChange={(e) =>
                      handleFieldChange(i, "keterangan", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-xs outline-none focus:border-brand bg-white"
                  />
                  <select
                    value={slot.arah}
                    onChange={(e) =>
                      handleFieldChange(i, "arah", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-xs outline-none focus:border-brand bg-brand-light font-medium cursor-pointer"
                  >
                    {arahOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Catatan */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Catatan
          </label>
          <textarea
            placeholder="Tambahkan catatan..."
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand resize-none"
          />
        </div>

        {/* Pengaturan Kertas & Aksi */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 pt-2 border-t border-gray-200">
          {/* Ukuran & Orientasi */}
          <div className="flex gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Ukuran
              </label>
              <select
                value={ukuranKertas}
                onChange={(e) => setUkuranKertas(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand bg-white cursor-pointer"
              >
                <option value="A4">A4</option>
                <option value="A3">A3</option>
                <option value="Letter">Letter</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Orientasi
              </label>
              <select
                value={orientasi}
                onChange={(e) => setOrientasi(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand bg-white cursor-pointer"
              >
                <option value="Portrait">Portrait</option>
                <option value="Landscape">Landscape</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 sm:ml-auto">
            <button
              onClick={() =>
                navigate("/workspace/preview", {
                  state: {
                    judul,
                    photos: photos.map((p) => ({
                      preview: p.preview,
                      keterangan: p.keterangan,
                      arah: p.arah,
                      existingPath: p.existingPath || null,
                    })),
                    catatan,
                    ukuranKertas,
                    orientasi,
                    editId: id || null,
                    fromForm: true,
                  },
                })
              }
              className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Preview
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 bg-accent hover:bg-accent-dark disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {saving ? "Menyimpan..." : isEditing ? "Update" : "Simpan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceFormPage;
