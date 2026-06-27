'use client'

import { useEffect, useState, useCallback } from 'react'

interface Section { id: string; title: string | null; drive_folder_id: string }
interface Photo   { id: string; name: string; thumbUrl: string; fullUrl: string; sectionId: string }

interface Props { sections: Section[]; locale: string }

export default function GaleriePageClient({ sections, locale }: Props) {
  const [photosBySection, setPhotosBySection] = useState<Record<string, Photo[]>>({})
  const [loading, setLoading] = useState(true)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  useEffect(() => {
    if (sections.length === 0) { setLoading(false); return }
    Promise.all(
      sections.map(async (s) => {
        const res = await fetch(`/api/gallery/photos?folderId=${s.drive_folder_id}`)
        const data = await res.json()
        const photos: Photo[] = (data.photos ?? []).map((p: { id: string; name: string; thumbUrl: string; fullUrl: string }) => ({
          id: p.id, name: p.name, thumbUrl: p.thumbUrl, fullUrl: p.fullUrl, sectionId: s.id,
        }))
        return { id: s.id, photos }
      })
    ).then(results => {
      const map: Record<string, Photo[]> = {}
      results.forEach(r => { map[r.id] = r.photos })
      setPhotosBySection(map)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [sections])

  // Flat list for lightbox navigation
  const allPhotos = sections.flatMap(s => photosBySection[s.id] ?? [])
  const total = allPhotos.length

  const closeLightbox = useCallback(() => setLightboxIdx(null), [])
  const prev = useCallback(() => setLightboxIdx(i => i !== null ? (i - 1 + total) % total : null), [total])
  const next = useCallback(() => setLightboxIdx(i => i !== null ? (i + 1) % total : null), [total])

  useEffect(() => {
    if (lightboxIdx === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      closeLightbox()
      if (e.key === 'ArrowLeft')   prev()
      if (e.key === 'ArrowRight')  next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxIdx, closeLightbox, prev, next])

  if (loading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--mute)', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.15em' }}>
        {locale === 'en' ? 'Loading gallery…' : 'Chargement de la galerie…'}
      </div>
    )
  }

  if (sections.every(s => (photosBySection[s.id] ?? []).length === 0)) {
    return (
      <div style={{ padding: '80px 40px', textAlign: 'center', color: 'var(--mute)', fontSize: 14 }}>
        {locale === 'en' ? 'No photos available yet.' : 'Aucune photo disponible pour l\'instant.'}
      </div>
    )
  }

  // Build offset map: section → starting flat index
  const sectionOffset: Record<string, number> = {}
  let offset = 0
  for (const s of sections) {
    sectionOffset[s.id] = offset
    offset += (photosBySection[s.id] ?? []).length
  }

  const currentPhoto = lightboxIdx !== null ? allPhotos[lightboxIdx] : null

  return (
    <>
      {/* Page title */}
      <div style={{ padding: '50px 40px 40px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontStyle: 'italic',
          fontSize: 'clamp(48px, 8vw, 112px)',
          textTransform: 'uppercase',
          lineHeight: 0.9,
          margin: 0,
          color: 'var(--ink)',
        }}>
          {locale === 'en' ? 'Gallery' : 'Galerie'}
        </h1>
      </div>

      {/* Sections */}
      {sections.map((section) => {
        const photos = photosBySection[section.id] ?? []
        if (photos.length === 0) return null
        const sectionTitle = section.title ?? (locale === 'en' ? 'Photos' : 'Photos')
        const startIdx = sectionOffset[section.id]

        return (
          <div key={section.id} style={{ marginBottom: 64 }}>
            {/* Section title */}
            <div style={{ padding: '0 40px 20px' }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontStyle: 'italic',
                fontSize: 'clamp(22px, 3vw, 40px)',
                textTransform: 'uppercase',
                margin: '0 0 4px',
                color: 'var(--ink)',
              }}>
                {sectionTitle}
              </h2>
              <div style={{ height: 2, width: 48, background: 'var(--ink)', opacity: 0.15 }} />
            </div>

            {/* Instagram grid */}
            <div className="galerie-grid">
              {photos.map((photo, idx) => (
                <button
                  key={photo.id}
                  onClick={() => setLightboxIdx(startIdx + idx)}
                  className="galerie-cell"
                  aria-label={photo.name}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.thumbUrl}
                    alt={photo.name}
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        )
      })}

      {/* Lightbox */}
      {lightboxIdx !== null && currentPhoto && (
        <div
          onClick={closeLightbox}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.94)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {/* Close */}
          <button onClick={closeLightbox} aria-label="Fermer" style={{
            position: 'absolute', top: 20, right: 24,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#fff', fontSize: 32, lineHeight: 1, padding: 8, zIndex: 1,
          }}>✕</button>

          {/* Prev */}
          {total > 1 && (
            <button onClick={e => { e.stopPropagation(); prev() }} aria-label="Précédent" style={{
              position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.3)',
              borderRadius: '50%', width: 48, height: 48, cursor: 'pointer',
              color: '#fff', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
            }}>←</button>
          )}

          {/* Image */}
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '90vh' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentPhoto.fullUrl}
              alt={currentPhoto.name}
              style={{ maxWidth: '90vw', maxHeight: '86vh', objectFit: 'contain', display: 'block', borderRadius: 2 }}
            />
            <div style={{
              textAlign: 'center', marginTop: 10,
              color: 'rgba(255,255,255,0.45)',
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em',
            }}>
              {lightboxIdx + 1} / {total}
            </div>
          </div>

          {/* Next */}
          {total > 1 && (
            <button onClick={e => { e.stopPropagation(); next() }} aria-label="Suivant" style={{
              position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.3)',
              borderRadius: '50%', width: 48, height: 48, cursor: 'pointer',
              color: '#fff', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
            }}>→</button>
          )}
        </div>
      )}

      <style>{`
        .galerie-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4px;
          padding: 0 40px;
        }
        .galerie-cell {
          aspect-ratio: 1;
          overflow: hidden;
          background: var(--paper-2, #f0f0f0);
          border: none;
          padding: 0;
          cursor: pointer;
          display: block;
          position: relative;
        }
        .galerie-cell img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.25s ease, opacity 0.2s;
        }
        .galerie-cell:hover img {
          transform: scale(1.04);
          opacity: 0.88;
        }
        @media (max-width: 720px) {
          .galerie-grid { grid-template-columns: repeat(3, 1fr); gap: 3px; padding: 0 12px; }
        }
        @media (max-width: 480px) {
          .galerie-grid { grid-template-columns: repeat(2, 1fr); gap: 3px; padding: 0 12px; }
        }
      `}</style>
    </>
  )
}
