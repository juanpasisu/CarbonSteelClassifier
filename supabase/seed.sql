-- Seed reviewed against shared/microstructure_classes.json.
-- This inserts catalog metadata only; it does not upload or create image records.

insert into public.microstructure_classes (slug, name, scientific_description)
values
    (
        'austenita',
        'Austenita',
        'Fase gamma del hierro, de estructura cristalina cúbica centrada en las caras.'
    ),
    (
        'ferrita',
        'Ferrita',
        'Solución sólida de carbono en hierro alfa, de estructura cristalina cúbica centrada en el cuerpo.'
    ),
    (
        'martensita',
        'Martensita',
        'Fase metaestable formada por transformación displaciva de la austenita, generalmente de alta dureza.'
    ),
    (
        'perlita',
        'Perlita',
        'Microconstituyente laminar formado principalmente por ferrita y cementita.'
    ),
    (
        'perlita-cementita',
        'Perlita + Cementita',
        'Microestructura en la que coexisten regiones de perlita y cementita.'
    ),
    (
        'perlita-ferrita-equiaxial',
        'Perlita + Ferrita Equiaxial',
        'Microestructura con colonias de perlita y ferrita de granos aproximadamente equiaxiales.'
    ),
    (
        'perlita-ferrita-widmanstatten',
        'Perlita + Ferrita Widmanstätten',
        'Microestructura con perlita y ferrita proeutectoide de morfología Widmanstätten.'
    )
on conflict (slug) do update
set
    name = excluded.name,
    scientific_description = excluded.scientific_description;
