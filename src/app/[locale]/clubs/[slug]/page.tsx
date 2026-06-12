import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import NavbarClient from '@/components/NavbarClient'
import SiteFooter from '@/components/SiteFooter'
import ClubJoinFormClient from '@/components/ClubJoinFormClient'
import { Club, Category } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function ClubDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const supabase = await createClient()

  const [{ data: clubData }, { data: categories }, { data: otherClubsRaw }] = await Promise.all([
    supabase.from('clubs').select('*').eq('slug', slug).eq('is_published', true).single(),
    supabase.from('categories').select('*').order('name'),
    supabase.from('clubs').select('*').eq('is_published', true).neq('slug', slug)
      .order('sort_order', { ascending: true }).limit(3),
  ])

  if (!clubData) notFound()

  const club       = clubData as Club
  const cats       = (categories  ?? []) as Category[]
  const otherClubs = (otherClubsRaw ?? []) as Club[]

  const ac = club.accent_color
  const at = club.accent_text_color

  const infoItems: { key: string; val: string }[] = [
    club.schedule     && { key: 'HORAIRES',           val: club.schedule },
    club.frequency    && { key: 'DATE / FRÉQUENCE',   val: club.frequency },
    club.location     && { key: 'LIEU',                val: club.location },
    club.member_count && { key: 'NOMBRE DE MEMBRES',  val: club.member_count },
  ].filter(Boolean) as { key: string; val: string }[]

  const hr = <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '22px 0' }} />

  return (
    <>
      <NavbarClient categories={cats} locale={locale} activeSlug="clubs" />

      <main className="club-detail-main" style={{ padding: '0 40px' }}>

        {/* Breadcrumb */}
        <nav style={{ padding: '10px 0 4px', fontSize: 11, fontFamily: 'var(--font-display)', fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--mute)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Link href={`/${locale}`} style={{ color: 'var(--mute)', textDecoration: 'none' }}>ACCUEIL</Link>
          <span>›</span>
          <Link href={`/${locale}/clubs`} style={{ color: 'var(--mute)', textDecoration: 'none' }}>NOS CLUBS</Link>
          <span>›</span>
          <span style={{ color: 'var(--ink)' }}>{club.title}</span>
        </nav>

        {/* ═══════════ BLOC PRINCIPAL 2-COL ═══════════
            Gauche : titre + photo empilés
            Droite : taglines + séparateurs + sections + form           */}
        <section className="club-detail-section" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0 60px',
          alignItems: 'flex-start',
          padding: '30px 0 60px',
        }}>

          {/* ── COLONNE GAUCHE ── */}
          <div className="club-detail-left" style={{ display: 'flex', flexDirection: 'column' }}>

            {/* Titre + flèche diagonale */}
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontWeight: 900,
              fontSize: 'clamp(52px, 6.5vw, 100px)',
              lineHeight: 0.92,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              color: 'var(--ink)',
              margin: '0 0 28px',
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(14px, 1.8vw, 30px)',
            }}>
              {club.title}
              <span aria-hidden="true" style={{ display: 'inline-flex', width: 'clamp(44px, 5vw, 80px)', height: 'clamp(44px, 5vw, 80px)', flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/fleche-bas.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </span>
            </h1>

            {/* Taglines — mobile uniquement, sous le titre */}
            <div className="club-taglines-mobile" style={{ display: 'none', flexDirection: 'column', gap: 4, marginBottom: 20, fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
              {club.tagline && (
                <span style={{ display: 'inline-block', background: ac, color: at, padding: '3px 10px 5px', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.02em', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                  {club.tagline}
                </span>
              )}
              {club.tagline_sub && (
                <span style={{ display: 'inline-block', background: ac, color: at, padding: '5px 12px 7px', fontSize: 22, letterSpacing: '-0.01em', textTransform: 'uppercase', width: 'fit-content', marginLeft: 20, fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                  {club.tagline_sub}
                </span>
              )}
            </div>

            {/* Grande photo — cachée sur mobile */}
            <div className="club-detail-image-wrap" style={{ width: '100%', aspectRatio: '4/5', overflow: 'hidden', background: ac, position: 'relative', flexShrink: 0 }}>
              {club.image_url ? (
                <Image
                  src={club.image_url}
                  alt={club.title}
                  fill
                  sizes="(max-width:900px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div style={{ position: 'absolute', inset: 0, background: ac, opacity: 0.25 }} />
              )}
            </div>
          </div>

          {/* ── COLONNE DROITE ── */}
          <div className="club-detail-right" style={{ paddingTop: 8 }}>

            {/* Taglines */}
            <div className="club-taglines-desktop">
            {(club.tagline || club.tagline_sub) && (
              <div style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                marginBottom: 28,
              }}>
                {club.tagline && (
                  <span style={{
                    display: 'inline-block',
                    background: ac,
                    color: at,
                    padding: '3px 10px 5px',
                    fontSize: 'clamp(11px, 0.9vw, 14px)',
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                    width: 'fit-content',
                    fontStyle: 'italic',
                  }}>
                    {club.tagline}
                  </span>
                )}
                {club.tagline_sub && (
                  <span style={{
                    display: 'inline-block',
                    background: ac,
                    color: at,
                    padding: '5px 12px 7px',
                    fontSize: 'clamp(18px, 2vw, 28px)',
                    letterSpacing: '-0.01em',
                    textTransform: 'uppercase',
                    width: 'fit-content',
                    marginLeft: 20,
                  }}>
                    {club.tagline_sub}
                  </span>
                )}
              </div>
            )}
            </div>

            {hr}

            {/* QUI SOMMES NOUS */}
            {club.who_we_are && (
              <>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontWeight: 900,
                  fontSize: 'clamp(14px, 1.2vw, 18px)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.01em',
                  color: 'var(--ink)',
                  margin: '0 0 12px',
                }}>
                  QUI SOMMES NOUS ?
                </h3>
                <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--ink)', margin: 0, opacity: 0.85 }}>
                  {club.who_we_are}
                </p>
                {hr}
              </>
            )}

            {/* NOTRE OBJECTIF */}
            {club.objective && (
              <>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontWeight: 900,
                  fontSize: 'clamp(14px, 1.2vw, 18px)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.01em',
                  color: 'var(--ink)',
                  margin: '0 0 12px',
                }}>
                  NOTRE OBJECTIF :
                </h3>
                <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--ink)', margin: 0, opacity: 0.85 }}>
                  {club.objective}
                </p>
                {hr}
              </>
            )}

            {/* INFOS IMPORTANTES — lignes simples */}
            {infoItems.length > 0 && (
              <>
                <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 900, fontSize: 'clamp(14px,1.2vw,18px)', textTransform: 'uppercase', letterSpacing: '0.01em', color: 'var(--ink)', margin: '0 0 12px' }}>
                  LES INFOS IMPORTANTES
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {infoItems.map((item, idx) => (
                    <div key={item.key} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      padding: '10px 0',
                      borderTop: idx === 0 ? 'none' : '1px solid #ebebeb',
                    }}>
                      <span style={{
                        fontFamily: 'var(--font-display)',
                        fontStyle: 'italic',
                        fontSize: 12,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: 'var(--ink)',
                      }}>
                        {item.key}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-display)',
                        fontStyle: 'italic',
                        fontSize: 12,
                        textTransform: 'uppercase',
                        color: 'var(--ink)',
                        textAlign: 'right',
                      }}>
                        {item.val}
                      </span>
                    </div>
                  ))}
                </div>
                {hr}
              </>
            )}

            {/* Formulaire rejoindre */}
            <ClubJoinFormClient clubTitle={club.title} clubSlug={club.slug} accentColor={ac} />

          </div>
        </section>

        {/* ═══════════ AUTRES CLUBS ═══════════ */}
        {otherClubs.length > 0 && (
          <section style={{ paddingBottom: 30 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 'clamp(20px, 1.8vw, 28px)',
              lineHeight: 1.8,
              margin: '0 0 32px',
              color: 'var(--ink)',
            }}>
              <span style={{ background: '#BFDBFE', padding: '4px 10px' }}>VOUS POUVEZ AUSSI DÉCOUVRIR</span>
              <br/>
              <span style={{ background: '#BFDBFE', padding: '4px 10px', display: 'inline-block', marginLeft: 40 }}>NOS AUTRES CLUBS !</span>
            </h2>
            <div className="club-others-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
              {otherClubs.map(other => (
                <Link key={other.id} href={`/${locale}/clubs/${other.slug}`} style={{
                  background: '#fff',
                  boxShadow: '0 2px 0 rgba(0,0,0,0.06), 0 10px 28px rgba(0,0,0,0.08)',
                  padding: '22px 22px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  color: 'var(--ink)',
                  textDecoration: 'none',
                  transition: 'transform 0.2s ease',
                }}>
                  <div style={{ aspectRatio: '16/10', overflow: 'hidden', background: other.image_url ? '#ddd' : other.accent_color, position: 'relative' }}>
                    {other.image_url && (
                      <Image src={other.image_url} alt={other.title} fill sizes="33vw" style={{ objectFit: 'cover' }} />
                    )}
                  </div>
                  <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(18px, 1.5vw, 24px)', textTransform: 'uppercase', margin: 0 }}>
                      {other.title}
                    </h3>
                    <span style={{ display: 'inline-flex', width: 24, height: 24, flexShrink: 0 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/smiley-handdrawn.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </span>
                  </header>
                  {other.schedule && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderTop: `1.2px solid ${other.accent_color}`, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 12, textTransform: 'uppercase' }}>
                      <span style={{ fontWeight: 900 }}>HORAIRES</span><span>{other.schedule}</span>
                    </div>
                  )}
                  {other.location && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderTop: `1.2px solid ${other.accent_color}`, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 12, textTransform: 'uppercase' }}>
                      <span style={{ fontWeight: 900 }}>LIEU</span><span>{other.location}</span>
                    </div>
                  )}
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: '#FFE74A', color: 'var(--ink)',
                    fontFamily: 'var(--font-display)', fontStyle: 'italic',
                    fontSize: 20, letterSpacing: '0.04em', textTransform: 'uppercase',
                    padding: '8px 20px', borderRadius: 999, alignSelf: 'flex-end', marginTop: 'auto',
                    fontWeight: 700,
                  }}>
                    DÉCOUVRIR LE CLUB
                    <svg viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 12 }}>
                      <path d="M2 8h19M14 1l7 7-7 7"/>
                    </svg>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid #e6e6e6', margin: '40px 0' }} />

        {/* ═══════════ BASKET CTA ═══════════ */}
        <section className="club-detail-shop" style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', alignItems: 'center', gap: 60, padding: '24px 0 60px', position: 'relative' }}>
          <div className="club-detail-shop-image" style={{ position: 'relative', width: '100%' }}>
            <span aria-hidden="true" style={{ position: 'absolute', top: '-10%', right: '-12%', width: '60%', height: '60%', transform: 'rotate(-12deg)', zIndex: 0 }}>
              <svg viewBox="0 0 142 142" fill="#FEEF4C" style={{ width: '100%', height: '100%' }}>
                <path d="M 33.516 62.621 L 0 33.516 L 33.516 71.882 L 0 116.863 L 50.273 82.025 L 64.385 142 L 70.559 82.025 L 142 103.634 L 93.05 71.882 L 118.627 46.745 L 70.559 46.745 L 70.559 11.025 L 50.273 46.745 L 26.901 0 L 33.516 62.621 Z"/>
              </svg>
            </span>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', zIndex: 1 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/basket.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'absolute', inset: 0 }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/prod-tshirt.png"  alt="" style={{ position: 'absolute', left: '18%', top: '14%', width: '42%', transform: 'rotate(-6deg)', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.18))' }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/prod-totebag.png" alt="" style={{ position: 'absolute', left: '44%', top: '10%', width: '28%', transform: 'rotate(8deg)',  objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.18))' }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/prod-gourde.png"  alt="" style={{ position: 'absolute', left: '56%', top: '22%', width: '22%', transform: 'rotate(-4deg)', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.18))' }} />
            </div>
          </div>
          <div className="club-detail-shop-text">
            <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(26px,2.6vw,38px)', lineHeight: 1.05, textTransform: 'uppercase', color: 'var(--ink)', margin: '0 0 14px' }}>
              INTÉRESSÉ PAR LEURS<br/>PRODUCTIONS ?
            </h3>
            <p style={{ fontStyle: 'italic', fontSize: 13, opacity: 0.65, margin: '0 0 18px' }}>
              *N&apos;hésitez pas à les soutenir en regardant le shop
            </p>
          </div>
          <div className="club-detail-shop-btn" style={{ gridColumn: 2, display: 'flex', justifyContent: 'flex-end', zIndex: 1 }}>
            <Link href={`/${locale}/shop`} style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'var(--yellow)', color: 'var(--ink)',
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontSize: 20, fontWeight: 700, letterSpacing: '0.04em',
              textTransform: 'uppercase', textDecoration: 'none', padding: '12px 22px', borderRadius: 999,
            }}>
              VOIR LE SHOP
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
