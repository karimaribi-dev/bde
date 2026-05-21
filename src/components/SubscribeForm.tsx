'use client'

import { useState } from 'react'

export default function SubscribeForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) { setStatus('error'); setErrorMsg(data.error ?? 'Erreur') }
      else { setStatus('success'); setEmail('') }
    } catch {
      setStatus('error')
      setErrorMsg('Erreur réseau, réessayez.')
    }
  }

  if (status === 'success') {
    return (
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.1em', color: '#16a34a' }}>
        ✓ Inscription confirmée !
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 0, width: '100%', maxWidth: 420 }}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="votre@email.com"
        required
        style={{
          flex: 1,
          border: '1px solid var(--hair)',
          borderRight: 'none',
          padding: '9px 14px',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          background: 'var(--paper)',
          color: 'var(--ink)',
          outline: 'none',
          minWidth: 0,
        }}
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        style={{
          padding: '9px 18px',
          background: 'var(--ink)',
          color: 'var(--paper)',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '.18em',
          textTransform: 'uppercase',
          border: 'none',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          opacity: status === 'loading' ? .6 : 1,
        }}
      >
        {status === 'loading' ? '…' : "S'inscrire →"}
      </button>
      {status === 'error' && (
        <p style={{ position: 'absolute', marginTop: 40, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#dc2626' }}>{errorMsg}</p>
      )}
    </form>
  )
}
