'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isStudentEmail, STUDENT_EMAIL_ERROR } from '@/lib/validate-email'

interface Props { clubTitle: string; clubSlug: string; accentColor: string; locale?: string }

export default function ClubJoinFormClient({ clubTitle, clubSlug, accentColor, locale }: Props) {
  void accentColor
  const isEn = locale === 'en'
  const [fields, setFields] = useState({ prenom: '', nom: '', classe: '', mail: '', presentation: '' })
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')
  const [consent, setConsent] = useState(false)

  function set(k: keyof typeof fields, v: string) {
    setFields(f => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!isStudentEmail(fields.mail)) { setError(STUDENT_EMAIL_ERROR); return }
    setSending(true)
    const supabase = createClient()
    const { error: dbErr } = await supabase.from('club_join_requests').insert({
      club_slug:    clubSlug,
      club_title:   clubTitle,
      prenom:       fields.prenom.trim(),
      nom:          fields.nom.trim(),
      classe:       fields.classe.trim() || null,
      mail:         fields.mail.trim(),
      presentation: fields.presentation.trim() || null,
      consent_at:   new Date().toISOString(),
    })
    setSending(false)
    if (dbErr) { setError(isEn ? 'Sending error. Please try again.' : 'Erreur lors de l\'envoi. Réessaie.'); return }
    setSent(true)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: 'none',
    borderBottom: '1px solid rgba(38,38,38,0.35)',
    background: 'transparent',
    outline: 'none',
    padding: '4px 6px',
    fontSize: 14,
  }

  if (sent) {
    return (
      <div style={{ padding: '18px 0', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, textTransform: 'uppercase', color: 'var(--ink)', margin: 0 }}>
          {isEn ? 'Thank you! We\'ll get back to you 🙏' : 'Merci ! On revient vers toi 🙏'}
        </p>
      </div>
    )
  }

  const fieldLabels: Record<string, string> = isEn
    ? { prenom: 'first name', nom: 'last name', classe: 'class', mail: 'email' }
    : { prenom: 'prenom', nom: 'nom', classe: 'classe', mail: 'mail' }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h3 style={{
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontSize: 'clamp(16px, 1.3vw, 22px)',
        textTransform: 'uppercase',
        letterSpacing: '-0.01em',
        margin: '0 0 4px',
        color: 'var(--ink)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <span style={{ display: 'inline-flex', width: 28, height: 28, flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/smiley-handdrawn.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </span>
        {isEn ? 'JOIN US!' : 'REJOIGNEZ NOUS !'}
      </h3>

      {error && (
        <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
      )}

      {(['prenom', 'nom', 'classe', 'mail'] as const).map(k => (
        <div key={k}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <label style={{ fontSize: 13, whiteSpace: 'nowrap', minWidth: 60 }}>{fieldLabels[k]} :</label>
            <div style={{ flex: 1 }}>
              <input
                type={k === 'mail' ? 'email' : 'text'}
                required={k !== 'classe'}
                value={fields[k]}
                onChange={e => set(k, e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
          {k === 'mail' && (
            <p style={{ fontSize: 12, color: '#888', fontStyle: 'italic', margin: '4px 0 0', paddingLeft: 70 }}>
              {isEn
                ? 'Please use only the email address provided by the school.'
                : "Merci d'utiliser uniquement votre adresse e-mail fournie par l'école."}
            </p>
          )}
        </div>
      ))}

      <label style={{ display: 'block', fontSize: 13, marginTop: 4 }}>{isEn ? 'short introduction :' : 'mini présentation :'}</label>
      <textarea
        rows={4}
        value={fields.presentation}
        onChange={e => set('presentation', e.target.value)}
        style={{ width: '100%', border: '1px solid rgba(38,38,38,0.2)', background: 'transparent', outline: 'none', fontSize: 14, padding: '8px 10px', resize: 'vertical', minHeight: 80 }}
      />

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 12, cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={consent}
          onChange={e => setConsent(e.target.checked)}
          style={{ marginTop: 3, flexShrink: 0, accentColor: 'var(--ink)', width: 15, height: 15, cursor: 'pointer' }}
        />
        <span style={{ fontSize: 12, color: '#555', lineHeight: 1.55 }}>
          {isEn
            ? <>En envoyant ce formulaire, I confirm that I am using the email address provided by the school and I agree that the information submitted will be used by the BDE de LISAA DGC to process my registration, in accordance with the <a href="/en/p/conditions-generales-dutilisation" style={{ color: 'var(--ink)', textDecoration: 'underline' }}>Terms of Use</a> and the <a href="/en/p/politique-de-confidentialite" style={{ color: 'var(--ink)', textDecoration: 'underline' }}>Privacy Policy</a>.</>
            : <>En envoyant ce formulaire, je confirme utiliser l&apos;adresse e-mail fournie par l&apos;école et j&apos;accepte que les informations transmises soient utilisées par le BDE de LISAA DGC pour traiter mon inscription, conformément aux <a href="/fr/p/conditions-generales-dutilisation" style={{ color: 'var(--ink)', textDecoration: 'underline' }}>Conditions Générales d&apos;Utilisation</a> et à la <a href="/fr/p/politique-de-confidentialite" style={{ color: 'var(--ink)', textDecoration: 'underline' }}>Politique de confidentialité</a> du site.</>
          }
        </span>
      </label>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
        <button type="submit" disabled={sending || !consent} style={{
          background: 'var(--yellow)', color: 'var(--ink)',
          fontFamily: 'var(--font-display)', fontStyle: 'italic',
          fontSize: 18, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
          padding: '12px 22px', border: 'none', borderRadius: 999,
          cursor: sending ? 'wait' : 'pointer', opacity: sending ? 0.7 : 1,
          display: 'inline-flex', alignItems: 'center', gap: 8,
        }}>
          {sending ? (isEn ? 'Sending…' : 'Envoi…') : (isEn ? 'SEND' : 'ENVOYER')}
          <svg viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 13 }}>
            <path d="M2 8h19M14 1l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </form>
  )
}
