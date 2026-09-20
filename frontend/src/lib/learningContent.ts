import { randomBankImage, sampleSrcForSlug } from './sampleImages'
import { LOCALIZED_CLASSES } from '../i18n/classes'
import type { Locale } from '../i18n/messages'

export type LevelId = 'basic' | 'beginner' | 'expert'

export interface MorphologyCue {
  id: string
  labelEs: string
  labelEn: string
}

export interface ClassLearningProfile {
  slug: string
  morphologyEs: string
  morphologyEn: string
  cues: MorphologyCue[]
  typicalMagnificationEs: string
  typicalMagnificationEn: string
  whyEs: string
  whyEn: string
}

export const CLASS_LEARNING: ClassLearningProfile[] = [
  {
    slug: 'austenita',
    morphologyEs:
      'Granos poligonales claros, bordes de grano definidos y aspecto relativamente homogéneo.',
    morphologyEn:
      'Clear polygonal grains, defined grain boundaries and a relatively homogeneous look.',
    cues: [
      { id: 'poly', labelEs: 'Granos poligonales', labelEn: 'Polygonal grains' },
      { id: 'uniform', labelEs: 'Textura uniforme', labelEn: 'Uniform texture' },
      { id: 'boundaries', labelEs: 'Bordes de grano visibles', labelEn: 'Visible grain boundaries' },
    ],
    typicalMagnificationEs: 'Suele reconocerse bien entre 100× y 500×.',
    typicalMagnificationEn: 'Often recognized well between 100× and 500×.',
    whyEs:
      'La austenita retenida o revelada ópticamente se identifica por granos equiaxiales sin laminillas internas ni agujas.',
    whyEn:
      'Retained or optically revealed austenite is identified by equiaxed grains without internal lamellae or needles.',
  },
  {
    slug: 'ferrita',
    morphologyEs:
      'Regiones claras y blandas, granos redondeados o irregulares sin estriado interno.',
    morphologyEn:
      'Bright soft regions, rounded or irregular grains without internal striations.',
    cues: [
      { id: 'bright', labelEs: 'Zonas claras', labelEn: 'Bright regions' },
      { id: 'soft', labelEs: 'Sin láminas internas', labelEn: 'No internal lamellae' },
      { id: 'equiaxed', labelEs: 'Granos equiaxiales', labelEn: 'Equiaxed grains' },
    ],
    typicalMagnificationEs: 'A 100×–200× se ve el contraste; a 500× se confirman bordes.',
    typicalMagnificationEn: 'At 100×–200× contrast stands out; at 500× boundaries are confirmed.',
    whyEs:
      'La ferrita aparece clara tras ataque con nital y no muestra el estriado típico de la perlita.',
    whyEn:
      'Ferrite appears bright after nital etch and lacks the striations typical of pearlite.',
  },
  {
    slug: 'perlita',
    morphologyEs:
      'Colonias con láminas alternas de ferrita y cementita; aspecto estriado o “fingerprint”.',
    morphologyEn:
      'Colonies with alternating ferrite–cementite lamellae; striated or fingerprint look.',
    cues: [
      { id: 'lamellar', labelEs: 'Láminas alternas', labelEn: 'Alternating lamellae' },
      { id: 'colonies', labelEs: 'Colonias', labelEn: 'Colonies' },
      { id: 'striation', labelEs: 'Estriado fino', labelEn: 'Fine striation' },
    ],
    typicalMagnificationEs: 'A 200×–500× las láminas se resuelven mejor.',
    typicalMagnificationEn: 'At 200×–500× lamellae resolve better.',
    whyEs:
      'La perlita se distingue por su morfología laminar bifásica, no por un solo tono uniforme.',
    whyEn:
      'Pearlite is distinguished by its two-phase lamellar morphology, not a single uniform tone.',
  },
  {
    slug: 'cementita-perlita',
    morphologyEs:
      'Red o red continua clara en bordes de grano (cementita) rodeando colonias de perlita.',
    morphologyEn:
      'Bright continuous network at grain boundaries (cementite) surrounding pearlite colonies.',
    cues: [
      { id: 'network', labelEs: 'Red en borde de grano', labelEn: 'Grain-boundary network' },
      { id: 'hard', labelEs: 'Contraste duro/claro', labelEn: 'Hard/bright contrast' },
      { id: 'pearlite-core', labelEs: 'Interior perlítico', labelEn: 'Pearlitic interior' },
    ],
    typicalMagnificationEs: 'La red se aprecia desde 100×; el detalle perlítico pide ≥200×.',
    typicalMagnificationEn: 'The network shows from 100×; pearlite detail needs ≥200×.',
    whyEs:
      'En hipereutectoides la cementita proeutectoide delimita granos y el resto es perlita.',
    whyEn:
      'In hypereutectoid steels proeutectoid cementite outlines grains and the rest is pearlite.',
  },
  {
    slug: 'perlita-ferrita-widmanstatten',
    morphologyEs:
      'Placas o agujas de ferrita orientadas dentro de una matriz perlítica.',
    morphologyEn:
      'Oriented ferrite plates or needles within a pearlitic matrix.',
    cues: [
      { id: 'needles', labelEs: 'Agujas / placas', labelEn: 'Needles / plates' },
      { id: 'oriented', labelEs: 'Orientación preferente', labelEn: 'Preferred orientation' },
      { id: 'matrix', labelEs: 'Matriz perlítica', labelEn: 'Pearlitic matrix' },
    ],
    typicalMagnificationEs: 'Las agujas se ven bien a 100×–200×; el detalle a 500×.',
    typicalMagnificationEn: 'Needles show well at 100×–200×; detail at 500×.',
    whyEs:
      'La ferrita Widmanstätten crece como placas geométricas, no como granos redondeados.',
    whyEn:
      'Widmanstätten ferrite grows as geometric plates, not rounded grains.',
  },
  {
    slug: 'perlita-ferrita-equiaxial',
    morphologyEs:
      'Granos claros de ferrita más o menos redondeados junto a colonias de perlita.',
    morphologyEn:
      'Bright, roughly rounded ferrite grains alongside pearlite colonies.',
    cues: [
      { id: 'rounded', labelEs: 'Ferrita redondeada', labelEn: 'Rounded ferrite' },
      { id: 'mixed', labelEs: 'Mezcla bifásica', labelEn: 'Two-phase mix' },
      { id: 'slow-cool', labelEs: 'Aspecto de recocido', labelEn: 'Annealed look' },
    ],
    typicalMagnificationEs: 'Contraste general a 100×; morfología de grano a 200×–500×.',
    typicalMagnificationEn: 'Overall contrast at 100×; grain morphology at 200×–500×.',
    whyEs:
      'En hipoeutectoides enfriados lento la ferrita proeutectoide es equiaxial, no acicular.',
    whyEn:
      'In slowly cooled hypoeutectoid steels proeutectoid ferrite is equiaxed, not acicular.',
  },
  {
    slug: 'martensita',
    morphologyEs:
      'Listones o placas agudas, alto contraste y aspecto “aguijado” o en relieve.',
    morphologyEn:
      'Laths or sharp plates, high contrast and a needle-like or relief appearance.',
    cues: [
      { id: 'laths', labelEs: 'Listones / placas', labelEn: 'Laths / plates' },
      { id: 'relief', labelEs: 'Alto relieve', labelEn: 'High relief' },
      { id: 'quench', labelEs: 'Aspecto de temple', labelEn: 'Quench appearance' },
    ],
    typicalMagnificationEs: 'A 200×–500× se resuelve mejor la morfología de listones.',
    typicalMagnificationEn: 'At 200×–500× lath morphology resolves better.',
    whyEs:
      'La martensita no es laminar como la perlita: son listones o placas de transformación rápida.',
    whyEn:
      'Martensite is not lamellar like pearlite: it forms laths or plates from rapid transformation.',
  },
]

