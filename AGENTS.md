# Guía del proyecto

## Alcance

CarbonSteelClassifier es una plataforma académica para clasificar microestructuras de aceros al carbono. Mantener separadas la interfaz, la API, el procesamiento de imágenes, la inferencia, la persistencia y el entrenamiento.

## Convenciones

- Usar inglés para nombres de archivos, variables, funciones, clases, endpoints internos y módulos.
- Mantener la documentación dirigida al contexto académico y científico.
- Usar TypeScript estricto en \`frontend/\`.
- Usar type hints, Pydantic y funciones pequeñas en \`backend/\` y \`ml/\`.
- No incluir credenciales, imágenes de usuario, datasets ni modelos pesados en Git.
- No duplicar la lista de microestructuras: la fuente canónica es \`shared/microstructure_classes.json\`.
- Compartir el mismo preprocesamiento entre entrenamiento e inferencia cuando se implemente el pipeline.
- Añadir o actualizar pruebas para cambios en lógica crítica.

## Seguridad

- La \`service_role\` de Supabase solo puede vivir en el backend.
- Todas las operaciones sobre análisis, imágenes e historial deben quedar limitadas al usuario autenticado.
- Revisar RLS antes de habilitar persistencia en Supabase.
- Validar tipo, tamaño y contenido de los archivos antes de procesarlos.

## Flujo de trabajo

1. Trabajar dentro de la fase activa del roadmap.
2. Explicar decisiones que cambien la arquitectura o el modelo de datos.
3. Ejecutar verificaciones relevantes antes de pasar de fase.
4. Usar Conventional Commits como referencia para los mensajes de Git.
