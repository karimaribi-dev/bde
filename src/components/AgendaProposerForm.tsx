'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props { source?: string }

export default function AgendaProposerForm({ source = 'agenda' }: Props) {
  const [text,    setText]    = useState('')
  const [mail,    setMail]    = useState('')
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setError('')
    setSending(true)
    const supabase = createClient()
    const { error: dbErr } = await supabase.from('suggestions').insert({
      source,
      message: text.trim(),
      mail: mail.trim() || null,
    })
    setSending(false)
    if (dbErr) { setError('Erreur lors de l\'envoi. Réessaie.'); return }
    setSent(true)
    setText('')
  }

  return (
    <section style={{ padding: '6px 0 10px', position: 'relative' }}>

      {/* ── En-tête ── */}
      <div style={{
        textAlign: 'center',
        position: 'relative',
        padding: '14px 80px 26px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
      }}>
        <span aria-hidden="true" style={{ position: 'absolute', width: 80, height: 110, pointerEvents: 'none', top: 8, left: '6%' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/fleche-curl.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
        </span>
        <span aria-hidden="true" style={{ position: 'absolute', width: 80, height: 110, pointerEvents: 'none', top: 8, right: '6%', transform: 'scaleX(-1)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/fleche-curl.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
        </span>

        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontWeight: 900,
          fontSize: 'clamp(22px, 2.4vw, 32px)',
          lineHeight: 1.55,
          textTransform: 'uppercase',
          color: 'var(--ink)',
          margin: 0,
          textAlign: 'center',
        }}>
          <span style={{ background: '#FFB3F0', padding: '4px 12px' }}>DES CHOSES À NOUS PROPOSER ?</span>
          <br/>
          <span style={{ background: '#FFB3F0', padding: '4px 12px', display: 'inline-block', marginTop: 6 }}>
            DES ÉVÉNEMENTS ?&nbsp;&nbsp;DES CLUBS ?
          </span>
        </h2>

        <div style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 'clamp(16px, 1.5vw, 22px)',
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 14,
          color: 'var(--ink)',
        }}>
          ON VOUS ÉCOUTE
          <span style={{ display: 'inline-flex', width: 50, height: 38 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/smiley-handdrawn.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </span>
        </div>
      </div>

      {/* ── Formulaire ── */}
      {!sent ? (
        <form onSubmit={handleSubmit} style={{
          border: '1.5px dashed rgba(0,0,0,0.55)',
          borderRadius: 6,
          padding: '20px 24px 18px',
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          {error && <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>}
          <input
            type="email"
            value={mail}
            onChange={e => setMail(e.target.value)}
            placeholder="ton adresse e-mail (facultatif)"
            style={{
              width: '100%',
              border: '1px solid rgba(0,0,0,0.85)',
              borderRadius: 2,
              padding: '10px 16px',
              fontSize: 14,
              background: '#fff',
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
          <label style={{ fontStyle: 'italic', fontSize: 13, color: '#888', paddingLeft: 4 }}>
            vos idées sont les bienvenues :
          </label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            required
            rows={6}
            style={{
              width: '100%',
              border: '1px solid rgba(0,0,0,0.85)',
              borderRadius: 2,
              padding: '14px 16px',
              fontSize: 14,
              background: '#fff',
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="submit" disabled={sending} style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'var(--ink)', color: '#fff',
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 14, fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              padding: '12px 22px',
              border: 'none',
              cursor: sending ? 'wait' : 'pointer',
              opacity: sending ? 0.7 : 1,
            }}>
              {sending ? 'Envoi…' : 'ENVOYER'}
              <svg viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 16 }}>
                <path d="M2 8h19M14 1l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </form>
      ) : (
        <div style={{
          border: '1.5px dashed rgba(0,0,0,0.55)',
          borderRadius: 6,
          padding: '40px 24px',
          background: '#fff',
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 22,
            textTransform: 'uppercase',
            color: 'var(--ink)',
            margin: 0,
          }}>
            Merci pour ta proposition ! 🙏
          </p>
        </div>
      )}
    </section>
  )
}