export const MAGNIFICATION_LESSONS = [
  {
    id: '100x',
    label: '100×',
    scale: 1,
    titleEs: 'Visión de conjunto',
    titleEn: 'Overview',
    bodyEs:
      'A 100× reconoces contraste general, redes en borde de grano y si hay agujas o colonias grandes. Aún no resuelves láminas finas de perlita.',
    bodyEn:
      'At 100× you see overall contrast, grain-boundary networks and whether needles or large colonies exist. Fine pearlite lamellae may not resolve yet.',
  },
  {
    id: '200x',
    label: '200×',
    scale: 1.2,
    titleEs: 'Morfología intermedia',
    titleEn: 'Intermediate morphology',
    bodyEs:
      'A 200× distingues mejor granos de ferrita, orientación Widmanstätten y el límite entre regiones claras y estriadas.',
    bodyEn:
      'At 200× ferrite grains, Widmanstätten orientation and the boundary between bright and striated regions become clearer.',
  },
  {
    id: '500x',
    label: '500×',
    scale: 1.4,
    titleEs: 'Detalle fino',
    titleEn: 'Fine detail',
    bodyEs:
      'A 500× puedes confirmar láminas de perlita, listones de martensita o el espesor aparente de placas. Cambia el “qué parece” al “qué es”.',
    bodyEn:
      'At 500× you can confirm pearlite lamellae, martensite laths or apparent plate thickness. Identification shifts from “looks like” to “is”.',
  },
] as const

