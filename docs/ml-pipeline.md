# Pipeline de Machine Learning

## Stack oficial

- Python **3.11**
- TensorFlow / Keras
- MobileNetV2 + transfer learning
- Artefacto de producción: `ml/models/trained/active.keras`

PyTorch ya no es el framework oficial. Los pesos históricos quedaron en `ml/models/archive/pytorch-v1/`.

## Fuente de datos

```text
ml/data/raw/
├── austenita/
├── ferrita/
├── perlita/
├── cementita-perlita/
├── perlita-ferrita-widmanstatten/
├── perlita-ferrita-equiaxial/
└── martensita/
```

## Orden oficial de clases (entrenamiento)

1. Austenita  
2. Ferrita  
3. Perlita  
4. Cementita + Perlita  
5. Perlita + Ferrita Widmanstätten  
6. Perlita + Ferrita Equiaxial  
7. Martensita  

Fuente canónica: `shared/microstructure_classes.json` (`ordering: official_training_order`).

## Preprocesamiento

Compartido entre entrenamiento e inferencia (`ml/src/preprocessing/image.py`):

1. EXIF transpose + RGB  
2. Resize 224×224 (LANCZOS)  
3. `tf.keras.applications.mobilenet_v2.preprocess_input`

## Entrenamiento

```bash
source .venv/bin/activate
PYTHONPATH=. python -m ml.src.training.train --epochs 12 --fine-tune-epochs 6
```

Incluye class weights, augmentation moderada, EarlyStopping, ModelCheckpoint y fine-tuning parcial.

## Inferencia

FastAPI carga `active.keras` una sola vez y usa el mismo preprocessing.
