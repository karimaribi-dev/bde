import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Category } from '@/lib/types'
import { getCategoryName } from '@/lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import NavbarClient from '@/components/NavbarClient'
import SiteFooter from '@/components/SiteFooter'
import AdSlot from '@/components/AdSlot'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

function formatDate(dateStr: string | null) {
  if (!dateStr) return ''
  return format(new Date(dateStr), 'dd.MM.yyyy', { locale: fr })
}

export default async function ArticlePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const supabase = await createClient()
  const tNav = await getTranslations({ locale, namespace: 'nav' })
  const tHome = await getTranslations({ locale, namespace: 'home' })
  const tArticle = await getTranslations({ locale, namespace: 'article' })

  const navLabels = {
    home: tNav('home'),
    contact: tNav('contact'),
    search_placeholder: tNav('search_placeholder'),
    no_results: tNav('no_results'),
    tagline: tNav('tagline'),
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [{ data: article }, { data: relatedRaw }, { data: allCats }, { data: marqueeRaw }] = await Promise.all([
    supabase
      .from('articles')
      .select('*, category:categories!category_id(id, name, slug)')
      .eq('slug', slug)
      .eq('status', 'published')
      .eq('locale', locale)
      .lte('published_at', new Date().toISOString())
      .single(),
    supabase
      .from('articles')
      .select('id, title, slug, published_at, cover_image_url, category:categories(id, name, slug)')
      .eq('status', 'published')
      .eq('locale', locale)
      .lte('published_at', new Date().toISOString())
      .neq('slug', slug)
      .order('published_at', { ascending: false })
      .limit(4),
    supabase.from('categories').select('*').order('sort_order').order('name'),
    supabase.from('articles').select('id, title, slug').eq('status', 'published').eq('locale', locale).lte('published_at', new Date().toISOString()).order('published_at', { ascending: false }).limit(6),
  ])

  const marqueeArts = (marqueeRaw ?? []) as { id: string; title: string; slug: string }[]

  const cats = (allCats ?? []) as Category[]

  type RelatedArticle = { id: string; title: string; slug: string; published_at: string | null; cover_image_url: string | null; category: Category | null }
  // Supabase returns category as array from join, normalize to single object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const related: RelatedArticle[] = ((relatedRaw ?? []) as any[]).map((r: any) => ({
    ...r,
    category: Array.isArray(r.category) ? (r.category[0] ?? null) : r.category,
  }))

  if (!article) notFound()

  const articleCategory = article.category as Category | null
  const categoryName = getCategoryName(articleCategory, locale)
  const categorySlug = articleCategory?.slug ?? ''

  return (
    <>
      {/* ── Navbar ── */}
      <NavbarClient categories={cats} activeSlug={categorySlug} withSearch locale={locale} labels={navLabels} />

      {/* ── Marquee ── */}
      <div className="marquee">
        <div className="marquee-track">
          {[...marqueeArts, ...marqueeArts].map((art, i) => (
            <span key={i} style={{ display: 'contents' }}>
              <Link href={`/articles/${art.slug}`}>{art.title.toUpperCase()}</Link>
              <span className="diamond">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Breadcrumb ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 28px', borderBottom: 'var(--hair-mute)', fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--mute)' }}>
        <div>
          <Link href="/" style={{ color: 'var(--mute)' }}>{tNav('home')}</Link>
          <span style={{ padding: '0 10px', opacity: .5 }}>/</span>
          {categorySlug && <><Link href={`/categorie/${categorySlug}`} style={{ color: 'var(--mute)' }}>{categoryName}</Link><span style={{ padding: '0 10px', opacity: .5 }}>/</span></>}
          <span style={{ color: 'var(--ink)' }}>{article.title.slice(0, 40)}{article.title.length > 40 ? '…' : ''}</span>
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          <span>Mis à jour {formatDate(article.published_at)}</span>
        </div>
      </div>

      {/* ── Article hero ── */}
      <section className="c-art-hero" style={{ borderBottom: 'var(--hair)' }}>
        <div style={{ padding: '48px 64px 36px 28px', borderRight: 'var(--hair)', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {categoryName && (
            <Link href={`/categorie/${categorySlug}`} style={{ display: 'inline-block', fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '.22em', textTransform: 'uppercase', background: 'var(--ink)', color: 'var(--paper)', padding: '6px 10px', width: 'max-content' }}>
              {categoryName}
            </Link>
          )}
          <h1 style={{ fontSize: 72, lineHeight: .96, letterSpacing: '-.025em', fontWeight: 700, margin: '8px 0 6px' }}>
            {article.title}
          </h1>
          {article.excerpt && (
            <p style={{ fontSize: 22, lineHeight: 1.4, color: 'var(--ink-2)', maxWidth: '64ch', margin: 0 }}>{article.excerpt}</p>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: 'var(--hair)', borderBottom: 'var(--hair)', padding: '14px 0', marginTop: 22, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', flexWrap: 'wrap', gap: 12 }}>
            <span>AI Trends News</span>
            <div style={{ display: 'flex', gap: 24, color: 'var(--mute)', flexWrap: 'wrap' }}>
              <span><b style={{ color: 'var(--ink)', fontWeight: 500 }}>{formatDate(article.published_at)}</b></span>
              {categoryName && <span>Section <b style={{ color: 'var(--ink)', fontWeight: 500 }}>{categoryName}</b></span>}
            </div>
          </div>
          {article.cover_image_url && (
            <div style={{ aspectRatio: '21/9', background: 'var(--ink)', position: 'relative', overflow: 'hidden', marginTop: 20 }} className="photo">
              <Image src={article.cover_image_url} alt={(article as { cover_image_alt?: string | null }).cover_image_alt || article.title} fill sizes="(max-width: 1024px) 100vw, calc(100vw - 360px)" style={{ objectFit: 'cover', filter: 'grayscale(1) contrast(1.04) brightness(.72)' }} priority />
              <span style={{ position: 'absolute', top: 14, left: 14, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.18em', color: 'rgba(243,239,230,.7)', textTransform: 'uppercase', zIndex: 2 }}>F.01 · Image principale</span>
              <span style={{ position: 'absolute', top: 14, right: 14, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.18em', color: 'rgba(243,239,230,.7)', textTransform: 'uppercase', zIndex: 2 }}>{categoryName}</span>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside style={{ background: 'var(--paper-2)', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Ad box */}
          <AdSlot slotName="article_top" placeholderLabel="Publicité" placeholderSize="300 × 200 · IAB" style={{ minHeight: 200, background: 'var(--paper)' }} />

          {/* Related articles */}
          {related && related.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.22em', textTransform: 'uppercase', borderBottom: 'var(--hair)', paddingBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{tArticle('related')}</span>
                <span style={{ color: 'var(--mute)' }}>0{related.length}</span>
              </div>
              {related.map((rel) => (
                <Link key={rel.id} href={`/articles/${rel.slug}`} style={{ display: 'grid', gridTemplateColumns: '54px 1fr', gap: 12, alignItems: 'start', padding: '10px 0', borderBottom: 'var(--hair-mute)', textDecoration: 'none' }}>
                  <div style={{ width: 54, height: 54, background: 'var(--ink)', position: 'relative', overflow: 'hidden' }} className="photo">
                    {rel.cover_image_url && (
                      <Image src={rel.cover_image_url} alt={rel.title} fill sizes="54px" style={{ objectFit: 'cover', filter: 'grayscale(1) contrast(1.04) brightness(.72)' }} />
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '.18em', textTransform: 'uppercase' }}>{getCategoryName(rel.category, locale)}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '.18em', color: 'var(--mute)', textTransform: 'uppercase' }}>{formatDate(rel.published_at)}</span>
                    </div>
                    <h6 style={{ margin: 0, fontSize: 13.5, lineHeight: 1.22, letterSpacing: '-.005em', fontWeight: 700 }}>{rel.title}</h6>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Sponsored */}
          <div style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(243,239,230,.55)' }}>— Contenu sponsorisé</span>
            <h5 style={{ margin: 0, fontSize: 18, lineHeight: 1.2, fontWeight: 700 }}>Déployer un agent IA sûr en 30 jours.</h5>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: 'rgba(243,239,230,.75)' }}>Cadre, gouvernance, supervision : un livre blanc gratuit.</p>
            <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid var(--paper)', padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', width: 'max-content', marginTop: 8, color: 'var(--paper)' }}>
              Télécharger →
            </a>
          </div>
        </aside>
      </section>

      {/* ── Article body + sidebar ── */}
      <section className="c-art-body" style={{ borderBottom: 'var(--hair)' }}>
        <article style={{ padding: '56px 64px 56px 28px', borderRight: 'var(--hair)' }}>
          <div className="article-content dropcap" dangerouslySetInnerHTML={{ __html: article.content ?? '' }} />

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 36 }}>
            {categoryName && (
              <Link href={`/categorie/${categorySlug}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '.18em', textTransform: 'uppercase', border: 'var(--hair)', padding: '6px 10px' }}>
                #{categoryName}
              </Link>
            )}
          </div>

          {/* End rule */}
          <div style={{ margin: '32px 0', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.22em', color: 'var(--mute)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ flex: 1, height: 1, background: 'var(--ink)', display: 'block' }} />
            — Fin de l&apos;article —
            <span style={{ flex: 1, height: 1, background: 'var(--ink)', display: 'block' }} />
          </div>

          {/* Share */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', borderTop: 'var(--hair)', borderBottom: 'var(--hair)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', flexWrap: 'wrap', gap: 12 }}>
            <span>Partager cet article</span>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
              <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </a>
              <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                X / Twitter
              </a>
              <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18.5a8.5 8.5 0 1 1 0-17 8.5 8.5 0 0 1 0 17zM8.5 8.5l7 3.5-7 3.5V8.5z"/></svg>
                Bluesky
              </a>
              <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                Instagram
              </a>
            </div>
          </div>

          {/* Back link */}
          <div style={{ marginTop: 32 }}>
            <Link href="/" className="lire">← {tNav('home')}</Link>
          </div>
        </article>

        {/* Sticky sidebar */}
        <aside style={{ background: 'var(--paper-2)', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 24, alignSelf: 'start', position: 'sticky', top: 0 }}>
          <AdSlot slotName="article_top" placeholderLabel="Publicité" placeholderSize="300 × 300 · IAB" style={{ minHeight: 300, background: 'var(--paper)' }} />
          <div style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.22em', textTransform: 'uppercase', borderBottom: '1px solid rgba(243,239,230,.2)', paddingBottom: 10 }}>Newsletter quotidienne</div>
            <h5 style={{ margin: 0, fontSize: 20, lineHeight: 1.2, fontWeight: 700 }}>RESTER DANS LA BOUCLE.</h5>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: 'rgba(243,239,230,.75)' }}>Une veille IA chaque matin, pour ne rien manquer.</p>
            <a href="#newsletter" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid var(--paper)', padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', width: 'max-content', marginTop: 8, color: 'var(--paper)' }}>
              S&apos;inscrire →
            </a>
          </div>
        </aside>
      </section>

      {/* ── More articles ── */}
      {related && related.length > 0 && (
        <section style={{ padding: '48px 28px', borderBottom: 'var(--hair)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, gap: 14, flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, fontSize: 56, lineHeight: .9, letterSpacing: '-.02em', fontWeight: 700 }}>{tArticle('related').toUpperCase()}.</h3>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--mute)' }}>
              <Link href="/" className="lire">Voir tous les articles →</Link>
            </span>
          </div>
          <div className="c-related-grid" style={{ borderTop: 'var(--hair-mute)' }}>
            {related.slice(0, 3).map((rel, i) => (
              <Link key={rel.id} href={`/articles/${rel.slug}`}
                className="hover-card"
                style={{ padding: '24px 24px 22px', borderRight: i < 2 ? 'var(--hair-mute)' : 0, display: 'flex', flexDirection: 'column', gap: 14, cursor: 'pointer', textDecoration: 'none' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '.18em', textTransform: 'uppercase' }}>{getCategoryName(rel.category, locale)}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '.18em', color: 'var(--mute)', textTransform: 'uppercase' }}>{formatDate(rel.published_at)}</span>
                </div>
                <div style={{ aspectRatio: '16/10', background: 'var(--ink)', position: 'relative', overflow: 'hidden' }} className="photo">
                  {rel.cover_image_url && (
                    <Image src={rel.cover_image_url} alt={rel.title} fill sizes="(max-width: 720px) 100vw, (max-width: 1024px) 50vw, 33vw" style={{ objectFit: 'cover', filter: 'grayscale(1) contrast(1.04) brightness(.72)' }} />
                  )}
                </div>
                <h4 style={{ margin: 0, fontSize: 20, lineHeight: 1.1, letterSpacing: '-.005em', fontWeight: 700 }}>{rel.title}</h4>
              </Link>
            ))}
          </div>
        </section>
      )}

      <SiteFooter categories={cats} />
    </>
  )
}
