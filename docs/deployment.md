# Despliegue con Docker y Render

## Objetivo

Publicar MetalVision AI (CarbonSteelClassifier) para uso remoto académico: una sola URL sirve la UI React y la API FastAPI con el modelo Keras.

## Arquitectura de despliegue (recomendada)

```text
Usuario ──HTTPS──► Render Web Service (Docker)
                      │
                      ├─ /              Vite SPA (dist)
                      ├─ /api/v1/*      FastAPI
                      ├─ /health        liveness
                      └─ active.keras   pesos CNN (volumen o MODEL_URL)
                               │
                               ▼
                         Supabase (opcional: catálogo + stats)
```

Un solo contenedor evita CORS entre dominios y reduce coste en Render.

## Requisitos

- Docker 24+ (local) o cuenta [Render](https://render.com).
- Artefacto `ml/models/trained/active.keras` (~9 MB), **no** va en Git.
- Plan Render con **≥1 GB RAM** (Starter o superior). El free tier suele fallar por OOM con TensorFlow.
- Python 3.11 / Node 20 solo para desarrollo local sin Docker.

## Variables de entorno

| Variable | Dónde | Notas |
| --- | --- | --- |
| `MODEL_PATH` | API | Ruta del `.keras` (default en imagen: `/app/ml/models/trained/active.keras`) |
| `MODEL_URL` | API | HTTPS para descargar el modelo al arrancar si el archivo no existe |
| `FRONTEND_DIST` | API | `/app/frontend/dist` en Docker; vacío en desarrollo puro API |
| `CORS_ORIGINS` | API | URL pública de Render (y localhost si hace falta) |
| `PORT` | API | Render lo inyecta; local `8000` |
| `SUPABASE_*` | API | Opcional; `SERVICE_ROLE` solo en el servidor |
| `VITE_API_BASE_URL` | Build frontend | Vacío (`""`) = same-origin; en `npm run dev` usa `http://127.0.0.1:8000` |

## Modelo fuera de Git

Elige una opción:

1. **URL pública/firmada** (`MODEL_URL`): sube `active.keras` a Supabase Storage, GitHub Releases o S3 y pega la URL en Render.
2. **Volumen local** (compose): monta `./ml/models/trained` (ver `docker-compose.yml`).
3. **Disk de Render** (avanzado): persiste el archivo y apunta `MODEL_PATH`.

Sin modelo, `/health` responde OK pero `POST /api/v1/predict` responde `503`.

## Local con Docker Compose

Desde la raíz del repo, con el modelo ya entrenado:

```bash
docker compose build
docker compose up
```

Abre [http://127.0.0.1:8000](http://127.0.0.1:8000). Health: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health). OpenAPI: `/docs`.

Si no tienes el archivo local:

```bash
MODEL_URL="https://ejemplo.com/active.keras" docker compose up --build
```

(quita o ajusta el volumen `ro` en `docker-compose.yml` si quieres que el entrypoint escriba el archivo descargado).

## Despliegue en Render

1. Sube `active.keras` a un hosting HTTPS y copia la URL.
2. En Render: **New → Blueprint** y selecciona este repositorio (`render.yaml`), o **New → Web Service** con runtime Docker y `Dockerfile` en la raíz.
3. Configura secretos:
   - `MODEL_URL` = URL del `.keras`
   - `CORS_ORIGINS` = `https://<tu-servicio>.onrender.com`
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (si usas catálogo/stats)
4. Health check path: `/health`.
5. Tras el primer deploy, verifica:
   - `GET /health` → `{"status":"ok",...}`
   - `GET /api/v1/model` → modelo disponible
   - UI en `/` y una predicción de prueba

Cold start en planes bajos puede tardar 1–2 minutos (carga de TensorFlow + descarga del modelo).

### Despliegue continuo (GitHub Actions)

El workflow `.github/workflows/deploy-render.yml` se ejecuta en cada push a `main`:

1. `pytest` (API + ML, Python 3.11) y `vitest` + `tsc` + build de Vite en paralelo.
2. Si ambos pasan, llama al Deploy Hook de Render y se construye la nueva imagen.

En pull requests solo se ejecutan las pruebas. El autodeploy nativo de Render está desactivado (`autoDeployTrigger: "off"` en `render.yaml`) para no desplegar commits que fallen las pruebas.

Configuración única:

1. Render → servicio `metalvision-ai` → **Settings → Deploy Hook** → copiar la URL.
2. GitHub → repositorio → **Settings → Secrets and variables → Actions → New repository secret**: `RENDER_DEPLOY_HOOK_URL` con esa URL.

El Deploy Hook es un secreto: quien lo tenga puede disparar despliegues. Si se filtra, regenerarlo en Render y actualizar el secret.

## Alternativa: frontend estático + API

Si prefieres dos servicios:

1. Web Service Docker **sin** montar SPA (`FRONTEND_DIST` vacío) solo para la API.
2. Static Site de Render con `frontend/`: build `npm ci && npm run build`, publish `dist`, env `VITE_API_BASE_URL=https://<api>.onrender.com`.
3. Añade la URL del static site a `CORS_ORIGINS` de la API.

La opción de un solo contenedor sigue siendo la recomendada para este proyecto académico.

## Verificación de que nada se rompe

Tras cambios de Docker:

```bash
# Tests API / ML (venv Python 3.11)
source .venv/bin/activate
PYTHONPATH=. pytest -q

# Typecheck frontend
cd frontend && npm test && npx tsc --noEmit

# Imagen
docker compose build
docker compose up -d
curl -fsS http://127.0.0.1:8000/health
curl -fsS http://127.0.0.1:8000/api/v1/model
```

El desarrollo local sin Docker (`./scripts/run_backend.sh` + `npm run dev`) no cambia: `FRONTEND_DIST` vacío y `VITE_API_BASE_URL` apuntando a `http://127.0.0.1:8000`.
