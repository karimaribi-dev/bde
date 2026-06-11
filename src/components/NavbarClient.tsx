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
  { key: 'agenda',       label: 'AGENDA',        href: (l: string) => `/${l}/agenda` },
  { key: 'clubs',        label: 'NOS CLUBS',      href: (l: string) => `/${l}/clubs` },
  { key: 'shop',         label: 'SHOP',           href: (l: string) => `/${l}/shop` },
  { key: 'coup',         label: 'COUP DE CŒUR',   href: (l: string) => `/${l}/coup-de-coeur` },
  { key: 'propos',       label: 'À PROPOS',       href: (_: string) => `/p/a-propos` },
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
  const [panelSearch, setPanelSearch]       = useState('')
  const [panelResults, setPanelResults]     = useState<SearchResult[]>([])
  const [panelLoading, setPanelLoading]     = useState(false)

  const pathname       = usePathname()
  const wrapRef        = useRef<HTMLDivElement>(null)
  const inputRef       = useRef<HTMLInputElement>(null)
  const panelSearchRef = useRef<HTMLInputElement>(null)

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
    const timer = setTimeout(async () => {
      if (panelSearch.trim().length < 2) { setPanelResults([]); return }
      setPanelLoading(true)
      setPanelResults(await doSearch(panelSearch))
      setPanelLoading(false)
    }, 320)
    return () => clearTimeout(timer)
  }, [panelSearch, doSearch])

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
    if (panelOpen) setTimeout(() => panelSearchRef.current?.focus(), 380)
    document.body.style.overflow = panelOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [panelOpen])

  const closePanel = () => { setPanelOpen(false); setPanelSearch(''); setPanelResults([]) }
  const closeDesktopSearch = () => { setSearchOpen(false); setDesktopQuery(''); setDesktopResults([]) }
  const showDesktopDrop   = searchOpen && desktopQuery.trim().length >= 2
  const showDesktopEmpty  = showDesktopDrop && !desktopLoading && desktopResults.length === 0

  return (
    <>
      {/* ── Site header — une seule ligne : brand + nav + panier ── */}
      <header className="site-header">

        {/* Brand */}
        <Link href={`/${locale}`} className="brand" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span>BDE</span>
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
              {item.label}
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

          <LocaleSwitcher currentLocale={locale} />

          {/* Panier */}
          <Link href={`/${locale}/shop`} className="cart-link" aria-label="Panier">
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h4l2.5 14h16l3-10H9"/><circle cx="12" cy="26" r="2"/><circle cx="23" cy="26" r="2"/><path d="M9 20l-1 2"/>
            </svg>
          </Link>

          {/* Hamburger — mobile uniquement */}
          <button className="topbar-hamburger" onClick={() => setPanelOpen(true)} aria-label="Ouvrir le menu">
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* ── Overlay ── */}
      <div className={`nav-overlay${panelOpen ? ' open' : ''}`} onClick={closePanel} aria-hidden="true" />

      {/* ── Slide-in panel mobile ── */}
      <div className={`nav-panel${panelOpen ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label="Menu">
        <div className="nav-panel__head">
          <Link href={`/${locale}`} onClick={closePanel} className="nav-panel__brand" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="brand-name" style={{ fontSize: 18 }}>BDE</span>
            <span className="brand-sub" style={{ marginLeft: 8 }}>LISAA DGC</span>
          </Link>
          <button className="nav-panel__close" onClick={closePanel} aria-label="Fermer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18"/>
            </svg>
          </button>
        </div>

        <nav className="nav-panel__links">
          {NAV_ITEMS.map(item => (
            <Link key={item.key} href={item.href(locale)} onClick={closePanel}>{item.label}</Link>
          ))}

          <div className="nav-panel__locales">
            {['fr', 'en', 'es', 'de'].map(code => (
              <button key={code} className={`nav-panel__locale${code === locale ? ' active' : ''}`}
                onClick={() => { closePanel(); document.cookie = `locale_choice=${code};path=/;max-age=31536000;samesite=lax`; window.location.href = buildLocalePath(pathname, code) }}>
                {code.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="nav-panel__search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.7-4.7"/>
            </svg>
            <input ref={panelSearchRef} type="text" value={panelSearch} onChange={e => setPanelSearch(e.target.value)} placeholder={l.search_placeholder} />
            {panelLoading && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--mute)', flexShrink: 0 }}>…</span>}
          </div>

          {panelResults.length > 0 && (
            <div className="nav-panel__results">
              {panelResults.map(r => (
                <Link key={r.id} href={`/articles/${r.slug}`} onClick={closePanel} className="nav-panel__result">
                  {r.cat_name && <span className="nav-panel__result-cat">{r.cat_name}</span>}
                  <span className="nav-panel__result-title">{r.title}</span>
                </Link>
              ))}
            </div>
          )}
          {panelSearch.trim().length >= 2 && !panelLoading && panelResults.length === 0 && (
            <div className="nav-panel__no-results">{l.no_results}</div>
          )}
        </nav>
      </div>
    </>
  )
}
