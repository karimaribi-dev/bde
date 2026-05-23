import type { Category } from './types'

/** Retourne le nom de la catégorie dans la locale demandée, avec fallback sur le nom FR */
export function getCategoryName(cat: Category | null | undefined, locale: string): string {
  if (!cat) return ''
  if (locale === 'en' && cat.name_en) return cat.name_en
  if (locale === 'es' && cat.name_es) return cat.name_es
  if (locale === 'de' && cat.name_de) return cat.name_de
  return cat.name
}
