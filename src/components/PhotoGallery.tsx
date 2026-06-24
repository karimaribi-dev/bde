'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

interface Photo { id: string; name: string; thumbnailLink: string | null }

interface Props {
  folderId: string
  title?: string
  locale?: string
}

export default function PhotoGallery({ folderId, title, locale = 'fr' }: Props) {
  const [photos, setPhotos]     = useState<Photo[]>([])
  const [loading, setLoading]   = useState(true)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const sliderRef               = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!folderId) return
    setLoading(true)
    fetch(`/api/gallery/photos?folderId=${folderId}`)
      .then(r => r.json())
      .then(d => { setPhotos(d.photos ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [folderId])

  const openLightbox  = (idx: number) => setLightbox(idx)
  const closeLightbox = useCallback(() => setLightbox(null), [])
  const prev = useCallback(() => setLightbox(i => i !== null ? (i - 1 + photos.length) % photos.length : null), [photos.length])
  const next = useCallback(() => setLightbox(i => i !== null ? (i + 1) % photos.length : null), [photos.length])

  useEffect(() => {
    if (lightbox === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox, closeLightbox, prev, next])

  const driveThumb = (photo: Photo) => `/api/gallery/image/${photo.id}`
  const driveFull  = (photo: Photo) => `/api/gallery/image/${photo.id}`

  if (loading) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--mute)', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.15em' }}>
        {locale === 'en' ? 'Loading photos…' : 'Chargement des photos…'}
      </div>
    )
  }

  if (photos.length === 0) return null

  return (
    <div style={{ position: 'relative' }}>
      {/* Slider */}
      <div
        ref={sliderRef}
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          padding: '0 40px 12px',
          cursor: 'grab',
        }}
        className="gallery-slider"
      >
        {photos.map((photo, idx) => (
          <div
            key={photo.id}
            onClick={() => openLightbox(idx)}
            style={{
              scrollSnapAlign: 'start',
              flex: '0 0 auto',
              width: 'clamp(200px, 28vw, 380px)',
              aspectRatio: '4/3',
              borderRadius: 4,
              overflow: 'hidden',
              cursor: 'pointer',
              background: 'var(--paper-2)',
              transition: 'transform 0.15s',
            }}
            className="gallery-thumb"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={driveThumb(photo)}
              alt={photo.name}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        ))}
        <div style={{ flex: '0 0 28px' }} />
      </div>

      {/* Counter */}
      <div style={{ textAlign: 'right', paddingRight: 40, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.15em', color: 'var(--mute)', marginTop: 4 }}>
        {photos.length} {locale === 'en' ? 'photos' : 'photos'}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          onClick={closeLightbox}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            aria-label="Fermer"
            style={{
              position: 'absolute', top: 20, right: 24,
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#fff', fontSize: 32, lineHeight: 1, padding: 8,
              zIndex: 1,
            }}
          >✕</button>

          {/* Prev */}
          <button
            onClick={(e) => { e.stopPropagation(); prev() }}
            aria-label="Photo précédente"
            style={{
              position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.3)',
              borderRadius: '50%', width: 48, height: 48, cursor: 'pointer',
              color: '#fff', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1,
            }}
          >←</button>

          {/* Image */}
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: '88vw', maxHeight: '88vh', position: 'relative' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={driveFull(photos[lightbox])}
              alt={photos[lightbox].name}
              style={{ maxWidth: '88vw', maxHeight: '88vh', objectFit: 'contain', display: 'block', borderRadius: 4 }}
            />
            <div style={{ textAlign: 'center', marginTop: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em' }}>
              {lightbox + 1} / {photos.length}
            </div>
          </div>

          {/* Next */}
          <button
            onClick={(e) => { e.stopPropagation(); next() }}
            aria-label="Photo suivante"
            style={{
              position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.3)',
              borderRadius: '50%', width: 48, height: 48, cursor: 'pointer',
              color: '#fff', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1,
            }}
          >→</button>
        </div>
      )}

      <style>{`
        .gallery-slider::-webkit-scrollbar { display: none; }
        .gallery-thumb:hover { transform: scale(1.02); }
      `}</style>
    </div>
  )
}
