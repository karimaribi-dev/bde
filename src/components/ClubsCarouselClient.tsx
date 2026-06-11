'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Club } from '@/lib/types'

const TILTS = ['-5deg', '4deg', '-3deg', '6deg']

interface Props { clubs: Club[]; locale: string }

export default function ClubsCarouselClient({ clubs, locale }: Props) {
  const trackRef   = useRef<HTMLDivElement>(null)
  const pausedRef  = useRef(false)
  const offsetRef  = useRef(0)
  const halfRef    = useRef(0)
  const lastRef    = useRef(0)
  const rafRef     = useRef<number | undefined>(undefined)
  const dragging   = useRef(false)
  const startX     = useRef(0)
  const startOff   = useRef(0)

  useEffect(() => {
    const track = trackRef.current
    if (!track || clubs.length === 0) return

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
        offsetRef.current += 38 * dt
        if (offsetRef.current >= halfRef.current * 2) offsetRef.current -= halfRef.current
        if (offsetRef.current < 0) offsetRef.current += halfRef.current
        if (track) track.style.transform = `translate3d(${-offsetRef.current}px,0,0)`
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      clearTimeout(timer)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', measure)
    }
  }, [clubs.length])

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    dragging.current = true
    startX.current   = e.clientX
    startOff.current = offsetRef.current
    pausedRef.current = true
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return
    const track = trackRef.current; if (!track) return
    let n = startOff.current - (e.clientX - startX.current)
    const hw = halfRef.current
    if (hw > 0) { if (n >= hw * 2) n -= hw; if (n < 0) n += hw }
    offsetRef.current = n
    track.style.transform = `translate3d(${-n}px,0,0)`
  }
  function onPointerUp() { dragging.current = false }

  if (clubs.length === 0) return null

  /* Triple pour boucle infinie */
  const tripled = [...clubs, ...clubs, ...clubs]

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        marginLeft: 'calc(50% - 50vw)',
        padding: '70px 0 90px',
        overflow: 'hidden',
        cursor: 'grab',
        userSelect: 'none',
      }}
      onMouseEnter={() => { pausedRef.current = true }}
      onMouseLeave={() => { pausedRef.current = false; dragging.current = false }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        ref={trackRef}
        style={{
          display: 'flex',
          gap: 40,
          alignItems: 'center',
          width: 'max-content',
          willChange: 'transform',
          padding: '0 20px',
        }}
      >
        {tripled.map((club, i) => (
          <ClubCard key={`${club.id}-${i}`} club={club} locale={locale} tilt={TILTS[i % 4]} />
        ))}
      </div>
    </div>
  )
}

/* ── Card individuelle ── */
function ClubCard({ club, locale, tilt }: { club: Club; locale: string; tilt: string }) {
  const ac = club.accent_color
  const at = club.accent_text_color

  const infoRow = (key: string, val: string, borderTop = true) => (
    <div style={{
      margin: '0 18px',
      padding: '8px 10px',
      border: `1.2px solid ${ac}`,
      borderTop: borderTop ? `1.2px solid ${ac}` : 'none',
      display: 'flex',
      justifyContent: 'space-between',
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontSize: 13,
      textTransform: 'uppercase',
    }}>
      <span style={{ fontWeight: 900 }}>{key}</span>
      <span>{val}</span>
    </div>
  )

  const infoRows = [
    club.schedule  && infoRow('HORAIRES', club.schedule, true),
    club.frequency && infoRow('DATE / FRÉQUENCE', club.frequency, !!club.schedule),
    club.location  && infoRow('LIEU', club.location, !!(club.schedule || club.frequency)),
  ].filter(Boolean)

  return (
    <article
      style={{
        flexShrink: 0,
        width: 360,
        background: '#fff',
        paddingBottom: 22,
        boxShadow: '0 18px 40px -20px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        transform: `rotate(${tilt})`,
        transformOrigin: 'center center',
        transition: 'transform 480ms cubic-bezier(.2,.7,.2,1), box-shadow 480ms, opacity 320ms',
        pointerEvents: 'auto',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = 'rotate(0deg) translateY(-6px) scale(1.02)'
        el.style.boxShadow = '0 30px 60px -20px rgba(0,0,0,0.32), 0 4px 10px rgba(0,0,0,0.08)'
        el.style.zIndex = '5'
        el.style.opacity = '1'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = `rotate(${tilt})`
        el.style.boxShadow = '0 18px 40px -20px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.06)'
        el.style.zIndex = ''
        el.style.opacity = ''
      }}
    >
      {/* Eyebrow tagline */}
      <div style={{
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontSize: 11,
        lineHeight: 1.4,
        display: 'flex',
        flexDirection: 'column',
        padding: '18px 18px 0',
        gap: 2,
      }}>
        {club.tagline && (
          <span style={{ display: 'inline-block', background: ac, color: at, padding: '3px 6px', width: 'fit-content', textTransform: 'uppercase' }}>
            {club.tagline}
          </span>
        )}
        {club.tagline_sub && (
          <span style={{ display: 'inline-block', background: ac, color: at, padding: '3px 6px', width: 'fit-content', textTransform: 'uppercase', marginLeft: 60 }}>
            {club.tagline_sub}
          </span>
        )}
      </div>

      {/* Titre + smiley */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', gap: 8 }}>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 'clamp(20px, 1.8vw, 26px)',
          textTransform: 'uppercase',
          letterSpacing: '-0.01em',
          margin: 0,
          color: 'var(--ink)',
        }}>
          {club.title}
        </h3>
        <span style={{ display: 'inline-flex', width: 22, height: 22, flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/smiley-handdrawn.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </span>
      </header>

      {/* Description */}
      {club.who_we_are && (
        <p style={{ padding: '0 18px', fontSize: 13, lineHeight: 1.45, color: 'var(--ink)', margin: 0 }}>
          {club.who_we_are}
        </p>
      )}

      {/* Info rows */}
      {infoRows}

      {/* CTA */}
      <Link
        href={`/${locale}/clubs/${club.slug}`}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--ink)', color: '#fff',
          fontFamily: 'var(--font-display)', fontStyle: 'italic',
          fontSize: 13, letterSpacing: '0.04em', textTransform: 'uppercase',
          padding: '10px 18px', textDecoration: 'none',
          alignSelf: 'center', margin: '4px 0',
        }}
        onClick={e => e.stopPropagation()}
      >
        EN SAVOIR PLUS
        <svg viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 13 }}>
          <path d="M2 8h19M14 1l7 7-7 7"/>
        </svg>
      </Link>

      {/* Photo */}
      <div style={{ margin: '4px 18px 0', aspectRatio: '4/3', overflow: 'hidden', background: club.image_url ? '#ddd' : ac, position: 'relative', opacity: club.image_url ? 1 : 0.3 }}>
        {club.image_url && (
          <Image src={club.image_url} alt={club.title} fill sizes="360px" style={{ objectFit: 'cover' }} />
        )}
      </div>
    </article>
  )
}
