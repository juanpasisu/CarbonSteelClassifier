import sampleBank from './sampleBank.json'

/** Higher-quality static previews used in catalogs/hero. */
export const CLASS_SAMPLE_SRC: Record<string, string> = {
  austenita: '/samples/austenita.png',
  ferrita: '/samples/ferrita.png',
  perlita: '/samples/demo-perlita.png',
  'cementita-perlita': '/samples/cementita-perlita.jpg',
  'perlita-ferrita-widmanstatten':
    '/samples/perlita-ferrita-widmanstatten.png',
  'perlita-ferrita-equiaxial': '/samples/perlita-ferrita-equiaxial.png',
  martensita: '/samples/martensita.png',
}

export type SampleBank = Record<string, string[]>

export const SAMPLE_BANK: SampleBank = sampleBank as SampleBank

export function bankForSlug(slug: string): string[] {
  const bank = SAMPLE_BANK[slug] ?? []
  const featured = CLASS_SAMPLE_SRC[slug]
  const merged: string[] = []
  if (featured) {
    merged.push(featured)
  }
  for (const src of bank) {
    if (!merged.includes(src)) {
      merged.push(src)
    }
  }
  if (merged.length === 0) {
    return ['/samples/demo-perlita.png']
  }
  return merged
}

export function randomBankImage(slug: string, exclude?: string): string {
  const bank = bankForSlug(slug)
  const pool = exclude ? bank.filter((src) => src !== exclude) : bank
  const choices = pool.length > 0 ? pool : bank
  return choices[Math.floor(Math.random() * choices.length)] ?? bank[0]
}

export function sampleSrcForSlug(slug: string): string {
  return bankForSlug(slug)[0] ?? '/samples/demo-perlita.png'
}
