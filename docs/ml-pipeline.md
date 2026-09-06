# Pipeline de Machine Learning

## Fuente de datos

El dataset se organiza exclusivamente como imágenes dentro de una carpeta por clase:

~~~text
ml/data/raw/
├── austenita/
├── ferrita/
├── martensita/
├── perlita/
├── perlita-cementita/
├── perlita-ferrita-equiaxial/
└── perlita-ferrita-widmanstatten/
~~~

No se requiere un CSV para asignar las etiquetas: el slug de la carpeta es la etiqueta canónica. Los nombres de carpeta deben coincidir con shared/microstructure_classes.json.

## Estado de la inspección inicial

El dataset local contiene actualmente 2.404 imágenes reales:

| Clase | Imágenes |
| --- | ---: |
| Austenita | 304 |
| Ferrita | 320 |
| Martensita | 336 |
| Perlita | 304 |
| Perlita + Cementita | 288 |
| Perlita + Ferrita Equiaxial | 320 |
| Perlita + Ferrita Widmanstätten | 532 |
| **Total** | **2.404** |

Se detectaron también 2.404 archivos Zone.Identifier. Son sidecars de metadatos creados por Windows y no forman parte del dataset; el validador los ignora. No se eliminan automáticamente.

## Aumentos y particiones

Se detectaron 1.632 imágenes con sufijos _aug1, _aug2 o _aug3 y 772 grupos de origen. Las variantes aumentadas de una misma imagen no deben repartirse entre train, validación y test. El pipeline debe agruparlas por el nombre base, asignar el grupo completo a una sola partición y solo después construir los conjuntos.

La partición inicial propuesta es 70% entrenamiento, 15% validación y 15% prueba, con semilla fija. Los porcentajes se ajustarán si el número de grupos por clase o el balance del dataset lo exige.

## Próximas validaciones

1. Ejecutar el validador estructural.
2. Verificar que cada archivo pueda decodificarse como imagen.
3. Revisar dimensiones, canales, duplicados y distribución por grupo.
4. Definir preprocessing único para entrenamiento e inferencia.
5. Particionar por grupo antes de entrenar.

Todavía no se reportan métricas ni se entrena una CNN: primero debe completarse la validación del dataset.
