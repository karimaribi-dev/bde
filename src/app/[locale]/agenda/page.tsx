import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import NavbarClient from '@/components/NavbarClient'
import SiteFooter from '@/components/SiteFooter'
import AgendaCalendarClient from '@/components/AgendaCalendarClient'
import AgendaProposerForm from '@/components/AgendaProposerForm'
import { Event, Category } from '@/lib/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

export default async function AgendaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase   = await createClient()
  const today      = new Date().toISOString().slice(0, 10)

  const [{ data: upcomingRaw }, { data: pastRaw }, { data: categories }] = await Promise.all([
    supabase.from('events').select('*').eq('is_published', true)
      .gte('event_date', today).order('event_date', { ascending: true }),
    supabase.from('events').select('*').eq('is_published', true)
      .lt('event_date', today).order('event_date', { ascending: false }).limit(4),
    supabase.from('categories').select('*').order('name'),
  ])

  const upcoming = (upcomingRaw ?? []) as Event[]
  const past     = (pastRaw    ?? []) as Event[]
  const cats     = (categories ?? []) as Category[]
  const allEvents = [...upcoming, ...past]
  const isEn = locale === 'en'

  return (
    <>
      <NavbarClient categories={cats} locale={locale} activeSlug="agenda" />

      <main className="agenda-main" style={{ padding: '0 40px' }}>

        {/* ═══════════ HERO ═══════════ */}
        <section style={{ padding: '30px 0 14px' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 900,
            fontSize: 'clamp(72px, 13vw, 200px)',
            lineHeight: 0.86,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            color: 'var(--ink)',
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
          }}>
            {/* Ligne 1 : AGENDA + flèche diagonale */}
            <span style={{ display: 'flex', alignItems: 'center', gap: 'clamp(16px,2.4vw,40px)', whiteSpace: 'nowrap' }}>
              <span>AGENDA</span>
              <span aria-hidden="true" style={{ display: 'inline-flex', width: 'clamp(80px,10vw,160px)', height: 'clamp(80px,10vw,160px)', flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/fleche-bas.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </span>
            </span>
            {/* Ligne 2 : smiley + & EVENT */}
            <span style={{ display: 'flex', alignItems: 'center', gap: 'clamp(16px,2.4vw,40px)', whiteSpace: 'nowrap' }}>
              <span aria-hidden="true" style={{ display: 'inline-flex', width: 'clamp(90px,11vw,170px)', height: 'clamp(60px,8vw,130px)', flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/smiley-handdrawn.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </span>
              <span>&amp; EVENT</span>
            </span>
          </h1>
        </section>

        {/* ═══════════ EYEBROW ═══════════ */}
        <div style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 'clamp(14px,1.3vw,20px)',
          letterSpacing: '0.01em',
          textTransform: 'uppercase',
          margin: '18px 0 30px',
        }}>
          <span style={{ background: 'var(--orange-deep)', color: '#fff', padding: '5px 12px 7px' }}>
            {isEn ? 'DISCOVER YOUR CLASSMATES WITH AMAZING ACTIVITIES' : 'DÉCOUVREZ VOS CAMARADES AVEC DES SUPERS ACTIVITÉS'}
          </span>
        </div>

        {/* ═══════════ MARQUEE PROCHAINEMENT ═══════════ */}
        <div className="agenda-prochainement" style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontWeight: 900,
          fontSize: 'clamp(36px,5.2vw,80px)',
          letterSpacing: '-0.02em',
          textTransform: 'uppercase',
          color: 'var(--ink)',
          overflow: 'hidden',
          margin: '18px -40px 30px',
          padding: '6px 0',
          display: 'block',
        }}>
          <div style={{ width: '100%', overflow: 'hidden' }}>
            <div style={{
              display: 'inline-flex',
              gap: 'clamp(20px,2.5vw,40px)',
              alignItems: 'center',
              whiteSpace: 'nowrap',
              animation: 'marquee-scroll 38s linear infinite',
              willChange: 'transform',
            }}>
              {[0, 1].map(half => (
                <span key={half} style={{ display: 'inline-flex', gap: 'clamp(20px,2.5vw,40px)', alignItems: 'center' }}>
                  {['↓','PROCHAINEMENT','↓','SOON','↓','PROCHAINEMENT','↓','SOON'].map((w, i) =>
                    w === '↓'
                      ? <span key={i} style={{ color: 'var(--orange-deep)', fontWeight: 900, fontSize: '0.95em', lineHeight: 1, flexShrink: 0 }}>{w}</span>
                      : <span key={i} style={{ lineHeight: 1 }}>{w}</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════ 3 CARDS ÉVÉNEMENTS À VENIR ═══════════ */}
        {upcoming.length > 0 ? (
          <div className="agenda-upcoming-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22 }}>
            {upcoming.slice(0, 3).map(ev => (
              <Link key={ev.id} href={`/${locale}/agenda/${ev.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <EventCard ev={ev} />
              </Link>
            ))}
          </div>
        ) : (
          <p style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 16,
            color: '#888',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            padding: '40px 0',
          }}>
            {isEn ? 'No upcoming events at the moment.' : 'Aucun événement à venir pour le moment.'}
          </p>
        )}

        {/* ═══════════ SÉPARATEUR ═══════════ */}
        <hr style={{ border: 'none', borderTop: '1px solid #e6e6e6', margin: '40px 0' }} />

        {/* ═══════════ CALENDRIER ═══════════ */}
        <section className="agenda-calendar-section" style={{
          display: 'grid',
          gridTemplateColumns: '0.85fr 1.4fr',
          gap: 60,
          alignItems: 'center',
          padding: '30px 0 50px',
          position: 'relative',
        }}>
          {/* Texte gauche */}
          <div className="agenda-calendar-text" style={{ position: 'relative', paddingTop: 20, paddingLeft: 0 }}>
            {/* Étoile bleue décorative */}
            <span aria-hidden="true" style={{ display: 'inline-flex', width: 90, height: 90, marginBottom: 12 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/etoile.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </span>
            <h2 style={{
              fontFamily: '"neue-haas-grotesk-display", sans-serif',
              fontStyle: 'normal',
              fontWeight: 700,
              fontSize: 56,
              lineHeight: 1.05,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              color: 'var(--ink)',
              margin: '0 0 24px',
            }}>
              {isEn ? (
                <>YOUR EVENTS<br/>CALENDAR</>
              ) : (
                <>
                  L&apos;AGENDA POUR<br/>
                  VOUS<br/>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
                    ORGANISER
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/fleche-droite.svg" aria-hidden="true" alt="" style={{ width: 48, height: 48, objectFit: 'contain', flexShrink: 0 }} />
                  </span>
                </>
              )}
            </h2>
          </div>

          {/* Calendrier interactif */}
          <AgendaCalendarClient events={allEvents} locale={locale} />
        </section>

        {/* ═══════════ SÉPARATEUR ═══════════ */}
        <hr style={{ border: 'none', borderTop: '1px solid #e6e6e6', margin: '0 0 40px' }} />

        {/* ═══════════ Y ÉTIEZ VOUS ? / PASSÉS ═══════════ */}
        <section style={{ marginBottom: 60 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0, margin: '0 0 26px' }}>
            <span style={{ background: 'var(--blue-strong)', padding: '4px 12px', fontFamily: '"new-atten", sans-serif', fontWeight: 700, fontStyle: 'italic', fontSize: 16, textTransform: 'uppercase', color: 'var(--ink)' }}>{isEn ? 'WERE YOU THERE?' : 'Y ÉTIEZ VOUS ?'}</span>
            <span style={{ background: 'var(--blue-strong)', padding: '4px 12px', marginLeft: 80, fontFamily: '"new-atten", sans-serif', fontWeight: 400, fontStyle: 'normal', fontSize: 24, textTransform: 'uppercase', color: 'var(--ink)' }}>{isEn ? 'OUR PAST EVENTS' : 'NOS ÉVÉNEMENTS PASSÉS'}</span>
          </div>

          {past.length > 0 ? (
            <div className="agenda-past-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22 }}>
              {past.map(ev => (
                <Link key={ev.id} href={`/${locale}/agenda/${ev.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <EventCard ev={ev} mini />
                </Link>
              ))}
            </div>
          ) : (
            <p style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 15,
              color: '#aaa',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '30px 0',
            }}>
              {isEn ? 'Past events will appear here.' : 'Les événements passés apparaîtront ici.'}
            </p>
          )}
        </section>

        {/* ═══════════ SÉPARATEUR ═══════════ */}
        <hr style={{ border: 'none', borderTop: '1px solid #e6e6e6', margin: '0 0 40px' }} />

        {/* ═══════════ PROPOSER FORM ═══════════ */}
        <AgendaProposerForm />

        {/* ═══════════ SÉPARATEUR ═══════════ */}
        <hr style={{ border: 'none', borderTop: '1px solid #e6e6e6', margin: '40px 0' }} />

        {/* ═══════════ BASKET CTA ═══════════ */}
        <section className="agenda-shop-section" style={{
          display: 'grid',
          gridTemplateColumns: '1.05fr 1fr',
          alignItems: 'center',
          gap: 60,
          padding: '24px 0 60px',
          position: 'relative',
        }}>
          {/* Starburst jaune derrière */}
          <span aria-hidden="true" style={{
            position: 'absolute', top: '5%', right: '4%',
            width: '38%', height: '70%',
            transform: 'rotate(-12deg)', zIndex: 0, pointerEvents: 'none',
          }}>
            <svg viewBox="0 0 142 142" fill="#FEEF4C" style={{ width: '100%', height: '100%' }}>
              <path d="M 33.516 62.621 L 0 33.516 L 33.516 71.882 L 0 116.863 L 50.273 82.025 L 64.385 142 L 70.559 82.025 L 142 103.634 L 93.05 71.882 L 118.627 46.745 L 70.559 46.745 L 70.559 11.025 L 50.273 46.745 L 26.901 0 L 33.516 62.621 Z"/>
            </svg>
          </span>

          {/* Images produits */}
          <div className="agenda-shop-image" style={{ position: 'relative', width: '100%', zIndex: 2 }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/basket.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'absolute', inset: 0 }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/prod-tshirt.png" alt="" style={{ position: 'absolute', left: '18%', top: '14%', width: '42%', transform: 'rotate(-6deg)', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.18))' }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/prod-totebag.png" alt="" style={{ position: 'absolute', left: '44%', top: '10%', width: '28%', transform: 'rotate(8deg)', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.18))' }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/prod-gourde.png" alt="" style={{ position: 'absolute', left: '56%', top: '22%', width: '22%', transform: 'rotate(-4deg)', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.18))' }} />
            </div>
          </div>

          {/* Texte */}
          <div className="agenda-shop-text" style={{ position: 'relative', zIndex: 1 }}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 'clamp(28px,3vw,42px)',
              lineHeight: 1.05,
              textTransform: 'uppercase',
              letterSpacing: '-0.01em',
              color: 'var(--ink)',
              margin: '0 0 14px',
            }}>
              {isEn ? <>INTERESTED IN<br/>THEIR WORK?</> : <>INTÉRESSÉ PAR LEURS<br/>PRODUCTIONS ?</>}
            </h3>
            <p style={{ fontStyle: 'italic', fontSize: 13, color: 'var(--ink)', opacity: 0.65, margin: 0 }}>
              {isEn ? '*Feel free to support them by browsing the shop' : '*N’hésitez pas à les soutenir en regardant le shop'}
            </p>
          </div>

          {/* Bouton — sous l'image sur mobile, sous le texte sur desktop (col 2) */}
          <div className="agenda-shop-btn" style={{ gridColumn: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', zIndex: 1 }}>
            <Link href={`/${locale}/shop`} style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'var(--yellow)', color: 'var(--ink)',
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontSize: 20, fontWeight: 700, letterSpacing: '0.04em',
              textTransform: 'uppercase', textDecoration: 'none',
              padding: '12px 22px', borderRadius: 999,
            }}>
              {isEn ? 'SEE THE SHOP' : 'VOIR LE SHOP'}
              <svg viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 16 }}>
                <path d="M2 8h19M14 1l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </section>

      </main>

      <SiteFooter categories={cats} />
    </>
  )
}

