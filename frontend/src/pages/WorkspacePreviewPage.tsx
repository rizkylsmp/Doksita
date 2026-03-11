import { useLocation, useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

interface PhotoData {
  preview: string;
  keterangan: string;
  arah: string;
  posY?: number;
  existingPath?: string | null;
}

interface WorkspaceData {
  judul: string;
  noBerkas?: string;
  photos: PhotoData[];
  catatan: string;
  ukuranKertas: string;
  orientasi: string;
  editId?: string | null;
  fromForm?: boolean;
  fromDocumentation?: boolean;
}

// Paper sizes in mm
const paperSizes: Record<string, { w: number; h: number }> = {
  A4: { w: 210, h: 297 },
  A3: { w: 297, h: 420 },
  Letter: { w: 215.9, h: 279.4 },
};

// Convert mm to CSS px (1mm = 3.7795275591px)
const mmToPx = (mm: number) => Math.round(mm * 3.7795275591);

const WorkspacePreviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const data = location.state as WorkspaceData | null;
  const [exporting, setExporting] = useState(false);
  const [scale, setScale] = useState(1);

  const paper = paperSizes[data?.ukuranKertas || "A4"] || paperSizes.A4;
  const isLandscape = data?.orientasi === "Landscape";
  const pageW = isLandscape ? paper.h : paper.w;
  const pageH = isLandscape ? paper.w : paper.h;

  // Pixel dimensions for screen rendering
  const pageWpx = mmToPx(pageW);
  const pageHpx = mmToPx(pageH);

  // Scale paper to fit viewport
  useEffect(() => {
    const updateScale = () => {
      const viewportW = window.innerWidth - 32;
      if (pageWpx > viewportW) {
        setScale(viewportW / pageWpx);
      } else {
        setScale(1);
      }
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [pageWpx]);

  // Inject @page CSS for print
  useEffect(() => {
    if (!data) return;
    const style = document.createElement("style");
    style.id = "print-page-style";
    style.textContent = `
      @page { size: ${data.ukuranKertas || "A4"} ${isLandscape ? "landscape" : "portrait"}; margin: 10mm; }
      @media print {
        .page-content { height: auto !important; margin: 0 !important; box-shadow: none !important; border: none !important; break-after: page; padding: 0 !important; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.getElementById("print-page-style")?.remove();
    };
  }, [data, isLandscape]);

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Tidak ada data untuk di-preview.</p>
        <button
          onClick={() => navigate("/workspace/create")}
          className="mt-4 text-brand hover:underline text-sm cursor-pointer"
        >
          Kembali ke form
        </button>
      </div>
    );
  }

  // Fixed padding for consistent page layout calculation
  const pagePad = 40;

  // Build multi-page layout: distribute content across pages
  const buildPages = () => {
    const availableW = pageWpx - pagePad * 2;
    const availableH = pageHpx - pagePad * 2;
    const headerH = 100;
    const titleH = 76;
    const photoGap = 24; // gap-6
    const colW = (availableW - photoGap) / 2;
    const imgH = colW * 0.75; // aspect-4/3
    const rowH = imgH + 32; // image + caption + mb-2

    // Group photos into rows of 2
    const rows: PhotoData[][] = [];
    for (let i = 0; i < data.photos.length; i += 2) {
      rows.push(data.photos.slice(i, Math.min(i + 2, data.photos.length)));
    }

    const result: {
      showHeader: boolean;
      showTitle: boolean;
      photoRows: PhotoData[][];
      showCatatan: boolean;
    }[] = [];
    let usedH = headerH + titleH; // page 1 starts with header + title
    let currentRows: PhotoData[][] = [];
    let isFirstPage = true;

    for (const row of rows) {
      const gapAbove = currentRows.length > 0 ? photoGap : 0;
      if (usedH + gapAbove + rowH > availableH) {
        // Row doesn't fit — finalize current page
        result.push({
          showHeader: isFirstPage,
          showTitle: isFirstPage,
          photoRows: [...currentRows],
          showCatatan: false,
        });
        isFirstPage = false;
        usedH = 0;
        currentRows = [];
      }
      usedH += (currentRows.length > 0 ? photoGap : 0) + rowH;
      currentRows.push(row);
    }

    // Check if catatan fits on current page
    const catatanH = data.catatan ? 80 : 0;
    if (
      usedH + catatanH > availableH &&
      currentRows.length > 0 &&
      data.catatan
    ) {
      result.push({
        showHeader: isFirstPage,
        showTitle: isFirstPage,
        photoRows: [...currentRows],
        showCatatan: false,
      });
      result.push({
        showHeader: false,
        showTitle: false,
        photoRows: [],
        showCatatan: true,
      });
    } else {
      result.push({
        showHeader: isFirstPage,
        showTitle: isFirstPage,
        photoRows: [...currentRows],
        showCatatan: !!data.catatan,
      });
    }

    return result;
  };

  const pages = buildPages();
  const pageGap = 32;
  const totalWrapperH = pages.length * pageHpx + (pages.length - 1) * pageGap;

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    setExporting(true);

    try {
      // Pre-convert all images to base64 to avoid cross-origin issues
      const images = wrapper.querySelectorAll("img");
      const originalSrcs: { img: HTMLImageElement; src: string }[] = [];

      await Promise.all(
        Array.from(images).map(async (img) => {
          if (img.src && !img.src.startsWith("data:")) {
            try {
              originalSrcs.push({ img, src: img.src });
              const response = await fetch(img.src, { mode: "cors" });
              const blob = await response.blob();
              const dataUrl = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
              });
              img.src = dataUrl;
            } catch {
              // Keep original src if fetch fails
            }
          }
        }),
      );

      await new Promise((r) => setTimeout(r, 100));

      // Capture each page individually
      const pageElements = wrapper.querySelectorAll(".page-content");
      const orientation = isLandscape ? "landscape" : "portrait";
      const pdf = new jsPDF({
        orientation,
        unit: "mm",
        format: [pageW, pageH],
      });

      for (let i = 0; i < pageElements.length; i++) {
        if (i > 0) pdf.addPage([pageW, pageH], orientation);

        const canvas = await html2canvas(pageElements[i] as HTMLElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          width: pageWpx,
          height: pageHpx,
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        pdf.addImage(imgData, "JPEG", 0, 0, pageW, pageH);
      }

      // Restore original image srcs
      for (const { img, src } of originalSrcs) {
        img.src = src;
      }

      const filename = `${data.judul || "dokumen"}.pdf`.replace(
        /[^a-zA-Z0-9_\-. ]/g,
        "_",
      );
      pdf.save(filename);
    } catch (err) {
      console.error("Export PDF gagal:", err);
      alert("Gagal mengexport PDF. Coba lagi.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      {/* Action Bar - hidden saat print */}
      <div className="print:hidden sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => {
              if (data.fromForm) {
                const path = data.editId
                  ? `/workspace/edit/${data.editId}`
                  : "/workspace/create";
                navigate(path, { state: data });
              } else {
                navigate(
                  data.fromDocumentation ? "/documentation" : "/workspace",
                );
              }
            }}
            className="flex items-center gap-1 text-sm text-brand hover:text-brand-dark font-medium cursor-pointer"
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
            <span className="hidden sm:inline">Kembali</span>
          </button>
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={handlePrint}
              className="px-3 sm:px-5 py-2 bg-brand hover:bg-brand-dark text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 sm:gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M5 2.75C5 1.784 5.784 1 6.75 1h6.5c.966 0 1.75.784 1.75 1.75v3.552c.377.338.75.753.75 1.448v6.5A1.75 1.75 0 0114 16.25h-1v.25c0 .966-.784 1.75-1.75 1.75h-2.5A1.75 1.75 0 017 16.5v-.25H6A1.75 1.75 0 014.25 14.5V8.75c0-.695.373-1.11.75-1.448V2.75zM7 15h6a.25.25 0 00.25-.25v-3.5a.25.25 0 00-.25-.25H7a.25.25 0 00-.25.25v3.5c0 .138.112.25.25.25zm1-11.75v3h4v-3a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="px-3 sm:px-5 py-2 bg-accent-dark hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 sm:gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
              </svg>
              <span className="hidden sm:inline">
                {exporting ? "Mengexport..." : "Export PDF"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex flex-col items-center py-4 sm:py-8 print:py-0 bg-gray-100 print:bg-white min-h-screen px-4 print:px-0">
        {/* Paper info badge */}
        <div className="print:hidden mb-3 sm:mb-4 flex items-center gap-2 text-xs text-gray-500">
          <span className="bg-white border border-gray-300 rounded-full px-3 py-1 font-medium">
            {data.ukuranKertas || "A4"} — {data.orientasi || "Portrait"} —{" "}
            {pageW}×{pageH}mm
          </span>
        </div>

        <div
          ref={wrapperRef}
          style={{
            width: `${pageWpx}px`,
            transform: `scale(${scale})`,
            transformOrigin: "top center",
          }}
          className="print:transform-none! print:w-auto!"
        >
          {pages.map((page, idx) => (
            <div key={idx}>
              <div
                className="page-content bg-white shadow-lg relative border border-gray-300"
                style={{
                  width: `${pageWpx}px`,
                  height: `${pageHpx}px`,
                  padding: `${pagePad}px`,
                }}
              >
                {page.showHeader && data.noBerkas && (
                  <p
                    className="text-xs font-semibold text-gray-800 absolute"
                    style={{ top: "12px", right: "16px" }}
                  >
                    No Berkas : {data.noBerkas}
                  </p>
                )}

                {page.showHeader && (
                  <div className="flex items-center pb-4 border-b-2 border-gray-800">
                    <img
                      src="./bpn.svg"
                      alt="Logo"
                      className="w-20 h-20"
                      crossOrigin="anonymous"
                    />
                    <div className="text-center flex-1">
                      <p className="text-md font-bold tracking-wide">
                        KEMENTERIAN AGRARIA DAN TATA RUANG/
                      </p>
                      <p className="text-md font-bold tracking-wide">
                        BADAN PERTANAHAN NASIONAL
                      </p>
                      <p className="text-md font-bold tracking-wide mt-0.5">
                        KANTOR PERTANAHAN KOTA PEKALONGAN
                      </p>
                      <p className="text-sm text-gray-600 mt-0.5">
                        Jl. Majapahit No.2, Podosugih, Kec. Pekalongan Bar.,
                        Kota Pekalongan, Jawa Tengah 51111
                      </p>
                    </div>
                  </div>
                )}

                {page.showTitle && (
                  <div className="mt-6 mb-6 text-center">
                    <h2 className="text-lg font-bold uppercase tracking-wide">
                      {data.judul ||
                        "KONDISI PENGGUNAAN TANAH YANG DI MOHONKAN"}
                    </h2>
                  </div>
                )}

                {page.photoRows.length > 0 && (
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    {page.photoRows.flat().map((photo, i) => (
                      <div key={i} className="text-center">
                        <div className="border border-gray-300 overflow-hidden bg-gray-50 aspect-4/3 mb-2">
                          {photo.preview ? (
                            <img
                              src={photo.preview}
                              alt={`Foto ${photo.arah}`}
                              className="w-full h-full object-cover"
                              style={{
                                objectPosition: `center ${photo.posY ?? 50}%`,
                              }}
                              crossOrigin="anonymous"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                              Tidak ada foto
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-gray-800">
                          {photo.keterangan
                            ? `Tampak ${photo.arah} — ${photo.keterangan}`
                            : `Tampak ${photo.arah}`}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {page.showCatatan && data.catatan && (
                  <div className="mt-6">
                    <h3 className="text-base font-bold text-gray-900 mb-2">
                      Catatan
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed text-justify">
                      {data.catatan}
                    </p>
                  </div>
                )}
              </div>
              {idx < pages.length - 1 && <div className="h-8 print:hidden" />}
            </div>
          ))}
        </div>
        {/* Spacer to account for scaled height */}
        {scale < 1 && (
          <div
            className="print:hidden"
            style={{
              height: `${totalWrapperH * scale - totalWrapperH + 32}px`,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default WorkspacePreviewPage;
