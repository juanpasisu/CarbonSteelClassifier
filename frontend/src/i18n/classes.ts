import type { Locale } from './messages'

export interface LocalizedClass {
  slug: string
  nameEs: string
  nameEn: string
  descriptionEs: string
  descriptionEn: string
}

export const LOCALIZED_CLASSES: LocalizedClass[] = [
  {
    slug: 'austenita',
    nameEs: 'Austenita',
    nameEn: 'Austenite',
    descriptionEs:
      'Es una solución sólida de carbono en hierro con estructura cristalina cúbica centrada en las caras (FCC). Es estable únicamente a altas temperaturas (por encima de 727 °C en aceros al carbono). Es blanda, dúctil, tenaz y no magnética, siendo la fase de partida para la mayoría de los tratamientos térmicos.',
    descriptionEn:
      'A solid solution of carbon in iron with a face-centered cubic (FCC) crystal structure. It is stable only at high temperatures (above 727 °C in carbon steels). It is soft, ductile, tough, and non-magnetic, and it is the starting phase for most heat treatments.',
  },
  {
    slug: 'ferrita',
    nameEs: 'Ferrita',
    nameEn: 'Ferrite',
    descriptionEs:
      'Es una solución sólida de carbono en hierro α con estructura cúbica centrada en el cuerpo (BCC). Es la fase más estable a temperatura ambiente para aceros de bajo carbono. Es muy blanda, altamente dúctil y magnética, pero tiene baja resistencia mecánica.',
    descriptionEn:
      'A solid solution of carbon in α-iron with a body-centered cubic (BCC) structure. It is the most stable phase at room temperature for low-carbon steels. It is very soft, highly ductile, and magnetic, but has low mechanical strength.',
  },
  {
    slug: 'perlita',
    nameEs: 'Perlita',
    nameEn: 'Pearlite',
    descriptionEs:
      'No es una fase, sino un constituyente estructural bifásico formado por láminas alternas de ferrita y cementita. Se origina por el enfriamiento lento de la austenita a partir de los 727 °C. Ofrece el mejor equilibrio general entre dureza, resistencia y ductilidad.',
    descriptionEn:
      'Not a single phase, but a two-phase structural constituent made of alternating lamellae of ferrite and cementite. It forms by slow cooling of austenite from 727 °C. It offers the best overall balance of hardness, strength, and ductility.',
  },
  {
    slug: 'cementita-perlita',
    nameEs: 'Cementita + Perlita',
    nameEn: 'Cementite + Pearlite',
    descriptionEs:
      'Microestructura típica de aceros hipereutectoides (más de 0.77% de carbono). Al enfriarse lentamente, el exceso de carbono se segrega primero en los bordes de grano de la antigua austenita formando una red o matriz dura de cementita proeutectoide, mientras que el resto de la estructura se transforma en colonias de perlita. Es un material muy duro pero quebradizo.',
    descriptionEn:
      'Typical microstructure of hypereutectoid steels (more than 0.77% carbon). On slow cooling, excess carbon first segregates at prior-austenite grain boundaries as a hard proeutectoid cementite network or matrix, while the remainder transforms into pearlite colonies. The material is very hard but brittle.',
  },
  {
    slug: 'perlita-ferrita-widmanstatten',
    nameEs: 'Perlita + Ferrita Widmanstätten',
    nameEn: 'Pearlite + Widmanstätten Ferrite',
    descriptionEs:
      'Variante morfológica que ocurre en aceros de bajo o medio carbono cuando se enfrían a una velocidad relativamente rápida (pero sin llegar al temple) o desde una temperatura de austenización excesivamente alta (grano grueso). En lugar de granos redondeados, la ferrita proeutectoide crece en forma de agujas o placas delgadas orientadas en direcciones cristalográficas específicas dentro de la matriz de perlita. Esta disposición geométrica reduce drásticamente la tenacidad del acero, haciéndolo propenso a fracturas.',
    descriptionEn:
      'A morphological variant in low- or medium-carbon steels cooled relatively quickly (but not quenched) or from an excessively high austenitizing temperature (coarse grain). Instead of rounded grains, proeutectoid ferrite grows as needles or thin plates along specific crystallographic directions within a pearlite matrix. This geometry sharply reduces toughness and increases fracture susceptibility.',
  },
  {
    slug: 'perlita-ferrita-equiaxial',
    nameEs: 'Perlita + Ferrita Equiaxial',
    nameEn: 'Pearlite + Equiaxed Ferrite',
    descriptionEs:
      'Estructura que se genera en aceros hipoeutectoides (menos de 0.77% de carbono) tras un enfriamiento lento y controlado (como un recocido ordinario). Antes de formarse la perlita, se precipitan granos de ferrita proeutectoide con forma esférica u homogénea (equiaxiales) en los bordes de grano. Es una estructura muy común, fácil de mecanizar y con buena tenacidad.',
    descriptionEn:
      'A structure formed in hypoeutectoid steels (less than 0.77% carbon) after slow, controlled cooling (such as ordinary annealing). Before pearlite forms, proeutectoid ferrite grains precipitate with a roughly spherical or homogeneous (equiaxed) shape at grain boundaries. It is a very common structure, easy to machine, and has good toughness.',
  },
  {
    slug: 'martensita',
    nameEs: 'Martensita',
    nameEn: 'Martensite',
    descriptionEs:
      'Es una fase monofásica que se produce mediante el enfriamiento extremadamente rápido (temple) de la austenita, impidiendo que el carbono difunda. Tiene una estructura tetragonal centrada en el cuerpo (BCT) altamente distorsionada. Es la estructura más dura y frágil del acero, con nula ductilidad antes de ser revenida.',
    descriptionEn:
      'A single-phase product formed by extremely rapid cooling (quenching) of austenite, preventing carbon diffusion. It has a highly distorted body-centered tetragonal (BCT) structure. It is the hardest and most brittle steel structure, with essentially no ductility before tempering.',
  },
]

const bySpanishName = new Map(
  LOCALIZED_CLASSES.map((item) => [item.nameEs, item]),
)
const bySlug = new Map(LOCALIZED_CLASSES.map((item) => [item.slug, item]))

export function localizeClassName(
  spanishOrLocalizedName: string,
  locale: Locale,
): string {
  const match =
    bySpanishName.get(spanishOrLocalizedName) ??
    LOCALIZED_CLASSES.find(
      (item) =>
        item.nameEn === spanishOrLocalizedName ||
        item.nameEs === spanishOrLocalizedName,
    )
  if (!match) {
    return spanishOrLocalizedName
  }
  return locale === 'en' ? match.nameEn : match.nameEs
}

export function localizeClassDescription(
  slugOrSpanishName: string,
  locale: Locale,
  fallback: string,
): string {
  const match =
    bySlug.get(slugOrSpanishName) ?? bySpanishName.get(slugOrSpanishName)
  if (!match) {
    return fallback
  }
  return locale === 'en' ? match.descriptionEn : match.descriptionEs
}
