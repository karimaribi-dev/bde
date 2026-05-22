'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Category } from '@/lib/types'
import LocaleSwitcher from './LocaleSwitcher'

interface Props {
  categories: Category[]
  activeSlug?: string
  withSearch?: boolean
  locale?: string
}

interface SearchResult {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cat_name: string | null
}

export default function NavbarClient({ categories, activeSlug, withSearch = false, locale = 'fr' }: Props) {
  const [panelOpen, setPanelOpen]       = useState(false)
  const [searchOpen, setSearchOpen]     = useState(false)
  const [desktopQuery, setDesktopQuery] = useState('')
  const [desktopResults, setDesktopResults] = useState<SearchResult[]>([])
  const [desktopLoading, setDesktopLoading] = useState(false)
  const [panelSearch, setPanelSearch]   = useState('')
  const [panelResults, setPanelResults] = useState<SearchResult[]>([])
  const [panelLoading, setPanelLoading] = useState(false)

  const wrapRef        = useRef<HTMLDivElement>(null)
  const inputRef       = useRef<HTMLInputElement>(null)
  const panelSearchRef = useRef<HTMLInputElement>(null)

  /* ── Shared search via RPC (accent-insensitive) ── */
  const doSearch = useCallback(async (q: string): Promise<SearchResult[]> => {
    if (q.trim().length < 2) return []
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { data } = await supabase.rpc('search_articles', { q: q.trim() })
    return (data ?? []) as SearchResult[]
  }, [])

  /* ── Desktop search debounce ── */
  useEffect(() => {
    if (!withSearch) return
    const timer = setTimeout(async () => {
      if (desktopQuery.trim().length < 2) { setDesktopResults([]); return }
      setDesktopLoading(true)
      const results = await doSearch(desktopQuery)
      setDesktopResults(results)
      setDesktopLoading(false)
    }, 320)
    return () => clearTimeout(timer)
  }, [desktopQuery, doSearch, withSearch])

  /* ── Panel search debounce ── */
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (panelSearch.trim().length < 2) { setPanelResults([]); return }
      setPanelLoading(true)
      const results = await doSearch(panelSearch)
      setPanelResults(results)
      setPanelLoading(false)
    }, 320)
    return () => clearTimeout(timer)
  }, [panelSearch, doSearch])

  /* ── Keyboard + click-outside ── */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setSearchOpen(false); setDesktopQuery(''); setDesktopResults([])
        setPanelOpen(false)
      }
      if (withSearch && (e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault(); setSearchOpen(true)
      }
    }
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setSearchOpen(false); setDesktopQuery(''); setDesktopResults([])
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onClickOutside)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onClickOutside)
    }
  }, [withSearch])

  /* ── Focus desktop input on open ── */
  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 200)
  }, [searchOpen])

  /* ── Panel: lock scroll + focus ── */
  useEffect(() => {
    if (panelOpen) setTimeout(() => panelSearchRef.current?.focus(), 380)
    document.body.style.overflow = panelOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [panelOpen])

  const closePanel = () => {
    setPanelOpen(false); setPanelSearch(''); setPanelResults([])
  }
  const closeDesktopSearch = () => {
    setSearchOpen(false); setDesktopQuery(''); setDesktopResults([])
  }

  const showDesktopDrop = searchOpen && desktopQuery.trim().length >= 2
  const showDesktopEmpty = showDesktopDrop && !desktopLoading && desktopResults.length === 0

  return (
    <>
      {/* ── Topbar ── */}
      <header className="topbar">
        <div className="brand">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Image src="/logo-black.png" alt="AI Trends News" width={36} height={36} style={{ objectFit: 'contain' }} priority unoptimized />
            <span className="brand-name">AI TRENDS NEWS</span>
          </Link>
          <span className="brand-sub">Veille IA · Quotidienne</span>
        </div>
        <button className="topbar-hamburger" onClick={() => setPanelOpen(true)} aria-label="Ouvrir le menu">
          <span /><span /><span />
        </button>
      </header>

      {/* ── Navbar — desktop only ── */}
      <div className="navbar">
        <nav>
          <div className="nav-links">
            {categories.slice(0, 5).map((cat) => (
              <Link key={cat.id} href={`/categorie/${cat.slug}`} className={cat.slug === activeSlug ? 'active' : ''}>
                {cat.name}
              </Link>
            ))}
          </div>

          {withSearch ? (
            <div ref={wrapRef} className={`search-wrap${searchOpen ? ' open' : ''}`}>
              <button
                className="search-btn"
                aria-label="Recherche"
                aria-expanded={searchOpen}
                onClick={e => { e.stopPropagation(); setSearchOpen(v => !v) }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.7-4.7"/>
                </svg>
              </button>
              <input
                ref={inputRef}
                className="search-input"
                type="text"
                placeholder="Rechercher…"
                value={desktopQuery}
                onChange={e => setDesktopQuery(e.target.value)}
              />
              <button className="search-close" aria-label="Fermer" onClick={e => { e.stopPropagation(); closeDesktopSearch() }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6L6 18"/>
                </svg>
              </button>

              {/* Dropdown résultats desktop */}
              {showDesktopDrop && (
                <div className="search-dropdown">
                  {desktopLoading && <div className="search-dropdown__empty">Recherche…</div>}
                  {showDesktopEmpty && <div className="search-dropdown__empty">Aucun résultat</div>}
                  {desktopResults.map(r => (
                    <Link key={r.id} href={`/articles/${r.slug}`} className="search-dropdown__item" onClick={closeDesktopSearch}>
                      {r.cat_name && <span className="search-dropdown__cat">{r.cat_name}</span>}
                      <span className="search-dropdown__title">{r.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="search-icon-placeholder">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.7-4.7"/>
              </svg>
            </div>
          )}

          <LocaleSwitcher currentLocale={locale} />
        </nav>
      </div>

      {/* ── Overlay ── */}
      <div className={`nav-overlay${panelOpen ? ' open' : ''}`} onClick={closePanel} aria-hidden="true" />

      {/* ── Slide-in panel ── */}
      <div className={`nav-panel${panelOpen ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label="Menu de navigation">

        <div className="nav-panel__head">
          <Link href="/" onClick={closePanel} className="nav-panel__brand">
            <Image src="/logo-black.png" alt="AI Trends News" width={28} height={28} style={{ objectFit: 'contain' }} unoptimized />
            <span className="brand-name" style={{ marginLeft: 8 }}>AI TRENDS NEWS</span>
          </Link>
          <button className="nav-panel__close" onClick={closePanel} aria-label="Fermer le menu">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18"/>
            </svg>
          </button>
        </div>

        <nav className="nav-panel__links">
          <Link href="/" onClick={closePanel}>Accueil</Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categorie/${cat.slug}`}
              className={cat.slug === activeSlug ? 'active' : ''}
              onClick={closePanel}
            >
              {cat.name}
            </Link>
          ))}
          <Link href="#" onClick={closePanel}>Contact</Link>

          {/* Recherche — en bas de la liste */}
          <div className="nav-panel__search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.7-4.7"/>
            </svg>
            <input
              ref={panelSearchRef}
              type="text"
              value={panelSearch}
              onChange={e => setPanelSearch(e.target.value)}
              placeholder="Rechercher…"
            />
            {panelLoading && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--mute)', flexShrink: 0 }}>…</span>
            )}
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
            <div className="nav-panel__no-results">Aucun résultat</div>
          )}
        </nav>
      </div>
    </>
  )
}
