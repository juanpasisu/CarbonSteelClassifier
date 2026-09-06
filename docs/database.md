# Diseño de base de datos

## Alcance

El dataset de la CNN se alimentará únicamente con imágenes organizadas por carpetas. No se necesita un CSV para asignar la etiqueta: el nombre de la carpeta usa el slug canónico de shared/microstructure_classes.json.

Las imágenes binarias deben vivir en Supabase Storage. PostgreSQL conservará metadatos, relaciones, predicciones e historial; no se guardarán los bytes de las imágenes dentro de una columna.

## Tablas

| Tabla | Propósito | Propietario lógico |
| --- | --- | --- |
| profiles | Datos complementarios del usuario | Usuario autenticado |
| microstructure_classes | Catálogo de las siete clases | Catálogo del sistema |
| images | Metadatos de imágenes analizadas | Usuario autenticado |
| analyses | Resultado principal de cada análisis | Usuario autenticado |
| predictions | Probabilidad por clase para un análisis | Usuario autenticado vía análisis |
| ml_models | Versiones y metadatos de modelos | Sistema |

La tabla images conserva una relación compuesta con analyses para impedir que un análisis vincule una imagen de otro usuario. El índice parcial de ml_models permite un solo modelo activo.

## Storage

La migración crea el bucket privado microstructure-images con límite de 25 MB y MIME permitidos JPG, PNG, WEBP y TIFF. La ruta prevista es:

~~~text
user_id/image_id/original.ext
~~~

Las políticas de storage.objects restringen lectura, carga, actualización y eliminación al primer segmento de la ruta, que debe ser el UUID del usuario autenticado.

El dataset de entrenamiento local no se sube automáticamente a este bucket de usuarios. Si se necesita una copia en la nube, se creará un bucket administrativo separado, por ejemplo training-dataset, con políticas distintas y revisión explícita.

## RLS

- Cada usuario solo puede leer, modificar y eliminar sus propios perfiles e imágenes.
- Cada usuario solo puede consultar y eliminar sus propios análisis.
- Las predicciones se pueden consultar únicamente cuando el análisis padre pertenece al usuario.
- El catálogo de clases y los modelos se pueden consultar por usuarios autenticados.
- Las escrituras de análisis y predicciones quedan reservadas al backend mediante la service role key, que nunca debe llegar al frontend.

## Aplicación

La migración está en supabase/migrations/20260905_000001_initial_schema.sql. El archivo modifica estructura y políticas, pero no se ejecuta desde este repositorio. Debe revisarse en el SQL Editor de Supabase antes de aplicarlo.
