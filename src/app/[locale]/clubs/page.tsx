import { createClient } from '@/lib/supabase/server'
import NavbarClient from '@/components/NavbarClient'
import SiteFooter from '@/components/SiteFooter'
import ClubsCarouselClient from '@/components/ClubsCarouselClient'
import AgendaProposerForm from '@/components/AgendaProposerForm'
import Link from 'next/link'
import { Club, Category } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function ClubsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase   = await createClient()

  const [{ data: clubsRaw }, { data: categories }] = await Promise.all([
    supabase.from('clubs').select('*').eq('is_published', true)
      .order('sort_order', { ascending: true }),
    supabase.from('categories').select('*').order('name'),
  ])

  const clubs = (clubsRaw ?? []) as Club[]
  const cats  = (categories ?? []) as Category[]

  return (
    <>
      <NavbarClient categories={cats} locale={locale} activeSlug="clubs" />

      <main style={{ padding: '0 40px' }}>

        {/* ═══════════ HERO ═══════════ */}
        <section style={{ padding: '18px 0 50px' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 900,
            fontSize: 'clamp(60px, 11vw, 170px)',
            lineHeight: 0.9,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            color: 'var(--ink)',
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}>
            {/* Ligne 1 : JOIN OUR + flèche */}
            <span style={{ display: 'flex', alignItems: 'center', gap: 'clamp(20px, 3vw, 50px)' }}>
              <span>JOIN OUR</span>
              <span aria-hidden="true" style={{ display: 'inline-flex', width: 'clamp(70px,8vw,130px)', height: 'clamp(70px,8vw,130px)' }}>
                <svg viewBox="0 0 100 100" fill="none" stroke="#262626" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                  <path d="M20 20L80 80M40 80H80V40"/>
                </svg>
              </span>
            </span>
            {/* Ligne 2 : ( Amazing, Fun,... ) CLUBS */}
            <span style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px,1.5vw,20px)' }}>
              <span style={{ fontWeight: 900 }}>(</span>
              <span style={{
                fontFamily: 'Georgia, serif',
                fontWeight: 700,
                fontStyle: 'italic',
                fontSize: 'clamp(22px, 2.4vw, 40px)',
                lineHeight: 1.05,
                textTransform: 'none',
                letterSpacing: 0,
                textAlign: 'center',
                whiteSpace: 'nowrap',
                color: 'var(--ink)',
              }}>
                Amazing, Fun,<br/>Creative,…
              </span>
              <span style={{ fontWeight: 900 }}>)</span>
              <span>CLUBS</span>
            </span>
          </h1>
        </section>

        {/* ═══════════ CAROUSEL ═══════════ */}
        {clubs.length > 0 ? (
          <ClubsCarouselClient clubs={clubs} locale={locale} />
        ) : (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, textTransform: 'uppercase', color: '#aaa' }}>
              Les clubs arrivent bientôt !
            </p>
          </div>
        )}

        {/* ═══════════ PROPOSER ═══════════ */}
        <div style={{ marginTop: 80, position: 'relative' }}>
          {/* Étoile bleue décorative */}
          <span aria-hidden="true" style={{ position: 'absolute', top: -40, left: -20, width: 180, height: 180, zIndex: 0, pointerEvents: 'none' }}>
            <svg viewBox="0 0 140 140" fill="none" stroke="#5FA0FB" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
              <path d="M70 12 C72 26 78 36 84 40 C96 42 110 42 124 38 C112 50 102 60 100 68 C104 80 108 96 116 116 C100 102 84 92 70 90 C56 92 38 100 22 116 C30 100 36 82 38 68 C36 56 24 50 12 38 C26 42 40 42 52 40 C60 36 66 26 70 12 Z"/>
            </svg>
          </span>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <AgendaProposerForm />
          </div>
        </div>

        {/* ═══════════ SÉPARATEUR ═══════════ */}
        <hr style={{ border: 'none', borderTop: '1px solid #e6e6e6', margin: '40px 0' }} />

        {/* ═══════════ BASKET CTA ═══════════ */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: '1.05fr 1fr',
          alignItems: 'center',
          gap: 60,
          padding: '24px 0 60px',
          position: 'relative',
        }}>
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
