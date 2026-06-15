'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Club } from '@/lib/types'

const TILTS = ['-5deg', '4deg', '-3deg', '6deg']

interface Props { clubs: Club[]; locale: string }

export default function ClubsCarouselClient({ clubs, locale }: Props) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 720)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const trackRef   = useRef<HTMLDivElement>(null)
  const pausedRef  = useRef(false)
  const offsetRef  = useRef(0)
  const halfRef    = useRef(0)
  const lastRef    = useRef(0)
  const rafRef     = useRef<number | undefined>(undefined)
  const dragging   = useRef(false)
  const didDrag    = useRef(false)
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

    /* Drag via window — évite setPointerCapture qui bloque les clics sur Links */
    function onWinMove(e: PointerEvent) {
      if (!dragging.current) return
      const delta = Math.abs(e.clientX - startX.current)
      if (delta > 5) didDrag.current = true
      const t = trackRef.current; if (!t) return
      let n = startOff.current - (e.clientX - startX.current)
      const hw = halfRef.current
      if (hw > 0) { if (n >= hw * 2) n -= hw; if (n < 0) n += hw }
      offsetRef.current = n
      t.style.transform = `translate3d(${-n}px,0,0)`
    }
    function onWinUp() {
      dragging.current  = false
      pausedRef.current = false
    }
    window.addEventListener('pointermove', onWinMove)
    window.addEventListener('pointerup',   onWinUp)
    window.addEventListener('pointercancel', onWinUp)

    return () => {
      clearTimeout(timer)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', measure)
      window.removeEventListener('pointermove', onWinMove)
      window.removeEventListener('pointerup',   onWinUp)
      window.removeEventListener('pointercancel', onWinUp)
    }
  }, [clubs.length])

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    dragging.current  = true
    didDrag.current   = false
    startX.current    = e.clientX
    startOff.current  = offsetRef.current
    pausedRef.current = true
  }

  /* Bloque la navigation uniquement si c'était un vrai drag */
  function onClickCapture(e: React.MouseEvent) {
    if (didDrag.current) {
      e.preventDefault()
      e.stopPropagation()
      didDrag.current = false
    }
  }

  if (clubs.length === 0) return null

  if (isMobile) {
    return (
      <div style={{ marginTop: 0 }}>
        {clubs.map((club, i) => (
          <div key={club.id}>
            <MobileClubCard club={club} locale={locale} />
            {i < clubs.length - 1 && (
              <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.12)', margin: '32px 0' }} />
            )}
          </div>
        ))}
      </div>
    )
  }

  /*
   * On répète les clubs assez de fois pour que chaque "section" (1/3 du track)
   * soit plus large que le viewport. Minimum 10 cartes par section.
   * Puis on triple pour la boucle infinie.
   * Ex. 2 clubs → reps=5 → base=10 → tripled=30 cartes → très large
   */
  const MIN_PER_SECTION = 10
  const reps   = Math.max(3, Math.ceil(MIN_PER_SECTION / clubs.length))
  const base   = Array.from({ length: reps }, () => clubs).flat()
  const tripled = [...base, ...base, ...base]

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
      onMouseLeave={() => { if (!dragging.current) pausedRef.current = false }}
      onPointerDown={onPointerDown}
      onClickCapture={onClickCapture}
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

