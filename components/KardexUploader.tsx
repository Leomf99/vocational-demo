"use client";

export default function KardexUploader() {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="mb-3 text-sm font-medium text-gray-700">Sube tu CSV (demo)</p>
      <label className="inline-flex cursor-pointer items-center rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
        <span>Seleccionar archivo</span>
        <input
          type="file"
          accept=".csv"
          className="sr-only"
          aria-label="Subir archivo CSV"
        />
      </label>
    </section>
  );
}
