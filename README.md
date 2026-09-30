# CarbonSteelClassifier

Plataforma web académica de acceso público para apoyar la identificación de fases y microconstituyentes en imágenes metalográficas de aceros al carbono mediante visión por computador y redes neuronales convolucionales (CNN).

El sistema no reemplaza el criterio de un especialista metalúrgico. Su propósito es didáctico, investigativo y de apoyo al aprendizaje.

## Estado del proyecto

Avance actual: stack oficial **Python 3.11 + TensorFlow/Keras + MobileNetV2**. Modelo activo `active.keras` (~89.7% accuracy en test). Registrado en Supabase como `MicrostructureCNN` v2.0.

Despliegue remoto preparado con **Docker** y **Render** (servicio único API + SPA). Guía: [`docs/deployment.md`](docs/deployment.md).

## Tecnologías

- **Frontend:** React, Vite, TypeScript y Tailwind CSS.
- **Backend:** Python 3.11, FastAPI, Pydantic y Uvicorn.
- **Machine Learning:** TensorFlow/Keras, MobileNetV2 (transfer learning), NumPy, scikit-learn, OpenCV y Matplotlib.
- **Datos y servicios:** Supabase (PostgreSQL para clases, modelos y estadísticas anónimas).
- **Despliegue:** Docker (imagen multi-stage), Docker Compose, Render Blueprint (`render.yaml`).
- **Calidad:** Git, pytest, Vitest y configuraciones reproducibles mediante variables de entorno.

## Arquitectura resumida

El usuario accede directamente, carga una imagen y recibe la predicción de la CNN. FastAPI valida la imagen en memoria, aplica el preprocessing de MobileNetV2 y ejecuta el modelo `.keras`. Opcionalmente registra estadísticas anónimas en Supabase.

En producción (Docker/Render) la misma URL sirve la interfaz y la API (`FRONTEND_DIST`).

Documentación: [`docs/architecture.md`](docs/architecture.md) · despliegue: [`docs/deployment.md`](docs/deployment.md) · roadmap: [`docs/roadmap.md`](docs/roadmap.md) · ML: [`docs/ml-pipeline.md`](docs/ml-pipeline.md).

## Estructura

```text
CarbonSteelClassifier/
├── backend/                 # API FastAPI y servicios de aplicación
├── frontend/                # Aplicación React/Vite/TypeScript
├── ml/                      # Datos, entrenamiento, evaluación e inferencia
├── shared/                  # Configuración canónica compartida
├── supabase/                # Migraciones y seed de PostgreSQL
├── docs/                    # Documentación técnica
├── tests/                   # Pruebas automatizadas
├── Dockerfile               # Imagen de producción (SPA + API + CNN)
├── docker-compose.yml       # Ejecución local con Docker
└── render.yaml              # Blueprint de Render
```

Las siete etiquetas están centralizadas en [`shared/microstructure_classes.json`](shared/microstructure_classes.json).

## Requisitos

- Python **3.11** (recomendado vía `uv python install 3.11`).
- Node.js 20 o superior y npm.
- Docker 24+ (opcional, recomendado para probar el despliegue).
- Proyecto Supabase para catálogo, modelos y estadísticas (sin Auth de producto).

## Configuración inicial

1. Crear el entorno virtual con Python 3.11:

   ```bash
   # Si usas uv:
   uv python install 3.11
   uv venv --python 3.11 .venv
   source .venv/bin/activate
   python -m ensurepip --upgrade
   pip install -r backend/requirements.txt -r ml/requirements.txt
   ```

2. Copiar `.env.example` a `.env`. La clave `service_role` debe permanecer solo en el servidor.
   `MODEL_PATH` debe apuntar a `ml/models/trained/active.keras`.

3. Instalar el frontend:

   ```bash
   cd frontend
   npm install
   ```

## Entrenar el modelo

```bash
source .venv/bin/activate
PYTHONPATH=. python -m ml.src.training.train --epochs 12
```

## Verificación local (sin Docker)

Backend (desde la raíz del repositorio, con el `.venv` de Python 3.11):

```bash
cd /path/to/CarbonSteelClassifier
source .venv/bin/activate
./scripts/run_backend.sh
```

Equivalente manual:

```bash
cd /path/to/CarbonSteelClassifier
source .venv/bin/activate
PYTHONPATH=. python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

No uses `backend/.venv` (Python 3.14) ni ejecutes `uvicorn backend.app.main:app` desde dentro de `backend/` con `PYTHONPATH=.`: ahí no existe el paquete `backend`.

Frontend:

```bash
cd frontend
npm run dev
```

## Docker (paridad con Render)

Con `ml/models/trained/active.keras` presente:

```bash
docker compose up --build
```

Abre [http://127.0.0.1:8000](http://127.0.0.1:8000). Detalle completo y despliegue en Render: [`docs/deployment.md`](docs/deployment.md).

## Próximo paso

Publicar `active.keras` en una URL HTTPS (`MODEL_URL`), crear el Web Service en Render con el `Dockerfile` / `render.yaml` y verificar `/health` + una predicción de extremo a extremo.
