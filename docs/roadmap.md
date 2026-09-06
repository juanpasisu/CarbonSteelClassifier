# Roadmap técnico

## Estado

| Fase | Objetivo | Estado |
| --- | --- | --- |
| 0 | Requisitos, arquitectura, tecnologías y flujo de datos | Completada |
| 1 | Estructura inicial, documentación y shells locales | Completada |
| 2 | Esquema PostgreSQL, RLS y Storage en Supabase | Completada; aplicado y verificado |
| 3 | Backend FastAPI base y configuración | Completada; conexión y JWT preparados |
| 4 | Registro, inicio de sesión y protección de rutas | Implementación inicial; validación manual pendiente |
| 5 | Carga, validación y almacenamiento de imágenes | Dataset de entrenamiento cargado; carga de usuario pendiente |
| 6 | Pipeline reproducible de datos y preprocessing | Índice y partición por grupos preparados |
| 7 | CNN, entrenamiento y versionado de modelos | Pendiente |
| 8 | Métricas, matriz de confusión y curvas | Pendiente |
| 9 | Inferencia CNN integrada con FastAPI | Pendiente |
| 10 | Interfaz funcional: Auth, dashboard, predicción e historial | Pendiente |
| 11 | Integración end-to-end | Pendiente |
| 12 | Pruebas funcionales, API y seguridad básica | Pendiente |
| 13 | Documentación y preparación académica final | Pendiente |

## Criterios de avance

- No avanzar de fase sin verificar el entregable de la fase activa.
- No ejecutar SQL destructivo ni cambios externos sin revisión explícita.
- No afirmar métricas del modelo hasta disponer de un dataset real y un experimento reproducible.
- Mantener actualizados README y documentación cuando cambien decisiones relevantes.

## Próxima fase: análisis autenticado

Validar el flujo de registro e inicio de sesión, comprobar GET /api/v1/auth/me con un JWT real y después implementar POST /api/v1/analyses con validación, Storage y persistencia por usuario.
