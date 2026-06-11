import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import NavbarClient from '@/components/NavbarClient'
import SiteFooter from '@/components/SiteFooter'
import { Event, Category } from '@/lib/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

function formatEventDate(iso: string) {
  return format(new Date(iso), "EEEE d MMMM", { locale: fr })
}

export default async function AgendaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  const today = new Date().toISOString().slice(0, 10)

  const [{ data: upcomingRaw }, { data: pastRaw }, { data: categories }] = await Promise.all([
    supabase.from('events').select('*').eq('is_published', true).gte('event_date', today).order('event_date', { ascending: true }),
    supabase.from('events').select('*').eq('is_published', true).lt('event_date', today).order('event_date', { ascending: false }).limit(6),
    supabase.from('categories').select('*').order('name'),
  ])

  const upcoming = (upcomingRaw ?? []) as Event[]
  const past     = (pastRaw ?? []) as Event[]

  return (
    <>
      <NavbarClient categories={(categories ?? []) as Category[]} locale={locale} activeSlug="agenda" />

      <main style={{ padding: '0 40px' }}>

        {/* ── Hero titre ── */}
        <section style={{ padding: '36px 0 40px' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 'clamp(56px, 9vw, 130px)',
            fontWeight: 800,
            lineHeight: 0.88,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            margin: 0,
          }}>
            AGENDA
          </h1>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid #e6e6e6', margin: '0 0 48px' }} />

        {/* ── Événements à venir ── */}
        {upcoming.length > 0 && (
          <section style={{ marginBottom: 60 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              margin: '0 0 24px',
              color: '#888',
            }}>
              À VENIR
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {upcoming.map(ev => (
                <EventCard key={ev.id} ev={ev} locale={locale} />
              ))}
            </div>
          </section>
        )}

        {upcoming.length === 0 && (
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: '#888', letterSpacing: '.06em', textTransform: 'uppercase', padding: '40px 0 60px' }}>
            Aucun événement à venir pour le moment.
          </p>
        )}

        {/* ── Événements passés ── */}
        {past.length > 0 && (
          <section style={{ marginBottom: 80 }}>
            <hr style={{ border: 'none', borderTop: '1px solid #e6e6e6', margin: '0 0 40px' }} />
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              margin: '0 0 24px',
              color: '#888',
            }}>
              ÉVÉNEMENTS PASSÉS
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, opacity: 0.7 }}>
              {past.map(ev => (
                <EventCard key={ev.id} ev={ev} locale={locale} />
              ))}
            </div>
          </section>
        )}

      </main>

      <SiteFooter categories={(categories ?? []) as Category[]} />
    </>
  )
}

/* ── Card composant ── */
function EventCard({ ev, locale }: { ev: Event; locale: string }) {
  return (
    <Link
      href={`/${locale}/agenda/${ev.slug}`}
      style={{ display: 'block', textDecoration: 'none', color: 'inherit', position: 'relative', overflow: 'hidden', aspectRatio: '7/6', background: '#ddd' }}
    >
      {/* Image */}
      {ev.image_url && (
        <Image
          src={ev.image_url}
          alt={ev.title}
          fill
          sizes="(max-width: 720px) 100vw, 33vw"
          style={{ objectFit: 'cover' }}
        />
      )}
      {!ev.image_url && (
        <div style={{ position: 'absolute', inset: 0, background: ev.badge_color, opacity: 0.4 }} />
      )}

      {/* Overlay dégradé */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 40%, transparent 80%)' }} />

      {/* Badge */}
      <span style={{
        position: 'absolute', top: 14, left: 14,
        background: ev.badge_color,
        color: ev.badge_text_color,
        padding: '4px 10px',
        borderRadius: 3,
        fontFamily: 'var(--font-display)',
        fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
        zIndex: 2,
      }}>
        {ev.badge}
      </span>

      {/* Infos bas */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 16px', zIndex: 2 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px, 2vw, 24px)', fontWeight: 800, lineHeight: 1, textTransform: 'uppercase', color: '#fff', marginBottom: 8 }}>
          {ev.title}
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'capitalize', color: 'rgba(255,255,255,0.8)' }}>
            {format(new Date(ev.event_date), "EEEE d MMM", { locale: fr })}
          </span>
          {ev.event_time && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>
              {ev.event_time}
            </span>
          )}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>
            {ev.price}
          </span>
        </div>
      </div>
    </Link>
  )
}
