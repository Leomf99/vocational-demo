# Demo Vocacional por Fortalezas

Sistema experimental de orientación vocacional basado en el análisis de
un kardex (CSV) de preparatoria.

El sistema:

1.  Clasifica materias en áreas de competencia.
2.  Calcula fortalezas con factor de confianza.
3.  Recomienda rutas académicas (clusters).
4.  Sugiere carreras específicas con explicación automática.

---

## Tecnologías

- Next.js (App Router)
- TypeScript
- PapaParse (lectura de CSV)
- TailwindCSS
- Motor de scoring determinístico (sin IA)
- Sistema de recomendación basado en pesos por área

---

## Cómo funciona

### 1. Clasificación de materias

Cada materia del kardex se normaliza y se compara contra un diccionario
de palabras clave para clasificarla en una de estas áreas:

- Creatividad
- Matemáticas
- Ciencias
- Lenguaje y Comunicación
- Ciencias Sociales
- Tecnología

---

### 2. Cálculo de fortalezas

Por cada área se calcula:

- n (cantidad de materias)
- avg (promedio)
- score (promedio ajustado por factor de confianza)

Factor de confianza: - 1 materia → 0.85 - 2 materias → 0.93 - 3+
materias → 1

---

### 3. Recomendación de carreras (Mixto Inteligente)

El sistema:

1.  Calcula compatibilidad por carrera usando pesos por área.
2.  Agrupa por cluster (ruta académica).
3.  Calcula score por cluster usando el promedio de sus top 3 carreras.
4.  Siempre muestra 2 rutas:
    - Ruta principal
    - Ruta alternativa (exploración)

Cada carrera muestra: - Score numérico - Etiqueta cualitativa: - Muy
alta compatibilidad - Alta compatibilidad - Compatibilidad media -
Compatibilidad baja - Explicación automática: \> Se alinea con tu
fortaleza en Creatividad y Lenguaje y Comunicación.

---

## Estructura del Proyecto

    app/
    components/
    lib/
      scoring.ts
      careerMatcher.ts
      presenters/
        areaPresenter.ts
    data/
      careers.json
    types/
    scripts/
      test-scoring.ts
      test-career-matcher.ts

---

## Formato del CSV esperado

Columnas (case-insensitive):

- materia o subject
- calificacion o grade

Ejemplo:

    materia,calificacion
    Matematicas I,92
    Programacion I,95

Reglas:

- Calificación entre 0 y 100
- Filas vacías se ignoran
- Errores se reportan

---

## Scripts de prueba

Probar scoring:

    npx tsx scripts/test-scoring.ts

Probar recomendación:

    npx tsx scripts/test-career-matcher.ts

---

## Objetivo del Proyecto

Explorar una alternativa explicable y determinística a los sistemas
tradicionales de orientación vocacional, evitando modelos opacos y
priorizando:

- Transparencia
- Interpretabilidad
- Simplicidad matemática
- UX clara

---

## Próximos pasos posibles

- Conectar vacantes reales por cluster
- Exportar reporte PDF
- Agregar visualización gráfica de fortalezas
- Comparativa percentil contra otros perfiles
- Integrar intereses declarados además del kardex
