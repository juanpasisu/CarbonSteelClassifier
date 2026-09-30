# Roadmap técnico

## Estado

| Fase | Objetivo | Estado |
| --- | --- | --- |
| 0 | Planificación y arquitectura | Completada |
| 1 | Inicialización del repositorio | Completada |
| 2 | Supabase y base de datos (sin usuarios) | Completada |
| 3 | Backend base sin autenticación | Completada |
| 4 | Gestión temporal de imágenes | Completada |
| 5 | Pipeline ML CNN (TensorFlow/Keras) | Completada |
| 6 | API de predicción `POST /predict` | Completada |
| 7 | Frontend público e identidad visual UIS | Parcial |
| 8 | Integración completa Frontend → FastAPI → CNN | Lista para verificación |
| 9 | Pruebas y validación | En curso (20 tests OK) |
| 10 | Documentación final | En actualización |
| 11 | Docker + Render (despliegue público) | Lista (ver `docs/deployment.md`) |

## Decisiones vigentes

- Python oficial: **3.11**
- Framework ML: **TensorFlow/Keras** (MobileNetV2 + transfer learning)
- Artefacto: `ml/models/trained/active.keras`
- Preprocess: `mobilenet_v2.preprocess_input`
- Orden de clases: oficial del brief
- Archivo PyTorch histórico: `ml/models/archive/pytorch-v1/`

## Modelo activo

- Nombre: MicrostructureCNN  
- Versión: **2.0**  
- Framework: tensorflow  
- Accuracy test: **90,0 %** (239 imágenes; checkpoint `best_head`, validación 85,6 %)

## Próxima fase

Desplegar en Render con `MODEL_URL` + plan ≥1 GB RAM y cerrar la documentación académica final.
