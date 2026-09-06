# Arquitectura del sistema

## Objetivo

CarbonSteelClassifier es una plataforma web para apoyar la identificación académica de microestructuras en imágenes metalográficas de aceros al carbono. El sistema debe mostrar una predicción y sus probabilidades, pero debe comunicar que el resultado es una ayuda didáctica y no un diagnóstico metalúrgico definitivo.

## Componentes

\`\`\`text
┌──────────────────────────────┐
│ Frontend React + TypeScript   │
│ UI, sesión y carga de imagen  │
└──────────────┬───────────────┘
               │ HTTPS + Bearer JWT
┌──────────────▼───────────────┐
│ Backend FastAPI               │
│ validación, casos de uso, API │
└───────┬──────────────┬───────┘
        │              │
        │              └────────────────────┐
        ▼                                   ▼
┌───────────────┐                 ┌────────────────────┐
│ ML pipeline    │                 │ Supabase             │
│ preprocess,    │                 │ Auth, PostgreSQL,    │
│ CNN, inference │                 │ Storage               │
└───────────────┘                 └────────────────────┘
\`\`\`

### Frontend

React con Vite y TypeScript ofrece un cliente ligero, rápido de iniciar y fácil de separar por páginas, componentes y servicios. Tailwind CSS se utilizará para un sistema visual consistente y responsive. El cliente puede usar la clave pública de Supabase para Auth, pero nunca contiene \`SUPABASE_SERVICE_ROLE_KEY\`.

### Backend

FastAPI concentra las reglas de negocio, la autorización, la validación de archivos, el acceso al almacenamiento, el registro del análisis y la llamada al modelo activo. La aplicación se organizará por rutas, schemas, servicios, persistencia y utilidades para evitar que los endpoints acumulen lógica.

### Machine Learning

\`ml/\` es independiente del servidor web. Contendrá validación del dataset, preprocessing, arquitectura CNN, entrenamiento, evaluación e inferencia. El preprocesamiento se diseñará como una pieza reutilizable para asegurar que las imágenes de entrenamiento y predicción reciban las mismas transformaciones.

### Supabase

Supabase proveerá autenticación, PostgreSQL y Storage. El backend validará el JWT del usuario y limitará cada consulta por \`user_id\`. PostgreSQL aplicará Row Level Security como segunda barrera. Las imágenes seguirán una ruta lógica \`user_id/image_id/original.ext\` dentro del bucket privado \`microstructure-images\`.

## Flujo de una predicción

1. El usuario inicia sesión en Supabase Auth.
2. El frontend selecciona una imagen y envía \`multipart/form-data\` al backend con el JWT.
3. FastAPI autentica al usuario y valida extensión, MIME, tamaño y contenido legible.
4. Se crea el registro de imagen y se almacena el original en Storage.
5. El servicio de inferencia aplica el preprocessing canónico y ejecuta el modelo activo.
6. El backend guarda la clase predicha, confianza y probabilidad de cada clase.
7. La API devuelve una respuesta consistente con el análisis, el modelo utilizado y las probabilidades.
8. El frontend presenta el resultado y lo añade al historial del usuario.

## Contrato de clases

\`shared/microstructure_classes.json\` es la fuente canónica de slugs, nombres y descripciones. Backend y ML la leen directamente; el seed de Supabase deberá derivarse de ella. En frontend se mantendrá un contrato tipado y validado para las respuestas de la API, sin crear nombres alternativos.

## Decisiones de seguridad

- \`service_role\` solo en backend y variables de entorno del servidor.
- Bucket de imágenes privado.
- UUID como identificadores.
- RLS para perfiles, imágenes, análisis y predicciones.
- Usuarios limitados a sus propios datos.
- Validación de archivos y límites de tamaño antes de decodificar imágenes.

## Alcance de Fase 1

Esta fase solo prepara estructura, documentación y shells ejecutables. No crea tablas, políticas RLS, buckets, credenciales, dataset ni resultados de entrenamiento. El SQL de Fase 2 se presentará para revisión antes de aplicarlo.
