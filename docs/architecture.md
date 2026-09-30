# Arquitectura del sistema

## Objetivo

CarbonSteelClassifier es una herramienta académica de acceso público para identificar fases y microconstituyentes en imágenes metalográficas de aceros al carbono mediante una CNN. El resultado es una ayuda didáctica, no un diagnóstico metalúrgico definitivo.

## Componentes

```text
┌──────────────────────────────┐
│ Frontend React + Vite + TS    │
│ UI pública, carga y resultados│
└──────────────┬───────────────┘
               │ HTTPS (sin JWT de usuario)
┌──────────────▼───────────────┐
│ Backend FastAPI               │
│ validación, inferencia, API   │
└───────┬──────────────┬───────┘
        │              │
        ▼              ▼
┌───────────────┐  ┌────────────────────┐
│ ML pipeline    │  │ Supabase            │
│ preprocess,    │  │ PostgreSQL (clases, │
│ CNN, inference │  │ modelos, stats)     │
└───────────────┘  └────────────────────┘
```

En **Docker / Render** el frontend compilado (`FRONTEND_DIST`) se sirve desde el mismo proceso FastAPI (mismo origen). Ver [`deployment.md`](deployment.md).

### Frontend

Aplicación pública con React, Vite, TypeScript y Tailwind CSS. El usuario entra y analiza una imagen sin crear cuenta. No se usa Supabase Auth en el cliente.

### Backend

FastAPI recibe la imagen, la valida, la preprocesa en memoria, ejecuta la CNN y devuelve la predicción. Opcionalmente registra estadísticas anónimas en Supabase con la `service_role`.

### Machine Learning

`ml/` permanece independiente del servidor web. El preprocesamiento es compartido entre entrenamiento e inferencia. Las siete clases y su orden oficial de entrenamiento viven en `shared/microstructure_classes.json`.

### Supabase

Se usa como PostgreSQL para:

- Catálogo de microestructuras
- Metadatos de versiones del modelo
- Análisis anónimos para estadística académica

No se usa Auth de usuarios finales. Las imágenes de predicción no se almacenan de forma permanente.

## Flujo de una predicción

1. El usuario abre la aplicación (acceso directo).
2. Selecciona o arrastra una imagen metalográfica.
3. El frontend envía `multipart/form-data` a `POST /predict`.
4. FastAPI valida extensión, MIME, tamaño y contenido.
5. El servicio de inferencia aplica el preprocessing canónico, ejecuta el modelo activo y deriva la presencia de ferrita, perlita y cementita.
6. La API responde con clase morfológica, confianza, probabilidades, fases identificadas e info del modelo.
7. Opcionalmente se registra un análisis anónimo en PostgreSQL.
8. La imagen en memoria se descarta.

## Contrato de clases

`shared/microstructure_classes.json` es la fuente canónica (orden oficial de entrenamiento). Backend, ML, seed de Supabase y frontend deben derivar de ella.

## Decisiones de seguridad y privacidad

- `service_role` solo en backend.
- Sin cuentas, sesiones ni historial personal.
- Validación de archivos antes de decodificar.
- Persistencia mínima y anónima cuando se habiliten estadísticas.
