import { normalizeText } from "@/lib/normalize";
import { subjectKeywords } from "@/lib/subjectKeywords";
import type { AreaTag, KardexRow } from "@/types";

export type AreaScore = { area: AreaTag; n: number; avg: number; score: number };

export type ScoringResult = {
  areas: AreaScore[];
  topAreas: AreaScore[];
  meta: {
    totalRows: number;
    classifiedRows: number;
    ignoredRows: number;
    coverage: number;
  };
  classified: Array<{
    materiaOriginal: string;
    materiaNormalizada: string;
    area: AreaTag;
    calificacion: number;
    matchedKeyword: string;
  }>;
  ignored: Array<{
    materiaOriginal: string;
    materiaNormalizada: string;
    calificacion: number;
    reason: "no_match" | "empty_subject";
  }>;
};

type KeywordEntry = {
  original: string;
  normalized: string;
};

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

const sortedKeywordsByArea: Record<AreaTag, KeywordEntry[]> = {
  math: [...subjectKeywords.math]
    .map((keyword) => ({ original: keyword, normalized: normalizeText(keyword) }))
    .sort((a, b) => b.normalized.length - a.normalized.length),
  science: [...subjectKeywords.science]
    .map((keyword) => ({ original: keyword, normalized: normalizeText(keyword) }))
    .sort((a, b) => b.normalized.length - a.normalized.length),
  language: [...subjectKeywords.language]
    .map((keyword) => ({ original: keyword, normalized: normalizeText(keyword) }))
    .sort((a, b) => b.normalized.length - a.normalized.length),
  social: [...subjectKeywords.social]
    .map((keyword) => ({ original: keyword, normalized: normalizeText(keyword) }))
    .sort((a, b) => b.normalized.length - a.normalized.length),
  tech: [...subjectKeywords.tech]
    .map((keyword) => ({ original: keyword, normalized: normalizeText(keyword) }))
    .sort((a, b) => b.normalized.length - a.normalized.length),
  creative: [...subjectKeywords.creative]
    .map((keyword) => ({ original: keyword, normalized: normalizeText(keyword) }))
    .sort((a, b) => b.normalized.length - a.normalized.length),
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function round4(value: number): number {
  return Math.round(value * 10000) / 10000;
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

function detectBestMatch(
  materiaNormalizada: string,
): { area: AreaTag; matchedKeyword: string } | null {
  let bestMatch:
    | {
        area: AreaTag;
        matchedKeyword: string;
        keywordLength: number;
        priority: number;
      }
    | undefined;

  for (const area of areaPriority) {
    for (const keyword of sortedKeywordsByArea[area]) {
      if (!keyword.normalized) {
        continue;
      }

      if (!materiaNormalizada.includes(keyword.normalized)) {
        continue;
      }

      const currentMatch = {
        area,
        matchedKeyword: keyword.original,
        keywordLength: keyword.normalized.length,
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

  if (!bestMatch) {
    return null;
  }

  return {
    area: bestMatch.area,
    matchedKeyword: bestMatch.matchedKeyword,
  };
}

export function scoreKardex(rows: KardexRow[]): ScoringResult {
  const areaBuckets = new Map<AreaTag, number[]>();
  const classified: ScoringResult["classified"] = [];
  const ignored: ScoringResult["ignored"] = [];

  for (const row of rows) {
    const materiaOriginal = row.materia;
    const materiaNormalizada = normalizeText(materiaOriginal);

    if (!materiaNormalizada) {
      ignored.push({
        materiaOriginal,
        materiaNormalizada,
        calificacion: row.calificacion,
        reason: "empty_subject",
      });
      continue;
    }

    const match = detectBestMatch(materiaNormalizada);
    if (!match) {
      ignored.push({
        materiaOriginal,
        materiaNormalizada,
        calificacion: row.calificacion,
        reason: "no_match",
      });
      continue;
    }

    const list = areaBuckets.get(match.area) ?? [];
    list.push(row.calificacion);
    areaBuckets.set(match.area, list);

    classified.push({
      materiaOriginal,
      materiaNormalizada,
      area: match.area,
      calificacion: row.calificacion,
      matchedKeyword: match.matchedKeyword,
    });
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

  const totalRows = rows.length;
  const classifiedRows = classified.length;
  const ignoredRows = ignored.length;

  return {
    areas,
    topAreas: areas.slice(0, 2),
    meta: {
      totalRows,
      classifiedRows,
      ignoredRows,
      coverage: totalRows === 0 ? 0 : round4(classifiedRows / totalRows),
    },
    classified,
    ignored,
  };
}
