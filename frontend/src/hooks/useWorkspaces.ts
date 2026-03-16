import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import type { Workspace } from "../types";

export function useWorkspaces() {
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
    if (!confirm("Yakin ingin menghapus?")) return;
    try {
      await api.delete(`/workspaces/${id}`);
      setWorkspaces((prev) => prev.filter((w) => w.id !== id));
    } catch {
      alert("Gagal menghapus");
    }
  };

  const handleOpen = async (id: number, fromDocumentation = false) => {
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
            posY: p.pos_y != null ? p.pos_y : 50,
          })),
          noBerkas: data.no_berkas,
          catatan: data.catatan,
          keteranganAtas: data.keterangan_atas,
          ukuranKertas: data.ukuran_kertas,
          orientasi: data.orientasi,
          ...(fromDocumentation && { fromDocumentation: true }),
        },
      });
    } catch {
      alert("Gagal membuka workspace");
    }
  };

  return { workspaces, loading, handleDelete, handleOpen, navigate };
}
