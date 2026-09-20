-- Seed reviewed against shared/microstructure_classes.json.
-- Official training order (not alphabetical). Catalog metadata only.

update public.microstructure_classes
set
    slug = 'cementita-perlita',
    name = 'Cementita + Perlita',
    scientific_description = 'Microestructura típica de aceros hipereutectoides (más de 0.77% de carbono). Al enfriarse lentamente, el exceso de carbono se segrega primero en los bordes de grano de la antigua austenita formando una red o matriz dura de cementita proeutectoide, mientras que el resto de la estructura se transforma en colonias de perlita. Es un material muy duro pero quebradizo.'
where slug = 'perlita-cementita';

insert into public.microstructure_classes (slug, name, scientific_description)
values
    (
        'austenita',
        'Austenita',
        'Es una solución sólida de carbono en hierro con estructura cristalina cúbica centrada en las caras (FCC). Es estable únicamente a altas temperaturas (por encima de 727 °C en aceros al carbono). Es blanda, dúctil, tenaz y no magnética, siendo la fase de partida para la mayoría de los tratamientos térmicos.'
    ),
    (
        'ferrita',
        'Ferrita',
        'Es una solución sólida de carbono en hierro α con estructura cúbica centrada en el cuerpo (BCC). Es la fase más estable a temperatura ambiente para aceros de bajo carbono. Es muy blanda, altamente dúctil y magnética, pero tiene baja resistencia mecánica.'
    ),
    (
        'perlita',
        'Perlita',
        'No es una fase, sino un constituyente estructural bifásico formado por láminas alternas de ferrita y cementita. Se origina por el enfriamiento lento de la austenita a partir de los 727 °C. Ofrece el mejor equilibrio general entre dureza, resistencia y ductilidad.'
    ),
    (
        'cementita-perlita',
        'Cementita + Perlita',
        'Microestructura típica de aceros hipereutectoides (más de 0.77% de carbono). Al enfriarse lentamente, el exceso de carbono se segrega primero en los bordes de grano de la antigua austenita formando una red o matriz dura de cementita proeutectoide, mientras que el resto de la estructura se transforma en colonias de perlita. Es un material muy duro pero quebradizo.'
    ),
    (
        'perlita-ferrita-widmanstatten',
        'Perlita + Ferrita Widmanstätten',
        'Variante morfológica que ocurre en aceros de bajo o medio carbono cuando se enfrían a una velocidad relativamente rápida (pero sin llegar al temple) o desde una temperatura de austenización excesivamente alta (grano grueso). En lugar de granos redondeados, la ferrita proeutectoide crece en forma de agujas o placas delgadas orientadas en direcciones cristalográficas específicas dentro de la matriz de perlita. Esta disposición geométrica reduce drásticamente la tenacidad del acero, haciéndolo propenso a fracturas.'
    ),
    (
        'perlita-ferrita-equiaxial',
        'Perlita + Ferrita Equiaxial',
        'Estructura que se genera en aceros hipoeutectoides (menos de 0.77% de carbono) tras un enfriamiento lento y controlado (como un recocido ordinario). Antes de formarse la perlita, se precipitan granos de ferrita proeutectoide con forma esférica u homogénea (equiaxiales) en los bordes de grano. Es una estructura muy común, fácil de mecanizar y con buena tenacidad.'
    ),
    (
        'martensita',
        'Martensita',
        'Es una fase monofásica que se produce mediante el enfriamiento extremadamente rápido (temple) de la austenita, impidiendo que el carbono difunda. Tiene una estructura tetragonal centrada en el cuerpo (BCT) altamente distorsionada. Es la estructura más dura y frágil del acero, con nula ductilidad antes de ser revenida.'
    )
on conflict (slug) do update
set
    name = excluded.name,
    scientific_description = excluded.scientific_description;
