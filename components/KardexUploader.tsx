"use client";

import { useMemo, useState } from "react";
import Papa from "papaparse";

import type { KardexRow } from "@/types";

type RawCsvRow = Record<string, unknown>;

type KardexUploaderProps = {
  onParsed?: (rows: KardexRow[], errors: string[], filename: string | null) => void;
};

const SUBJECT_KEYS = new Set(["materia", "subject"]);
const GRADE_KEYS = new Set(["calificacion", "grade"]);

function normalizeHeader(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function getValueByAliases(
  row: RawCsvRow,
  aliases: Set<string>,
): string | undefined {
  for (const [key, value] of Object.entries(row)) {
    if (aliases.has(normalizeHeader(key))) {
      return value === undefined || value === null ? "" : String(value);
    }
  }

  return undefined;
}

export default function KardexUploader({ onParsed }: KardexUploaderProps) {
  const [rows, setRows] = useState<KardexRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [filename, setFilename] = useState<string | null>(null);
  const [showAllRows, setShowAllRows] = useState(false);

  const previewRows = useMemo(
    () => (showAllRows ? rows : rows.slice(0, 10)),
    [rows, showAllRows],
  );
  const previewErrors = useMemo(() => errors.slice(0, 10), [errors]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setFilename(null);
      setRows([]);
      setErrors([]);
      setShowAllRows(false);
      onParsed?.([], [], null);
      return;
    }

    setFilename(file.name);

    Papa.parse<RawCsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const validRows: KardexRow[] = [];
        const parseErrors: string[] = [];

        const fields = result.meta.fields ?? [];
        const hasSubjectColumn = fields.some((field) =>
          SUBJECT_KEYS.has(normalizeHeader(field)),
        );
        const hasGradeColumn = fields.some((field) =>
          GRADE_KEYS.has(normalizeHeader(field)),
        );

        if (!hasSubjectColumn) {
          parseErrors.push(
            'No se encontro columna de materia. Usa "materia" o "subject".',
          );
        }

        if (!hasGradeColumn) {
          parseErrors.push(
            'No se encontro columna de calificacion. Usa "calificacion" o "grade".',
          );
        }

        for (const csvError of result.errors) {
          const rowInfo =
            typeof csvError.row === "number"
              ? `fila ${csvError.row + 1}`
              : "fila desconocida";
          parseErrors.push(`Error de CSV en ${rowInfo}: ${csvError.message}`);
        }

        result.data.forEach((row, index) => {
          const line = index + 2;
          const materiaRaw = getValueByAliases(row, SUBJECT_KEYS);
          const calificacionRaw = getValueByAliases(row, GRADE_KEYS);

          const materia = (materiaRaw ?? "").trim();
          if (!materia) {
            parseErrors.push(
              `Fila ${line}: materia vacia o columna no reconocida (materia/subject).`,
            );
            return;
          }

          const calificacionText = (calificacionRaw ?? "").trim().replace(",", ".");
          if (!calificacionText) {
            parseErrors.push(
              `Fila ${line}: calificacion vacia o columna no reconocida (calificacion/grade).`,
            );
            return;
          }

          const calificacion = Number(calificacionText);
          if (!Number.isFinite(calificacion)) {
            parseErrors.push(
              `Fila ${line}: calificacion invalida "${calificacionText}" (debe ser numero entre 0 y 100).`,
            );
            return;
          }

          if (calificacion < 0 || calificacion > 100) {
            parseErrors.push(
              `Fila ${line}: calificacion fuera de rango (${calificacion}). Debe estar entre 0 y 100.`,
            );
            return;
          }

          validRows.push({ materia, calificacion });
        });

        setRows(validRows);
        setErrors(parseErrors);
        setShowAllRows(false);
        onParsed?.(validRows, parseErrors, file.name);
      },
      error: (error) => {
        const readErrors = [`No se pudo leer el archivo: ${error.message}`];
        setFilename(null);
        setRows([]);
        setErrors(readErrors);
        setShowAllRows(false);
        onParsed?.([], readErrors, null);
      },
    });
  };

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="mb-3 text-sm font-medium text-gray-700">Sube tu CSV (demo)</p>

      <input
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileChange}
        className="mb-4 block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border file:border-gray-300 file:bg-gray-50 file:px-3 file:py-2 file:text-sm file:text-gray-700 hover:file:bg-gray-100"
        aria-label="Subir archivo CSV"
      />

      {filename && (
        <div className="space-y-3">
          <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-700">
            <p>
              <span className="font-semibold">Archivo:</span> {filename}
            </p>
            <p>
              <span className="font-semibold">Filas validas:</span> {rows.length}
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-gray-800">
                Preview ({showAllRows ? "todas las filas validas" : "primeras 10 filas validas"})
              </h3>
              {rows.length > 10 && (
                <button
                  type="button"
                  onClick={() => setShowAllRows((prev) => !prev)}
                  className="rounded-md border border-gray-300 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                >
                  {showAllRows ? "Mostrar solo 10" : "Mostrar todas"}
                </button>
              )}
            </div>
            {previewRows.length === 0 ? (
              <p className="text-sm text-gray-600">Sin filas validas para mostrar.</p>
            ) : (
              <div className="overflow-x-auto rounded-md border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Materia</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Calificacion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {previewRows.map((row, index) => (
                      <tr key={`${row.materia}-${index}`}>
                        <td className="px-3 py-2 text-gray-700">{row.materia}</td>
                        <td className="px-3 py-2 text-gray-700">{row.calificacion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {errors.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-red-700">Errores detectados</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-red-700">
                {previewErrors.map((error, index) => (
                  <li key={`${error}-${index}`}>{error}</li>
                ))}
              </ul>
              {errors.length > previewErrors.length && (
                <p className="mt-2 text-sm text-red-700">
                  ... y {errors.length - previewErrors.length} errores mas.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
