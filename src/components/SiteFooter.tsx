'use client'

import Link from 'next/link'
import { Category } from '@/lib/types'

const NAV_COL1 = [
  { label: 'AGENDA & EVENT', href: '/agenda' },
  { label: 'CLUB',           href: '/clubs' },
  { label: 'SHOP',           href: '/shop' },
]
const NAV_COL2 = [
  { label: 'COUP DE CŒUR', href: '/coup-de-coeur' },
  { label: 'À PROPOS',     href: '/p/a-propos' },
]

function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const linkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  color: 'var(--ink)',
  textDecoration: 'none',
  display: 'block',
  padding: '4px 0',
}

export default function SiteFooter({ categories }: { categories: Category[] }) {
  void categories

  return (
    <footer style={{ background: 'var(--yellow)', borderTop: 'var(--hair)', fontFamily: 'var(--font-display)' }}>

      {/* ── Top band : brand + scroll up ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '28px 36px',
        borderBottom: 'var(--hair)',
      }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(44px, 7vw, 72px)',
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
          }}>BDE</span>
          <span style={{
            background: 'var(--blue)',
            padding: '6px 18px 8px',
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(24px, 4.5vw, 52px)',
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: '-0.01em',
            fontStyle: 'italic',
            textTransform: 'uppercase',
          }}>LISAA DGC</span>
        </Link>

        <button
          onClick={scrollTop}
          aria-label="Haut de page"
          style={{
            width: 56,
            height: 56,
            border: '2px solid var(--ink)',
            borderRadius: '50%',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background .15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--ink)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15"/>
          </svg>
        </button>
      </div>

      {/* ── 3-column middle ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        borderBottom: 'var(--hair)',
      }}>

        {/* Col 1 — MENU */}
        <div style={{ padding: '28px 36px', borderRight: 'var(--hair)' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            paddingBottom: 12,
            borderBottom: '1px dashed rgba(17,17,17,0.35)',
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, fontStyle: 'italic', letterSpacing: '.04em', textTransform: 'uppercase' }}>
              MENU
            </span>
            <span style={{ fontSize: 18, lineHeight: 1 }}>☺</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {NAV_COL1.map(l => (
                <Link key={l.href} href={l.href} style={linkStyle}>{l.label}</Link>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {NAV_COL2.map(l => (
                <Link key={l.href} href={l.href} style={linkStyle}>{l.label}</Link>
              ))}
            </div>
          </div>
        </div>

        {/* Col 2 — INSTA */}
        <div style={{ padding: '28px 36px', borderRight: 'var(--hair)' }}>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: 15,
            fontWeight: 800,
            fontStyle: 'italic',
            letterSpacing: '.04em',
            textTransform: 'uppercase',
            margin: '0 0 14px',
          }}>
            SUIVEZ NOUS SUR INSTA !
          </p>

          <a href="https://instagram.com/bde_lisaa_dgc" target="_blank" rel="noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'var(--ink)', marginBottom: 20 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.05em' }}>bde_lisaa_dgc</span>
          </a>

          {/* App icon placeholders */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { label: 'R', bg: '#1a1a1a', color: '#fff' },
              { label: 'jow', bg: '#FF6B47', color: '#fff' },
              { label: '🌐', bg: '#BFDBFE', color: '#111' },
            ].map(app => (
              <div key={app.label} style={{
                width: 44,
                height: 44,
                background: app.bg,
                color: app.color,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-display)',
                fontSize: app.label === 'jow' ? 11 : 16,
                fontWeight: 800,
                letterSpacing: 0,
                border: '1px solid rgba(0,0,0,0.12)',
              }}>
                {app.label}
              </div>
            ))}
          </div>
        </div>

        {/* Col 3 — MAKE THE CAMPUS ALIVE oval */}
        <div style={{ padding: '28px 36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            border: '2.5px solid var(--ink)',
            borderRadius: '50%',
            padding: '28px 40px',
            textAlign: 'center',
            maxWidth: 260,
          }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(18px, 2.2vw, 26px)',
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              display: 'block',
            }}>
              MAKE THE<br />CAMPUS ALIVE
            </span>
          </div>
        </div>

      </div>

      {/* ── Legal bar ── */}
      <div style={{ padding: '12px 36px', textAlign: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink)', opacity: 0.65 }}>
          © {new Date().getFullYear()} BDE LISAA PARIS – TOUS DROITS RÉSERVÉS
        </span>
      </div>

    </footer>
  )
}
