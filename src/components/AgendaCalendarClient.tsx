'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Event } from '@/lib/types'
import { format, startOfMonth, getDay, getDaysInMonth, addMonths, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Props {
  events: Event[]
  locale: string
}

export default function AgendaCalendarClient({ events, locale }: Props) {
  const [current, setCurrent] = useState(() => new Date())

  const year  = current.getFullYear()
  const month = current.getMonth()

  /* Offset lundi-premier */
  const firstDow = getDay(startOfMonth(current)) // 0=dim
  const offset   = firstDow === 0 ? 6 : firstDow - 1
  const days     = getDaysInMonth(current)

  /* Events de ce mois */
  const eventsByDay: Record<number, Event[]> = {}
  events.forEach(ev => {
    const d = new Date(ev.event_date + 'T12:00:00')
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate()
      if (!eventsByDay[day]) eventsByDay[day] = []
      eventsByDay[day].push(ev)
    }
  })

  const monthLabel = format(current, 'MMMM yyyy', { locale: fr }).toUpperCase()

  /* Grille: cases vides + jours + padding fin */
  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const navBtn: React.CSSProperties = {
    width: 36, height: 36, padding: 0,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ink)',
  }

  return (
    <div>
      {/* ── Entête mois ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', paddingBottom: 14 }}>
        <button onClick={() => setCurrent(subMonths(current, 1))} style={navBtn} aria-label="Mois précédent">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26 }}>
            <path d="M15 4 L7 12 L15 20"/>
          </svg>
        </button>

        <span style={{
          fontFamily: "'Gaegu', cursive",
          fontWeight: 400,
          fontSize: 'clamp(20px, 1.8vw, 28px)',
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
          textAlign: 'center',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          color: 'var(--ink)',
        }}>
          {monthLabel}
          <span style={{ display: 'inline-flex', width: 34, height: 24, flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/smiley-handdrawn.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </span>
        </span>

        <button onClick={() => setCurrent(addMonths(current, 1))} style={navBtn} aria-label="Mois suivant">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26 }}>
            <path d="M9 4 L17 12 L9 20"/>
          </svg>
        </button>
      </div>

      {/* ── Jours de la semaine ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        padding: '6px 0 8px',
        borderTop: '1.5px solid var(--ink)',
      }}>
        {['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'].map(d => (
          <span key={d} style={{ fontFamily: '"new-atten", sans-serif', fontWeight: 400, fontStyle: 'normal', fontSize: 24, textAlign: 'center', color: 'var(--ink)' }}>{d}</span>
        ))}
      </div>

      {/* ── Grille ── */}
      <div style={{ position: 'relative', overflow: 'visible' }}>

        {/* Étoiles décoratives derrière */}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <span style={{
            position: 'absolute', width: '28%', height: '60%',
            top: '18%', left: '6%', transform: 'rotate(-8deg)', display: 'inline-flex',
          }}>
            <svg viewBox="0 0 142 142" fill="#FFE74A" style={{ width: '100%', height: '100%' }}>
              <path d="M 33.516 62.621 L 0 33.516 L 33.516 71.882 L 0 116.863 L 50.273 82.025 L 64.385 142 L 70.559 82.025 L 142 103.634 L 93.05 71.882 L 118.627 46.745 L 70.559 46.745 L 70.559 11.025 L 50.273 46.745 L 26.901 0 L 33.516 62.621 Z"/>
            </svg>
          </span>
          <span style={{
            position: 'absolute', width: '22%', height: '50%',
            bottom: '-6%', right: '-2%', transform: 'rotate(12deg)', display: 'inline-flex',
          }}>
            <svg viewBox="0 0 142 142" fill="#FFE74A" style={{ width: '100%', height: '100%' }}>
              <path d="M 33.516 62.621 L 0 33.516 L 33.516 71.882 L 0 116.863 L 50.273 82.025 L 64.385 142 L 70.559 82.025 L 142 103.634 L 93.05 71.882 L 118.627 46.745 L 70.559 46.745 L 70.559 11.025 L 50.273 46.745 L 26.901 0 L 33.516 62.621 Z"/>
            </svg>
          </span>
        </div>

        {/* Cases calendrier */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gridAutoRows: 'minmax(64px, 1fr)',
          backgroundImage: 'url(/images/quadrillage.svg)',
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
          zIndex: 1,
        }}>
          {cells.map((day, i) => (
            <div key={i} style={{
              padding: '8px 6px 6px',
              minHeight: 64,
              position: 'relative',
              overflow: 'hidden',
            }}>
              {day && (
                <>
                  <span style={{
                    fontFamily: "'Gaegu', cursive",
                    fontSize: 26,
                    fontWeight: 400,
                    color: 'var(--ink)',
                    lineHeight: 1,
                    display: 'block',
                  }}>
                    {day}
                  </span>
                  {eventsByDay[day]?.map(ev => (
                    <Link key={ev.id} href={`/${locale}/agenda/${ev.slug}`} style={{ textDecoration: 'none' }}>
                      <span style={{
                        display: 'block',
                        background: ev.badge_color,
                        color: ev.badge_text_color,
                        fontSize: 8,
                        padding: '2px 5px',
                        fontFamily: 'var(--font-display)',
                        fontStyle: 'italic',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        marginTop: 3,
                        transform: 'rotate(-3deg)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        cursor: 'pointer',
                        maxWidth: '100%',
                      }}>
                        {ev.badge}
                      </span>
                    </Link>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
