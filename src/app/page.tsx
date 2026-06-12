'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Article, Category } from '@/lib/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import NavbarClient from '@/components/NavbarClient'
import SiteFooter from '@/components/SiteFooter'
import AdSectionClient from '@/components/AdSectionClient'
import SubscribeForm from '@/components/SubscribeForm'
import DuotonePhoto from '@/components/DuotonePhoto'

function formatDate(dateStr: string | null) {
  if (!dateStr) return ''
  return format(new Date(dateStr), 'dd.MM.yyyy', { locale: fr })
}

function PhotoDiv({ className, style, children }: { className?: string; style?: React.CSSProperties; children?: React.ReactNode }) {
  return <div className={`photo ${className ?? ''}`} style={style}>{children}</div>
}

function SiteHeader({ categories }: { categories: Category[] }) {
  return <NavbarClient categories={categories}/>
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

function AdColumn() {
  return (
    <aside style={{ display: 'flex', flexDirection: 'column', background: 'var(--paper-2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: 'var(--hair)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase' }}>Espace partenaire</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--mute)' }}>A.D.</span>
      </div>
      <AdSectionClient slotId="sidebar_display" variant="display" />
      <AdSectionClient slotId="sidebar_sponsored" variant="sponsored" />
      <AdSectionClient slotId="sidebar_promo" variant="promo" />
    </aside>
  )
}

const PAGE_SIZE = 6

export default function HomePage() {
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
  }, [])

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
  }, [initialized, hasMore, loadingMore, offset])

  return (
    <>
      <SiteHeader categories={categories} />
      <Marquee articles={[featured, ...latest].filter((a): a is ArticleWithCat => a !== null)} />

      {/* ── Hero ── */}
      <section className="c-hero" style={{ borderBottom: 'var(--hair)' }}>

        {/* Col 1 — Featured */}
        <article style={{ padding: '28px 28px 24px', display: 'flex', flexDirection: 'column', gap: 20, background: 'var(--paper)', borderRight: 'var(--hair)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 'var(--hair)', paddingBottom: 10 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase' }}>À la une</span>
          </div>
          {featured ? (
            <Link href={`/articles/${featured.slug}`} style={{ display: 'contents' }}>
              {featured.cover_image_url ? (
                <DuotonePhoto
                  src={featured.cover_image_url}
                  alt={featured.title}
                  color1={featured.duotone_color1}
                  color2={featured.duotone_color2}
                  sizes="(max-width: 900px) 100vw, (max-width: 1100px) 60vw, 45vw"
                  priority
                  aspectRatio="16/9"
                  className="photo"
                >
                  <span style={{ position: 'absolute', top: 14, left: 14, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.18em', color: 'rgba(243,239,230,.7)', textTransform: 'uppercase', zIndex: 5 }}>
                    {featured.category?.name ?? ''}
                  </span>
                  <span style={{ position: 'absolute', top: 14, right: 14, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.18em', color: 'rgba(243,239,230,.7)', textTransform: 'uppercase', zIndex: 5 }}>
                    {formatDate(featured.published_at)}
                  </span>
                </DuotonePhoto>
              ) : (
                <div style={{ position: 'relative', aspectRatio: '16/9', background: '#0a0a0a' }} className="photo" />
              )}
              {featured.category && (
                <span style={{ display: 'inline-block', fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '.18em', textTransform: 'uppercase', background: 'var(--ink)', color: 'var(--paper)', padding: '6px 10px', width: 'max-content' }}>
                  {featured.category.name}
                </span>
              )}
              <h1 style={{ fontSize: 54, lineHeight: .96, letterSpacing: '-.02em', fontWeight: 700, margin: 0 }}>
                {featured.title}
              </h1>
              {featured.excerpt && (
                <p style={{ fontSize: 17, lineHeight: 1.5, color: 'var(--ink-2)', maxWidth: '56ch', margin: 0 }}>{featured.excerpt}</p>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: 'var(--hair)', paddingTop: 14, marginTop: 'auto' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase' }}>
                  {formatDate(featured.published_at)}
                </span>
                <span className="lire">Lire la suite <span>→</span></span>
              </div>
            </Link>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mute)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase' }}>
              Aucun article publié
            </div>
          )}
        </article>

        {/* Col 2 — Latest */}
        <aside style={{ display: 'flex', flexDirection: 'column', background: 'var(--paper)', borderRight: 'var(--hair)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', borderBottom: 'var(--hair)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase' }}>Derniers articles</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.18em', color: 'var(--mute)', textTransform: 'uppercase' }}>Aujourd&apos;hui</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {latest.map((art, i) => (
              <Link key={art.id} href={`/articles/${art.slug}`} style={{ display: 'grid', gridTemplateColumns: '84px 1fr', gap: 18, padding: '18px 24px', borderBottom: i < latest.length - 1 ? 'var(--hair-mute)' : 0, cursor: 'pointer', textDecoration: 'none', flex: 1, alignItems: 'start', transition: 'background .2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--paper-2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {art.cover_image_url ? (
                  <DuotonePhoto
                    src={art.cover_image_url}
                    alt={art.title}
                    color1={art.duotone_color1}
                    color2={art.duotone_color2}
                    sizes="84px"
                    style={{ width: 84, flexShrink: 0, aspectRatio: '1' }}
                    className="photo"
                  />
                ) : (
                  <div style={{ width: 84, flexShrink: 0, aspectRatio: '1', background: '#0a0a0a' }} className="photo" />
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase' }}>{art.category?.name ?? ''}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.18em', color: 'var(--mute)', textTransform: 'uppercase' }}>{formatDate(art.published_at)}</span>
                  </div>
                  <h3 style={{ fontSize: 16, lineHeight: 1.18, fontWeight: 700, margin: '2px 0', letterSpacing: '-.005em' }}>{art.title}</h3>
                  {art.excerpt && <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.45, color: 'var(--ink-2)' }}>{art.excerpt}</p>}
                </div>
              </Link>
            ))}
          </div>
        </aside>

        {/* Col 3 — Ad */}
        <AdColumn />
      </section>

      {/* ── Ad strip ── */}
      <div style={{ padding: '20px 28px', borderBottom: 'var(--hair)' }}>
        <div style={{ border: '1px dashed rgba(12,12,12,.35)', height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, position: 'relative', background: 'var(--paper-2)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--ink)', position: 'relative' }}>PUBLICITÉ</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--mute)', position: 'relative' }}>970 × 90 · IAB Leaderboard</span>
        </div>
      </div>

      {/* ── Article grid — premiers articles ── */}
      <section className="c-article-grid">
        {grid.slice(0, PAGE_SIZE).map((art, i) => (
          <Link
            key={art.id}
            href={`/articles/${art.slug}`}
            className="hover-card"
            style={{
              padding: '24px 24px 22px',
              borderRight: (i + 1) % 3 === 0 ? 0 : 'var(--hair-mute)',
              borderBottom: 'var(--hair-mute)',
              display: 'flex', flexDirection: 'column', gap: 14, cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '.18em', textTransform: 'uppercase' }}>{art.category?.name ?? ''}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '.18em', color: 'var(--mute)', textTransform: 'uppercase' }}>{formatDate(art.published_at)}</span>
            </div>
            {art.cover_image_url ? (
              <DuotonePhoto
                src={art.cover_image_url}
                alt={art.title}
                color1={art.duotone_color1}
                color2={art.duotone_color2}
                sizes="(max-width: 720px) 100vw, (max-width: 900px) 50vw, 33vw"
                aspectRatio="16/10"
                className="photo"
              >
                <span style={{ position: 'absolute', top: 10, left: 10, fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '.18em', color: 'rgba(243,239,230,.7)', textTransform: 'uppercase', zIndex: 5 }}>
                  A.{String(i + 1).padStart(2, '0')}
                </span>
              </DuotonePhoto>
            ) : (
              <div style={{ aspectRatio: '16/10', background: '#0a0a0a' }} className="photo" />
            )}
            <h3 style={{ fontSize: 22, lineHeight: 1.08, letterSpacing: '-.01em', fontWeight: 700, margin: 0 }}>{art.title}</h3>
            {art.excerpt && <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink-2)' }}>{art.excerpt}</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 'auto', paddingTop: 10, borderTop: 'var(--hair-mute)' }}>
              <span className="lire">Lire la suite <span>→</span></span>
            </div>
          </Link>
        ))}
        {grid.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '64px 28px', textAlign: 'center', color: 'var(--mute)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase' }}>
            Aucun article publié pour le moment.
          </div>
        )}
      </section>

      {/* ── Newsletter ── */}
      <section className="c-newsletter" style={{ borderTop: 'var(--hair)', borderBottom: 'var(--hair)' }}>
        <div style={{ padding: '24px 28px 20px', borderRight: 'var(--hair)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--mute)', marginBottom: 12 }}>Newsletter · Quotidienne</div>
          <h2 style={{ fontSize: 44, lineHeight: .95, letterSpacing: '-.025em', fontWeight: 700, margin: '0 0 12px' }}>RESTER DANS LA BOUCLE.</h2>
          <p style={{ fontSize: 15, lineHeight: 1.4, color: 'var(--ink-2)', maxWidth: '36ch', margin: '0 0 12px' }}>Une veille IA essentielle, chaque matin, pour ne rien manquer.</p>
          <div style={{ display: 'flex', gap: 18, fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--mute)' }}>
            <span>Sans publicité</span><span>·</span><span>Désabonnement en 1 clic</span>
          </div>
        </div>
        <div style={{ padding: '24px 28px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
          <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--ink-2)', margin: 0, maxWidth: '46ch' }}>Recevez chaque matin notre sélection : une analyse de fond, trois signaux à surveiller, un rapport décrypté.</p>
          <SubscribeForm />
        </div>
      </section>

      {/* ── Articles plus anciens + sidebar pub — sous la newsletter ── */}
      {grid.slice(PAGE_SIZE).length > 0 && (
        <div className="c-below-newsletter">
          <section className="c-article-grid-open">
            {grid.slice(PAGE_SIZE).map((art) => (
              <Link key={art.id} href={`/articles/${art.slug}`} className="hover-card c-article-card">
                <div style={{ aspectRatio: '3/2', background: art.duotone_color1 || '#000000', position: 'relative', overflow: 'hidden', marginBottom: 12, isolation: 'isolate' }} className="photo">
                  {art.cover_image_url && (
                    <Image src={art.cover_image_url} alt={art.title} fill sizes="(max-width: 720px) 100vw, (max-width: 900px) 50vw, 33vw" style={{ objectFit: 'cover',  }} />
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: art.duotone_color2 || '#ffffff', mixBlendMode: 'multiply', pointerEvents: 'none', zIndex: 1 }} />
                </div>
                {art.category?.name && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--mute)', display: 'block', marginBottom: 6 }}>{art.category.name}</span>
                )}
                <h3 style={{ fontSize: 19, lineHeight: 1.15, letterSpacing: '-.01em', fontWeight: 700, margin: 0 }}>{art.title}</h3>
              </Link>
            ))}
          </section>
          <AdColumn />
        </div>
      )}

      {/* ── Sentinel scroll infini ── */}
      <div ref={sentinelRef}>
        {loadingMore && (
          <div style={{ padding: '28px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--mute)', borderTop: 'var(--hair)' }}>
            Chargement…
          </div>
        )}
      </div>

      <SiteFooter categories={categories} />
    </>
  )
}
