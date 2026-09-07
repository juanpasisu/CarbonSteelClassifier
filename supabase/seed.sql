-- Seed reviewed against shared/microstructure_classes.json.
-- Official training order (not alphabetical). Catalog metadata only.

update public.microstructure_classes
set
    slug = 'cementita-perlita',
    name = 'Cementita + Perlita',
    scientific_description = 'Microestructura en la que coexisten regiones de cementita y perlita.'
where slug = 'perlita-cementita';

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
        'perlita',
        'Perlita',
        'Microconstituyente laminar formado principalmente por ferrita y cementita.'
    ),
    (
        'cementita-perlita',
        'Cementita + Perlita',
        'Microestructura en la que coexisten regiones de cementita y perlita.'
    ),
    (
        'perlita-ferrita-widmanstatten',
        'Perlita + Ferrita Widmanstätten',
        'Microestructura con perlita y ferrita proeutectoide de morfología Widmanstätten.'
    ),
    (
        'perlita-ferrita-equiaxial',
        'Perlita + Ferrita Equiaxial',
        'Microestructura con colonias de perlita y ferrita de granos aproximadamente equiaxiales.'
    ),
    (
        'martensita',
        'Martensita',
        'Fase metaestable formada por transformación displaciva de la austenita, generalmente de alta dureza.'
    )
on conflict (slug) do update
set
    name = excluded.name,
    scientific_description = excluded.scientific_description;
