'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useCart } from '@/components/CartContext'
import { createClient } from '@/lib/supabase/client'
import { isStudentEmail, STUDENT_EMAIL_ERROR, STUDENT_DOMAIN } from '@/lib/validate-email'

export default function CartDrawer() {
  const { items, remove, setQty, clear, total, count, isOpen, close } = useCart()

  const [step,    setStep]    = useState<'cart' | 'sent'>('cart')
  const [fields,  setFields]  = useState({ prenom: '', nom: '', classe: '', mail: '' })
  const [sending, setSending] = useState(false)
  const [error,   setError]   = useState('')

  /* Reset form state when re-opened after sent */
  useEffect(() => {
    if (isOpen && step === 'sent') {
      /* keep sent screen visible — user closes manually */
    }
  }, [isOpen, step])

  function set(k: keyof typeof fields, v: string) {
    setFields(f => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) return
    setError('')
    if (!isStudentEmail(fields.mail)) { setError(STUDENT_EMAIL_ERROR); return }
    setSending(true)
    const supabase = createClient()
    const { error: dbErr } = await supabase.from('shop_orders').insert({
      prenom: fields.prenom.trim(),
      nom:    fields.nom.trim(),
      classe: fields.classe.trim() || null,
      mail:   fields.mail.trim(),
      items:  items.map(i => ({
        productId: i.productId,
        title:     i.title,
        qty:       i.qty,
        price:     i.price,
        subtotal:  +(i.price * i.qty).toFixed(2),
      })),
      total: +total.toFixed(2),
    })
    setSending(false)
    if (dbErr) { setError('Erreur lors de l\'envoi. Réessaie.'); return }
    clear()
    setStep('sent')
  }

  function handleClose() {
    close()
    setTimeout(() => {
      setStep('cart')
      setError('')
      setFields({ prenom: '', nom: '', classe: '', mail: '' })
    }, 320)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: 'none',
    borderBottom: '1.5px solid rgba(38,38,38,0.22)',
    background: 'transparent',
    outline: 'none',
    padding: '8px 4px',
    fontSize: 14,
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    color: 'var(--ink)',
  }

  return (
    <>
      {/* ── Overlay ── */}
      <div
        className="cart-drawer-bg"
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 49,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(3px)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.28s ease',
        }}
      />

      {/* ── Drawer ── */}
      <div
        className="cart-drawer-inner"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 'min(440px, 95vw)',
          background: 'var(--paper)',
          zIndex: 50,
          boxShadow: '-8px 0 40px rgba(0,0,0,0.13)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header (sticky) */}
        <div style={{
          padding: '20px 22px 16px',
          borderBottom: '1px solid var(--hair-mute, rgba(38,38,38,0.1))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
          background: 'var(--paper)',
          zIndex: 2,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontWeight: 900,
              fontSize: 20,
              textTransform: 'uppercase',
              color: 'var(--ink)',
              margin: 0,
              letterSpacing: '-0.01em',
            }}>
              MON PANIER
            </h2>
            {count > 0 && (
              <span style={{
                background: 'var(--yellow)', color: 'var(--ink)',
                fontFamily: 'var(--font-display)', fontStyle: 'italic',
                fontWeight: 700, fontSize: 12,
                padding: '2px 9px', borderRadius: 99,
              }}>
                {count} article{count > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            style={{
              width: 34, height: 34, borderRadius: '50%',
              border: '1.5px solid #e5e7eb', background: 'var(--paper-2)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, color: 'var(--mute)', lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ flex: 1, overflowY: 'auto' }}>

          {/* Confirmation */}
          {step === 'sent' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 340, padding: '40px 28px', textAlign: 'center', gap: 16 }}>
              <div style={{ fontSize: 56 }}>🎉</div>
              <p style={{
                fontFamily: 'var(--font-display)', fontStyle: 'italic',
                fontWeight: 900, fontSize: 22, textTransform: 'uppercase',
                color: 'var(--ink)', margin: 0, lineHeight: 1.3,
              }}>
                Commande reçue !
              </p>
              <p style={{ fontSize: 14, color: '#6b7280', margin: 0, lineHeight: 1.65, maxWidth: 280 }}>
                On revient vers toi vite pour finaliser ta commande 🙌
              </p>
              <button
                onClick={handleClose}
                style={{
                  marginTop: 10,
                  background: 'var(--yellow)', color: 'var(--ink)',
                  fontFamily: 'var(--font-display)', fontStyle: 'italic',
                  fontWeight: 700, fontSize: 20, textTransform: 'uppercase',
                  padding: '12px 28px', border: 'none', borderRadius: 999,
                  cursor: 'pointer', letterSpacing: '0.02em',
                }}
              >
                Continuer à shopper →
              </button>
            </div>
          )}

          {/* Panier vide */}
          {step === 'cart' && items.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, padding: 40, textAlign: 'center', gap: 14 }}>
              <span style={{ fontSize: 48, opacity: 0.25 }}>🛍️</span>
              <p style={{
                fontFamily: 'var(--font-display)', fontStyle: 'italic',
                fontSize: 16, textTransform: 'uppercase', color: '#aaa', margin: 0,
              }}>
                Ton panier est vide
              </p>
              <button
                onClick={handleClose}
                style={{
                  background: 'var(--yellow)', color: 'var(--ink)',
                  fontFamily: 'var(--font-display)', fontStyle: 'italic',
                  fontSize: 20, fontWeight: 700, textTransform: 'uppercase',
                  padding: '12px 22px', border: 'none', borderRadius: 999, cursor: 'pointer',
                }}
              >
                Voir le shop →
              </button>
            </div>
          )}

          {/* Articles */}
          {step === 'cart' && items.length > 0 && (
            <div>
              <div style={{ padding: '6px 22px 0' }}>
                {items.map(item => (
                  <div key={item.productId} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 0',
                    borderBottom: '1px solid #f4f4f4',
                  }}>
                    {/* Vignette */}
                    <div style={{
                      width: 68, height: 68, flexShrink: 0,
                      background: '#f8f8f8', position: 'relative',
                    }}>
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          sizes="68px"
                          style={{ objectFit: 'contain', padding: 6 }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, opacity: 0.25 }}>📦</div>
                      )}
                    </div>

                    {/* Infos + contrôles */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: 'var(--font-display)', fontStyle: 'italic',
                        fontSize: 12, textTransform: 'uppercase',
                        lineHeight: 1.25, color: 'var(--ink)',
                        marginBottom: 8,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {item.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        {/* Qty controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <button
                            type="button"
                            onClick={() => item.qty === 1 ? remove(item.productId) : setQty(item.productId, item.qty - 1)}
                            style={{
                              width: 24, height: 24, borderRadius: '50%',
                              border: '1px solid rgba(38,38,38,0.5)', background: 'transparent',
                              fontSize: 13, cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'var(--ink)',
                            }}
                          >
                            {item.qty === 1 ? '×' : '−'}
                          </button>
                          <span style={{
                            fontFamily: 'var(--font-display)', fontStyle: 'italic',
                            fontWeight: 900, fontSize: 16,
                            minWidth: 18, textAlign: 'center', color: 'var(--ink)',
                          }}>
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQty(item.productId, item.qty + 1)}
                            disabled={item.qty >= item.stockCount}
                            style={{
                              width: 24, height: 24, borderRadius: '50%',
                              border: '1px solid rgba(38,38,38,0.5)', background: 'transparent',
                              fontSize: 13, cursor: item.qty >= item.stockCount ? 'not-allowed' : 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              opacity: item.qty >= item.stockCount ? 0.3 : 1,
                              color: 'var(--ink)',
                            }}
                          >
                            +
                          </button>
                        </div>
                        {/* Prix ligne */}
                        <span style={{
                          fontFamily: 'var(--font-display)', fontStyle: 'italic',
                          fontWeight: 900, fontSize: 15, color: 'var(--ink)',
                        }}>
                          {(item.price * item.qty).toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div style={{
                margin: '0 22px',
                padding: '14px 0',
                borderTop: '2px solid var(--ink)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic',
                  fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.04em',
                  color: 'var(--ink)',
                }}>
                  Total
                </span>
                <span style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic',
                  fontWeight: 900, fontSize: 24, color: 'var(--ink)',
                }}>
                  {total.toFixed(2)} €
                </span>
              </div>

              {/* ── Formulaire de commande ── */}
              <div style={{
                margin: '0 22px 28px',
                padding: '18px 0 0',
                borderTop: '1px solid #ebebeb',
              }}>
                <p style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic',
                  fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em',
                  color: '#999', margin: '0 0 16px',
                }}>
                  Tes coordonnées pour la commande
                </p>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {error && (
                    <p style={{ fontSize: 13, color: '#dc2626', margin: 0, background: '#fef2f2', padding: '8px 12px', borderRadius: 4 }}>
                      {error}
                    </p>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    {([
                      { k: 'prenom', label: 'Prénom', required: true },
                      { k: 'nom',    label: 'Nom',    required: true },
                    ] as const).map(({ k, label, required }) => (
                      <div key={k}>
                        <label style={{
                          display: 'block', fontSize: 10,
                          textTransform: 'uppercase', letterSpacing: '0.08em',
                          color: '#aaa', marginBottom: 4,
                        }}>
                          {label}{required ? ' *' : ''}
                        </label>
                        <input
                          type="text"
                          required={required}
                          value={fields[k]}
                          onChange={e => set(k, e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#aaa', marginBottom: 4 }}>Classe</label>
                    <input
                      type="text"
                      value={fields.classe}
                      onChange={e => set('classe', e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#aaa', marginBottom: 4 }}>E-mail {STUDENT_DOMAIN} *</label>
                    <input
                      type="email"
                      required
                      value={fields.mail}
                      onChange={e => set('mail', e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    style={{
                      marginTop: 6,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      background: 'var(--yellow)', color: 'var(--ink)',
                      fontFamily: 'var(--font-display)', fontStyle: 'italic',
                      fontWeight: 700, fontSize: 20, textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      padding: '15px 24px', border: 'none', borderRadius: 999,
                      cursor: sending ? 'wait' : 'pointer',
                      opacity: sending ? 0.7 : 1,
                      width: '100%',
                      transition: 'opacity 0.15s',
                    }}
                  >
                    {sending ? 'Envoi en cours…' : 'COMMANDER'}
                    {!sending && (
                      <svg viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 14 }}>
                        <path d="M2 8h19M14 1l7 7-7 7"/>
                      </svg>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
