'use client'

import { useCart } from '@/components/CartContext'

export default function CartBubble() {
  const { count, total, open } = useCart()

  if (count === 0) return null

  return (
    <button
      onClick={open}
      style={{
        position: 'fixed',
        bottom: 28, right: 28,
        zIndex: 48,
        background: 'var(--ink)',
        color: '#fff',
        border: 'none',
        borderRadius: 999,
        padding: '13px 20px 13px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontWeight: 700,
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
        cursor: 'pointer',
        boxShadow: '0 8px 28px rgba(0,0,0,0.22)',
        transition: 'transform 0.15s',
      }}
      onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.04)')}
      onMouseOut={e  => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {/* Panier icon */}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
      MON PANIER
      {/* Badge count */}
      <span style={{
        background: '#FFE74A', color: 'var(--ink)',
        borderRadius: 99, padding: '2px 8px',
        fontSize: 13, fontWeight: 900,
        lineHeight: 1.4,
      }}>
        {count}
      </span>
      {/* Total */}
      <span style={{
        borderLeft: '1px solid rgba(255,255,255,0.25)',
        paddingLeft: 10,
        fontSize: 13, fontWeight: 700, opacity: 0.9,
      }}>
        {total.toFixed(2)} €
      </span>
    </button>
  )
}
