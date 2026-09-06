# CarbonSteelClassifier

Plataforma web académica para apoyar la identificación de fases y microconstituyentes en imágenes metalográficas de aceros al carbono mediante visión por computador y redes neuronales convolucionales (CNN).

El sistema no reemplaza el criterio de un especialista metalúrgico. Su propósito es didáctico, investigativo y de apoyo al aprendizaje.

## Estado del proyecto

Avance actual: Supabase configurado, esquema/RLS/Storage verificados, dataset local cargado y autenticación inicial implementada.

## Tecnologías

- **Frontend:** React, Vite, TypeScript y Tailwind CSS.
- **Backend:** Python, FastAPI, Pydantic y Uvicorn.
- **Machine Learning:** TensorFlow/Keras, NumPy, Pandas, scikit-learn, OpenCV y Matplotlib.
- **Datos y servicios:** Supabase (PostgreSQL, Auth y Storage).
- **Calidad:** Git, pytest y configuraciones reproducibles mediante variables de entorno.

## Arquitectura resumida

El frontend gestiona la experiencia del usuario y la sesión de Supabase Auth. Envía el token de acceso y las imágenes al backend FastAPI. El backend valida la solicitud, registra los metadatos, delega el procesamiento al pipeline compartido de ML y ejecuta el modelo activo. Los resultados y el historial se persisten en PostgreSQL; las imágenes se almacenan en Supabase Storage. La clave \`service_role\` permanece únicamente en el backend.

La arquitectura detallada está en [\`docs/architecture.md\`](docs/architecture.md) y el plan de trabajo en [\`docs/roadmap.md\`](docs/roadmap.md).

## Estructura

\`\`\`text
CarbonSteelClassifier/
├── backend/                 # API FastAPI y servicios de aplicación
├── frontend/                # Aplicación React/Vite/TypeScript
├── ml/                      # Datos, entrenamiento, evaluación e inferencia
├── shared/                  # Configuración canónica compartida
├── supabase/                # Migraciones y seed de PostgreSQL
├── docs/                    # Documentación técnica
└── tests/                   # Pruebas automatizadas
\`\`\`

Las siete etiquetas de microestructuras están centralizadas en [\`shared/microstructure_classes.json\`](shared/microstructure_classes.json). Ese archivo es la fuente canónica para backend, ML, frontend y el futuro seed de Supabase.

## Requisitos

- Python 3.11 o superior.
- Node.js 20 o superior y npm.
- Una cuenta/proyecto de Supabase para las fases de integración.

## Configuración inicial

1. Copiar .env.example a .env para consultar las variables disponibles. En desarrollo el backend lee el .env raíz; la clave service_role debe permanecer solo en el servidor.
2. Crear un entorno virtual para Python e instalar las dependencias del backend:

   \`\`\`bash
   cd backend
   python -m venv .venv
   # Linux/macOS: source .venv/bin/activate
   # Windows: .venv\\Scripts\\activate
   pip install -r requirements.txt
   \`\`\`

3. Instalar las dependencias del frontend:

   \`\`\`bash
   cd frontend
   npm install
   \`\`\`

## Verificación de la Fase 1

Backend:

\`\`\`bash
cd backend
.venv/bin/python -m uvicorn app.main:app --reload
\`\`\`

Abrir \`http://127.0.0.1:8000/health\` o la documentación interactiva en \`http://127.0.0.1:8000/docs\`.

Frontend:

\`\`\`bash
cd frontend
npm run dev
\`\`\`

La aplicación debe abrirse en la URL indicada por Vite.

## Próximo paso

La siguiente iteración es validar manualmente el registro e inicio de sesión con Supabase Auth y completar el flujo autenticado de carga y análisis de imágenes.
