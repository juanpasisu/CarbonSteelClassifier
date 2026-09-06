# API

## Base

La API utiliza FastAPI y expone documentación OpenAPI en /docs. El prefijo funcional versionado es /api/v1.

## Endpoints disponibles

GET /health

Devuelve el estado de vida del servicio.

GET /api/v1/classes

Devuelve las siete clases desde shared/microstructure_classes.json. El endpoint no mantiene una lista alternativa.

GET /api/v1/auth/me

Valida el JWT de Supabase enviado como Authorization: Bearer <access_token> y devuelve el identificador y correo del usuario autenticado. La clave service_role se usa únicamente dentro del backend.

## Próximos endpoints

- POST /api/v1/analyses: validar, almacenar y analizar una imagen autenticada.
- GET /api/v1/analyses: consultar el historial del usuario autenticado.
- GET /api/v1/models: consultar modelos disponibles.

Las rutas de análisis deben limitar sus consultas por user_id y conservar RLS como segunda barrera.
