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

  const trackRef  = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)
  const offsetRef = useRef(0)
  const halfRef   = useRef(0)
  const lastRef   = useRef(0)
  const rafRef    = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!folderId) return
    setLoading(true)
    fetch(`/api/gallery/photos?folderId=${folderId}`)
      .then(r => r.json())
      .then(d => { setPhotos(d.photos ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [folderId])

  // Auto-scroll infini
  useEffect(() => {
    const track = trackRef.current
    if (!track || photos.length === 0) return

    const measure = () => { halfRef.current = track.scrollWidth / 3 }
    const timer = setTimeout(() => {
      measure()
      offsetRef.current = halfRef.current
      track.style.transform = `translate3d(${-offsetRef.current}px,0,0)`
    }, 60)
    window.addEventListener('resize', measure)
    lastRef.current = performance.now()

    function tick(now: number) {
      const dt = (now - lastRef.current) / 1000
      lastRef.current = now
      if (!pausedRef.current && halfRef.current > 0) {
        offsetRef.current += 40 * dt
        if (offsetRef.current >= halfRef.current * 2) offsetRef.current -= halfRef.current
        if (offsetRef.current < 0) offsetRef.current += halfRef.current
        if (track) track.style.transform = `translate3d(${-offsetRef.current}px,0,0)`
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', measure)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [photos])

  const openLightbox  = (idx: number) => setLightbox(idx % photos.length)
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

  const driveImg = (photo: Photo) => `/api/gallery/image/${photo.id}`

  if (loading) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--mute)', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.15em' }}>
        {locale === 'en' ? 'Loading photos…' : 'Chargement des photos…'}
      </div>
    )
  }

  if (photos.length === 0) return null

  // Triple les photos pour le défilement infini
  const repeated = [...photos, ...photos, ...photos]

  return (
    <div
      style={{ position: 'relative', overflow: 'hidden' }}
      onMouseEnter={() => { pausedRef.current = true }}
      onMouseLeave={() => { pausedRef.current = false }}
    >
      {/* Track */}
      <div
        ref={trackRef}
        style={{
          display: 'flex',
          gap: 12,
          willChange: 'transform',
          padding: '0 0 12px',
          width: 'max-content',
        }}
      >
        {repeated.map((photo, idx) => (
          <div
            key={`${photo.id}-${idx}`}
            onClick={() => openLightbox(idx)}
            style={{
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
              src={driveImg(photo)}
              alt={photo.name}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        ))}
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
          <button
            onClick={closeLightbox}
            aria-label="Fermer"
            style={{
              position: 'absolute', top: 20, right: 24,
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#fff', fontSize: 32, lineHeight: 1, padding: 8, zIndex: 1,
            }}
          >✕</button>

          <button
            onClick={(e) => { e.stopPropagation(); prev() }}
            aria-label="Photo précédente"
            style={{
              position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.3)',
              borderRadius: '50%', width: 48, height: 48, cursor: 'pointer',
              color: '#fff', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
            }}
          >←</button>

          <div onClick={e => e.stopPropagation()} style={{ maxWidth: '88vw', maxHeight: '88vh', position: 'relative' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={driveImg(photos[lightbox])}
              alt={photos[lightbox].name}
              style={{ maxWidth: '88vw', maxHeight: '88vh', objectFit: 'contain', display: 'block', borderRadius: 4 }}
            />
            <div style={{ textAlign: 'center', marginTop: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em' }}>
              {lightbox + 1} / {photos.length}
            </div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); next() }}
            aria-label="Photo suivante"
            style={{
              position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.3)',
              borderRadius: '50%', width: 48, height: 48, cursor: 'pointer',
              color: '#fff', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
            }}
          >→</button>
        </div>
      )}

      <style>{`
        .gallery-thumb:hover { transform: scale(1.02); }
      `}</style>
    </div>
  )
}
