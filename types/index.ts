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
  nombre: string;
  descripcion: string;
  tags: AreaTag[];
};
