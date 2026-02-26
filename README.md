# Demo Vocacional (Next.js App Router)

Base incremental para un proyecto que estima fortalezas academicas de un alumno a partir de su kardex.

## Como correr el proyecto

```bash
npm install
npm run dev
```

Abrir en `http://localhost:3000`.

## Estructura de carpetas

- `app/`: rutas y UI principal (App Router).
- `components/`: componentes reutilizables de interfaz.
- `lib/`: utilidades de normalizacion y scoring (placeholders).
- `data/`: datos estaticos para demo (`careers.json`).
- `types/`: tipos compartidos del dominio.

## Roadmap (proximos pasos)

1. Implementar parseo de CSV en `KardexUploader`.
2. Implementar normalizacion de materias en `lib/normalize.ts`.
3. Implementar scoring en `lib/scoring.ts`.
4. Mapear resultados de scoring a carreras de `data/careers.json`.
