'use client'

import { useState, useEffect } from 'react'

const CONSENT_KEY = 'cookie_consent_v1'

// GTM est déjà chargé par GtmLoader (inconditionnellement).
// On pousse juste l'événement de consentement dans le dataLayer.
function pushConsentAccepted() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any
  w.dataLayer = w.dataLayer || []
  w.dataLayer.push({ event: 'cookie_consent_accepted' })
}

function pushConsentRefused() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any
  w.dataLayer = w.dataLayer || []
  w.dataLayer.push({ event: 'cookie_consent_refused' })
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY)
    if (!stored) {
      // Small delay so page loads first
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    }
    if (stored === 'accepted') {
      pushConsentAccepted()
    }
  }, [])

  function accept() {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    setVisible(false)
    pushConsentAccepted()
  }

  function refuse() {
    localStorage.setItem(CONSENT_KEY, 'refused')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Consentement cookies"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        background: 'var(--ink)',
        color: 'var(--paper)',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        flexWrap: 'wrap',
        animation: 'cookieSlideUp 0.3s ease',
      }}
    >
      <style>{`@keyframes cookieSlideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>

      <p style={{
        margin: 0,
        flex: 1,
        minWidth: 220,
        fontFamily: '"new-atten", sans-serif',
        fontSize: '1rem',
        lineHeight: 1.5,
        color: 'var(--paper)',
        opacity: 0.9,
      }}>
        Nous utilisons des cookies pour mesurer l&apos;audience de notre site et améliorer votre expérience.
        {' '}<a href="/politique-confidentialite" style={{ color: 'var(--yellow)', textDecoration: 'underline', fontSize: '0.9rem' }}>En savoir plus</a>
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
        <button
          onClick={refuse}
          style={{
            background: 'transparent',
            border: '1.5px solid rgba(255,255,250,0.3)',
            color: 'var(--paper)',
            padding: '0.5rem 1.4rem',
            borderRadius: 999,
            fontSize: '0.8rem',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Refuser
        </button>
        <button
          onClick={accept}
          style={{
            background: 'var(--yellow)',
            border: 'none',
            color: 'var(--ink)',
            padding: '0.5rem 1.6rem',
            borderRadius: 999,
            fontSize: '0.8rem',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Accepter
        </button>
      </div>
    </div>
  )
}
