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
  const cats       = (categories ?? []) as Category[]
  const otherClubs = (otherClubsRaw ?? []) as Club[]

  const ac = club.accent_color
  const at = club.accent_text_color

  /* Info rows — seulement les champs renseignés */
  const infoItems: { key: string; val: string }[] = [
    club.schedule    && { key: 'HORAIRES',          val: club.schedule },
    club.frequency   && { key: 'DATE / FRÉQUENCE',  val: club.frequency },
    club.location    && { key: 'LIEU',               val: club.location },
    club.member_count && { key: 'NOMBRE DE MEMBRES', val: club.member_count },
  ].filter(Boolean) as { key: string; val: string }[]

  return (
    <>
      <NavbarClient categories={cats} locale={locale} activeSlug="clubs" />

      <main style={{ padding: '0 40px' }}>

        {/* ═══════════ HERO ═══════════ */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 30, alignItems: 'flex-start', padding: '30px 0 24px' }}>
          {/* Titre + flèche */}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 900,
            fontSize: 'clamp(54px, 7vw, 108px)',
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(16px, 2vw, 36px)',
            textTransform: 'uppercase',
          }}>
            {club.title}
            <span aria-hidden="true" style={{ display: 'inline-flex', width: 'clamp(50px,5vw,100px)', height: 'clamp(50px,5vw,100px)', flexShrink: 0 }}>
              <svg viewBox="0 0 100 100" fill="none" stroke="#262626" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                <path d="M20 20L80 80M40 80H80V40"/>
              </svg>
            </span>
          </h1>

          {/* Tagline à droite */}
          <div style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 'clamp(13px, 1.1vw, 18px)',
            lineHeight: 1.8,
            alignSelf: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            alignItems: 'flex-end',
          }}>
            {club.tagline && (
              <span style={{ display: 'inline-block', background: ac, color: at, padding: '4px 10px 6px', letterSpacing: '0.01em', width: 'fit-content', textTransform: 'uppercase' }}>
                {club.tagline}
              </span>
            )}
            {club.tagline_sub && (
              <span style={{ display: 'inline-block', background: ac, color: at, padding: '4px 10px 6px', letterSpacing: '0.01em', width: 'fit-content', textTransform: 'uppercase', marginLeft: 40 }}>
                {club.tagline_sub}
              </span>
            )}
          </div>
        </section>

        {/* ═══════════ DETAIL 2 COLONNES ═══════════ */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 50, marginTop: 16 }}>

          {/* Photo grande */}
          <div style={{ aspectRatio: '1/1', overflow: 'hidden', background: club.image_url ? '#ddd' : ac, position: 'relative' }}>
            {club.image_url ? (
              <Image src={club.image_url} alt={club.title} fill sizes="(max-width:900px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
            ) : (
              <div style={{ position: 'absolute', inset: 0, background: ac, opacity: 0.3 }} />
            )}
          </div>

          {/* Colonne info boxes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* QUI SOMMES NOUS */}
            {club.who_we_are && (
              <InfoBox ac={ac} title="QUI SOMMES NOUS ?">
                <p style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--ink)', margin: 0 }}>
                  {club.who_we_are}
                </p>
              </InfoBox>
            )}

            {/* NOTRE OBJECTIF */}
            {club.objective && (
              <InfoBox ac={ac} title="NOTRE OBJECTIF :">
                <p style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--ink)', margin: 0 }}>
                  {club.objective}
                </p>
              </InfoBox>
            )}

            {/* LES INFOS IMPORTANTES */}
            {infoItems.length > 0 && (
              <InfoBox ac={ac} title="LES INFOS IMPORTANTES">
                {infoItems.map((item, idx) => (
                  <div key={item.key} style={{
                    padding: '10px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    border: `1.2px solid ${ac}`,
                    borderTop: idx === 0 ? `1.2px solid ${ac}` : 'none',
                    fontFamily: 'var(--font-display)',
                    fontStyle: 'italic',
                    fontSize: 13,
                    textTransform: 'uppercase',
                  }}>
                    <span style={{ fontWeight: 900 }}>{item.key}</span>
                    <span>{item.val}</span>
                  </div>
                ))}
              </InfoBox>
            )}

            {/* Formulaire rejoindre */}
            <ClubJoinFormClient clubTitle={club.title} accentColor={ac} />

          </div>
        </section>

        {/* ═══════════ AUTRES CLUBS ═══════════ */}
        {otherClubs.length > 0 && (
          <section style={{ marginTop: 60, paddingBottom: 30 }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
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
                  {/* Photo */}
                  <div style={{ aspectRatio: '16/10', overflow: 'hidden', background: other.image_url ? '#ddd' : other.accent_color, position: 'relative' }}>
                    {other.image_url && (
                      <Image src={other.image_url} alt={other.title} fill sizes="33vw" style={{ objectFit: 'cover' }} />
                    )}
                  </div>
                  {/* Titre */}
                  <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(20px, 1.6vw, 26px)', textTransform: 'uppercase', margin: 0 }}>
                      {other.title}
                    </h3>
                    <span style={{ display: 'inline-flex', width: 26, height: 26 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/smiley-handdrawn.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </span>
                  </header>
                  {/* Info rows */}
                  {other.schedule && (
                    <div style={{ padding: '8px 10px', border: `1.2px solid ${other.accent_color}`, display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 12, textTransform: 'uppercase' }}>
                      <span style={{ fontWeight: 900 }}>HORAIRES</span><span>{other.schedule}</span>
                    </div>
                  )}
                  {other.location && (
                    <div style={{ padding: '8px 10px', border: `1.2px solid ${other.accent_color}`, borderTop: other.schedule ? 'none' : `1.2px solid ${other.accent_color}`, display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 12, textTransform: 'uppercase' }}>
                      <span style={{ fontWeight: 900 }}>LIEU</span><span>{other.location}</span>
                    </div>
                  )}
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'var(--ink)', color: '#fff',
                    fontFamily: 'var(--font-display)', fontStyle: 'italic',
                    fontSize: 12, letterSpacing: '0.04em', textTransform: 'uppercase',
                    padding: '8px 14px', alignSelf: 'center', marginTop: 6,
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

        {/* ═══════════ SÉPARATEUR ═══════════ */}
        <hr style={{ border: 'none', borderTop: '1px solid #e6e6e6', margin: '40px 0' }} />

        {/* ═══════════ BASKET CTA ═══════════ */}
        <section style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', alignItems: 'center', gap: 60, padding: '24px 0 60px', position: 'relative' }}>
          <div style={{ position: 'relative', width: '100%' }}>
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
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(26px,2.6vw,38px)', lineHeight: 1.05, textTransform: 'uppercase', color: 'var(--ink)', margin: '0 0 14px' }}>
              INTÉRESSÉ PAR LEURS<br/>PRODUCTIONS ?
            </h3>
            <p style={{ fontStyle: 'italic', fontSize: 13, opacity: 0.65, margin: '0 0 18px' }}>
              *N&apos;hésitez pas à les soutenir en regardant le shop
            </p>
            <Link href={`/${locale}/shop`} style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: '#FFE74A', color: 'var(--ink)',
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontSize: 14, fontWeight: 700, letterSpacing: '0.04em',
              textTransform: 'uppercase', textDecoration: 'none', padding: '12px 22px',
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

/* ── Boîte info réutilisable ── */
function InfoBox({ ac, title, children }: { ac: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '18px 20px', border: `1.5px solid ${ac}`, background: '#fff' }}>
      <h3 style={{
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontSize: 'clamp(16px, 1.3vw, 22px)',
        textTransform: 'uppercase',
        letterSpacing: '-0.01em',
        margin: '0 0 10px',
        color: 'var(--ink)',
      }}>
        {title}
      </h3>
      {children}
    </div>
  )
}
