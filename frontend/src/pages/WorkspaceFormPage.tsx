import { useState, useEffect, useRef, useCallback } from "react";
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
  const fromDocumentation = initialState?.fromDocumentation || false;
  const backPath = fromDocumentation ? "/documentation" : "/workspace";

  const [judul, setJudul] = useState(initialState?.judul || "");
  const [noBerkas, setNoBerkas] = useState(initialState?.noBerkas || "");
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
  const [actionSheet, setActionSheet] = useState<number | null>(null);
  const [cameraOpen, setCameraOpen] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment",
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(
    async (facing: "environment" | "user") => {
      stopCamera();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facing,
            width: { ideal: 1280 },
            height: { ideal: 960 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        alert("Tidak dapat mengakses kamera. Pastikan izin kamera diaktifkan.");
        setCameraOpen(null);
      }
    },
    [stopCamera],
  );

  useEffect(() => {
    if (cameraOpen !== null) {
      startCamera(facingMode);
    }
    return () => {
      if (cameraOpen === null) stopCamera();
    };
  }, [cameraOpen, facingMode, startCamera, stopCamera]);

  const handleCapture = () => {
    if (!videoRef.current || cameraOpen === null) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `camera-${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          handlePhotoChange(cameraOpen, file);
        }
        stopCamera();
        setCameraOpen(null);
      },
      "image/jpeg",
      0.9,
    );
  };

  useEffect(() => {
    if (isEditing && !initialState) {
      const fetchWorkspace = async () => {
        try {
          const res = await api.get(`/workspaces/${id}`);
          const data = res.data;
          setJudul(data.judul);
          setNoBerkas(data.no_berkas || "");
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
          navigate(backPath);
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
      formData.append("no_berkas", noBerkas);
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

      navigate(backPath);
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
        onClick={() => navigate(backPath)}
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

        {/* No Berkas */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            No Berkas
          </label>
          <input
            type="text"
            placeholder="Masukan nomor berkas"
            value={noBerkas}
            onChange={(e) => setNoBerkas(e.target.value)}
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
                    <>
                      <button
                        type="button"
                        onClick={() => setActionSheet(i)}
                        className="flex flex-col items-center gap-1.5 text-brand hover:text-brand-dark transition-colors cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-8 h-8"
                        >
                          <path
                            fillRule="evenodd"
                            d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-xs font-medium">Tambah Foto</span>
                      </button>
                      <input
                        ref={(el) => {
                          fileInputRefs.current[i] = el;
                        }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handlePhotoChange(i, f);
                          e.target.value = "";
                        }}
                      />
                    </>
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
                    noBerkas,
                    catatan,
                    ukuranKertas,
                    orientasi,
                    editId: id || null,
                    fromForm: true,
                    fromDocumentation,
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

      {/* Bottom Sheet Action Menu */}
      {actionSheet !== null && (
        <div
          className="fixed inset-0 z-40 bg-black/40 flex items-end justify-center"
          onClick={() => setActionSheet(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-2xl p-5 pb-8 animate-[slideUp_0.25s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" />
            <p className="text-sm font-semibold text-gray-800 mb-4 text-center">
              Pilih Sumber Foto {actionSheet + 1}
            </p>
            <div className="space-y-2">
              {/* Kamera */}
              <button
                onClick={() => {
                  const idx = actionSheet;
                  setActionSheet(null);
                  setCameraOpen(idx);
                }}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-brand-light transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center text-brand">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
                    <path
                      fillRule="evenodd"
                      d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3H4.5a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0zm12-2.25a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H19.5a.75.75 0 01-.75-.75V10.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800">
                    Ambil Foto
                  </p>
                  <p className="text-xs text-muted">Gunakan kamera perangkat</p>
                </div>
              </button>

              {/* Galeri */}
              <button
                onClick={() => {
                  const idx = actionSheet;
                  setActionSheet(null);
                  fileInputRefs.current[idx]?.click();
                }}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-brand-light transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center text-accent">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800">
                    Pilih dari Galeri
                  </p>
                  <p className="text-xs text-muted">
                    Upload foto dari perangkat
                  </p>
                </div>
              </button>
            </div>

            {/* Batal */}
            <button
              onClick={() => setActionSheet(null)}
              className="w-full mt-4 py-3 text-sm font-semibold text-muted hover:text-gray-800 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {cameraOpen !== null && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-black/80">
            <span className="text-white text-sm font-medium">
              Foto {cameraOpen + 1}
            </span>
            <button
              onClick={() => {
                stopCamera();
                setCameraOpen(null);
              }}
              className="text-white hover:text-red-400 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>

          {/* Video Feed */}
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-8 px-4 py-5 bg-black/80">
            {/* Switch Camera */}
            <button
              onClick={() =>
                setFacingMode((m) =>
                  m === "environment" ? "user" : "environment",
                )
              }
              className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer transition-colors"
              title="Ganti Kamera"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path
                  fillRule="evenodd"
                  d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm14.49 3.882a7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-1.45-.388z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Capture */}
            <button
              onClick={handleCapture}
              className="w-16 h-16 rounded-full bg-white hover:bg-gray-200 flex items-center justify-center cursor-pointer transition-colors border-4 border-white/50"
              title="Ambil Foto"
            >
              <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-300" />
            </button>

            {/* Spacer */}
            <div className="w-12 h-12" />
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceFormPage;
