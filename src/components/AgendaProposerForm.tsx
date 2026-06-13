'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isStudentEmail, STUDENT_EMAIL_ERROR, STUDENT_DOMAIN } from '@/lib/validate-email'

interface Props { source?: string }

export default function AgendaProposerForm({ source = 'agenda' }: Props) {
  const [text,    setText]    = useState('')
  const [mail,    setMail]    = useState('')
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 720)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setError('')
    if (mail.trim() && !isStudentEmail(mail)) { setError(STUDENT_EMAIL_ERROR); return }
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
        <span aria-hidden="true" style={{ position: 'absolute', width: isMobile ? 44 : 80, height: isMobile ? 60 : 110, pointerEvents: 'none', top: isMobile ? 80 : 8, left: '6%' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/fleche-curl.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
        </span>
        <span aria-hidden="true" style={{ position: 'absolute', width: isMobile ? 44 : 80, height: isMobile ? 60 : 110, pointerEvents: 'none', top: isMobile ? 80 : 8, right: '6%', transform: 'scaleX(-1)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/fleche-curl.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
        </span>

        <div style={{ textAlign: 'center', margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
          <span style={{ background: 'var(--pink)', padding: '4px 12px', fontFamily: '"new-atten", sans-serif', fontWeight: 400, fontStyle: 'normal', fontSize: 24, textTransform: 'uppercase', color: 'var(--ink)', whiteSpace: 'nowrap' }}>DES CHOSES À NOUS PROPOSER ?</span>
          <span style={{ background: 'var(--pink)', padding: '4px 12px', fontFamily: '"new-atten", sans-serif', fontWeight: 700, fontStyle: 'italic', fontSize: 16, textTransform: 'uppercase', color: 'var(--ink)', whiteSpace: 'nowrap' }}>DES ÉVÉNEMENTS ?&nbsp;&nbsp;DES CLUBS ?</span>
        </div>

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
            placeholder="ton adresse mail"
            style={{
              width: '100%',
              border: '1.5px dotted rgba(0,0,0,0.55)',
              marginBottom: 12,
              borderRadius: 4,
              padding: '10px 16px',
              fontSize: 14,
              background: '#f5f5f5',
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
            placeholder="un événement, une idée, un club… tout est le bienvenu !"
            style={{
              width: '100%',
              border: '1.5px dotted rgba(0,0,0,0.55)',
              marginBottom: 12,
              borderRadius: 4,
              padding: '14px 16px',
              fontSize: 14,
              background: '#f5f5f5',
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="submit" disabled={sending} style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'var(--yellow)', color: 'var(--ink)',
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 20, fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              padding: '12px 22px',
              border: 'none',
              borderRadius: 999,
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
