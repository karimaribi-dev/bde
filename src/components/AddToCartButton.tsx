'use client'

import { useCart } from '@/components/CartContext'

interface Props {
  productId:  string
  title:      string
  slug:       string
  price:      number
  imageUrl:   string | null
  stockCount: number
  /** 'circle' = petit bouton rose flottant (grille shop)
   *  'full'   = grand bouton de la page détail */
  variant?: 'circle' | 'full'
}

export default function AddToCartButton({
  productId, title, slug, price, imageUrl, stockCount,
  variant = 'circle',
}: Props) {
  const { add } = useCart()

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    add({ productId, title, slug, price, imageUrl, stockCount })
  }

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={handleClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          background: '#FFE74A',
          color: 'var(--ink)',
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontWeight: 900,
          fontSize: 16,
          textTransform: 'uppercase',
          letterSpacing: '0.03em',
          padding: '16px 32px',
          border: 'none',
          borderRadius: 999,
          cursor: 'pointer',
          transition: 'transform 0.15s',
        }}
        onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.03)')}
        onMouseOut={e  => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        AJOUTER AU PANIER
      </button>
    )
  }

  /* variant === 'circle' */
  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Ajouter ${title} au panier`}
      style={{
        position: 'absolute',
        top: -14, right: 14,
        width: 44, height: 44,
        background: '#FF69B4',
        borderRadius: '50%',
        color: '#fff',
        fontFamily: 'var(--font-display)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 26,
        zIndex: 4,
        boxShadow: '0 4px 10px rgba(0,0,0,0.18)',
        lineHeight: 1,
        border: 'none',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      +
    </button>
  )
}
