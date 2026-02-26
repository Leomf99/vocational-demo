export type KardexRow = {
  materia: string;
  calificacion: number;
};

export type AreaTag =
  | "math"
  | "science"
  | "language"
  | "social"
  | "tech"
  | "creative";

export type Career = {
  id: string;
  name: string;
  cluster: string;
  description: string;
  tags: AreaTag[];
  weights: Partial<Record<AreaTag, number>>;
  minAreas?: AreaTag[];
  roles?: string[];
};