/* ════════════════════════════════════════
   EventCard — utilisé pour upcoming (normal) et past (mini)
════════════════════════════════════════ */
function EventCard({ ev, mini = false }: { ev: Event; mini?: boolean }) {
  return (
    <div style={{
      position: 'relative',
      overflow: 'hidden',
      aspectRatio: '7/6',
      background: '#ddd',
    }}>
      {/* Image de fond */}
      {ev.image_url ? (
        <Image
          src={ev.image_url}
          alt={ev.title}
          fill
          sizes={mini ? '25vw' : '33vw'}
          style={{ objectFit: 'cover' }}
        />
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: ev.badge_color, opacity: 0.5 }} />
      )}

      {/* Badge */}
      <div style={{
        position: 'absolute', top: 12, left: 12,
        background: ev.badge_color,
        color: ev.badge_text_color,
        padding: mini ? '5px 10px 6px' : '6px 14px 7px',
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontSize: mini ? 10 : 13,
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
        boxShadow: '0 2px 8px rgba(0,0,0,.15)',
      }}>
        {ev.badge}
      </div>

      {/* Panel info blanc en bas */}
      <div style={{
        position: 'absolute',
        bottom: 12, left: 12, right: 12,
        background: '#fff',
        padding: mini ? '9px 10px 11px' : '12px 14px 14px',
        boxShadow: '0 4px 12px rgba(0,0,0,.15)',
      }}>
        <div style={{
          fontFamily: '"neue-haas-grotesk-display", sans-serif',
          fontStyle: 'italic',
          fontWeight: 700,
          fontSize: mini ? 'clamp(12px,1vw,16px)' : 26,
          textTransform: 'uppercase',
          letterSpacing: '-0.01em',
          textAlign: 'center',
          color: 'var(--ink)',
          lineHeight: 1.1,
        }}>
          {ev.title}
        </div>
        <div style={{
          fontFamily: '"new-atten", sans-serif',
          fontWeight: 400,
          fontStyle: 'normal',
          fontSize: mini ? 12 : 20,
          display: 'flex',
          gap: mini ? 8 : 12,
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginTop: 4,
          color: 'var(--ink)',
          opacity: 0.85,
        }}>
          <span>○ {format(new Date(ev.event_date + 'T12:00:00'), "EEEE d MMM", { locale: fr })}</span>
          {ev.event_time && <span>○ {ev.event_time}</span>}
          <span>○ {ev.price}</span>
        </div>
      </div>
    </div>
  )
}
