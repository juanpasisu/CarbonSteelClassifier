# Libro de trabajo de grado — MetalVision AI

## Versión recomendada (legible)

Archivo principal: [`Libro-MetalVision-AI-legible.html`](Libro-MetalVision-AI-legible.html)

Esta versión está pensada para **cualquier lector universitario cuidadoso**: explica primero en español llano y después da el nombre técnico (Keras, F1, softmax, etc.), usa citas APA en el texto y cajas «En palabras simples».

## Versión anterior (más técnica)

[`Libro-MetalVision-AI.html`](Libro-MetalVision-AI.html) — misma estructura, tono más denso en jerga de ML.

## Cómo generar el PDF (A4)

1. Abre el HTML en Chrome o Edge.
2. `Ctrl+P` (o el botón **Imprimir / guardar PDF**).
3. Destino: **Guardar como PDF**.
4. Papel: **A4**. Márgenes: predeterminados.
5. Activar **Gráficos de fondo** para conservar la portada verde UIS.

## Tabla de contenido (vigente)

- INTRODUCCIÓN
- 1. GENERALIDADES (problema, justificación, objetivos, alcance)
- 2. FUNDAMENTOS TEÓRICOS (aceros, Fe–C, transformaciones, metalografía, 7 clases, IA, CNN, transferencia, aumento, métricas)
- 3. METODOLOGÍA EXPERIMENTAL
- 4. RESULTADOS Y ANÁLISIS
- 5. CONCLUSIONES
- 6. RECOMENDACIONES
- BIBLIOGRAFÍA
- ANEXOS

## Cifras usadas (no simuladas)

| Modelo | Exactitud validación | Exactitud prueba | F1 macro prueba | n prueba | Estado |
|--------|----------------------|------------------|-----------------|----------|--------|
| Prototipo Google Colab (PyTorch) | — | 96,9 % | — | 359 | Archivado; no corre en la web |
| Modelo actual Keras (`best_head`, v2.0) | 85,6 % | 90,0 % | 90,0 % | 239 (1699/466/239 de 2404) | En producción |

La partición es por grupo de origen (cada recorte con sus copias aumentadas); recortes de una misma micrografía pueden quedar en conjuntos distintos, por lo que la exactitud de prueba es una estimación optimista.

Fuente del modelo actual: `ml/models/trained/metrics.json`.

## Qué ya estaba fijado con su texto

- Portada y contraportada (título, autores, director, co-directora, UIS 2026).
- Objetivo general y objetivos específicos.
- Planteamiento del problema (sección 1.1).

## Qué se redactó a partir del repositorio

- Justificación, alcance, metodología (Colab vs Keras, FastAPI, React).
- Resultados reales del modelo activo.
- Explicaciones humanizadas de CNN, transferencia y métricas.
