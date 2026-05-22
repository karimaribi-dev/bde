import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Article, Category } from '@/lib/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import NavbarClient from '@/components/NavbarClient'
import SiteFooter from '@/components/SiteFooter'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

function formatDate(dateStr: string | null) {
  if (!dateStr) return ''
  return format(new Date(dateStr), 'dd.MM.yyyy', { locale: fr })
}

export default async function CategoryPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const supabase = await createClient()
  const tNav = await getTranslations({ locale, namespace: 'nav' })
  const tHome = await getTranslations({ locale, namespace: 'home' })

  const navLabels = {
    home: tNav('home'),
    contact: tNav('contact'),
    search_placeholder: tNav('search_placeholder'),
    no_results: tNav('no_results'),
  }

  const [{ data: category }, { data: allCategories }, { data: marqueeRaw }] = await Promise.all([
    supabase.from('categories').select('*').eq('slug', slug).single(),
    supabase.from('categories').select('*').order('sort_order').order('name'),
    supabase.from('articles').select('id, title, slug').eq('status', 'published').eq('locale', locale).lte('published_at', new Date().toISOString()).order('published_at', { ascending: false }).limit(6),
  ])

  const marqueeArts = (marqueeRaw ?? []) as { id: string; title: string; slug: string }[]

  if (!category) notFound()

  // Step 1: get article IDs linked via junction table
  const { data: junctionData } = await supabase
    .from('article_categories')
    .select('article_id')
    .eq('category_id', category.id)

  const extraIds = (junctionData ?? []).map((j: { article_id: string }) => j.article_id)

  // Step 2: fetch articles matching either primary or junction category, filtered by locale
  let artQuery = supabase
    .from('articles')
    .select('*, category:categories!category_id(id, name, slug)')
    .eq('status', 'published')
    .eq('locale', locale)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })

  if (extraIds.length > 0) {
    artQuery = artQuery.or(`category_id.eq.${category.id},id.in.(${extraIds.join(',')})`)
  } else {
    artQuery = artQuery.eq('category_id', category.id)
  }

  const { data: articles } = await artQuery

  const cats = (allCategories ?? []) as Category[]
  const arts = (articles ?? []) as (Article & { category: Category | null })[]

  return (
    <>
      {/* Navbar */}
      <NavbarClient categories={cats} activeSlug={slug} withSearch locale={locale} labels={navLabels} />

      {/* Marquee */}
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

      {/* Category header */}
      <div className="c-cat-header" style={{ padding: '48px 28px 32px', borderBottom: 'var(--hair)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--mute)', marginBottom: 12 }}>
          <Link href="/" style={{ color: 'var(--mute)' }}>{tNav('home')}</Link>
          <span style={{ padding: '0 10px', opacity: .5 }}>/</span>
          <span>{category.name}</span>
        </div>
        <h1 style={{ fontSize: 72, lineHeight: .92, letterSpacing: '-.025em', fontWeight: 700, margin: '0 0 16px' }}>
          {category.name.toUpperCase()}.
        </h1>
        {category.description && (
          <p style={{ fontSize: 18, lineHeight: 1.5, color: 'var(--ink-2)', maxWidth: '60ch', margin: 0 }}>
            {category.description}
          </p>
        )}
      </div>

      {/* Articles grid */}
      {arts.length > 0 ? (
        <section className="c-cat-grid" style={{ borderBottom: 'var(--hair)' }}>
          {arts.map((art, i) => (
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
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '.18em', textTransform: 'uppercase' }}>
                  {category.name}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '.18em', color: 'var(--mute)', textTransform: 'uppercase' }}>
                  {formatDate(art.published_at)}
                </span>
              </div>
              <div style={{ aspectRatio: '16/10', background: 'var(--ink)', position: 'relative', overflow: 'hidden' }} className="photo">
                {art.cover_image_url && (
                  <Image
                    src={art.cover_image_url}
                    alt={art.title}
                    fill
                    sizes="(max-width: 720px) 100vw, (max-width: 900px) 50vw, 33vw"
                    style={{ objectFit: 'cover', filter: 'grayscale(1) contrast(1.04) brightness(.72)' }}
                  />
                )}
                <span style={{ position: 'absolute', top: 10, left: 10, fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '.18em', color: 'rgba(243,239,230,.7)', textTransform: 'uppercase', zIndex: 2 }}>
                  A.{String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <h2 style={{ fontSize: 22, lineHeight: 1.08, letterSpacing: '-.01em', fontWeight: 700, margin: 0 }}>
                {art.title}
              </h2>
              {art.excerpt && (
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink-2)' }}>{art.excerpt}</p>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 'auto', paddingTop: 10, borderTop: 'var(--hair-mute)' }}>
                <span className="lire">{tHome('read_more')} <span>→</span></span>
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <div style={{ padding: '80px 28px', textAlign: 'center', borderBottom: 'var(--hair)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--mute)' }}>
          {tHome('no_articles')}
        </div>
      )}

      <SiteFooter categories={cats} />
    </>
  )
}
