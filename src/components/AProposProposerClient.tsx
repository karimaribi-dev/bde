'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isStudentEmail, STUDENT_EMAIL_ERROR, STUDENT_DOMAIN } from '@/lib/validate-email'

export default function AProposProposerClient() {
  const [text,    setText]    = useState('')
  const [mail,    setMail]    = useState('')
  const [sent,    setSent]    = useState(false)
  const [sending, setSending] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setError('')
    if (mail.trim() && !isStudentEmail(mail)) { setError(STUDENT_EMAIL_ERROR); return }
    setSending(true)
    const supabase = createClient()
    const { error: dbErr } = await supabase.from('suggestions').insert({
      source: 'a-propos',
      message: text.trim(),
      mail: mail.trim() || null,
    })
    setSending(false)
    if (dbErr) { setError('Erreur lors de l\'envoi. Réessaie.'); return }
    setSent(true)
  }

  return (
    <section style={{ position: 'relative', padding: '40px 0 50px', marginTop: 20 }}>

      {/* Flèches curl gauche/droite */}
      <span aria-hidden="true" style={{ position: 'absolute', width: 70, height: 100, top: 36, left: '12%', pointerEvents: 'none', zIndex: 1 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/fleche-curl.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </span>
      <span aria-hidden="true" style={{ position: 'absolute', width: 70, height: 100, top: 36, right: '12%', pointerEvents: 'none', zIndex: 1, transform: 'scaleX(-1)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/fleche-curl.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </span>

      {/* Titre centré */}
      <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 28px', position: 'relative', zIndex: 2 }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontWeight: 700,
          fontSize: 'clamp(16px, 1.6vw, 24px)',
          lineHeight: 1.75,
          margin: '0 0 16px',
          color: 'var(--ink)',
          textTransform: 'uppercase',
        }}>
          <span style={{ display: 'inline-block', background: '#FFB3F0', padding: '4px 10px' }}>
            DES CHOSES À NOUS PROPOSER ?
          </span>
          <br/>
          <span style={{ display: 'inline-block', background: '#FFB3F0', padding: '4px 10px', marginLeft: 30 }}>
            DES ÉVÉNEMENTS ?&nbsp;&nbsp;DES CLUBS ?
          </span>
        </h2>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 'clamp(18px, 1.6vw, 24px)',
          textTransform: 'uppercase',
          color: 'var(--ink)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
        }}>
          ON VOUS ÉCOUTE
          <span style={{ display: 'inline-flex', width: 30, height: 30 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/smiley-handdrawn.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </span>
        </div>
      </div>

      {/* Formulaire */}
      {sent ? (
        <div style={{
          border: '1.5px dashed var(--ink)', borderRadius: 10,
          padding: '36px 28px', background: '#fff',
          maxWidth: 1100, margin: '0 auto',
          textAlign: 'center', position: 'relative', zIndex: 1,
        }}>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, textTransform: 'uppercase', color: 'var(--ink)', margin: 0 }}>
            Merci pour ta proposition ! 🙏
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{
            border: '1.5px dashed var(--ink)',
            borderRadius: 10,
            padding: '22px 28px 18px',
            background: '#fff',
            maxWidth: 1100,
            margin: '0 auto',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <label style={{ fontStyle: 'italic', fontSize: 13, color: '#888', display: 'block', marginBottom: 8, paddingLeft: 4 }}>
            vos idées sont les bienvenues :
          </label>
          <input
            type="email"
            value={mail}
            onChange={e => setMail(e.target.value)}
            placeholder="ton adresse mail"
            style={{
              width: '100%',
              border: '1.5px dashed var(--ink)',
              borderRadius: 2,
              padding: '10px 16px',
              fontSize: 14,
              background: '#fff',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <textarea
            rows={6}
            value={text}
            onChange={e => setText(e.target.value)}
            required
            style={{
              width: '100%',
              border: '1.5px dashed var(--ink)',
              borderRadius: 2,
              padding: '14px 16px',
              minHeight: 140,
              fontSize: 14,
              background: '#fff',
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            {error && <p style={{ fontSize: 13, color: '#dc2626', marginBottom: 6 }}>{error}</p>}
          <button type="submit" disabled={sending} style={{ opacity: sending ? 0.7 : 1, cursor: sending ? 'wait' : 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#FFE74A', color: 'var(--ink)',
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
              padding: '11px 22px', border: 'none', cursor: 'pointer',
              borderRadius: 999,
            }}>
              {sending ? 'Envoi…' : 'ENVOYER'}
              <svg viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 13 }}>
                <path d="M2 8h19M14 1l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
