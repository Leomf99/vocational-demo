import type { AreaTag } from "@/types";

export const AREA_LABELS_ES: Record<AreaTag, string> = {
  creative: "Creatividad",
  math: "Matemáticas",
  science: "Ciencias",
  language: "Lenguaje y Comunicación",
  social: "Ciencias Sociales",
  tech: "Tecnología",
};

export function formatReasonsEs(reasons: AreaTag[]): string {
  if (reasons.length === 0) {
    return "";
  }

  if (reasons.length === 1) {
    return `Se alinea con tu fortaleza en ${AREA_LABELS_ES[reasons[0]]}.`;
  }

  const [first, second] = reasons;
  return `Se alinea con tu fortaleza en ${AREA_LABELS_ES[first]} y ${AREA_LABELS_ES[second]}.`;
}

export function formatAreaListEs(areas: AreaTag[]): string {
  if (areas.length === 0) {
    return "";
  }

  const labels = areas.map((area) => AREA_LABELS_ES[area]);

  if (labels.length === 1) {
    return labels[0];
  }

  if (labels.length === 2) {
    return `${labels[0]} y ${labels[1]}`;
  }

  const head = labels.slice(0, -1).join(", ");
  const tail = labels[labels.length - 1];
  return `${head} y ${tail}`;
}