/* ── Card mobile ── */
function MobileClubCard({ club, locale }: { club: Club; locale: string }) {
  const ac = club.accent_color
  const at = club.accent_text_color
  const isEn = locale === 'en'
  const taglineDisplay    = (isEn && club.tagline_en)     ? club.tagline_en     : club.tagline
  const taglineSubDisplay = (isEn && club.tagline_sub_en) ? club.tagline_sub_en : club.tagline_sub
  const whoWeAreDisplay   = (isEn && club.who_we_are_en)  ? club.who_we_are_en  : club.who_we_are
  const scheduleDisplay   = (isEn && club.schedule_en)    ? club.schedule_en    : club.schedule
  const frequencyDisplay  = (isEn && club.frequency_en)   ? club.frequency_en   : club.frequency
  const locationDisplay   = (isEn && club.location_en)    ? club.location_en    : club.location
  return (
    <article style={{ width: '100%' }}>
      {/* Taglines */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, marginBottom: 10 }}>
        {taglineDisplay && (
          <span style={{ background: ac, color: at, padding: '3px 8px', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 11, textTransform: 'uppercase', display: 'inline-block' }}>
            {taglineDisplay}
          </span>
        )}
        {taglineSubDisplay && (
          <span style={{ background: ac, color: at, padding: '3px 8px', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 11, textTransform: 'uppercase', display: 'inline-block', marginLeft: 32 }}>
            {taglineSubDisplay}
          </span>
        )}
      </div>

      {/* Titre */}
      <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 900, fontSize: 32, lineHeight: 1, textTransform: 'uppercase', letterSpacing: '-0.02em', color: 'var(--ink)', margin: '0 0 14px' }}>
        {club.title}
      </h3>

      {/* Image */}
      {club.image_url && (
        <div style={{ width: '100%', aspectRatio: '4/3', position: 'relative', marginBottom: 14, overflow: 'hidden', background: ac }}>
          <Image src={club.image_url} alt={club.title} fill sizes="100vw" style={{ objectFit: 'cover' }} />
        </div>
      )}

      {/* Description */}
      {whoWeAreDisplay && (
        <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--ink)', margin: '0 0 12px' }}>
          {whoWeAreDisplay}
        </p>
      )}

      {/* Info rows */}
      {[
        scheduleDisplay  && { k: isEn ? 'TIMES'            : 'HORAIRES',         v: scheduleDisplay },
        frequencyDisplay && { k: isEn ? 'DATE / FREQUENCY' : 'DATE / FRÉQUENCE', v: frequencyDisplay },
        locationDisplay  && { k: isEn ? 'LOCATION'         : 'LIEU',             v: locationDisplay },
      ].filter(Boolean).map((row) => {
        const r = row as { k: string; v: string }
        return (
          <div key={r.k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 10px', border: `1.2px solid ${ac}`, borderTop: 'none', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 12, textTransform: 'uppercase' }}>
            <span style={{ fontWeight: 900 }}>{r.k}</span>
            <span>{r.v}</span>
          </div>
        )
      })}

      {/* CTA */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
        <Link href={`/${locale}/clubs/${club.slug}`} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--yellow)', color: 'var(--ink)',
          fontFamily: '"neue-haas-grotesk-text", sans-serif', fontStyle: 'normal', fontWeight: 500,
          fontSize: 20, letterSpacing: '0.02em',
          textTransform: 'uppercase', textDecoration: 'none',
          padding: '12px 22px', borderRadius: 999,
        }}>
          {isEn ? 'LEARN MORE' : 'EN SAVOIR PLUS'}
          <svg viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 14 }}>
            <path d="M2 8h19M14 1l7 7-7 7"/>
          </svg>
        </Link>
      </div>
    </article>
  )
}

/* ── Card individuelle ── */
function ClubCard({ club, locale, tilt }: { club: Club; locale: string; tilt: string }) {
  const ac = club.accent_color
  const at = club.accent_text_color
  const isEn = locale === 'en'
  const taglineDisplay    = (isEn && club.tagline_en)     ? club.tagline_en     : club.tagline
  const taglineSubDisplay = (isEn && club.tagline_sub_en) ? club.tagline_sub_en : club.tagline_sub
  const whoWeAreDisplay   = (isEn && club.who_we_are_en)  ? club.who_we_are_en  : club.who_we_are
  const scheduleDisplay   = (isEn && club.schedule_en)    ? club.schedule_en    : club.schedule
  const frequencyDisplay  = (isEn && club.frequency_en)   ? club.frequency_en   : club.frequency
  const locationDisplay   = (isEn && club.location_en)    ? club.location_en    : club.location

  const infoRow = (key: string, val: string, borderTop = true) => (
    <div key={key} style={{
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
    scheduleDisplay  && infoRow(isEn ? 'TIMES' : 'HORAIRES', scheduleDisplay, true),
    frequencyDisplay && infoRow(isEn ? 'DATE / FREQUENCY' : 'DATE / FRÉQUENCE', frequencyDisplay, !!scheduleDisplay),
    locationDisplay  && infoRow(isEn ? 'LOCATION' : 'LIEU', locationDisplay, !!(scheduleDisplay || frequencyDisplay)),
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
        {taglineDisplay && (
          <span style={{ display: 'inline-block', background: ac, color: at, padding: '3px 6px', width: 'fit-content', textTransform: 'uppercase' }}>
            {taglineDisplay}
          </span>
        )}
        {taglineSubDisplay && (
          <span style={{ display: 'inline-block', background: ac, color: at, padding: '3px 6px', width: 'fit-content', textTransform: 'uppercase', marginLeft: 60 }}>
            {taglineSubDisplay}
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
      {whoWeAreDisplay && (
        <p style={{ padding: '0 18px', fontSize: 13, lineHeight: 1.45, color: 'var(--ink)', margin: 0 }}>
          {whoWeAreDisplay}
        </p>
      )}

      {/* Info rows */}
      {infoRows}

      {/* CTA */}
      <Link
        href={`/${locale}/clubs/${club.slug}`}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--yellow)', color: 'var(--ink)',
          fontFamily: '"neue-haas-grotesk-text", sans-serif', fontStyle: 'normal', fontWeight: 500,
          fontSize: 20, letterSpacing: '0.02em', textTransform: 'uppercase',
          padding: '10px 22px', textDecoration: 'none', borderRadius: 999,
          alignSelf: 'center', margin: '4px 0',
        }}
      >
        {isEn ? 'LEARN MORE' : 'EN SAVOIR PLUS'}
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
