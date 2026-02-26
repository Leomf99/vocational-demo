"use client";

import { useState } from "react";

import KardexUploader from "@/components/KardexUploader";
import { scoreKardex, type ScoringResult } from "@/lib/scoring";
import type { KardexRow } from "@/types";

export default function Home() {
  const [kardexRows, setKardexRows] = useState<KardexRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [filename, setFilename] = useState<string | null>(null);
  const [scoring, setScoring] = useState<ScoringResult | null>(null);

  const handleParsed = (
    rows: KardexRow[],
    errors: string[],
    parsedFilename: string | null,
  ) => {
    setKardexRows(rows);
    setParseErrors(errors);
    setFilename(parsedFilename);

    if (rows.length > 0) {
      setScoring(scoreKardex(rows));
      return;
    }

    setScoring(null);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Demo Vocacional por Fortalezas
        </h1>
        <p className="text-sm text-gray-600">
          Carga de kardex en CSV con preview y validacion basica.
        </p>
      </header>

      <KardexUploader onParsed={handleParsed} />

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Resultados</h2>

        {!scoring ? (
          <p className="text-sm text-gray-600">Sube un CSV para ver resultados.</p>
        ) : (
          <div className="space-y-4 text-sm text-gray-700">
            <div className="rounded-md bg-gray-50 p-3">
              <p>
                <span className="font-semibold">Archivo:</span> {filename ?? "N/A"}
              </p>
              <p>
                <span className="font-semibold">Coverage:</span>{" "}
                {(scoring.meta.coverage * 100).toFixed(2)}% ({scoring.meta.classifiedRows}/
                {scoring.meta.totalRows})
              </p>
              <p>
                <span className="font-semibold">Filas parseadas:</span> {kardexRows.length}
              </p>
              <p>
                <span className="font-semibold">Errores de parseo:</span> {parseErrors.length}
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-gray-800">Top areas</h3>
              {scoring.topAreas.length === 0 ? (
                <p className="text-gray-600">Sin areas clasificadas.</p>
              ) : (
                <ul className="list-disc space-y-1 pl-5">
                  {scoring.topAreas.map((area) => (
                    <li key={area.area}>
                      {area.area}: score {area.score}, avg {area.avg}, n {area.n}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-gray-800">Todas las areas</h3>
              {scoring.areas.length === 0 ? (
                <p className="text-gray-600">Sin datos de scoring.</p>
              ) : (
                <div className="overflow-x-auto rounded-md border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Area</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">n</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Avg</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {scoring.areas.map((area) => (
                        <tr key={area.area}>
                          <td className="px-3 py-2">{area.area}</td>
                          <td className="px-3 py-2">{area.n}</td>
                          <td className="px-3 py-2">{area.avg}</td>
                          <td className="px-3 py-2">{area.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-md border border-gray-200 p-3">
                <h3 className="mb-2 font-semibold text-gray-800">Ejemplos clasificados</h3>
                {scoring.classified.length === 0 ? (
                  <p className="text-gray-600">Sin elementos clasificados.</p>
                ) : (
                  <ul className="space-y-1">
                    {scoring.classified.slice(0, 3).map((item, index) => (
                      <li key={`${item.materiaOriginal}-${index}`}>
                        {item.materiaOriginal} {"->"} {item.area} ({item.matchedKeyword})
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-md border border-gray-200 p-3">
                <h3 className="mb-2 font-semibold text-gray-800">Ejemplos ignorados</h3>
                {scoring.ignored.length === 0 ? (
                  <p className="text-gray-600">Sin elementos ignorados.</p>
                ) : (
                  <ul className="space-y-1">
                    {scoring.ignored.slice(0, 3).map((item, index) => (
                      <li key={`${item.materiaOriginal}-${item.reason}-${index}`}>
                        {item.materiaOriginal || "[vacia]"} {"->"} {item.reason}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
