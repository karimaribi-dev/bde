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

/* ── Placeholder events (à remplacer par la table DB agenda) ── */
const PLACEHOLDER_EVENTS = [
  {
    id: 'e1',
    badge: 'AFTERWORK',
    badgeColor: 'var(--pink)',
    badgeText: 'var(--ink)',
    title: 'LA FÉLICITA',
    date: 'jeudi 19 mars',
    time: '19h',
    price: 'gratuit',
    img: '/images/event-felicita.jpg',
  },
  {
    id: 'e2',
    badge: 'OLYMPIADES',
    badgeColor: 'var(--orange-deep)',
    badgeText: '#fff',
    title: 'JARDIN DES PLANTES',
    date: 'vendredi 3 avril',
    time: '16h',
    price: '5€',
    img: '/images/event-olympiades.jpg',
  },
  {
    id: 'e3',
    badge: 'DEJ DES CHAMPION(NE)S',
    badgeColor: 'var(--yellow)',
    badgeText: 'var(--ink)',
    title: 'CAMPUS OLYMPIADES',
    date: 'mardi 21 avril',
    time: '10h',
    price: 'gratuit',
    img: '/images/event-dej.jpg',
  },
]

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

      {/* ── PROCHAINEMENT bar — exact du dossier ── */}
      {/* font géant italique, margin négatif pour casser le padding parent */}
      <div style={{
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontWeight: 900,
        fontSize: 'clamp(36px, 5.2vw, 80px)',
        letterSpacing: '-0.02em',
        textTransform: 'uppercase',
        color: 'var(--ink)',
        overflow: 'hidden',
        margin: '30px -40px 36px',
        padding: '6px 0',
        display: 'block',
      }}>
        <div style={{ width: '100%', overflow: 'hidden' }}>
          <div style={{
            display: 'inline-flex',
            gap: 'clamp(20px, 2.5vw, 40px)',
            alignItems: 'center',
            whiteSpace: 'nowrap',
            animation: 'marquee-scroll 38s linear infinite',
            willChange: 'transform',
          }}>
            {/* contenu doublé pour boucle parfaite (-50%) */}
            {[...Array(2)].map((_, half) => (
              <span key={half} style={{ display: 'inline-flex', gap: 'clamp(20px, 2.5vw, 40px)', alignItems: 'center' }}>
                {['PROCHAINEMENT','SOON','PROCHAINEMENT','SOON','PROCHAINEMENT','SOON','PROCHAINEMENT','SOON'].map((word, i) => (
                  i % 2 === 0
                    ? <span key={i} style={{ color: 'var(--orange-deep)', fontWeight: 900, fontSize: '0.95em', lineHeight: 1, display: 'inline-flex', flexShrink: 0 }}>↓</span>
                    : <span key={i} style={{ lineHeight: 1 }}>{word === 'SOON' && i % 4 === 1 ? 'SOON' : 'PROCHAINEMENT'}</span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Event cards — grid-3, cartes exactes du dossier ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22, marginTop: 6 }}>
        {PLACEHOLDER_EVENTS.map((ev) => (
          <Link key={ev.id} href={`/${locale}/agenda`} style={{ position: 'relative', overflow: 'hidden', aspectRatio: '7/6', background: '#ddd', display: 'block', textDecoration: 'none', color: 'inherit' }}>
            <Image
              src={ev.img}
              alt={ev.title}
              fill
              sizes="33vw"
              style={{ objectFit: 'cover', display: 'block' }}
            />
            {/* Badge — position absolute top-left */}
            <div style={{
              position: 'absolute', top: 12, left: 12,
              background: ev.badgeColor,
              color: ev.badgeText,
              padding: '6px 14px 7px',
              fontFamily: 'var(--font-display)',
              fontSize: 13,
              fontStyle: 'italic',
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}>
              {ev.badge}
            </div>
            {/* Info panel — position absolute bottom, fond blanc */}
            <div style={{
              position: 'absolute', bottom: 12, left: 12, right: 12,
              background: '#fff',
              padding: '12px 14px 14px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 'clamp(15px, 1.4vw, 22px)',
                textTransform: 'uppercase',
                letterSpacing: '-0.01em',
                textAlign: 'center',
                color: 'var(--ink)',
              }}>
                {ev.title}
              </div>
              <div style={{
                fontSize: 12,
                display: 'flex',
                gap: 14,
                justifyContent: 'center',
                marginTop: 4,
                color: 'var(--ink)',
                opacity: 0.85,
              }}>
                <span>○ {ev.date}</span>
                <span>○ {ev.time}</span>
                <span>○ {ev.price}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Events footer ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, marginTop: 22, marginBottom: 60 }}>
        <span style={{ fontStyle: 'italic', fontSize: 14, color: 'var(--ink)', opacity: 0.7 }}>
          *N&apos;hésitez pas à slider pour plus d&apos;event
        </span>
        <Link href={`/${locale}/agenda`} style={{
          display: 'inline-flex', alignItems: 'center', gap: 12,
          background: 'var(--yellow)', color: 'var(--ink)',
          padding: '11px 24px', borderRadius: 999,
          fontWeight: 700, fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase',
          whiteSpace: 'nowrap', textDecoration: 'none',
          transition: 'transform .12s, background .15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--yellow-deep)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--yellow)'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          VOIR TOUS LES ÉVENEMENTS
          <span style={{ display: 'inline-flex', width: 18, height: 14 }}>
            <svg viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
              <path d="M2 8h19M14 1l7 7-7 7"/>
            </svg>
          </span>
        </Link>
      </div>

      {/* ── NOS CLUBS JUSTE POUR VOUS ── */}
      <section style={{ padding: '6px 40px', borderBottom: 'var(--hair)', background: 'var(--paper)' }}>

        {/* Titre */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 30 }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 'clamp(36px, 4.6vw, 60px)',
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            margin: 0,
          }}>
            NOS CLUBS JUSTE<br />POUR VOUS
          </h2>
          {/* Flèche bouclée jaune — exactement celle du dossier */}
          <span style={{ display: 'inline-flex', width: 60, height: 80, marginBottom: -6, flexShrink: 0 }}>
            <svg viewBox="0 0 60 80" fill="none" stroke="#FEEF4C" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
              <path d="M10 8 C 30 30, 35 50, 30 70"/>
              <path d="M20 60 L 30 72 L 42 58"/>
            </svg>
          </span>
        </div>

        {/* Blocs clubs — layout exact du dossier */}
        <div style={{ position: 'relative', width: '100%' }}>

          {/* Orange — Club Typo (position: relative, 53%, 180px, clip-path arrow droite) */}
          <div style={{
            position: 'relative',
            background: 'var(--orange-deep)',
            width: '53%',
            height: 180,
            clipPath: 'polygon(0 0, calc(100% - 100px) 0, 100% 50%, calc(100% - 100px) 100%, 0 100%)',
            paddingRight: 110,
            padding: '28px 110px 28px 40px',
            zIndex: 3,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 4,
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(28px, 3.4vw, 44px)', lineHeight: 1, letterSpacing: '-0.01em', textTransform: 'uppercase' }}>CLUB TYPO</div>
            <div style={{ fontStyle: 'italic', fontSize: 13, letterSpacing: '0.02em', opacity: 0.9 }}>tous les jeudis — 18H</div>
          </div>

          {/* Bleu — Club Photo (position: absolute, top: 90px, right: 0) */}
          <div style={{
            position: 'absolute',
            top: 90,
            right: 0,
            background: 'var(--blue-strong)',
            width: 'calc(47% + 100px)',
            height: 180,
            clipPath: 'polygon(100px 0, 100% 0, 100% 100%, 100px 100%, 0 50%)',
            padding: '28px 40px 28px 130px',
            textAlign: 'right',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: 4,
            zIndex: 4,
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(28px, 3.4vw, 44px)', lineHeight: 1, letterSpacing: '-0.01em', textTransform: 'uppercase' }}>CLUB PHOTO</div>
            <div style={{ fontStyle: 'italic', fontSize: 13, letterSpacing: '0.02em', opacity: 0.9 }}>tous les mercredis — 18H</div>
          </div>

          {/* Rose — Club Print (position: relative, full width, min-height: 290px) */}
          <div style={{
            position: 'relative',
            background: 'var(--pink)',
            width: '100%',
            minHeight: 290,
            padding: '30px 40px 60px',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            gap: 4,
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(28px, 3.4vw, 44px)', lineHeight: 1, letterSpacing: '-0.01em', textTransform: 'uppercase' }}>CLUB PRINT</div>
            <div style={{ fontStyle: 'italic', fontSize: 13, letterSpacing: '0.02em', opacity: 0.9 }}>tous les mardi — 18H</div>
            {/* Blurb — position absolute bas gauche */}
            <div style={{ position: 'absolute', bottom: 18, left: 36, fontSize: 14, lineHeight: 1.3, color: 'var(--ink)' }}>
              <div>Passionés de print ?</div>
              <div>Vous êtes les bienvenues</div>
            </div>
            {/* Flèche — position absolute bas droite */}
            <Link href={`/${locale}/clubs`} aria-label="Découvrir les clubs"
              style={{ position: 'absolute', bottom: 22, right: 36, width: 40, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)', textDecoration: 'none' }}>
              <svg viewBox="0 0 24 16" fill="none" stroke="#262626" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                <path d="M2 8h19M14 1l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* CTA — btn pill exact du dossier */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22 }}>
          <Link href={`/${locale}/clubs`} style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            background: 'var(--yellow)', color: 'var(--ink)',
            padding: '11px 24px', borderRadius: 999,
            fontWeight: 700, fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase',
            whiteSpace: 'nowrap', textDecoration: 'none',
            transition: 'transform .12s, background .15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--yellow-deep)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--yellow)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            EN SAVOIR PLUS
            <span style={{ display: 'inline-flex', width: 18, height: 14 }}>
              <svg viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                <path d="M2 8h19M14 1l7 7-7 7"/>
              </svg>
            </span>
          </Link>
        </div>
      </section>

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

