import { scoreKardex } from "../lib/scoring";
import type { KardexRow } from "../types";

const sampleRows: KardexRow[] = [
  { materia: "Matematicas I", calificacion: 92 },
  { materia: "Algebra Lineal", calificacion: 88 },
  { materia: "Probabilidad y Estadistica", calificacion: 90 },
  { materia: "Fisica General", calificacion: 84 },
  { materia: "Quimica Basica", calificacion: 86 },
  { materia: "Biologia", calificacion: 80 },
  { materia: "Historia Universal", calificacion: 78 },
  { materia: "Filosofia", calificacion: 82 },
  { materia: "Ingles Tecnico", calificacion: 91 },
  { materia: "Redaccion Academica", calificacion: 87 },
  { materia: "Programacion I", calificacion: 95 },
  { materia: "Base de Datos", calificacion: 93 },
  { materia: "Redes de Computadoras", calificacion: 89 },
  { materia: "Artes Visuales", calificacion: 85 },
  { materia: "Diseno Digital", calificacion: 88 },
  { materia: "   ", calificacion: 70 },
  { materia: "Educacion Fisica", calificacion: 97 },
];

const result = scoreKardex(sampleRows);

const coveragePercent = (result.meta.coverage * 100).toFixed(2);
console.log(
  `Coverage: ${coveragePercent}% (${result.meta.classifiedRows}/${result.meta.totalRows})`,
);

if (result.topAreas.length === 0) {
  console.log("Top areas: none");
} else {
  console.log("Top areas:");
  for (const area of result.topAreas) {
    console.log(`- ${area.area}: score=${area.score}, avg=${area.avg}, n=${area.n}`);
  }
}

const classifiedPreview = result.classified.slice(0, 3);
if (classifiedPreview.length > 0) {
  console.log("Classified examples:");
  for (const item of classifiedPreview) {
    console.log(
      `- ${item.materiaOriginal} -> ${item.area} (keyword: ${item.matchedKeyword}, calificacion: ${item.calificacion})`,
    );
  }
}

const ignoredPreview = result.ignored.slice(0, 3);
if (ignoredPreview.length > 0) {
  console.log("Ignored examples:");
  for (const item of ignoredPreview) {
    console.log(
      `- ${item.materiaOriginal || "[vacia]"} -> ${item.reason} (calificacion: ${item.calificacion})`,
    );
  }
}

console.log("\nFull result JSON:");
console.log(JSON.stringify(result, null, 2));
