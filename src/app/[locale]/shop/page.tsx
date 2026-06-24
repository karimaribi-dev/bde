import { createClient } from '@/lib/supabase/server'
import NavbarClient from '@/components/NavbarClient'
import SiteFooter from '@/components/SiteFooter'
import GalleryForPage from '@/components/GalleryForPage'
import AddToCartButton from '@/components/AddToCartButton'
import Link from 'next/link'
import Image from 'next/image'
import { Product, Category } from '@/lib/types'

export const dynamic = 'force-dynamic'

/* Rotations fixes par position dans la grille (modulo 8) */
const TILTS = ['-3deg','2deg','-1deg','4deg','-2deg','3deg','-3deg','2deg']

/* Décalages verticaux */
const OFFSETS = [0, 40, 20, 60, 30, 50, 70, 30]

export default async function ShopPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase   = await createClient()

  const [{ data: productsRaw }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*').eq('is_published', true)
      .order('sort_order', { ascending: true }),
    supabase.from('categories').select('*').order('name'),
  ])

  const products = (productsRaw ?? []) as Product[]
  const cats     = (categories  ?? []) as Category[]
  const isEn     = locale === 'en'

  return (
    <>
      <NavbarClient categories={cats} locale={locale} activeSlug="shop" />

      <main className="shop-main" style={{ padding: '0 40px' }}>

        <GalleryForPage page="shop" position="top" locale={locale} />

        {/* ── Breadcrumb ── */}
        <nav style={{ padding: '14px 0 0', fontSize: 11, fontFamily: 'var(--font-display)', fontStyle: 'italic', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--ink)', opacity: 0.6 }}>
          <a href={`/${locale}`} style={{ color: 'inherit', textDecoration: 'none' }}>{isEn ? 'HOME' : 'ACCUEIL'}</a>
          <span style={{ margin: '0 6px' }}>›</span>
          <span>{isEn ? 'THE SHOP' : 'LE SHOP'}</span>
        </nav>

        {/* ═══════════ HERO ═══════════ */}
        <section style={{ textAlign: 'center', padding: '30px 0 40px' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 900,
            fontSize: 'clamp(72px, 15.5vw, 224px)',
            letterSpacing: '-0.02em',
            lineHeight: 1,
            color: 'var(--ink)',
            margin: '0 0 20px',
            textTransform: 'uppercase',
          }}>
            LE SHOP
          </h1>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 'clamp(13px, 1.1vw, 16px)',
            letterSpacing: '0.01em',
          }}>
            <span className="shop-label-badge" style={{ background: '#FFE74A', color: 'var(--ink)', padding: '6px 12px 8px' }}>
              {isEn ? 'The best of student creations' : 'La sélection de créations étudiantes'}
            </span>
            <span className="shop-label-badge" style={{ background: '#FFE74A', color: 'var(--ink)', padding: '6px 12px 8px', transform: 'translateX(60px)' }}>
              {isEn ? 'and limited edition merch' : 'et de merch en édition limitée'}
            </span>
          </div>
        </section>

        {/* ═══════════ GRILLE PRODUITS ═══════════ */}
        {products.length === 0 ? (
          <div style={{ padding: '80px 0', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, textTransform: 'uppercase', color: '#aaa' }}>
              {isEn ? 'Shop coming soon!' : 'Le shop arrive bientôt !'}
            </p>
          </div>
        ) : (
          <section className="shop-products-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '50px 30px',
            padding: '40px 0 140px',
          }}>
            {products.map((product, i) => {
              const tilt   = TILTS[i % 8]
              const offset = OFFSETS[i % 8]
              const sold   = product.stock_count === 0

              return (
                /* Wrapper : gère le positionnement absolu du bouton + */
                <div
                  key={product.id}
                  className="prod-card-wrap"
                  style={{
                    position: 'relative',
                    aspectRatio: '1/1',
                    transform: `translateY(${offset}px) rotate(${tilt})`,
                    transition: 'transform 0.18s ease',
                  }}
                >
                  {/* ── Lien cliquable (toute la surface) ── */}
                  <Link
                    href={`/${locale}/shop/${product.slug}`}
                    className="shop-product-card"
                    style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      textDecoration: 'none',
                      zIndex: 1,
                    }}
                    aria-label={product.title}
                  >
                    {/* Fond blanc */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: '#fff',
                      boxShadow: '0 6px 18px rgba(0,0,0,0.08), 0 1px 0 rgba(0,0,0,0.04)',
                    }} />

                    {/* Badge épuisé */}
                    {sold && (
                      <span style={{
                        position: 'absolute',
                        top: -14, right: 14,
                        background: '#dc2626',
                        color: '#fff',
                        fontFamily: 'var(--font-display)',
                        fontStyle: 'italic',
                        fontSize: 11,
                        padding: '5px 10px',
                        borderRadius: 99,
                        zIndex: 3,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}>
                        {isEn ? 'SOLD OUT' : 'ÉPUISÉ'}
                      </span>
                    )}

                    {/* Image produit */}
                    <div style={{ position: 'relative', zIndex: 1, width: '76%', height: '76%', opacity: sold ? 0.45 : 1 }}>
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.title}
                          fill
                          sizes="25vw"
                          style={{ objectFit: 'contain' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 36, opacity: 0.3 }}>📦</span>
                        </div>
                      )}
                    </div>

                    {/* Titre + prix en bas */}
                    <div style={{
                      position: 'absolute',
                      bottom: 10, left: 10, right: 10,
                      zIndex: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-end',
                    }}>
                      <span style={{
                        fontFamily: 'var(--font-display)', fontStyle: 'italic',
                        fontSize: 11, textTransform: 'uppercase',
                        color: 'var(--ink)', lineHeight: 1.2, maxWidth: '60%',
                      }}>
                        {product.title}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-display)', fontStyle: 'italic',
                        fontWeight: 900, fontSize: 14, color: 'var(--ink)',
                      }}>
                        {Number(product.price).toFixed(0)} €
                      </span>
                    </div>
                  </Link>

                  {/* ── Bouton "+" (hors du Link) ── */}
                  {!sold && (
                    <AddToCartButton
                      productId={product.id}
                      title={product.title}
                      slug={product.slug}
                      price={Number(product.price)}
                      imageUrl={product.image_url}
                      stockCount={product.stock_count}
                      variant="circle"
                    />
                  )}
                </div>
              )
            })}
          </section>
        )}

        {/* ═══════════ NOTE BAS DE PAGE ═══════════ */}
        <p className="shop-note" style={{
          textAlign: 'center',
          maxWidth: 860,
          margin: '0 auto 60px',
          fontSize: 15,
          lineHeight: 1.65,
          color: 'var(--ink)',
          opacity: 0.8,
          fontStyle: 'italic',
        }}>
          {isEn
            ? <>All these items were designed and created by LISAA students with the BDE, as part of the school.<br/>100&nbsp;% original creations, 100&nbsp;% LISAA, offered in limited editions.</>
            : <>Tous ces objets ont été imaginés et réalisés par des étudiants de LISAA avec le BDE, dans le cadre de l&apos;école.<br/>Des créations 100&nbsp;% originales, 100&nbsp;% LISAA, proposées en éditions limitées.</>
          }
        </p>

      </main>

      {/* Hover effet */}
      <style>{`
        .prod-card-wrap:hover {
          transform: translateY(-4px) rotate(0deg) !important;
          z-index: 5;
        }
      `}</style>

        <GalleryForPage page="shop" position="bottom" locale={locale} />

      <SiteFooter categories={cats} />
    </>
  )
}
