import { normalizeText } from "@/lib/normalize";
import { subjectKeywords } from "@/lib/subjectKeywords";
import type { AreaTag, KardexRow } from "@/types";

export type AreaScore = { area: AreaTag; n: number; avg: number; score: number };
export type ScoringResult = { areas: AreaScore[]; topAreas: AreaScore[] };

const areaPriority: AreaTag[] = [
  "tech",
  "math",
  "science",
  "language",
  "social",
  "creative",
];

const areaRank: Record<AreaTag, number> = {
  tech: 0,
  math: 1,
  science: 2,
  language: 3,
  social: 4,
  creative: 5,
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function confidenceFactor(n: number): number {
  if (n === 1) {
    return 0.85;
  }

  if (n === 2) {
    return 0.93;
  }

  return 1;
}

function detectArea(materia: string): AreaTag | null {
  const normalizedSubject = normalizeText(materia);
  if (!normalizedSubject) {
    return null;
  }

  let bestMatch:
    | {
        area: AreaTag;
        keywordLength: number;
        priority: number;
      }
    | undefined;

  for (const area of areaPriority) {
    for (const keyword of subjectKeywords[area]) {
      const normalizedKeyword = normalizeText(keyword);
      if (!normalizedKeyword) {
        continue;
      }

      if (!normalizedSubject.includes(normalizedKeyword)) {
        continue;
      }

      const currentMatch = {
        area,
        keywordLength: normalizedKeyword.length,
        priority: areaRank[area],
      };

      if (!bestMatch) {
        bestMatch = currentMatch;
        continue;
      }

      if (currentMatch.keywordLength > bestMatch.keywordLength) {
        bestMatch = currentMatch;
        continue;
      }

      if (
        currentMatch.keywordLength === bestMatch.keywordLength &&
        currentMatch.priority < bestMatch.priority
      ) {
        bestMatch = currentMatch;
      }
    }
  }

  return bestMatch?.area ?? null;
}

export function scoreKardex(rows: KardexRow[]): ScoringResult {
  const areaBuckets = new Map<AreaTag, number[]>();

  for (const row of rows) {
    const area = detectArea(row.materia);
    if (!area || !Number.isFinite(row.calificacion)) {
      continue;
    }

    const list = areaBuckets.get(area) ?? [];
    list.push(row.calificacion);
    areaBuckets.set(area, list);
  }

  const areas: AreaScore[] = Array.from(areaBuckets.entries())
    .map(([area, grades]) => {
      const n = grades.length;
      const avgRaw = grades.reduce((sum, grade) => sum + grade, 0) / n;
      const scoreRaw = avgRaw * confidenceFactor(n);

      return {
        area,
        n,
        avg: round2(avgRaw),
        score: round2(scoreRaw),
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return areaRank[a.area] - areaRank[b.area];
    });

  return {
    areas,
    topAreas: areas.slice(0, 2),
  };
}
