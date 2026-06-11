import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import NavbarClient from '@/components/NavbarClient'
import SiteFooter from '@/components/SiteFooter'
import EventMapClient from '@/components/EventMapClient'
import { Event, Category } from '@/lib/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = use(params)

  const supabase = await createClient()
  const [{ data: ev }, { data: categories }] = await Promise.all([
    supabase.from('events').select('*').eq('slug', slug).eq('is_published', true).single(),
    supabase.from('categories').select('*').order('name'),
  ])

  if (!ev) notFound()

  const event = ev as Event
  const cats  = (categories ?? []) as Category[]

  const eventDateFull = format(new Date(event.event_date), "EEEE d MMMM yyyy", { locale: fr })

  return (
    <>
      <NavbarClient categories={cats} locale={locale} activeSlug="agenda" />

      <main style={{ padding: '0 40px' }}>

        {/* ── Breadcrumb ── */}
        <nav style={{ padding: '18px 0 0', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: '#888' }}>
          <Link href={`/${locale}/agenda`} style={{ color: '#888', textDecoration: 'none' }}>Agenda</Link>
          <span style={{ margin: '0 8px' }}>›</span>
          <span style={{ color: 'var(--ink)' }}>{event.title}</span>
        </nav>

        {/* ── Hero ── */}
        <section style={{ padding: '24px 0 40px' }}>

          {/* Badge */}
          <div style={{ marginBottom: 18 }}>
            <span style={{
              display: 'inline-block',
              background: event.badge_color,
              color: event.badge_text_color,
              padding: '6px 16px',
              borderRadius: 3,
              fontFamily: 'var(--font-display)',
              fontSize: 12, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase',
            }}>
              {event.badge}
            </span>
          </div>

          {/* Titre */}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 'clamp(44px, 7vw, 100px)',
            fontWeight: 800,
            lineHeight: 0.9,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            margin: '0 0 32px',
          }}>
            {event.title}
          </h1>

          {/* Bande infos */}
          <div style={{
            display: 'flex', gap: 36, flexWrap: 'wrap',
            borderTop: '1px solid #e6e6e6', borderBottom: '1px solid #e6e6e6',
            padding: '20px 0',
            marginBottom: 44,
          }}>
            <InfoBlock label="Date" value={eventDateFull} capitalize />
            {event.event_time && <InfoBlock label="Heure" value={event.event_time} />}
            <InfoBlock label="Prix" value={event.price} />
            {event.location_name && <InfoBlock label="Lieu" value={event.location_name} />}
          </div>

          {/* Grille image + description */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: event.image_url && event.description ? '1fr 1fr' : '1fr',
            gap: 52,
            marginBottom: 60,
          }}>
            {event.image_url && (
              <div style={{ position: 'relative', aspectRatio: '7/6', overflow: 'hidden', background: '#f0f0f0' }}>
                <Image src={event.image_url} alt={event.title} fill sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
              </div>
            )}
            {event.description && (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--ink)', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {event.description}
                </p>
              </div>
            )}
          </div>

        </section>

        {/* ── Carte ── */}
        {typeof event.location_lat === 'number' && typeof event.location_lng === 'number' && (
          <>
            <hr style={{ border: 'none', borderTop: '1px solid #e6e6e6', margin: '0 0 40px' }} />
            <section style={{ paddingBottom: 80 }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 'clamp(24px, 3vw, 40px)',
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
                margin: '0 0 8px',
              }}>
                {event.location_name ?? 'Lieu'}
              </h2>
              {event.location_address && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#888', margin: '0 0 20px', letterSpacing: '.04em' }}>
                  {event.location_address}
                </p>
              )}
              <EventMapClient
                lat={event.location_lat}
                lng={event.location_lng}
                locationName={event.location_name ?? undefined}
              />
              {event.location_address && (
                <div style={{ marginTop: 12 }}>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location_address)}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.1em',
                      textTransform: 'uppercase', color: 'var(--ink)', textDecoration: 'underline',
                    }}
                  >
                    Ouvrir dans Google Maps →
                  </a>
                </div>
              )}
            </section>
          </>
        )}

        {/* ── Retour agenda ── */}
        <div style={{ paddingBottom: 60, borderTop: '1px solid #e6e6e6', paddingTop: 24 }}>
          <Link
            href={`/${locale}/agenda`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
              letterSpacing: '.1em', textTransform: 'uppercase',
              color: 'var(--ink)', textDecoration: 'none',
            }}
          >
            ← Retour à l&apos;agenda
          </Link>
        </div>

      </main>

      <SiteFooter categories={cats} />
    </>
  )
}

/* ── Helper InfoBlock ── */
function InfoBlock({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: '#888', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 15,
        textTransform: capitalize ? 'capitalize' : 'none',
      }}>
        {value}
      </div>
    </div>
  )
}
