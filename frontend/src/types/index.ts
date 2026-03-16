export interface Workspace {
  id: number;
  judul: string;
  no_berkas: string;
  catatan: string;
  keterangan_atas: string;
  ukuran_kertas: string;
  orientasi: string;
  created_at: string;
}

export interface PhotoSlot {
  file: File | null;
  preview: string;
  keterangan: string;
  arah: string;
  posY: number;
  existingPath?: string | null;
}

export interface User {
  id: number;
  nama: string;
  username: string;
  email: string;
}
