'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Category } from '@/lib/types'
import LocaleSwitcher, { buildLocalePath } from './LocaleSwitcher'
import { usePathname } from 'next/navigation'

interface NavLabels {
  home: string
  contact: string
  search_placeholder: string
  no_results: string
  tagline: string
}

interface Props {
  categories: Category[]
  activeSlug?: string
  withSearch?: boolean
  locale?: string
  labels?: NavLabels
}

interface SearchResult {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cat_name: string | null
}

/* Nav links — hardcodés, pas liés aux catégories */
const NAV_ITEMS = [
  { key: 'agenda', label: 'AGENDA & EVENTS', labelEn: 'AGENDA & EVENTS', href: (l: string) => `/${l}/agenda` },
  { key: 'clubs',  label: 'NOS CLUBS',       labelEn: 'OUR CLUBS',       href: (l: string) => `/${l}/clubs` },
  { key: 'shop',   label: 'SHOP',            labelEn: 'SHOP',            href: (l: string) => `/${l}/shop` },
  { key: 'propos', label: 'À PROPOS',        labelEn: 'ABOUT',           href: (l: string) => `/${l}/a-propos` },
]

export default function NavbarClient({ categories: _cats, activeSlug, withSearch = false, locale = 'fr', labels }: Props) {
  void _cats

  const defaultLabels: NavLabels = {
    home: 'Accueil', contact: 'Contact',
    search_placeholder: 'Rechercher…', no_results: 'Aucun résultat', tagline: 'LISAA DGC',
  }
  const l = labels ?? defaultLabels

  const [panelOpen, setPanelOpen]           = useState(false)
  const [searchOpen, setSearchOpen]         = useState(false)
  const [desktopQuery, setDesktopQuery]     = useState('')
  const [desktopResults, setDesktopResults] = useState<SearchResult[]>([])
  const [desktopLoading, setDesktopLoading] = useState(false)
  const pathname       = usePathname()
  const wrapRef        = useRef<HTMLDivElement>(null)
  const inputRef       = useRef<HTMLInputElement>(null)

  const doSearch = useCallback(async (q: string): Promise<SearchResult[]> => {
    if (q.trim().length < 2) return []
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { data } = await supabase.rpc('search_articles', { q: q.trim() })
    return (data ?? []) as SearchResult[]
  }, [])

  useEffect(() => {
    if (!withSearch) return
    const timer = setTimeout(async () => {
      if (desktopQuery.trim().length < 2) { setDesktopResults([]); return }
      setDesktopLoading(true)
      setDesktopResults(await doSearch(desktopQuery))
      setDesktopLoading(false)
    }, 320)
    return () => clearTimeout(timer)
  }, [desktopQuery, doSearch, withSearch])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setSearchOpen(false); setDesktopQuery(''); setDesktopResults([]); setPanelOpen(false) }
      if (withSearch && (e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true) }
    }
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) { setSearchOpen(false); setDesktopQuery(''); setDesktopResults([]) }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onClickOutside)
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('click', onClickOutside) }
  }, [withSearch])

  useEffect(() => { if (searchOpen) setTimeout(() => inputRef.current?.focus(), 200) }, [searchOpen])
  useEffect(() => {
    document.body.style.overflow = panelOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [panelOpen])

  const closePanel = () => { setPanelOpen(false) }
  const closeDesktopSearch = () => { setSearchOpen(false); setDesktopQuery(''); setDesktopResults([]) }
  const showDesktopDrop   = searchOpen && desktopQuery.trim().length >= 2
  const showDesktopEmpty  = showDesktopDrop && !desktopLoading && desktopResults.length === 0

  return (
    <>
      {/* ── Site header — une seule ligne : brand + nav + panier ── */}
      <header className="site-header">

        {/* Brand */}
        <Link href={`/${locale}`} className="brand" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="bde-word">BDE</span>
          <span className="lisaa-dgc">{l.tagline}</span>
        </Link>

        {/* Nav desktop */}
        <nav className="main-nav">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.key}
              href={item.href(locale)}
              className={activeSlug === item.key ? 'is-active' : ''}
            >
              {locale === 'en' ? item.labelEn : item.label}
            </Link>
          ))}
        </nav>

        {/* Droite : recherche + locale + panier + hamburger mobile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0 }}>

          {/* Recherche desktop */}
          {withSearch && (
            <div ref={wrapRef} className={`search-wrap${searchOpen ? ' open' : ''}`} style={{ position: 'relative' }}>
              <button className="search-btn" aria-label="Recherche" aria-expanded={searchOpen}
                onClick={e => { e.stopPropagation(); setSearchOpen(v => !v) }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.7-4.7"/>
                </svg>
              </button>
              {searchOpen && (
                <>
                  <input ref={inputRef} className="search-input" type="text" placeholder={l.search_placeholder}
                    value={desktopQuery} onChange={e => setDesktopQuery(e.target.value)} />
                  <button className="search-close" aria-label="Fermer" onClick={e => { e.stopPropagation(); closeDesktopSearch() }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 6l12 12M18 6L6 18"/>
                    </svg>
                  </button>
                </>
              )}
              {showDesktopDrop && (
                <div className="search-dropdown">
                  {desktopLoading && <div className="search-dropdown__empty">{l.search_placeholder}</div>}
                  {showDesktopEmpty && <div className="search-dropdown__empty">{l.no_results}</div>}
                  {desktopResults.map(r => (
                    <Link key={r.id} href={`/articles/${r.slug}`} className="search-dropdown__item" onClick={closeDesktopSearch}>
                      {r.cat_name && <span className="search-dropdown__cat">{r.cat_name}</span>}
                      <span className="search-dropdown__title">{r.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Toggle langue desktop — même switch que le panel mobile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', flexShrink: 0 }}>
            <span style={{ fontFamily: '"neue-haas-grotesk-text", sans-serif', fontSize: 12, color: 'var(--ink)', opacity: locale === 'fr' ? 1 : 0.4, textTransform: 'lowercase' }}>fr</span>
            <button
              className={`nav-panel__locale-toggle${locale === 'en' ? ' en' : ''}`}
              aria-label="Changer de langue"
              style={{ width: 52, height: 26, borderRadius: 13 }}
              onClick={() => {
                const next = locale === 'fr' ? 'en' : 'fr'
                document.cookie = `locale_choice=${next};path=/;max-age=31536000;samesite=lax`
                window.location.href = buildLocalePath(pathname, next)
              }}
            />
            <span style={{ fontFamily: '"neue-haas-grotesk-text", sans-serif', fontSize: 12, color: 'var(--ink)', opacity: locale === 'en' ? 1 : 0.4, textTransform: 'lowercase' }}>en</span>
          </div>

          {/* Panier */}
          <Link href={`/${locale}/shop`} className="cart-link" aria-label="Panier">
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h4l2.5 14h16l3-10H9"/><circle cx="12" cy="26" r="2"/><circle cx="23" cy="26" r="2"/><path d="M9 20l-1 2"/>
            </svg>
          </Link>

          {/* Hamburger — mobile uniquement */}
          <button className="topbar-hamburger" onClick={() => setPanelOpen(true)} aria-label="Ouvrir le menu">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/menu-burger.svg" alt="" style={{ width: 36, height: 26, display: 'block' }} />
          </button>
        </div>
      </header>

      {/* ── Overlay (desktop uniquement) ── */}
      <div className={`nav-overlay${panelOpen ? ' open' : ''}`} onClick={closePanel} aria-hidden="true" />

      {/* ── Panel mobile plein écran ── */}
      <div className={`nav-panel${panelOpen ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label="Menu">

        {/* En-tête : flèche retour + logo */}
        <div className="nav-panel__head">
          <button className="nav-panel__back" onClick={closePanel} aria-label="Fermer">
            <svg width="22" height="16" viewBox="0 0 24 18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 9H2M10 1L2 9l8 8"/>
            </svg>
          </button>
          <Link href={`/${locale}`} onClick={closePanel} className="nav-panel__brand">
            <span style={{ fontFamily: '"neue-haas-grotesk-display", sans-serif', fontWeight: 700, fontSize: 64, lineHeight: 1, letterSpacing: '-0.01em', textTransform: 'uppercase' }}>BDE</span>
            <span style={{ background: 'var(--pink)', padding: '4px 14px 6px', fontFamily: '"new-atten", sans-serif', fontWeight: 500, fontStyle: 'italic', fontSize: 32, lineHeight: 1, textTransform: 'uppercase', display: 'inline-block' }}>LISAA DGC</span>
          </Link>
        </div>

        {/* Corps centré verticalement */}
        <div className="nav-panel__body">
          {/* Liens de navigation — gros boutons jaunes */}
          <nav className="nav-panel__links">
            {NAV_ITEMS.map(item => (
              <Link key={item.key} href={item.href(locale)} onClick={closePanel}
                className={activeSlug === item.key ? 'active' : ''}>
                {locale === 'en' ? item.labelEn : item.label}
              </Link>
            ))}
            {/* Panier */}
            <Link href={`/${locale}/shop`} onClick={closePanel} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: 'var(--yellow)', fontFamily: '"neue-haas-grotesk-text", sans-serif', fontSize: 18, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink)', textDecoration: 'none', padding: '16px 24px', borderRadius: 4 }}>
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h4l2.5 14h16l3-10H9"/><circle cx="12" cy="26" r="2"/><circle cx="23" cy="26" r="2"/>
              </svg>
              PANIER
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h4l2.5 14h16l3-10H9"/><circle cx="12" cy="26" r="2"/><circle cx="23" cy="26" r="2"/>
              </svg>
            </Link>
          </nav>

          {/* Toggle langue */}
          <div className="nav-panel__locale-row">
            <span className="nav-panel__locale-label" style={{ opacity: locale === 'fr' ? 1 : 0.45 }}>français</span>
            <button
              className={`nav-panel__locale-toggle${locale === 'en' ? ' en' : ''}`}
              aria-label="Changer de langue"
              onClick={() => {
                const next = locale === 'fr' ? 'en' : 'fr'
                closePanel()
                document.cookie = `locale_choice=${next};path=/;max-age=31536000;samesite=lax`
                window.location.href = buildLocalePath(pathname, next)
              }}
            />
            <span className="nav-panel__locale-label" style={{ opacity: locale === 'en' ? 1 : 0.45 }}>english</span>
          </div>
        </div>

        {/* Footer — mentions légales + contact */}
        <div className="nav-panel__footer">
          <Link href={`/${locale}/mentions-legales`} onClick={closePanel}>Mentions légales</Link>
          <Link href={`/${locale}/contact`} onClick={closePanel}>Contact</Link>
        </div>

      </div>
    </>
  )
}
