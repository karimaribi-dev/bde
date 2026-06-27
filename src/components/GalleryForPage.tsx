import { createClient } from '@/lib/supabase/server'
import PhotoGallery from './PhotoGallery'

interface Props {
  page: string
  position: string
  locale?: string
}

export default async function GalleryForPage({ page, position, locale = 'fr' }: Props) {
  const supabase = await createClient()
  const { data: sections } = await supabase
    .from('gallery_sections')
    .select('id, title, title_en, drive_folder_id, allow_download')
    .contains('page', [page])
    .eq('position', position)
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })

  if (!sections || sections.length === 0) return null

  return (
    <>
      {sections.map((section) => {
        if (!section.drive_folder_id) return null
        return (
          <section
            key={section.id}
            style={{ padding: '48px 0 60px', borderTop: '1px solid var(--border)' }}
          >
            <div style={{ padding: '0 40px', marginBottom: 24 }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(36px, 4vw, 64px)',
                fontWeight: 900,
                fontStyle: 'italic',
                textTransform: 'uppercase',
                margin: 0,
                lineHeight: 1,
              }}>
                {(locale === 'en' ? (section.title_en || section.title) : section.title) ?? (locale === 'en' ? 'Photo gallery' : 'Galerie photos')}
              </h2>
            </div>
            <PhotoGallery
              folderId={section.drive_folder_id}
              title={section.title}
              locale={locale}
              allowDownload={section.allow_download ?? false}
            />
          </section>
        )
      })}
    </>
  )
}
