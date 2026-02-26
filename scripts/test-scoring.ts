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
];

const result = scoreKardex(sampleRows);
console.log(JSON.stringify(result, null, 2));
