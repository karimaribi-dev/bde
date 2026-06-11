'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Article, Category } from '@/lib/types'
import { getCategoryName } from '@/lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import NavbarClient from '@/components/NavbarClient'
import SiteFooter from '@/components/SiteFooter'
import AdSectionClient from '@/components/AdSectionClient'
import SubscribeForm from '@/components/SubscribeForm'
import { use } from 'react'
import { useTranslations } from 'next-intl'

function formatDate(dateStr: string | null) {
  if (!dateStr) return ''
  return format(new Date(dateStr), 'dd.MM.yyyy', { locale: fr })
}

function PhotoDiv({ className, style, children }: { className?: string; style?: React.CSSProperties; children?: React.ReactNode }) {
  return <div className={`photo ${className ?? ''}`} style={style}>{children}</div>
}

function SiteHeader({ categories, locale, labels }: { categories: Category[], locale: string, labels: { home: string; contact: string; search_placeholder: string; no_results: string; tagline: string } }) {
  return <NavbarClient categories={categories} withSearch locale={locale} labels={labels} />
}

function Marquee({ articles }: { articles: { title: string; slug: string }[] }) {
  const src = articles.length > 0 ? articles : []
  const doubled = [...src, ...src]
  if (doubled.length === 0) return null
  return (
    <div className="marquee">
      <div className="marquee-track">
        {doubled.map((art, i) => (
          <span key={i} style={{ display: 'contents' }}>
            <Link href={`/articles/${art.slug}`}>{art.title.toUpperCase()}</Link>
            <span className="diamond">◆</span>
          </span>
        ))}
      </div>
    </div>
  )
}

function AdColumn({ adPartnerLabel, locale }: { adPartnerLabel: string; locale: string }) {
  return (
    <aside style={{ display: 'flex', flexDirection: 'column', background: 'var(--paper-2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: 'var(--hair)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase' }}>{adPartnerLabel}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--mute)' }}>A.D.</span>
      </div>
      <AdSectionClient slotId="sidebar_display" variant="display" locale={locale} />
      <AdSectionClient slotId="sidebar_sponsored" variant="sponsored" locale={locale} />
      <AdSectionClient slotId="sidebar_promo" variant="promo" locale={locale} />
    </aside>
  )
}

