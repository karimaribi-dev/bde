'use client'

import Link from 'next/link'
import { Category } from '@/lib/types'

const NAV_LINKS = [
  { label: 'AGENDA & ÉVÉNEMENTS', href: '/agenda' },
  { label: 'CLUBS',               href: '/clubs' },
  { label: 'COUP DE CŒUR',        href: '/coup-de-coeur' },
  { label: 'LA RAMETTE',          href: '/la-ramette' },
  { label: 'SHOP',                href: '/shop' },
  { label: 'À PROPOS',            href: '/p/a-propos' },
]

const LEGAL_LINKS = [
  { label: 'Mentions légales', href: '/p/mentions-legales' },
  { label: 'Contact',          href: '/p/contact' },
]

function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export default function SiteFooter({ categories }: { categories: Category[] }) {
  void categories // not used — nav is hardcoded

  return (
    <footer style={{ background: 'var(--yellow)', borderTop: 'var(--hair)', fontFamily: 'var(--font-display)' }}>

      {/* ── Main band ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 0,
        borderBottom: 'var(--hair)',
      }}>

        {/* Left — brand + nav + social */}
        <div style={{ padding: '40px 36px', borderRight: 'var(--hair)' }}>

          {/* Brand */}
          <div style={{ marginBottom: 28 }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'inline-flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: 1 }}>BDE</span>
              <span style={{ background: 'var(--ink)', color: 'var(--yellow)', padding: '3px 9px 4px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', fontStyle: 'italic' }}>LISAA DGC</span>
            </Link>
          </div>

          {/* Nav links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 36 }}>
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href} style={{
                display: 'block',
                fontFamily: 'var(--font-display)',
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                color: 'var(--ink)',
                textDecoration: 'none',
                padding: '7px 0',
                borderBottom: '1px solid rgba(17,17,17,0.15)',
                transition: 'padding-left .15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.paddingLeft = '8px')}
                onMouseLeave={e => (e.currentTarget.style.paddingLeft = '0')}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Social */}
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', margin: '0 0 12px', color: 'var(--ink)' }}>
              SUIVEZ NOUS SUR INSTA !
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <a href="https://instagram.com/bde_lisaa_dgc" target="_blank" rel="noreferrer"
                style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.06em', color: 'var(--ink)', textDecoration: 'none', borderBottom: '1px solid var(--ink)', paddingBottom: 1 }}>
                @bde_lisaa_dgc
              </a>
              {/* Instagram */}
              <a href="https://instagram.com/bde_lisaa_dgc" target="_blank" rel="noreferrer" aria-label="Instagram"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: 'var(--ink)', color: 'var(--yellow)', borderRadius: 2, flexShrink: 0, transition: 'background .15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--pink-hot)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--ink)')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              {/* TikTok */}
              <a href="https://tiktok.com/@bde_lisaa_dgc" target="_blank" rel="noreferrer" aria-label="TikTok"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: 'var(--ink)', color: 'var(--yellow)', borderRadius: 2, flexShrink: 0, transition: 'background .15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--pink-hot)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--ink)')}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.73a8.16 8.16 0 0 0 4.78 1.52V6.8a4.85 4.85 0 0 1-1.01-.11z"/>
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="https://linkedin.com/company/bde-lisaa-dgc" target="_blank" rel="noreferrer" aria-label="LinkedIn"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: 'var(--ink)', color: 'var(--yellow)', borderRadius: 2, flexShrink: 0, transition: 'background .15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--pink-hot)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--ink)')}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Right — tagline + scroll top */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', padding: '40px 36px', minWidth: 240 }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: 800,
            lineHeight: 0.9,
            letterSpacing: '-0.03em',
            textTransform: 'uppercase',
            textAlign: 'right',
          }}>
            <span>MAKE THE</span><br />
            <span style={{ background: 'var(--ink)', color: 'var(--yellow)', padding: '0 8px' }}>CAMPUS</span><br />
            <span>ALIVE</span>
          </div>

          <button
            onClick={scrollTop}
            aria-label="Haut de page"
            style={{
              width: 48,
              height: 48,
              border: 'var(--hair)',
              background: 'var(--ink)',
              color: 'var(--yellow)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              flexShrink: 0,
              transition: 'background .15s, transform .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--pink-hot)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--ink)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Legal bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 36px', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink)', opacity: 0.6 }}>
          © BDE LISAA DGC {new Date().getFullYear()}
        </span>
        <div style={{ display: 'flex', gap: 20 }}>
          {LEGAL_LINKS.map(l => (
            <Link key={l.href} href={l.href} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink)', textDecoration: 'none', opacity: 0.6, transition: 'opacity .15s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>

    </footer>
  )
}
