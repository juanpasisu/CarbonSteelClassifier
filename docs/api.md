# API

## Base

La API utiliza FastAPI y expone documentación OpenAPI en `/docs`. El prefijo funcional versionado es `/api/v1`.

No hay autenticación de usuarios finales.

## Endpoints disponibles

### GET /health

Devuelve el estado de vida del servicio.

### GET /api/v1/classes

Devuelve las siete clases desde `shared/microstructure_classes.json` (orden oficial de entrenamiento).

### GET /api/v1/model

Consulta el modelo activo. Mientras no haya modelo cargado, responde con estado no disponible.

### POST /api/v1/predict

Recibe una imagen (`multipart/form-data`, campo `file`), la valida, la preprocesa en memoria (224×224 RGB, `mobilenet_v2.preprocess_input`) y ejecuta la CNN. Además de la clase morfológica de siete etiquetas, responde la presencia/ausencia de ferrita, perlita y cementita.

Respuesta esperada cuando el modelo esté disponible:

```json
{
  "predicted_class": "Ferrita",
  "confidence": 0.942,
  "probabilities": [
    { "class": "Austenita", "probability": 0.004 },
    { "class": "Cementita + Perlita", "probability": 0.002 },
    { "class": "Ferrita", "probability": 0.942 }
  ],
  "identified_phases": [
    { "slug": "ferrita", "name": "Ferrita", "present": true },
    { "slug": "perlita", "name": "Perlita", "present": false },
    { "slug": "cementita", "name": "Cementita", "present": false }
  ],
  "model": {
    "name": "MicrostructureCNN",
    "version": "1.0",
    "framework": "TensorFlow/Keras"
  }
}
```

Con el artefacto `ml/models/trained/active.keras` presente, el endpoint ejecuta la CNN real y responde el JSON de predicción. Si el modelo no está disponible, responde `503` sin simular resultados.

## Errores de cliente esperados

- Archivo inválido, formato no soportado, tamaño excesivo o imagen corrupta → `400`
- Modelo no disponible o fallo de inferencia → `503` / `500` con mensaje no técnico al cliente