const PAGE_SIZE = 6

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const t = useTranslations('home')
  const tNav = useTranslations('nav')
  type ArticleWithCat = Article & { category: Category | null }

  const [featured, setFeatured] = useState<ArticleWithCat | null>(null)
  const [latest, setLatest] = useState<ArticleWithCat[]>([])
  const [grid, setGrid] = useState<ArticleWithCat[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const supabaseRef = useRef<ReturnType<typeof import('@/lib/supabase/client').createClient> | null>(null)

  const navLabels = {
    home: tNav('home'),
    contact: tNav('contact'),
    search_placeholder: tNav('search_placeholder'),
    no_results: tNav('no_results'),
    tagline: tNav('tagline'),
  }

  // Initial load
  useEffect(() => {
    async function load() {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      supabaseRef.current = supabase

      const [{ data: arts }, { data: cats }] = await Promise.all([
        supabase
          .from('articles')
          .select('*, category:categories!category_id(id, name, slug)')
          .eq('status', 'published')
          .eq('locale', locale)
          .lte('published_at', new Date().toISOString())
          .order('published_at', { ascending: false })
          .range(0, 6 + PAGE_SIZE),
        supabase.from('categories').select('*').order('name'),
      ])
      const all = (arts ?? []) as ArticleWithCat[]
      setFeatured(all[0] ?? null)
      setLatest(all.slice(1, 6))
      // La grille commence après le featured (1) + les 5 articles de la sidebar (5) = index 6
      const firstGrid = all.slice(6, 6 + PAGE_SIZE)
      setGrid(firstGrid)
      setOffset(6 + PAGE_SIZE)
      setHasMore(all.length > 6 + PAGE_SIZE)
      setCategories(cats ?? [])
      setInitialized(true)
    }
    load()
  }, [locale])

  // Load more when sentinel becomes visible
  useEffect(() => {
    if (!initialized || !hasMore) return
    const observer = new IntersectionObserver(
      async (entries) => {
        if (!entries[0].isIntersecting || loadingMore || !hasMore) return
        setLoadingMore(true)
        const supabase = supabaseRef.current
        if (!supabase) return
        const { data } = await supabase
          .from('articles')
          .select('*, category:categories!category_id(id, name, slug)')
          .eq('status', 'published')
          .eq('locale', locale)
          .lte('published_at', new Date().toISOString())
          .order('published_at', { ascending: false })
          .range(offset, offset + PAGE_SIZE - 1)
        const more = (data ?? []) as ArticleWithCat[]
        setGrid(prev => [...prev, ...more])
        setOffset(prev => prev + more.length)
        setHasMore(more.length === PAGE_SIZE)
        setLoadingMore(false)
      },
      { rootMargin: '200px' }
    )
    const el = sentinelRef.current
    if (el) observer.observe(el)
    return () => { if (el) observer.unobserve(el) }
  }, [initialized, hasMore, loadingMore, offset, locale])

  const allArticles = [featured, ...latest, ...grid].filter((a): a is ArticleWithCat => a !== null)
  const BADGE_COLORS = ['var(--yellow)', 'var(--pink)', 'var(--blue)', 'var(--orange)']

  return (
    <>
      <SiteHeader categories={categories} locale={locale} labels={navLabels} />

      {/* ── Hero BDE ── */}
      <section style={{ background: 'var(--paper)', borderBottom: 'var(--hair)', padding: '56px 40px 48px', overflow: 'hidden' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(72px, 12vw, 160px)',
          fontWeight: 800,
          lineHeight: 0.9,
          letterSpacing: '-0.03em',
          textTransform: 'uppercase',
          margin: 0,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0 24px',
        }}>
          <span>MAKE</span>
          <span style={{ background: 'var(--yellow)', padding: '0 16px' }}>ALIVE</span>
          <span>LE</span>
          <span style={{ background: 'var(--pink)', padding: '0 16px' }}>CAMPUS</span>
        </h1>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--mute)', marginTop: 24, marginBottom: 0 }}>
          BDE LISAA DGC — Actu étudiante, événements & projets
        </p>
      </section>

      {/* ── Marquee ── */}
      <Marquee articles={allArticles} />

      {/* ── Articles grid ── */}
      <section style={{ padding: '40px 28px', borderBottom: 'var(--hair)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 28, borderBottom: 'var(--hair)', paddingBottom: 14 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', margin: 0 }}>DERNIÈRES ACTUS</h2>
        </div>

        {allArticles.length === 0 ? (
          <div style={{ padding: '64px 0', textAlign: 'center', color: 'var(--mute)', fontFamily: 'var(--font-display)', fontSize: 13, letterSpacing: '.1em', textTransform: 'uppercase' }}>
            Aucun article publié pour l&apos;instant
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
            {allArticles.map((art, i) => (
              <Link key={art.id} href={`/articles/${art.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: 14, padding: '24px', border: 'var(--hair)', background: 'var(--paper)', transition: 'background .15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--yellow)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--paper)')}
              >
                {art.cover_image_url && (
                  <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden', background: 'var(--ink)' }}>
                    <Image src={art.cover_image_url} alt={art.title} fill sizes="(max-width: 720px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
                  </div>
                )}
                {art.category && (
                  <span style={{ display: 'inline-block', background: BADGE_COLORS[i % 4], padding: '4px 10px', fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', borderRadius: 2, width: 'max-content' }}>
                    {getCategoryName(art.category, locale)}
                  </span>
                )}
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em', textTransform: 'uppercase', margin: 0 }}>{art.title}</h3>
                {art.excerpt && <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink-2)', fontFamily: 'inherit' }}>{art.excerpt}</p>}
                <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: 'var(--hair-mute)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--mute)' }}>{formatDate(art.published_at)}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase' }}>LIRE →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Sentinel scroll infini ── */}
      <div ref={sentinelRef}>
        {loadingMore && (
          <div style={{ padding: '28px', textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--mute)' }}>
            Chargement...
          </div>
        )}
      </div>

      <SiteFooter categories={categories} />
    </>
  )
}

