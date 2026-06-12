'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Category } from '@/lib/types'

const NAV_COL1 = [
  { label: 'AGENDA & EVENT', href: '/agenda' },
  { label: 'CLUB',           href: '/clubs' },
  { label: 'SHOP',           href: '/shop' },
]
const NAV_COL2 = [
  { label: 'COUP DE CŒUR', href: '/coup-de-coeur' },
  { label: 'À PROPOS',     href: '/a-propos' },
]

function scrollTop() { window.scrollTo({ top: 0, behavior: 'smooth' }) }

const navLinkStyle: React.CSSProperties = {
  fontFamily: '"neue-haas-grotesk-text", "Helvetica Neue", sans-serif',
  fontSize: 13,
  letterSpacing: '.04em',
  textTransform: 'uppercase',
  color: 'var(--ink)',
  textDecoration: 'none',
  display: 'block',
  padding: '5px 0',
}

const HR = () => (
  <div style={{ borderTop: '1px solid rgba(0,0,0,0.18)', margin: '0' }} />
)

export default function SiteFooter({ categories }: { categories: Category[] }) {
  void categories

  const [isMobile, setIsMobile] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 720)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  /* ─────────── Brand row (partagé desktop + mobile) ─────────── */
  const BrandRow = () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: isMobile ? '18px 20px' : '24px 36px',
      borderBottom: '1px solid rgba(0,0,0,0.18)',
    }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'baseline', gap: 10, textDecoration: 'none', color: 'inherit' }}>
        <span style={{ fontFamily: '"neue-haas-grotesk-display", sans-serif', fontWeight: 700, fontSize: isMobile ? 36 : 48, lineHeight: 1, letterSpacing: '-0.01em', textTransform: 'uppercase' }}>BDE</span>
        <span style={{ background: 'var(--pink)', padding: isMobile ? '3px 10px 4px' : '4px 12px 6px', fontFamily: '"new-atten", sans-serif', fontWeight: 500, fontStyle: 'italic', fontSize: isMobile ? 22 : 30, lineHeight: 1, textTransform: 'uppercase' }}>LISAA DGC</span>
      </Link>
      <button onClick={scrollTop} aria-label="Haut de page" style={{ width: isMobile ? 44 : 52, height: isMobile ? 44 : 52, border: '2px solid var(--ink)', borderRadius: '50%', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15"/>
        </svg>
      </button>
    </div>
  )

  /* ─────────── MAKE THE CAMPUS ALIVE (partagé) ─────────── */
  const MakeCampusAlive = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '28px 20px' : '36px 52px', position: 'relative' }}>
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '28px 40px' : '36px 52px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/entoure.svg" alt="" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
        <span style={{ position: 'relative', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: isMobile ? 'clamp(26px, 8vw, 40px)' : 'clamp(20px, 2.4vw, 30px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.02em', textTransform: 'uppercase', display: 'block', textAlign: 'center' }}>
          MAKE THE<br />CAMPUS ALIVE
        </span>
      </div>
    </div>
  )

  /* ─────────── Dark mode toggle ─────────── */
  const DarkModeToggle = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '18px 20px' : '20px 36px' }}>
      <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 800, fontSize: isMobile ? 20 : 17, letterSpacing: '-0.01em', textTransform: 'uppercase' }}>
        DARK MODE
      </span>
      <button
        onClick={() => setDark(d => !d)}
        aria-pressed={dark}
        aria-label="Toggle dark mode"
        style={{
          width: 58, height: 30,
          borderRadius: 15,
          background: dark ? 'var(--ink)' : 'rgba(0,0,0,0.15)',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background .2s',
          flexShrink: 0,
        }}
      >
        <span style={{
          position: 'absolute',
          top: 3, left: dark ? 31 : 3,
          width: 24, height: 24,
          borderRadius: '50%',
          background: '#262626',
          transition: 'left .2s',
          display: 'block',
        }} />
      </button>
    </div>
  )

  /* ─────────── Nav links ─────────── */
  const NavLinks = () => (
    <div style={{ padding: isMobile ? '18px 20px' : '28px 36px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {NAV_COL1.map(l => <Link key={l.href} href={l.href} style={navLinkStyle}>{l.label}</Link>)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {NAV_COL2.map(l => <Link key={l.href} href={l.href} style={navLinkStyle}>{l.label}</Link>)}
      </div>
    </div>
  )

  /* ─────────── Insta ─────────── */
  const InstaBlock = () => (
    <div style={{ padding: isMobile ? '18px 20px' : '28px 36px' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 800, fontSize: isMobile ? 20 : 15, letterSpacing: '-0.01em', textTransform: 'uppercase', margin: '0 0 14px' }}>
        SUIVEZ NOUS SUR INSTA !
      </p>
      <a href="https://instagram.com/bde_lisaa_dgc" target="_blank" rel="noreferrer"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'var(--ink)' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
        </svg>
        <span style={{ fontFamily: '"neue-haas-grotesk-text", sans-serif', fontSize: 20, letterSpacing: '.02em' }}>bde_lisaa_dgc</span>
      </a>
      {/* Crédit designers — visible uniquement sur desktop, juste sous l'handle */}
      {!isMobile && (
        <p style={{ fontFamily: '"neue-haas-grotesk-text", sans-serif', fontSize: 16, letterSpacing: '.02em', color: '#262626', fontStyle: 'italic', margin: '18px 0 0', border: '1px solid #262626', display: 'inline-block', padding: '8px 14px' }}>
          Designé par Célestine Goussard,<br />Liselotte Lecoq &amp; Marie Desbois
        </p>
      )}
    </div>
  )

  /* ─────────── Crédit designers (mobile uniquement) ─────────── */
  const DesignerCredit = () => (
    <div style={{ padding: '14px 20px' }}>
      <p style={{ fontFamily: '"neue-haas-grotesk-text", sans-serif', fontSize: 16, letterSpacing: '.02em', color: '#262626', fontStyle: 'italic', margin: 0, border: '1px solid #262626', display: 'inline-block', padding: '8px 14px' }}>
        Designé par Célestine Goussard, Liselotte Lecoq &amp; Marie Desbois
      </p>
    </div>
  )

  /* ─────────── Legal ─────────── */
  const Legal = () => (
    <div style={{ padding: isMobile ? '12px 20px' : '12px 36px', borderTop: '1px solid rgba(0,0,0,0.18)', textAlign: isMobile ? 'left' : 'center' }}>
      <span style={{ fontFamily: '"neue-haas-grotesk-text", sans-serif', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink)', opacity: 0.55 }}>
        © {new Date().getFullYear()} BDE LISAA PARIS – TOUS DROITS RÉSERVÉS
      </span>
    </div>
  )

  /* ═══════════════════════════════════════════════════════
     MOBILE LAYOUT
  ═══════════════════════════════════════════════════════ */
  if (isMobile) {
    return (
      <footer style={{ background: 'var(--yellow)', fontFamily: 'var(--font-display)' }}>
        <BrandRow />
        <MakeCampusAlive />
        <HR />
        <DarkModeToggle />
        <HR />
        <NavLinks />
        <HR />
        <InstaBlock />
        <HR />
        <DesignerCredit />
        <Legal />
      </footer>
    )
  }

  /* ═══════════════════════════════════════════════════════
     DESKTOP LAYOUT (3 colonnes)
  ═══════════════════════════════════════════════════════ */
  return (
    <footer style={{ background: 'var(--yellow)', borderTop: 'var(--hair)', fontFamily: 'var(--font-display)' }}>

      <BrandRow />

      {/* ── 3-column middle ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: 'var(--hair)' }}>

        {/* Col 1 — MENU + DARK MODE */}
        <div style={{ padding: '28px 36px', borderRight: 'var(--hair)', display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{ marginBottom: 20, paddingBottom: 14, borderBottom: '1px dashed rgba(17,17,17,0.3)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, fontStyle: 'italic', letterSpacing: '.04em', textTransform: 'uppercase' }}>MENU</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', marginBottom: 28 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {NAV_COL1.map(l => <Link key={l.href} href={l.href} style={navLinkStyle}>{l.label}</Link>)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {NAV_COL2.map(l => <Link key={l.href} href={l.href} style={navLinkStyle}>{l.label}</Link>)}
            </div>
          </div>
          <DarkModeToggle />
        </div>

        {/* Col 2 — INSTA */}
        <div style={{ padding: '28px 36px', borderRight: 'var(--hair)' }}>
          <InstaBlock />
        </div>

        {/* Col 3 — MAKE THE CAMPUS ALIVE */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MakeCampusAlive />
        </div>

      </div>

      <Legal />

    </footer>
  )
}
