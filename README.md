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
- `data/`: datos estaticos y CSV de ejemplo.
- `types/`: tipos compartidos del dominio.

## Formato del CSV esperado

El uploader acepta archivos `.csv` con encabezados (case-insensitive):

- Materia: `materia` o `subject`
- Calificacion: `calificacion` o `grade`

Ejemplo:

```csv
materia,calificacion
Matematicas I,92
Programacion I,95
```

Reglas actuales de validacion:

- Se ignoran filas vacias (`skipEmptyLines: true`).
- `calificacion` debe ser numero en rango de `0` a `100`.
- Se muestran filas validas y lista de errores detectados.

## Estado actual

- Ya hay parseo con PapaParse y preview de las primeras 10 filas validas.
- Ya hay validacion basica de columnas y calificaciones.
- Aun no hay scoring ni recomendacion de carreras.
