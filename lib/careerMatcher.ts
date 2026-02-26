import careersData from "@/data/careers.json";
import type { AreaScore, ScoringResult } from "@/lib/scoring";
import type { AreaTag, Career } from "@/types";

export type CompatibilityLabel =
  | "Muy alta compatibilidad"
  | "Alta compatibilidad"
  | "Compatibilidad media"
  | "Compatibilidad baja";

export type CareerMatch = {
  career: Career;
  score: number;
  label: CompatibilityLabel;
  reasons: AreaTag[];
};

export type ClusterRecommendation = {
  cluster: string;
  clusterScore: number;
  label: CompatibilityLabel;
  careers: CareerMatch[];
};

export type RecommendationResult = {
  clusters: [ClusterRecommendation, ClusterRecommendation];
};

const allAreaTags: AreaTag[] = [
  "math",
  "science",
  "language",
  "social",
  "tech",
  "creative",
];

const careerCatalog = careersData as Career[];

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function labelForScore(score: number): CompatibilityLabel {
  if (score >= 90) {
    return "Muy alta compatibilidad";
  }

  if (score >= 80) {
    return "Alta compatibilidad";
  }

  if (score >= 70) {
    return "Compatibilidad media";
  }

  return "Compatibilidad baja";
}

export function buildAreaScoreMap(scoring: ScoringResult): Record<AreaTag, number> {
  const map: Record<AreaTag, number> = {
    math: 0,
    science: 0,
    language: 0,
    social: 0,
    tech: 0,
    creative: 0,
  };

  for (const area of scoring.areas) {
    map[area.area] = area.score;
  }

  return map;
}

export function passesMinAreas(career: Career, scoring: ScoringResult): boolean {
  if (!career.minAreas || career.minAreas.length === 0) {
    return true;
  }

  return career.minAreas.every((requiredArea) =>
    scoring.areas.some((areaScore: AreaScore) => areaScore.area === requiredArea && areaScore.n > 0),
  );
}

export function careerMatchScore(
  career: Career,
  areaScoreMap: Record<AreaTag, number>,
): number {
  let weightedSum = 0;
  let weightSum = 0;

  for (const area of allAreaTags) {
    const weight = career.weights[area];
    if (typeof weight !== "number") {
      continue;
    }

    weightedSum += areaScoreMap[area] * weight;
    weightSum += weight;
  }

  if (weightSum === 0) {
    return 0;
  }

  return round2(weightedSum / weightSum);
}

export function reasonsForCareer(career: Career, scoring: ScoringResult): AreaTag[] {
  const areaScoreMap = buildAreaScoreMap(scoring);

  const contributions = allAreaTags
    .map((area) => {
      const weight = career.weights[area] ?? 0;
      return {
        area,
        contribution: areaScoreMap[area] * weight,
      };
    })
    .filter((item) => item.contribution > 0)
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 2)
    .map((item) => item.area);

  return contributions;
}

function buildExplorationCluster(careers: CareerMatch[]): ClusterRecommendation {
  const top3 = [...careers].sort((a, b) => b.score - a.score).slice(0, 3);

  return {
    cluster: "Exploración",
    clusterScore: 0,
    label: "Compatibilidad baja",
    careers: top3,
  };
}

export function recommendCareers(scoring: ScoringResult): RecommendationResult {
  const areaScoreMap = buildAreaScoreMap(scoring);

  const allMatches: CareerMatch[] = careerCatalog
    .filter((career) => passesMinAreas(career, scoring))
    .map((career) => {
      const score = careerMatchScore(career, areaScoreMap);
      return {
        career,
        score,
        label: labelForScore(score),
        reasons: reasonsForCareer(career, scoring),
      };
    });

  const groupedByCluster = new Map<string, CareerMatch[]>();

  for (const match of allMatches) {
    const list = groupedByCluster.get(match.career.cluster) ?? [];
    list.push(match);
    groupedByCluster.set(match.career.cluster, list);
  }

  const rankedClusters: ClusterRecommendation[] = Array.from(groupedByCluster.entries())
    .map(([cluster, matches]) => {
      const topCareers = [...matches].sort((a, b) => b.score - a.score).slice(0, 3);
      const clusterScore =
        topCareers.length === 0
          ? 0
          : round2(topCareers.reduce((sum, match) => sum + match.score, 0) / topCareers.length);

      return {
        cluster,
        clusterScore,
        label: labelForScore(clusterScore),
        careers: topCareers,
      };
    })
    .filter((cluster) => cluster.careers.length > 0)
    .sort((a, b) => b.clusterScore - a.clusterScore);

  if (rankedClusters.length >= 2) {
    const first = rankedClusters[0];
    const second = rankedClusters[1];
    return {
      clusters: [
        {
          ...first,
          careers: first.careers.slice(0, 3),
        },
        {
          ...second,
          careers: second.careers.slice(0, 3),
        },
      ],
    };
  }

  if (rankedClusters.length === 1) {
    const first = rankedClusters[0];
    const usedCareerIds = new Set(first.careers.map((match) => match.career.id));
    const remainingGlobal = allMatches.filter((match) => !usedCareerIds.has(match.career.id));

    return {
      clusters: [
        {
          ...first,
          careers: first.careers.slice(0, 3),
        },
        buildExplorationCluster(remainingGlobal),
      ],
    };
  }

  const emptyExploration = buildExplorationCluster([]);

  return {
    clusters: [emptyExploration, emptyExploration],
  };
}
