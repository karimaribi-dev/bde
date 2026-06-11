'use client'

import { useState } from 'react'

interface Props { clubTitle: string; accentColor: string }

export default function ClubJoinFormClient({ clubTitle, accentColor }: Props) {
  const [fields, setFields] = useState({ prenom: '', nom: '', classe: '', mail: '', presentation: '' })
  const [sent, setSent]     = useState(false)

  function set(k: keyof typeof fields, v: string) {
    setFields(f => ({ ...f, [k]: v }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
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
      <div style={{ padding: '18px 20px', border: `1.5px solid ${accentColor}`, background: '#fff', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, textTransform: 'uppercase', color: 'var(--ink)', margin: 0 }}>
          Merci ! On revient vers toi 🙏
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ padding: '20px 22px', border: `1.5px solid ${accentColor}`, background: '#fff', display: 'flex', flexDirection: 'column', gap: 10 }}
    >
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
        REJOIGNEZ {clubTitle} !
      </h3>

      {(['prenom', 'nom', 'classe', 'mail'] as const).map(k => (
        <div key={k} style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <label style={{ fontSize: 13, whiteSpace: 'nowrap', minWidth: 60 }}>{k} :</label>
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
      ))}

      <label style={{ display: 'block', fontSize: 13, marginTop: 4 }}>mini présentation :</label>
      <textarea
        rows={4}
        value={fields.presentation}
        onChange={e => set('presentation', e.target.value)}
        style={{ width: '100%', border: '1px solid rgba(38,38,38,0.2)', background: 'transparent', outline: 'none', fontSize: 14, padding: '8px 10px', resize: 'vertical', minHeight: 80 }}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
        <button type="submit" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--ink)', color: '#fff',
          fontFamily: 'var(--font-display)', fontStyle: 'italic',
          fontSize: 13, letterSpacing: '0.04em', textTransform: 'uppercase',
          padding: '10px 18px', border: 'none', cursor: 'pointer',
        }}>
          ENVOYER
          <svg viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 13 }}>
            <path d="M2 8h19M14 1l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </form>
  )
}
