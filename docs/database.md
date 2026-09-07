# Diseño de base de datos

## Alcance

El dataset de la CNN se alimenta con imágenes organizadas por carpetas. El slug de cada carpeta coincide con `shared/microstructure_classes.json`.

Las imágenes enviadas por usuarios de la aplicación se procesan en memoria y no se persisten. PostgreSQL guarda catálogo, modelos y estadísticas anónimas de predicción.

## Tablas

| Tabla | Propósito | Notas |
| --- | --- | --- |
| microstructure_classes | Catálogo de las siete clases | Lectura pública |
| ml_models | Versiones y metadatos de modelos | Lectura pública; un modelo activo |
| analyses | Resultado anónimo de cada predicción | Sin `user_id`; opcional para stats |
| predictions | Probabilidad por clase de un análisis | Ligada a `analyses` |

Tablas retiradas del diseño de producto: `profiles`, `images` y cualquier dependencia de `auth.users`.

## Migraciones

1. `20260905_000001_initial_schema.sql` — esquema original con usuarios (histórico).
2. `20260906_000002_public_access_schema.sql` — adapta el proyecto a acceso público: elimina perfiles/imágenes de usuario, recrea `analyses`/`predictions` anónimos y abre lectura de catálogos.

Aplicar la segunda migración solo tras revisar el SQL Editor de Supabase. Si ya existen datos de usuarios reales, confirmar el respaldo antes del `DROP`.

El bucket `microstructure-images` no se elimina por SQL: Supabase no permite `DELETE` directo en `storage.buckets`. Si el bucket sigue existiendo, bórralo desde **Dashboard → Storage** (o la Storage API). Las políticas de ese bucket sí se eliminan en la migración.

## Seed

`supabase/seed.sql` inserta o actualiza las siete clases oficiales en el orden de entrenamiento y renombra el slug legado `perlita-cementita` → `cementita-perlita`.

## Registro del modelo activo

Tras entrenar, registra la versión en `ml_models`:

```bash
PYTHONPATH=. python scripts/register_active_model.py --name MicrostructureCNN --version 1.0
```

El script desactiva modelos previos, hace upsert por `(name, version)` y marca el nuevo registro como `is_active`.

## Logging anónimo de predicciones

Cada `POST /api/v1/predict` exitoso intenta insertar:

1. Una fila en `analyses` (`predicted_class_id`, `confidence`, `model_id`)
2. Siete filas en `predictions` (probabilidad por clase)

Si Supabase no está configurado o falla, la predicción HTTP sigue respondiendo con éxito. No se guardan imágenes ni datos personales.

## RLS

- Lectura pública (`anon` / `authenticated`) de clases, modelos, análisis y predicciones.
- Escrituras de análisis vía backend con `service_role` (bypass de RLS).
- Sin políticas basadas en `auth.uid()` para el flujo de producto.
