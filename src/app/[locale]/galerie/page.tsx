import { createClient } from '@/lib/supabase/server'
import NavbarClient from '@/components/NavbarClient'
import SiteFooter from '@/components/SiteFooter'
import GaleriePageClient from '@/components/GaleriePageClient'
import { Category } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function GaleriePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  const [{ data: sections }, { data: categories }] = await Promise.all([
    supabase
      .from('gallery_sections')
      .select('id, title, title_en, drive_folder_id, allow_download')
      .eq('is_visible', true)
      .not('drive_folder_id', 'is', null)
      .order('sort_order', { ascending: true }),
    supabase.from('categories').select('*').order('name'),
  ])

  const cats = (categories ?? []) as Category[]
  const visibleSections = (sections ?? []).filter(s => s.drive_folder_id)

  return (
    <>
      <NavbarClient categories={cats} locale={locale} activeSlug="galerie" />
      <main style={{ paddingBottom: 80 }}>
        <GaleriePageClient sections={visibleSections} locale={locale} />
      </main>
      <SiteFooter categories={cats} />
    </>
  )
}
