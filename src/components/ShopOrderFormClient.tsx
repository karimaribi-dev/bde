'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Product } from '@/lib/types'

interface Props { product: Product }

export default function ShopOrderFormClient({ product }: Props) {
  const isEn = usePathname().startsWith('/en')
  const sold = product.stock_count === 0
  const [fields, setFields] = useState({ prenom: '', nom: '', classe: '', mail: '' })
  const [qty,    setQty]    = useState(1)
  const [sent,   setSent]   = useState(false)

  function set(k: keyof typeof fields, v: string) {
    setFields(f => ({ ...f, [k]: v }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSent(true)
  }

  const inputStyle: React.CSSProperties = {
    flex: 1,
    border: 'none',
    borderBottom: '1px solid rgba(38,38,38,0.3)',
    background: 'transparent',
    outline: 'none',
    padding: '4px 6px',
    fontSize: 14,
  }

  if (sold) {
    return (
      <div style={{ padding: '16px 0' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 14, color: '#dc2626', textTransform: 'uppercase', margin: 0 }}>
          {isEn ? 'This product is sold out. Come back soon!' : 'Ce produit est épuisé. Reviens bientôt !'}
        </p>
      </div>
    )
  }

  if (sent) {
    return (
      <div style={{ padding: '20px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 4, textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, textTransform: 'uppercase', color: '#16a34a', margin: 0 }}>
          {isEn ? 'Order received 🎉 We\'ll get back to you soon!' : 'Commande reçue 🎉 On revient vers toi vite !'}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Quantité */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#666' }}>{isEn ? 'Quantity:' : 'Quantité :'}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={() => setQty(q => Math.max(1, q - 1))}
            style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--ink)', background: 'transparent', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
          >−</button>
          <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 900, fontSize: 18, minWidth: 24, textAlign: 'center' }}>{qty}</span>
          <button
            type="button"
            onClick={() => setQty(q => Math.min(product.stock_count, q + 1))}
            style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--ink)', background: 'transparent', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
          >+</button>
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 900, fontSize: 16, marginLeft: 8 }}>
          = {(Number(product.price) * qty).toFixed(2)} €
        </span>
      </div>

      {/* Champs */}
      {(['prenom', 'nom', 'classe', 'mail'] as const).map(k => {
        const labelFr: Record<string, string> = { prenom: 'prenom', nom: 'nom', classe: 'classe', mail: 'mail' }
        const labelEn: Record<string, string> = { prenom: 'first name', nom: 'last name', classe: 'class', mail: 'email' }
        return (
        <div key={k} style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <label style={{ fontSize: 13, whiteSpace: 'nowrap', minWidth: 56, color: '#666' }}>{isEn ? labelEn[k] : labelFr[k]} :</label>
          <input
            type={k === 'mail' ? 'email' : 'text'}
            required={k !== 'classe'}
            value={fields[k]}
            onChange={e => set(k, e.target.value)}
            style={inputStyle}
          />
        </div>
        )
      })}

      {/* Submit */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 8 }}>
        <button type="submit" style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          background: 'var(--ink)', color: '#fff',
          fontFamily: 'var(--font-display)', fontStyle: 'italic',
          fontSize: 14, letterSpacing: '0.04em', textTransform: 'uppercase',
          padding: '12px 24px', border: 'none', cursor: 'pointer',
        }}>
          {isEn ? 'ORDER' : 'COMMANDER'}
          <svg viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 14 }}>
            <path d="M2 8h19M14 1l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </form>
  )
}