export const MORPHOLOGY_OPTIONS = [
  {
    id: 'lamellar',
    labelEs: 'Laminar / estriada',
    labelEn: 'Lamellar / striated',
  },
  {
    id: 'polygonal',
    labelEs: 'Granos poligonales claros',
    labelEn: 'Bright polygonal grains',
  },
  {
    id: 'needles',
    labelEs: 'Agujas o placas orientadas',
    labelEn: 'Oriented needles or plates',
  },
  {
    id: 'network',
    labelEs: 'Red en borde de grano',
    labelEn: 'Grain-boundary network',
  },
  {
    id: 'laths',
    labelEs: 'Listones de temple',
    labelEn: 'Quench laths',
  },
  {
    id: 'mixed-equiaxed',
    labelEs: 'Ferrita redondeada + perlita',
    labelEn: 'Rounded ferrite + pearlite',
  },
] as const

export const VISUAL_TRAIT_OPTIONS = [
  {
    id: 'high-contrast',
    labelEs: 'Alto contraste claro/oscuro',
    labelEn: 'High bright/dark contrast',
  },
  {
    id: 'fine-striation',
    labelEs: 'Estriado fino interno',
    labelEn: 'Fine internal striation',
  },
  {
    id: 'grain-boundary',
    labelEs: 'Bordes de grano marcados',
    labelEn: 'Marked grain boundaries',
  },
  {
    id: 'oriented-plates',
    labelEs: 'Placas con dirección preferente',
    labelEn: 'Plates with preferred direction',
  },
] as const

export const MAG_CHOICES = ['100×', '200×', '500×', '1000×'] as const

export { sampleSrcForSlug }

export function learningForSlug(slug: string): ClassLearningProfile | undefined {
  return CLASS_LEARNING.find((item) => item.slug === slug)
}

export function localizeCue(cue: MorphologyCue, locale: Locale): string {
  return locale === 'en' ? cue.labelEn : cue.labelEs
}

export function allClassSlugs(): string[] {
  return LOCALIZED_CLASSES.map((item) => item.slug)
}

export interface QuizQuestion {
  id: string
  slug: string
  imageSrc: string
  options: string[]
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function buildIdentificationQuiz(count = 5): QuizQuestion[] {
  const slugs = shuffle(allClassSlugs()).slice(0, count)
  return slugs.map((slug) => {
    const distractors = shuffle(allClassSlugs().filter((s) => s !== slug)).slice(
      0,
      3,
    )
    return {
      id: `q-${slug}-${Math.random().toString(36).slice(2, 7)}`,
      slug,
      imageSrc: randomBankImage(slug),
      options: shuffle([slug, ...distractors]),
    }
  })
}

export function slugFromClassName(name: string): string | undefined {
  const exact = LOCALIZED_CLASSES.find(
    (item) => item.nameEs === name || item.nameEn === name,
  )
  return exact?.slug
}
