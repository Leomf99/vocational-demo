import { recommendCareers } from "../lib/careerMatcher";
import { scoreKardex } from "../lib/scoring";
import type { KardexRow } from "../types";

type Scenario = {
  name: string;
  rows: KardexRow[];
};

const scenarios: Scenario[] = [
  {
    name: "Perfil creativo",
    rows: [
      { materia: "Diseno Digital", calificacion: 96 },
      { materia: "Artes Visuales", calificacion: 94 },
      { materia: "Fotografia", calificacion: 92 },
      { materia: "Animacion", calificacion: 91 },
      { materia: "Comunicacion", calificacion: 88 },
      { materia: "Ingles", calificacion: 86 },
      { materia: "Historia del Arte", calificacion: 90 },
      { materia: "Programacion Web", calificacion: 78 },
      { materia: "Matematicas", calificacion: 72 },
    ],
  },
  {
    name: "Perfil salud-ciencia",
    rows: [
      { materia: "Biologia", calificacion: 95 },
      { materia: "Quimica", calificacion: 93 },
      { materia: "Fisica", calificacion: 88 },
      { materia: "Anatomia", calificacion: 94 },
      { materia: "Salud Comunitaria", calificacion: 92 },
      { materia: "Estadistica", calificacion: 85 },
      { materia: "Matematicas", calificacion: 83 },
      { materia: "Ingles", calificacion: 79 },
      { materia: "Etica", calificacion: 84 },
    ],
  },
  {
    name: "Perfil humanista-social",
    rows: [
      { materia: "Historia Universal", calificacion: 94 },
      { materia: "Filosofia", calificacion: 92 },
      { materia: "Derecho", calificacion: 90 },
      { materia: "Sociologia", calificacion: 91 },
      { materia: "Economia", calificacion: 88 },
      { materia: "Geografia", calificacion: 87 },
      { materia: "Redaccion", calificacion: 89 },
      { materia: "Literatura", calificacion: 93 },
      { materia: "Comunicacion", calificacion: 90 },
    ],
  },
];

for (const scenario of scenarios) {
  const scoring = scoreKardex(scenario.rows);
  const recommendations = recommendCareers(scoring);

  console.log(`\n=== ${scenario.name} ===`);

  for (const cluster of recommendations.clusters) {
    console.log(
      `Cluster: ${cluster.cluster} | score=${cluster.clusterScore} | ${cluster.label}`,
    );

    if (cluster.careers.length === 0) {
      console.log("  - (sin carreras)");
      continue;
    }

    for (const match of cluster.careers) {
      const reasons = match.reasons.length > 0 ? match.reasons.join(", ") : "sin razones";
      console.log(
        `  - ${match.career.name} | score=${match.score} | ${match.label} | reasons: ${reasons}`,
      );
    }
  }
}
