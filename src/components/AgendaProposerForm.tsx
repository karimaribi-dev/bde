'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isStudentEmail, STUDENT_EMAIL_ERROR, STUDENT_DOMAIN } from '@/lib/validate-email'

interface Props { source?: string }

export default function AgendaProposerForm({ source = 'agenda' }: Props) {
  const isEn = usePathname().startsWith('/en')
  const [text,    setText]    = useState('')
  const [mail,    setMail]    = useState('')
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')
  const [consent, setConsent] = useState(false)
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
      consent_at: new Date().toISOString(),
    })
    setSending(false)
    if (dbErr) { setError(isEn ? 'Sending error. Please try again.' : 'Erreur lors de l\'envoi. Réessaie.'); return }
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
          <span style={{ background: 'var(--pink)', padding: '4px 12px', fontFamily: '"new-atten", sans-serif', fontWeight: 400, fontStyle: 'normal', fontSize: 24, textTransform: 'uppercase', color: 'var(--ink)', whiteSpace: 'nowrap' }}>{isEn ? 'GOT IDEAS FOR US?' : 'DES CHOSES À NOUS PROPOSER ?'}</span>
          <span style={{ background: 'var(--pink)', padding: '4px 12px', fontFamily: '"new-atten", sans-serif', fontWeight: 700, fontStyle: 'italic', fontSize: 16, textTransform: 'uppercase', color: 'var(--ink)', whiteSpace: 'nowrap' }}>{isEn ? 'EVENTS?  CLUBS?' : 'DES ÉVÉNEMENTS ?  DES CLUBS ?'}</span>
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
          {isEn ? "WE'RE LISTENING" : 'ON VOUS ÉCOUTE'}
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
            placeholder={isEn ? 'your email' : 'ton adresse mail'}
            style={{
              width: '100%',
              border: '1.5px dotted rgba(0,0,0,0.55)',
              marginBottom: 6,
              borderRadius: 4,
              padding: '10px 16px',
              fontSize: 14,
              background: '#f5f5f5',
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
          <p style={{ fontSize: 12, color: '#888', fontStyle: 'italic', margin: '0 0 12px', paddingLeft: 4 }}>
            {isEn
              ? 'Please use only the email address provided by the school.'
              : "Merci d'utiliser uniquement votre adresse e-mail fournie par l'école."}
          </p>
          <label style={{ fontStyle: 'italic', fontSize: 13, color: '#888', paddingLeft: 4 }}>
            {isEn ? 'all ideas are welcome:' : 'vos idées sont les bienvenues :'}
          </label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            required
            rows={6}
            placeholder={isEn ? 'an event, an idea, a club… everything is welcome!' : 'un événement, une idée, un club… tout est le bienvenu !'}
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
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={consent}
              onChange={e => setConsent(e.target.checked)}
              style={{ marginTop: 3, flexShrink: 0, accentColor: 'var(--ink)', width: 15, height: 15, cursor: 'pointer' }}
            />
            <span style={{ fontSize: 12, color: '#555', lineHeight: 1.55 }}>
              {isEn
                ? <>I confirm that I am using the email address provided by the school and I agree that the information submitted will be used by the BDE de LISAA DGC to process my suggestion, in accordance with the <a href="/en/p/conditions-generales-dutilisation" style={{ color: 'var(--ink)', textDecoration: 'underline' }}>Terms of Use</a> and the <a href="/en/p/politique-de-confidentialite" style={{ color: 'var(--ink)', textDecoration: 'underline' }}>Privacy Policy</a>.</>
                : <>En envoyant ce formulaire, je confirme utiliser l&apos;adresse e-mail fournie par l&apos;école et j&apos;accepte que les informations transmises soient utilisées par le BDE de LISAA DGC pour traiter ma suggestion, conformément aux <a href="/fr/p/conditions-generales-dutilisation" style={{ color: 'var(--ink)', textDecoration: 'underline' }}>Conditions Générales d&apos;Utilisation</a> et à la <a href="/fr/p/politique-de-confidentialite" style={{ color: 'var(--ink)', textDecoration: 'underline' }}>Politique de confidentialité</a> du site.</>
              }
            </span>
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="submit" disabled={sending || !consent} style={{
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
              {sending ? (isEn ? 'Sending…' : 'Envoi…') : (isEn ? 'SEND' : 'ENVOYER')}
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
            {isEn ? 'Thank you for your suggestion! 🙏' : 'Merci pour ta proposition ! 🙏'}
          </p>
        </div>
      )}
    </section>
  )
}
