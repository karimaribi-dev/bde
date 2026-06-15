'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Article, Category, Club, Event } from '@/lib/types'
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
  return <NavbarClient categories={categories} locale={locale} labels={labels} />
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
  const isEn = locale === 'en'
  const t = useTranslations('home')
  const tNav = useTranslations('nav')
  type ArticleWithCat = Article & { category: Category | null }

  interface TeamMember { id: string; name: string; badge_color: string; photo_url: string | null; sort_order: number }
  const FALLBACK_MEMBERS: TeamMember[] = [
    { id: '1', name: 'LOUISON', badge_color: '#4FA3FF', photo_url: null, sort_order: 1 },
    { id: '2', name: 'BENJI',   badge_color: '#FFB3F0', photo_url: null, sort_order: 2 },
    { id: '3', name: 'ACHILLE', badge_color: '#FFE74A', photo_url: null, sort_order: 3 },
  ]

  const [featured, setFeatured] = useState<ArticleWithCat | null>(null)
  const [latest, setLatest] = useState<ArticleWithCat[]>([])
  const [grid, setGrid] = useState<ArticleWithCat[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [dbEvents, setDbEvents] = useState<Event[]>([])
  const [homeClubs, setHomeClubs] = useState<Club[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(FALLBACK_MEMBERS)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const supabaseRef = useRef<ReturnType<typeof import('@/lib/supabase/client').createClient> | null>(null)

  const navLabels = {
    home: tNav('home'),
    contact: tNav('contact'),
    search_placeholder: tNav('search_placeholder'),
    no_results: tNav('no_results'),
    tagline: tNav('tagline'),
  }

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 720)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Initial load
  useEffect(() => {
    async function load() {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      supabaseRef.current = supabase

      const today = new Date().toISOString().slice(0, 10)
      const [{ data: arts }, { data: cats }, { data: evts }, { data: team }] = await Promise.all([
        supabase
          .from('articles')
          .select('*, category:categories!category_id(id, name, slug)')
          .eq('status', 'published')
          .eq('locale', locale)
          .lte('published_at', new Date().toISOString())
          .order('published_at', { ascending: false })
          .range(0, 6 + PAGE_SIZE),
        supabase.from('categories').select('*').order('name'),
        supabase
          .from('events')
          .select('*')
          .eq('is_published', true)
          .gte('event_date', today)
          .order('event_date', { ascending: true }),
        supabase.from('team_members').select('*').order('sort_order', { ascending: true }),
      ])
      const { data: clubsData } = await supabase
        .from('clubs').select('*').eq('is_published', true)
        .order('sort_order', { ascending: true }).limit(3)
      const all = (arts ?? []) as ArticleWithCat[]
      setFeatured(all[0] ?? null)
      setLatest(all.slice(1, 6))
      // La grille commence après le featured (1) + les 5 articles de la sidebar (5) = index 6
      const firstGrid = all.slice(6, 6 + PAGE_SIZE)
      setGrid(firstGrid)
      setOffset(6 + PAGE_SIZE)
      setHasMore(all.length > 6 + PAGE_SIZE)
      setCategories(cats ?? [])
      setDbEvents((evts ?? []) as Event[])
      if (team && team.length > 0) setTeamMembers(team as TeamMember[])
      setHomeClubs((clubsData ?? []) as Club[])
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

  /* Couleurs fixes par club (matchées par slug) */
  const CLUB_COLORS: Record<string, { bg: string; text: string }> = {
    typo:  { bg: '#FF5500', text: '#FFFFFA' },
    photo: { bg: '#5FA0FB', text: '#262626' },
    print: { bg: '#FF88E8', text: '#262626' },
  }
  function applyClubColor(club: Club): Club {
    const key = Object.keys(CLUB_COLORS).find(k => club.slug?.toLowerCase().includes(k) || club.title?.toLowerCase().includes(k))
    if (!key) return club
    return { ...club, accent_color: CLUB_COLORS[key].bg, accent_text_color: CLUB_COLORS[key].text }
  }
  const c0 = homeClubs[0] ? applyClubColor(homeClubs[0]) : null
  const c1 = homeClubs[1] ? applyClubColor(homeClubs[1]) : null
  const c2 = homeClubs[2] ? applyClubColor(homeClubs[2]) : null
  const clubSchedule = (c: Club) => {
    const freq  = (isEn && c.frequency_en) ? c.frequency_en : c.frequency
    const sched = (isEn && c.schedule_en)  ? c.schedule_en  : c.schedule
    return [freq, sched].filter(Boolean).join(' - ')
  }
  const c2tagline    = c2 ? ((isEn && c2.tagline_en)     ? c2.tagline_en     : c2.tagline)     : null
  const c2taglineSub = c2 ? ((isEn && c2.tagline_sub_en) ? c2.tagline_sub_en : c2.tagline_sub) : null

  return (
    <>
      <SiteHeader categories={categories} locale={locale} labels={navLabels} />

      {/* ── Articles marquee — pleine largeur, hors du padding main ── */}
      <Marquee articles={allArticles} />

      {/* ── MAIN ── */}
      <main className="home-main" style={{ padding: '0 clamp(16px, 5.5vw, 80px)' }}>

      {/* ── Hero BDE ── */}
      <section style={{ padding: '24px 0 36px', position: 'relative' }}>

        {/* ── Hero Desktop ── */}
        {!isMobile && (
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(90px, 15.5vw, 224px)',
            fontWeight: 800,
            lineHeight: 0.86,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            margin: 0,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            columnGap: 'clamp(20px, 3vw, 60px)',
          }}>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <span>MAKE</span>
              <span aria-hidden="true" style={{ display: 'block', height: '0.86em' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/smiley-handdrawn.svg" alt="" className="smiley-img" style={{ width: '0.86em', height: '0.86em', display: 'block' }} />
              </span>
              <span>ALIVE</span>
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 0, textAlign: 'right' }}>
              <span>THE</span>
              <span style={{ position: 'relative', display: 'inline-block' }}>
                <span aria-hidden="true" style={{ position: 'absolute', right: '-5%', top: '-10%', width: '45%', pointerEvents: 'none', zIndex: 0 }}>
                  <svg viewBox="0 0 142 142" fill="#FEEF4C" style={{ width: '100%', height: '100%' }}>
                    <path d="M 33.516 62.621 L 0 33.516 L 33.516 71.882 L 0 116.863 L 50.273 82.025 L 64.385 142 L 70.559 82.025 L 142 103.634 L 93.05 71.882 L 118.627 46.745 L 70.559 46.745 L 70.559 11.025 L 50.273 46.745 L 26.901 0 L 33.516 62.621 Z"/>
                  </svg>
                </span>
                <span style={{ position: 'relative', zIndex: 1, color: 'var(--orange-deep)' }}>CAMPUS</span>
              </span>
            </span>
          </h1>
        )}

        {/* ── Hero Mobile ── */}
        {isMobile && (
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 13vw, 120px)',
            fontWeight: 800,
            lineHeight: 0.88,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.06em',
          }}>
            {/* Row 1 : MAKE   THE */}
            <span style={{ display: 'flex', gap: '0.22em' }}>
              <span>MAKE</span>
              <span>THE</span>
            </span>
            {/* Row 2 : smiley + CAMPUS */}
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.08em' }}>
              <span aria-hidden="true" style={{ display: 'inline-flex', width: '0.75em', height: '0.75em', flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/smiley-handdrawn.svg" alt="" className="smiley-img" style={{ width: '100%', height: '100%' }} />
              </span>
              <span style={{ position: 'relative', display: 'inline-block' }}>
                <span aria-hidden="true" style={{ position: 'absolute', right: '-8%', top: '-15%', width: '42%', pointerEvents: 'none', zIndex: 0 }}>
                  <svg viewBox="0 0 142 142" fill="#FEEF4C" style={{ width: '100%', height: '100%' }}>
                    <path d="M 33.516 62.621 L 0 33.516 L 33.516 71.882 L 0 116.863 L 50.273 82.025 L 64.385 142 L 70.559 82.025 L 142 103.634 L 93.05 71.882 L 118.627 46.745 L 70.559 46.745 L 70.559 11.025 L 50.273 46.745 L 26.901 0 L 33.516 62.621 Z"/>
                  </svg>
                </span>
                <span style={{ position: 'relative', zIndex: 1, color: 'var(--orange-deep)' }}>CAMPUS</span>
              </span>
            </span>
            {/* Row 3 : ALIVE */}
            <span>ALIVE</span>
          </h1>
        )}

      </section>

      {/* ── PROCHAINEMENT bar ── */}
      <div className="home-soon" style={{
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

      {/* ── Event cards — scroll horizontal ── */}
      {dbEvents.length > 0 && (
        <div className="home-events" style={{
          display: 'flex',
          gap: 22,
          margin: '6px -40px 0',
          padding: '0 40px',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}>
          {dbEvents.map(ev => (
            <Link
              key={ev.id}
              href={`/${locale}/agenda/${ev.slug}`}
              className="home-event-card"
              style={{
                flex: isMobile ? '0 0 82vw' : '0 0 calc(33.333% - 15px)',
                position: 'relative',
                overflow: 'hidden',
                aspectRatio: '7/6',
                background: '#ddd',
                display: 'block',
                textDecoration: 'none',
                color: 'inherit',
                scrollSnapAlign: 'start',
              }}
            >
              {ev.image_url && (
                <Image src={ev.image_url} alt={ev.title} fill sizes="33vw" style={{ objectFit: 'cover' }} />
              )}
              {/* Badge */}
              <div style={{
                position: 'absolute', top: 12, left: 12,
                background: ev.badge_color, color: ev.badge_text_color,
                padding: '6px 14px 7px',
                fontFamily: 'var(--font-display)', fontSize: 13,
                fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '0.02em',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}>
                {ev.badge}
              </div>
              {/* Info panel bas */}
              <div className="event-card-body" style={{
                position: 'absolute', bottom: 12, left: 12, right: 12,
                background: '#fff', padding: '12px 14px 14px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}>
                <div style={{
                  fontFamily: '"neue-haas-grotesk-display", sans-serif',
                  fontWeight: 700,
                  fontStyle: 'italic',
                  fontSize: 26,
                  textTransform: 'uppercase',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.1,
                  textAlign: 'center',
                  color: 'var(--ink)',
                }}>
                  {ev.title}
                </div>
                <div style={{
                  fontSize: 12, display: 'flex', gap: 14,
                  justifyContent: 'center', marginTop: 4,
                  color: 'var(--ink)', opacity: 0.85,
                }}>
                  <span>○ {format(new Date(ev.event_date), "EEEE d MMM", { locale: fr })}</span>
                  {ev.event_time && <span>○ {ev.event_time}</span>}
                  <span>○ {ev.price}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ── Events footer ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginTop: 18, marginBottom: isMobile ? 40 : 60 }}>
        <span style={{ fontStyle: 'italic', fontSize: 14, color: 'var(--ink)', opacity: 0.7 }}>
          {isEn ? '*Feel free to scroll for more events' : "*N’hésitez pas à slider pour plus d’event"}
        </span>
        {isMobile ? (
          /* Flèche bold sur mobile */
          <Link href={`/${locale}/agenda`} aria-label="Voir tous les événements" style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none', flexShrink: 0,
          }}>
            <svg viewBox="0 0 58 58" fill="var(--yellow)" style={{ width: 44, height: 44 }}>
              <path d="M-8.15183e-05 32.25L43.6091 32.25L23.5782 52.2808L28.6666 57.3333L57.3333 28.6667L28.6666 -1.25306e-06L23.6141 5.0525L43.6091 25.0833L-8.12051e-05 25.0833L-8.15183e-05 32.25Z"/>
            </svg>
          </Link>
        ) : (
          /* Bouton complet sur desktop */
          <Link href={`/${locale}/agenda`} style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            background: 'var(--yellow)', color: 'var(--ink)',
            padding: '11px 24px', borderRadius: 999,
            fontWeight: 700, fontSize: 20, letterSpacing: '.08em', textTransform: 'uppercase',
            whiteSpace: 'nowrap', textDecoration: 'none',
          }}>
            {isEn ? 'SEE ALL EVENTS' : 'VOIR TOUS LES ÉVENEMENTS'}
            <svg viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 14 }}>
              <path d="M2 8h19M14 1l7 7-7 7"/>
            </svg>
          </Link>
        )}
      </div>

      {/* section-divider — CDC masquée temporairement */}
      {/* ── VOTE POUR TON COUP DE CŒUR DU MOIS — masqué, à produire plus tard ── */}
      {false && <section style={{ padding: '6px 0 12px' }}>

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
            fontWeight: 700, fontSize: 20, letterSpacing: '.08em', textTransform: 'uppercase',
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
      </section>}

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
            {isEn ? <>OUR CLUBS JUST<br />FOR YOU</> : <>NOS CLUBS JUSTE<br />POUR VOUS</>}
          </h2>
          {/* Flèche bouclée jaune — exactement celle du dossier */}
          <span style={{ display: 'inline-flex', width: 60, height: 80, marginBottom: -6, flexShrink: 0 }}>
            <svg viewBox="0 0 60 80" fill="none" stroke="#FEEF4C" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
              <path d="M10 8 C 30 30, 35 50, 30 70"/>
              <path d="M20 60 L 30 72 L 42 58"/>
            </svg>
          </span>
        </div>

        {/* Blocs clubs */}
        {c0 && (
          <div className="home-clubs-wrap" style={{ position: 'relative', width: '100%' }}>

            {/* Bloc 1 — flèche gauche */}
            <div style={{
              position: 'relative',
              background: c0.accent_color,
              color: c0.accent_text_color,
              width: '53%',
              height: 'clamp(100px, 14vw, 180px)',
              clipPath: 'polygon(0 0, calc(100% - clamp(55px, 8vw, 100px)) 0, 100% 50%, calc(100% - clamp(55px, 8vw, 100px)) 100%, 0 100%)',
              padding: 'clamp(14px, 2vw, 28px) clamp(65px, 8.5vw, 110px) clamp(14px, 2vw, 28px) clamp(18px, 3vw, 40px)',
              zIndex: 3,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 2,
            }}>
              <div style={{ fontFamily: '"neue-haas-grotesk-display", sans-serif', fontWeight: 700, fontSize: 'clamp(22px, 5.8vw, 76px)', lineHeight: 1, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>{c0.title}</div>
              {clubSchedule(c0) && <div style={{ fontFamily: '"new-atten", sans-serif', fontWeight: 400, fontSize: 'clamp(13px, 2.8vw, 36px)', opacity: 0.9 }}>{clubSchedule(c0)}</div>}
            </div>

            {/* Bloc 2 — flèche droite */}
            {c1 && (
              <div style={{
                position: 'absolute',
                top: 'clamp(50px, 7vw, 90px)',
                right: 0,
                background: c1.accent_color,
                color: c1.accent_text_color,
                width: 'calc(47% + clamp(55px, 8vw, 100px))',
                height: 'clamp(100px, 14vw, 180px)',
                clipPath: 'polygon(clamp(55px, 8vw, 100px) 0, 100% 0, 100% 100%, clamp(55px, 8vw, 100px) 100%, 0 50%)',
                padding: 'clamp(14px, 2vw, 28px) clamp(18px, 3vw, 40px) clamp(14px, 2vw, 28px) clamp(70px, 9.5vw, 130px)',
                textAlign: 'right',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'center',
                gap: 2,
                zIndex: 4,
              }}>
                <div style={{ fontFamily: '"neue-haas-grotesk-display", sans-serif', fontWeight: 700, fontSize: 'clamp(22px, 5.8vw, 76px)', lineHeight: 1, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>{c1.title}</div>
                {clubSchedule(c1) && <div style={{ fontFamily: '"new-atten", sans-serif', fontWeight: 400, fontSize: 'clamp(13px, 2.8vw, 36px)', opacity: 0.9 }}>{clubSchedule(c1)}</div>}
              </div>
            )}

            {/* Bloc 3 — pleine largeur */}
            {c2 && (
              <div style={{
                position: 'relative',
                background: c2.accent_color,
                color: c2.accent_text_color,
                width: '100%',
                minHeight: 'clamp(160px, 22vw, 290px)',
                marginTop: 0,
                padding: 'clamp(14px, 2.5vw, 30px) clamp(18px, 3vw, 40px) clamp(50px, 6vw, 60px)',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                gap: 2,
              }}>
                <div style={{ fontFamily: '"neue-haas-grotesk-display", sans-serif', fontWeight: 700, fontSize: 'clamp(22px, 5.8vw, 76px)', lineHeight: 1, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>{c2.title}</div>
                {clubSchedule(c2) && <div style={{ fontFamily: '"new-atten", sans-serif', fontWeight: 400, fontSize: 'clamp(13px, 2.8vw, 36px)', opacity: 0.9 }}>{clubSchedule(c2)}</div>}
                {(c2tagline || c2taglineSub) && (
                  <div style={{ position: 'absolute', bottom: 14, left: 'clamp(18px, 3vw, 36px)', fontSize: 'clamp(13px, 2vw, 24px)', lineHeight: 1.3, color: c2.accent_text_color }}>
                    {c2tagline && <div>{c2tagline}</div>}
                    {c2taglineSub && <div>{c2taglineSub}</div>}
                  </div>
                )}
                <Link href={`/${locale}/clubs`} aria-label="Découvrir les clubs"
                  style={{ position: 'absolute', bottom: 18, right: 'clamp(18px, 3vw, 36px)', width: 'clamp(28px, 3.5vw, 44px)', height: 'clamp(28px, 3.5vw, 44px)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: c2.accent_text_color, textDecoration: 'none' }}>
                  <svg viewBox="0 0 58 58" fill="currentColor" style={{ width: '100%', height: '100%' }}>
                    <path d="M-8.15183e-05 32.25L43.6091 32.25L23.5782 52.2808L28.6666 57.3333L57.3333 28.6667L28.6666 -1.25306e-06L23.6141 5.0525L43.6091 25.0833L-8.12051e-05 25.0833L-8.15183e-05 32.25Z"/>
                  </svg>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* CTA — btn pill exact du dossier */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22 }}>
          <Link href={`/${locale}/clubs`} style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            background: 'var(--yellow)', color: 'var(--ink)',
            padding: '11px 24px', borderRadius: 999,
            fontWeight: 700, fontSize: 20, letterSpacing: '.08em', textTransform: 'uppercase',
            whiteSpace: 'nowrap', textDecoration: 'none',
            transition: 'transform .12s, background .15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--yellow-deep)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--yellow)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            {isEn ? 'LEARN MORE' : 'EN SAVOIR PLUS'}
            <span style={{ display: 'inline-flex', width: 18, height: 14 }}>
              <svg viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                <path d="M2 8h19M14 1l7 7-7 7"/>
              </svg>
            </span>
          </Link>
        </div>
      </section>

      {/* section-divider */}
      <hr style={{ border: 'none', borderTop: '1px solid #e6e6e6', margin: isMobile ? '40px 0' : '60px 0' }} />

      {/* ── INTÉRESSÉ PAR LEURS PRODUCTIONS ? ── */}
      {isMobile ? (
        /* ── Mobile shop section ── */
        <section style={{ padding: '20px 0' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(24px, 7vw, 32px)', lineHeight: 1.05, textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--ink)', margin: '0 0 8px' }}>
            {isEn ? <>INTERESTED IN THEIR<br />PRODUCTIONS?</> : <>INTÉRESSÉ PAR LEURS<br />PRODUCTIONS ?</>}
          </h3>
          <p style={{ fontStyle: 'italic', fontSize: 13, color: 'var(--ink)', opacity: 0.65, margin: '0 0 16px' }}>
            {isEn ? '*Feel free to support them by checking out the shop' : "*N'hésitez pas à les soutenir en regardant le shop"}
          </p>
          {/* Image */}
          <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', marginBottom: 16 }}>
            <Image src="/images/basket.png" alt="" fill style={{ objectFit: 'contain' }} sizes="100vw" />
            <Image src="/images/prod-tshirt.png" alt="T-shirt" width={200} height={200} style={{ position: 'absolute', left: '18%', top: '14%', width: '42%', height: 'auto', transform: 'rotate(-6deg)', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.18))' }} />
            <Image src="/images/prod-totebag.png" alt="Tote bag" width={160} height={160} style={{ position: 'absolute', left: '44%', top: '10%', width: '28%', height: 'auto', transform: 'rotate(8deg)', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.18))' }} />
            <Image src="/images/prod-gourde.png" alt="Gourde" width={120} height={120} style={{ position: 'absolute', left: '56%', top: '22%', width: '22%', height: 'auto', transform: 'rotate(-4deg)', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.18))' }} />
          </div>
          {/* Bouton à droite */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Link href={`/${locale}/shop`} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'var(--yellow)', color: 'var(--ink)', padding: '11px 22px', borderRadius: 999, fontWeight: 700, fontSize: 20, letterSpacing: '.08em', textTransform: 'uppercase', textDecoration: 'none' }}>
              {isEn ? 'SEE THE SHOP' : 'VOIR LE SHOP'}
              <svg viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 14 }}>
                <path d="M2 8h19M14 1l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </section>
      ) : (
        /* ── Desktop shop section ── */
        <section style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', alignItems: 'center', gap: 60, padding: '24px 0', position: 'relative' }}>
          <span aria-hidden="true" style={{ position: 'absolute', top: '5%', right: '4%', width: '38%', height: '70%', transform: 'rotate(-12deg)', zIndex: 0, pointerEvents: 'none', display: 'inline-flex' }}>
            <svg viewBox="0 0 142 142" fill="#FEEF4C" style={{ width: '100%', height: '100%' }}>
              <path d="M 33.516 62.621 L 0 33.516 L 33.516 71.882 L 0 116.863 L 50.273 82.025 L 64.385 142 L 70.559 82.025 L 142 103.634 L 93.05 71.882 L 118.627 46.745 L 70.559 46.745 L 70.559 11.025 L 50.273 46.745 L 26.901 0 L 33.516 62.621 Z"/>
            </svg>
          </span>
          <div style={{ position: 'relative', width: '100%', zIndex: 2 }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3' }}>
              <Image src="/images/basket.png" alt="" fill style={{ objectFit: 'contain' }} sizes="50vw" />
              <Image src="/images/prod-tshirt.png" alt="T-shirt" width={200} height={200} style={{ position: 'absolute', left: '18%', top: '14%', width: '42%', height: 'auto', transform: 'rotate(-6deg)', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.18))' }} />
              <Image src="/images/prod-totebag.png" alt="Tote bag" width={160} height={160} style={{ position: 'absolute', left: '44%', top: '10%', width: '28%', height: 'auto', transform: 'rotate(8deg)', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.18))' }} />
              <Image src="/images/prod-gourde.png" alt="Gourde" width={120} height={120} style={{ position: 'absolute', left: '56%', top: '22%', width: '22%', height: 'auto', transform: 'rotate(-4deg)', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.18))' }} />
            </div>
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(28px, 3vw, 42px)', lineHeight: 1.05, textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--ink)', margin: '0 0 14px' }}>
              {isEn ? <>INTERESTED IN THEIR<br />PRODUCTIONS?</> : <>INTÉRESSÉ PAR LEURS<br />PRODUCTIONS ?</>}
            </h3>
            <p style={{ fontStyle: 'italic', fontSize: 13, color: 'var(--ink)', opacity: 0.65, margin: '0 0 18px' }}>
              {isEn ? '*Feel free to support them by checking out the shop' : "*N'hésitez pas à les soutenir en regardant le shop"}
            </p>
            <Link href={`/${locale}/shop`} style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'var(--yellow)', color: 'var(--ink)', padding: '11px 24px', borderRadius: 999, fontWeight: 700, fontSize: 20, letterSpacing: '.08em', textTransform: 'uppercase', whiteSpace: 'nowrap', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--yellow-deep)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--yellow)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {isEn ? 'SEE THE SHOP' : 'VOIR LE SHOP'}
              <svg viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 14 }}>
                <path d="M2 8h19M14 1l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </section>
      )}

      {/* section-divider */}
      <hr style={{ border: 'none', borderTop: '1px solid #e6e6e6', margin: isMobile ? '40px 0' : '60px 0' }} />

      {/* ── MEET THE TEAM ── */}
      <section style={{ textAlign: 'center', padding: isMobile ? '20px 0 40px' : '30px 0 60px' }}>
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

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: isMobile ? 'clamp(16px, 5vw, 32px)' : 'clamp(40px, 8vw, 110px)',
          alignItems: 'flex-end',
          flexWrap: 'nowrap',
        }}>
          {(() => {
            const ROTATIONS = [-2, 1.5, -1, 2.5, -1.5, 1, -2.5, 2]
            return teamMembers.map((member, idx) => {
              const rot = ROTATIONS[idx % ROTATIONS.length]
              return (
                <div key={member.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                  {/* Photo circulaire */}
                  <div style={{
                    width: isMobile ? 'clamp(80px, 26vw, 110px)' : 'clamp(130px, 13vw, 190px)',
                    height: isMobile ? 'clamp(88px, 28vw, 120px)' : 'clamp(150px, 15vw, 210px)',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: '#f0f0f0',
                    position: 'relative',
                  }}>
                    {member.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.photo_url}
                        alt={member.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 48, opacity: 0.2 }}>👤</span>
                      </div>
                    )}
                  </div>
                  {/* Badge nom */}
                  <div style={{
                    background: member.badge_color,
                    color: 'var(--ink)',
                    fontFamily: 'var(--font-display)',
                    fontStyle: 'italic',
                    fontWeight: 900,
                    fontSize: isMobile ? 'clamp(10px, 3vw, 13px)' : 'clamp(12px, 1.1vw, 16px)',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    padding: isMobile ? '3px 8px 4px' : '5px 14px 6px',
                    marginTop: -4,
                    zIndex: 1,
                    position: 'relative',
                    transform: `rotate(${rot}deg)`,
                  }}>
                    {member.name}
                  </div>
                </div>
              )
            })
          })()}
        </div>
      </section>

      </main>{/* fin main padding: 0 40px */}

      <SiteFooter categories={categories} />
    </>
  )
}

