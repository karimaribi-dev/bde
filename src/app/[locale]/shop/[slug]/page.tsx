import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import NavbarClient from '@/components/NavbarClient'
import SiteFooter from '@/components/SiteFooter'
import AddToCartButton from '@/components/AddToCartButton'
import { Product, Category } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const supabase = await createClient()

  const [{ data: productData }, { data: categories }, { data: othersRaw }] = await Promise.all([
    supabase.from('products').select('*').eq('slug', slug).eq('is_published', true).single(),
    supabase.from('categories').select('*').order('name'),
    supabase.from('products').select('*').eq('is_published', true).neq('slug', slug)
      .order('sort_order', { ascending: true }).limit(4),
  ])

  if (!productData) notFound()

  const product = productData as Product
  const cats    = (categories ?? []) as Category[]
  const others  = (othersRaw  ?? []) as Product[]
  const sold    = product.stock_count === 0

  // Traduction : utilise la version anglaise si dispo et locale === 'en'
  const displayTitle       = (locale === 'en' && product.title_en)       ? product.title_en       : product.title
  const displayDescription = (locale === 'en' && product.description_en) ? product.description_en : product.description

  return (
    <>
      <NavbarClient categories={cats} locale={locale} activeSlug="shop" />

      <main style={{ padding: '0 40px' }}>

        {/* Breadcrumb */}
        <nav style={{ padding: '14px 0 0', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9ca3af' }}>
          <Link href={`/${locale}/shop`} style={{ color: '#9ca3af', textDecoration: 'none' }}>Le Shop</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: 'var(--ink)' }}>{displayTitle}</span>
        </nav>

        {/* ═══════════ HERO ═══════════ */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, margin: '30px 0 60px', alignItems: 'flex-start' }}>

          {/* Photo */}
          <div style={{
            position: 'relative', background: '#fff',
            boxShadow: '0 12px 40px rgba(0,0,0,0.10)',
            padding: 30, aspectRatio: '1/1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {product.image_url ? (
              <div style={{ position: 'relative', width: '80%', height: '80%' }}>
                <Image
                  src={product.image_url}
                  alt={product.title}
                  fill
                  sizes="(max-width:900px) 100vw, 50vw"
                  style={{ objectFit: 'contain', opacity: sold ? 0.45 : 1 }}
                />
              </div>
            ) : (
              <div style={{ width: '80%', height: '80%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 64, opacity: 0.3 }}>📦</span>
              </div>
            )}
            {sold && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{
                  background: '#dc2626', color: '#fff',
                  fontFamily: 'var(--font-display)', fontStyle: 'italic',
                  fontSize: 'clamp(18px, 2vw, 28px)', letterSpacing: '0.06em',
                  textTransform: 'uppercase', padding: '10px 24px',
                  transform: 'rotate(-8deg)',
                }}>
                  ÉPUISÉ
                </span>
              </div>
            )}
          </div>

          {/* Infos produit */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {product.edition && (
              <span style={{
                display: 'inline-block', background: '#FFE74A', color: 'var(--ink)',
                fontFamily: 'var(--font-display)', fontStyle: 'italic',
                fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase',
                padding: '4px 10px', width: 'fit-content',
              }}>
                {product.edition}
              </span>
            )}

            <h1 style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontWeight: 900,
              fontSize: 'clamp(32px, 4vw, 58px)',
              lineHeight: 0.95, letterSpacing: '-0.02em',
              textTransform: 'uppercase', color: 'var(--ink)', margin: 0,
            }}>
              {displayTitle}
            </h1>

            <div style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontWeight: 900, fontSize: 'clamp(28px, 3vw, 46px)', color: 'var(--ink)',
            }}>
              {Number(product.price).toFixed(2)} €
            </div>

            {/* Stock */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: sold ? '#dc2626' : product.stock_count <= 5 ? '#f59e0b' : '#16a34a',
              }} />
              <span style={{ fontSize: 13, color: '#6b7280', fontStyle: 'italic' }}>
                {sold
                  ? 'Épuisé'
                  : product.stock_count <= 5
                    ? `Plus que ${product.stock_count} disponible${product.stock_count > 1 ? 's' : ''} !`
                    : `${product.stock_count} disponibles`}
              </span>
            </div>

            {/* Description */}
            {displayDescription && (
              <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--ink)', margin: 0, opacity: 0.8 }}>
                {displayDescription}
              </p>
            )}

            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '4px 0' }} />

            {/* ── Bouton panier ── */}
            {sold ? (
              <p style={{
                fontFamily: 'var(--font-display)', fontStyle: 'italic',
                fontSize: 14, color: '#dc2626', textTransform: 'uppercase', margin: 0,
              }}>
                Ce produit est épuisé. Reviens bientôt !
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <AddToCartButton
                  productId={product.id}
                  title={product.title}
                  slug={product.slug}
                  price={Number(product.price)}
                  imageUrl={product.image_url}
                  stockCount={product.stock_count}
                  variant="full"
                />
                <p style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic', margin: 0 }}>
                  Tu pourras ajuster la quantité dans le panier et renseigner tes infos avant de valider.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ═══════════ AUTRES PRODUITS ═══════════ */}
        {others.length > 0 && (
          <section style={{ paddingBottom: 60 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontSize: 'clamp(18px, 1.6vw, 26px)',
              textTransform: 'uppercase', margin: '0 0 30px', color: 'var(--ink)',
            }}>
              <span style={{ background: '#FFE74A', padding: '4px 10px' }}>VOUS AIMEREZ AUSSI</span>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
              {others.map(other => (
                <Link key={other.id} href={`/${locale}/shop/${other.slug}`} style={{
                  background: '#fff', boxShadow: '0 4px 14px rgba(0,0,0,0.07)',
                  padding: 20, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 10, textDecoration: 'none',
                  color: 'var(--ink)', transition: 'transform 0.15s ease',
                }}>
                  <div style={{ width: '100%', aspectRatio: '1/1', position: 'relative', opacity: other.stock_count === 0 ? 0.4 : 1 }}>
                    {other.image_url ? (
                      <Image src={other.image_url} alt={other.title} fill sizes="25vw" style={{ objectFit: 'contain', padding: 10 }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 28, opacity: 0.3 }}>📦</span>
                      </div>
                    )}
                  </div>
                  <div style={{ width: '100%' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 13, textTransform: 'uppercase', lineHeight: 1.2, marginBottom: 4 }}>
                      {other.title}
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 900, fontSize: 15 }}>
                      {Number(other.price).toFixed(2)} €
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </main>

      <SiteFooter categories={cats} />
    </>
  )
}
