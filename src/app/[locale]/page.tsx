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

      {/* ── Articles marquee — pleine largeur, hors du padding main ── */}
      <Marquee articles={allArticles} />

      {/* ── MAIN — padding: 0 40px comme l'original ── */}
      <main style={{ padding: '0 40px' }}>

      {/* ── Hero BDE ── */}
      <section style={{ padding: '24px 0 36px', position: 'relative' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(72px, 12vw, 160px)',
          fontWeight: 800,
          lineHeight: 0.86,
          letterSpacing: '-0.02em',
          textTransform: 'uppercase',
          margin: 0,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          columnGap: 'clamp(20px, 3vw, 60px)',
        }}>
          {/* Colonne gauche : MAKE / smiley / ALIVE */}
          <span style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <span>MAKE</span>
            <span aria-hidden="true" style={{ display: 'block', height: 'clamp(60px, 9vw, 130px)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/smiley-handdrawn.svg" alt="" style={{ width: 'clamp(60px, 9vw, 130px)', height: 'clamp(60px, 9vw, 130px)', display: 'block' }} />
            </span>
            <span>ALIVE</span>
          </span>
          {/* Colonne droite : THE / CAMPUS (avec starburst) */}
          <span style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <span>THE</span>
            <span style={{ position: 'relative', display: 'inline-block' }}>
              {/* Starburst jaune */}
              <span aria-hidden="true" style={{ position: 'absolute', right: '-5%', top: '-10%', width: '45%', pointerEvents: 'none', zIndex: 0 }}>
                <svg viewBox="0 0 142 142" fill="#FEEF4C" style={{ width: '100%', height: '100%' }}>
                  <path d="M 33.516 62.621 L 0 33.516 L 33.516 71.882 L 0 116.863 L 50.273 82.025 L 64.385 142 L 70.559 82.025 L 142 103.634 L 93.05 71.882 L 118.627 46.745 L 70.559 46.745 L 70.559 11.025 L 50.273 46.745 L 26.901 0 L 33.516 62.621 Z"/>
                </svg>
              </span>
              <span style={{ position: 'relative', zIndex: 1, color: 'var(--orange-deep)' }}>CAMPUS</span>
            </span>
          </span>
        </h1>
      </section>

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

      {/* section-divider */}
      <hr style={{ border: 'none', borderTop: '1px solid #e6e6e6', margin: '60px 0' }} />

      {/* ── VOTE POUR TON COUP DE CŒUR DU MOIS ── */}
      <section style={{ padding: '6px 0 12px' }}>

        {/* Titre centré */}
        <h2 style={{
          fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 900,
          fontSize: 'clamp(38px, 5.2vw, 72px)', lineHeight: 1, letterSpacing: '-0.02em',
          textTransform: 'uppercase', color: 'var(--ink)',
          display: 'flex', flexDirection: 'column', gap: 4,
          margin: '0 0 36px', alignItems: 'center', textAlign: 'center',
        }}>
          <span>VOTE POUR TON</span>
          <span>
            <span style={{ background: 'var(--pink)', padding: '0 14px 4px', display: 'inline-block', fontStyle: 'italic' }}>coup de coeur</span>
          </span>
          <span>DU MOIS</span>
        </h2>

        {/* Grid 3 cartes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22 }}>

          {/* Carte 1 */}
          <article style={{ background: '#262626', display: 'flex', flexDirection: 'column', padding: '0 0 22px' }}>
            <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', background: '#262626' }}>
              <Image src="/images/cdc-tombees.jpg" alt="Les Tombées de la Nuit" fill sizes="33vw" style={{ objectFit: 'cover', position: 'absolute', inset: 0 }} />
              <Image src="/images/cdc-tombees-overlay.png" alt="" fill sizes="33vw" style={{ objectFit: 'cover', position: 'absolute', inset: 0 }} />
            </div>
            <div style={{ color: '#fff', padding: '18px 22px 0', display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, letterSpacing: '0.02em', textTransform: 'uppercase' }}>LES TOMBÉES DE LA NUIT</div>
              <p style={{ fontSize: 13, lineHeight: 1.4, color: 'rgba(255,255,255,0.85)', margin: 0 }}>Affiche pour un festival d&apos;arts vivants qui transforme la ville en scène à ciel ouvert.</p>
              <div style={{ fontStyle: 'italic', fontSize: 13, textDecoration: 'underline', textUnderlineOffset: 3 }}>Leïla Bekhti</div>
            </div>
          </article>

          {/* Carte 2 */}
          <article style={{ background: '#262626', display: 'flex', flexDirection: 'column', padding: '0 0 22px' }}>
            <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', background: '#262626' }}>
              <Image src="/images/cdc-typo.jpg" alt="Typo expérimentale" fill sizes="33vw" style={{ objectFit: 'cover', position: 'absolute', inset: 0 }} />
            </div>
            <div style={{ color: '#fff', padding: '18px 22px 0', display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, letterSpacing: '0.02em', textTransform: 'uppercase' }}>TYPO EXPERIMENTALE</div>
              <p style={{ fontSize: 13, lineHeight: 1.4, color: 'rgba(255,255,255,0.85)', margin: 0 }}>Exploration typographique inspirée de la technique point de croix en broderie.</p>
              <div style={{ fontStyle: 'italic', fontSize: 13, textDecoration: 'underline', textUnderlineOffset: 3 }}>Agathe Millet</div>
            </div>
          </article>

          {/* Carte 3 */}
          <article style={{ background: '#262626', display: 'flex', flexDirection: 'column', padding: '0 0 22px' }}>
            <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', background: '#262626' }}>
              <Image src="/images/cdc-tombees.jpg" alt="Flux Urbains" fill sizes="33vw" style={{ objectFit: 'cover', position: 'absolute', inset: 0, objectPosition: '60% 0' }} />
            </div>
            <div style={{ color: '#fff', padding: '18px 22px 0', display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, letterSpacing: '0.02em', textTransform: 'uppercase' }}>FLUX URBAINS</div>
              <p style={{ fontSize: 13, lineHeight: 1.4, color: 'rgba(255,255,255,0.85)', margin: 0 }}>Typographie expérimentale et formes géométriques, qui joue avec les superpositions.</p>
              <div style={{ fontStyle: 'italic', fontSize: 13, textDecoration: 'underline', textUnderlineOffset: 3 }}>Camille Durand</div>
            </div>
          </article>
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
          <Link href={`/${locale}/coup-de-coeur`} style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            background: 'var(--yellow)', color: 'var(--ink)',
            padding: '11px 24px', borderRadius: 999,
            fontWeight: 700, fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase',
            whiteSpace: 'nowrap', textDecoration: 'none', transition: 'transform .12s, background .15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--yellow-deep)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--yellow)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            JE VOTE
            <span style={{ display: 'inline-flex', width: 18, height: 14 }}>
              <svg viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                <path d="M2 8h19M14 1l7 7-7 7"/>
              </svg>
            </span>
          </Link>
        </div>
      </section>

      {/* section-divider */}
      <hr style={{ border: 'none', borderTop: '1px solid #e6e6e6', margin: '60px 0' }} />

      {/* ── NOS CLUBS JUSTE POUR VOUS ── */}
      <section style={{ padding: '6px 0' }}>

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

      {/* section-divider */}
      <hr style={{ border: 'none', borderTop: '1px solid #e6e6e6', margin: '60px 0' }} />

      {/* ── INTERRÉSSÉ PAR LEURS PRODUCTIONS ? — exact du dossier ── */}
      <section style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', alignItems: 'center', gap: 60, padding: '24px 0', position: 'relative' }}>

        {/* Étoile burst — position absolute haut-droite */}
        <span aria-hidden="true" style={{ position: 'absolute', top: '5%', right: '4%', width: '38%', height: '70%', transform: 'rotate(-12deg)', zIndex: 0, pointerEvents: 'none', display: 'inline-flex' }}>
          <svg viewBox="0 0 142 142" fill="#FEEF4C" style={{ width: '100%', height: '100%' }}>
            <path d="M 33.516 62.621 L 0 33.516 L 33.516 71.882 L 0 116.863 L 50.273 82.025 L 64.385 142 L 70.559 82.025 L 142 103.634 L 93.05 71.882 L 118.627 46.745 L 70.559 46.745 L 70.559 11.025 L 50.273 46.745 L 26.901 0 L 33.516 62.621 Z"/>
          </svg>
        </span>

        {/* Colonne gauche — basket-stage */}
        <div style={{ position: 'relative', width: '100%', zIndex: 2 }}>
          <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3' }}>
            {/* Fond panier */}
            <Image src="/images/basket.png" alt="" fill style={{ objectFit: 'contain' }} sizes="50vw" />
            {/* Produits flottants */}
            <Image src="/images/prod-tshirt.png" alt="T-shirt" width={200} height={200}
              style={{ position: 'absolute', left: '18%', top: '14%', width: '42%', height: 'auto', transform: 'rotate(-6deg)', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.18))' }} />
            <Image src="/images/prod-totebag.png" alt="Tote bag" width={160} height={160}
              style={{ position: 'absolute', left: '44%', top: '10%', width: '28%', height: 'auto', transform: 'rotate(8deg)', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.18))' }} />
            <Image src="/images/prod-gourde.png" alt="Gourde" width={120} height={120}
              style={{ position: 'absolute', left: '56%', top: '22%', width: '22%', height: 'auto', transform: 'rotate(-4deg)', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.18))' }} />
          </div>
        </div>

        {/* Colonne droite — basket-copy */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontStyle: 'italic',
            fontSize: 'clamp(28px, 3vw, 42px)', lineHeight: 1.05,
            textTransform: 'uppercase', letterSpacing: '-0.01em',
            color: 'var(--ink)', margin: '0 0 14px',
          }}>
            INTERRÉSSÉ PAR LEURS<br />PRODUCTIONS ?
          </h3>
          <p style={{ fontStyle: 'italic', fontSize: 13, color: 'var(--ink)', opacity: 0.65, margin: '0 0 18px' }}>
            *N&apos;hésitez pas à les soutenir en regardant le shop
          </p>
          <Link href={`/${locale}/shop`} style={{
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
            VOIR LE SHOP
            <span style={{ display: 'inline-flex', width: 18, height: 14 }}>
              <svg viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                <path d="M2 8h19M14 1l7 7-7 7"/>
              </svg>
            </span>
          </Link>
        </div>
      </section>

      {/* section-divider */}
      <hr style={{ border: 'none', borderTop: '1px solid #e6e6e6', margin: '60px 0' }} />

      {/* ── MEET THE TEAM — exact du dossier BDE_site ── */}
      <section style={{ textAlign: 'center', padding: '30px 0 60px' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 'clamp(36px, 4.2vw, 56px)',
          letterSpacing: '-0.02em',
          textTransform: 'uppercase',
          color: 'var(--ink)',
          margin: '0 0 36px',
          textAlign: 'left',
        }}>
          MEET THE TEAM
        </h2>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 80, alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* Louison */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            <div style={{ width: 150, height: 170, overflow: 'visible', background: 'transparent', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/team-louison.png" alt="Louison" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
            </div>
            <div style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22,
              textTransform: 'uppercase', padding: '8px 14px 10px', letterSpacing: '0.02em',
              color: 'var(--ink)', marginTop: -12,
              background: 'var(--blue-strong)', transform: 'rotate(-4deg)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            }}>LOUISON</div>
          </div>

          {/* Benji */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            <div style={{ width: 150, height: 170, overflow: 'visible', background: 'transparent', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/team-benji.png" alt="Benji" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
            </div>
            <div style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22,
              textTransform: 'uppercase', padding: '8px 14px 10px', letterSpacing: '0.02em',
              color: 'var(--ink)', marginTop: -12,
              background: 'var(--pink)', transform: 'rotate(3deg)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            }}>BENJI</div>
          </div>

          {/* Achille */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            <div style={{ width: 150, height: 170, overflow: 'visible', background: 'transparent', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/team-achille.png" alt="Achille" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
            </div>
            <div style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22,
              textTransform: 'uppercase', padding: '8px 14px 10px', letterSpacing: '0.02em',
              color: 'var(--ink)', marginTop: -12,
              background: 'var(--yellow)', transform: 'rotate(-2deg)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            }}>ACHILLE</div>
          </div>

        </div>
      </section>

      </main>{/* fin main padding: 0 40px */}

      <SiteFooter categories={categories} />
    </>
  )
}

