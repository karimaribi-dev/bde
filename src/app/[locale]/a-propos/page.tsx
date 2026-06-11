import { createClient } from '@/lib/supabase/server'
import NavbarClient from '@/components/NavbarClient'
import SiteFooter from '@/components/SiteFooter'
import AProposProposerClient from '@/components/AProposProposerClient'
import { Category } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AProposPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase   = await createClient()
  const { data: categories } = await supabase.from('categories').select('*').order('name')
  const cats = (categories ?? []) as Category[]

  return (
    <>
      <NavbarClient categories={cats} locale={locale} activeSlug="propos" />

      <main style={{ padding: '0 40px' }}>

        {/* ══════════════ MEET THE TEAM ══════════════ */}
        <section style={{ textAlign: 'center', padding: '50px 0 60px' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 900,
            fontSize: 'clamp(56px, 10vw, 140px)',
            lineHeight: 0.9,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            color: 'var(--ink)',
            margin: '0 0 50px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          }}>
            {/* Ligne 1 : MEET THE + smiley */}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'clamp(14px,1.6vw,28px)' }}>
              <span>MEET THE</span>
              <span style={{ display: 'inline-flex', width: 'clamp(50px,6vw,90px)', height: 'clamp(50px,6vw,90px)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/smiley-handdrawn.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </span>
            </span>
            {/* Ligne 2 : ( Incredible. ) TEAM */}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'clamp(10px,1.2vw,20px)' }}>
              <span>(</span>
              <span style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: '0.7em',
                letterSpacing: 0,
                textTransform: 'none',
              }}>
                Incredible.
              </span>
              <span>)</span>
              <span>TEAM</span>
            </span>
          </h1>

          {/* Membres de l'équipe */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'clamp(40px, 8vw, 110px)',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
          }}>
            {[
              { name: 'LOUISON', color: '#4FA3FF', img: '/images/team-louison.png' },
              { name: 'BENJI',   color: '#FFB3F0', img: '/images/team-benji.png' },
              { name: 'ACHILLE', color: '#FFE74A', img: '/images/team-achille.png' },
            ].map(member => (
              <div key={member.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                {/* Photo circulaire */}
                <div style={{
                  width: 'clamp(130px, 13vw, 190px)',
                  height: 'clamp(150px, 15vw, 210px)',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: '#f0f0f0',
                  position: 'relative',
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.img}
                    alt={member.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                </div>
                {/* Badge nom */}
                <div style={{
                  background: member.color,
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontWeight: 900,
                  fontSize: 'clamp(12px, 1.1vw, 16px)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  padding: '5px 14px 6px',
                  marginTop: -4,
                  zIndex: 1,
                  position: 'relative',
                }}>
                  {member.name}
                </div>
              </div>
            ))}
          </div>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '0 0 0' }} />

        {/* ══════════════ MANIFESTO ══════════════ */}
        <section style={{ padding: '50px 0 60px' }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 900,
            fontSize: 'clamp(44px, 7vw, 108px)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            color: 'var(--ink)',
            maxWidth: 1100,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
          }}>

            {/* CREATE WHAT + étoile */}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'clamp(14px,2vw,28px)' }}>
              <span>
                <span style={{ color: '#FF55A5' }}>CREATE</span>
                {' '}WHAT
              </span>
              <span aria-hidden="true" style={{ display: 'inline-flex', width: 'clamp(44px,5vw,74px)', height: 'clamp(44px,5vw,74px)', transform: 'rotate(-10deg)', flexShrink: 0 }}>
                <svg viewBox="0 0 142 142" fill="#FEEF4C" style={{ width: '100%', height: '100%' }}>
                  <path d="M 33.516 62.621 L 0 33.516 L 33.516 71.882 L 0 116.863 L 50.273 82.025 L 64.385 142 L 70.559 82.025 L 142 103.634 L 93.05 71.882 L 118.627 46.745 L 70.559 46.745 L 70.559 11.025 L 50.273 46.745 L 26.901 0 L 33.516 62.621 Z"/>
                </svg>
              </span>
            </span>

            {/* YOU WANT. */}
            <span style={{ paddingLeft: 'clamp(40px, 6vw, 100px)' }}>YOU WANT.</span>

            {/* SHARE IT + flèche + main */}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'clamp(14px,2vw,26px)' }}>
              <span style={{ color: '#4FA3FF' }}>SHARE IT</span>
              <span aria-hidden="true" style={{ display: 'inline-flex', width: 'clamp(40px,4.5vw,68px)', height: 'clamp(26px,3vw,46px)', flexShrink: 0 }}>
                <svg viewBox="0 0 60 40" fill="none" stroke="#FF5500" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                  <path d="M5 10 C25 20 35 5 50 30"/>
                  <path d="M45 25 L50 30 L42 32"/>
                </svg>
              </span>
              <span aria-hidden="true" style={{ display: 'inline-flex', width: 'clamp(32px,3.5vw,54px)', height: 'clamp(32px,3.5vw,54px)', flexShrink: 0 }}>
                <svg viewBox="0 0 50 50" fill="none" stroke="#FEEF4C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                  <path d="M15 40V22c0-3 4-3 4 0v10M19 22V12c0-3 4-3 4 0v14M23 14c0-3 4-3 4 0v12M27 18c0-3 4-3 4 0v8c0 10-4 14-12 14-6 0-9-4-9-9"/>
                </svg>
              </span>
            </span>

            {/* WITH EVERYONE. */}
            <span>WITH EVERYONE.</span>

          </div>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '0 0 0' }} />

        {/* ══════════════ FORMULAIRE SUGGESTION ══════════════ */}
        <AProposProposerClient />

        <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '0 0 0' }} />

        {/* ══════════════ PARTENAIRES ══════════════ */}
        <section style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 40,
          padding: '36px 0 64px',
          flexWrap: 'wrap',
        }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontWeight: 900,
              fontSize: 'clamp(18px, 1.6vw, 26px)',
              textTransform: 'uppercase',
              color: 'var(--ink)',
              margin: '0 0 6px',
            }}>
              NOS PARTENAIRES
            </h2>
            <p style={{ fontSize: 14, color: 'var(--ink)', opacity: 0.7, margin: 0 }}>
              Les partenaires qui nous accompagnent tout au long de l&apos;année.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            {/* R */}
            <span style={{ width: 60, height: 60, borderRadius: 12, background: '#fff', border: '1px solid #eee', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <svg viewBox="0 0 40 40" fill="none" style={{ width: '100%', height: '100%' }}>
                <rect width="40" height="40" rx="6" fill="#fff" stroke="#ddd"/>
                <path d="M14 28V12h7c3 0 5 2 5 5s-2 5-5 5l5 6h-3l-5-6h-2v6h-2zm2-8h5c2 0 3-1 3-3s-1-3-3-3h-5v6z" fill="#111"/>
              </svg>
            </span>
            {/* Jow */}
            <span style={{ width: 60, height: 60, borderRadius: 12, overflow: 'hidden', display: 'inline-flex' }}>
              <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%' }}>
                <rect width="40" height="40" rx="6" fill="#FF553D"/>
                <text x="20" y="27" textAnchor="middle" fontFamily="Archivo Black, sans-serif" fontSize="17" fontStyle="italic" fill="#fff">jow</text>
              </svg>
            </span>
            {/* UN */}
            <span style={{ width: 60, height: 60, borderRadius: '50%', overflow: 'hidden', display: 'inline-flex' }}>
              <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%' }}>
                <circle cx="20" cy="20" r="20" fill="#1B97DA"/>
                <circle cx="20" cy="20" r="14" fill="none" stroke="#fff" strokeWidth="1.4"/>
                <path d="M20 6v28M6 20h28M10 12c4 4 16 4 20 0M10 28c4-4 16-4 20 0" stroke="#fff" strokeWidth="1" fill="none"/>
              </svg>
            </span>
          </div>
        </section>

      </main>

      <SiteFooter categories={cats} />
    </>
  )
}
