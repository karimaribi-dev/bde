'use client'

import { useState, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Popup } from '@/lib/types'

const EXPIRY_HOURS = 24

export default function SitePopupModal({ popup }: { popup: Popup }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [visible, setVisible] = useState(false)
  const popupId = popup.id

  useEffect(() => {
    if (pathname.startsWith('/admin')) return

    const isPreview = searchParams.get('preview_popup') === popupId

    if (isPreview) {
      setVisible(true)
      return
    }

    const key = `popup_${popupId}`
    const stored = localStorage.getItem(key)
    if (stored) {
      const dismissedAt = new Date(stored)
      const hoursSince = (Date.now() - dismissedAt.getTime()) / (1000 * 60 * 60)
      if (hoursSince < EXPIRY_HOURS) return
    }

    const timer = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(timer)
  }, [pathname, popupId, searchParams])

  function dismiss() {
    localStorage.setItem(`popup_${popupId}`, new Date().toISOString())
    setVisible(false)
  }

  if (!visible) return null

  const hasImage = !!popup.image_url
  const hasButton = !!popup.cta_text

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) dismiss() }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <style>{`
        .popup-inner { display: flex; overflow: hidden; }
        .popup-img   { position: relative; width: 45%; flex-shrink: 0; min-height: 340px; }
        .popup-body  { flex: 1; padding: 52px 40px 48px; display: flex; flex-direction: column; justify-content: center; gap: 16px; }
        .popup-body--centered { text-align: center; align-items: center; padding: 52px 48px 48px; }
        @media (max-width: 560px) {
          .popup-inner { flex-direction: column; }
          .popup-img   { width: 100%; min-height: 180px; }
          .popup-body  { padding: 28px 24px 32px; }
          .popup-body--centered { padding: 28px 24px 32px; }
        }
      `}</style>

      <div className="popup-inner" style={{
        background: '#fff',
        borderRadius: 4,
        maxWidth: hasImage ? 700 : 460,
        width: '100%',
        position: 'relative',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>

        {hasImage && (
          <div className="popup-img">
            <Image
              src={popup.image_url!}
              alt={popup.image_alt || ''}
              fill
              sizes="(max-width:560px) 100vw, 320px"
              style={{ objectFit: 'cover' }}
            />
          </div>
        )}

        <div className={`popup-body${!hasImage ? ' popup-body--centered' : ''}`} style={{
          textAlign: hasImage ? 'left' : 'center',
          alignItems: hasImage ? 'flex-start' : 'center',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 'clamp(24px, 2.5vw, 38px)',
            fontWeight: 900,
            color: '#111',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            margin: 0,
          }}>
            {popup.heading}
          </h2>

          {popup.subheading && (
            <p style={{ fontFamily: '"new-atten", sans-serif', fontSize: 18, color: '#444', lineHeight: 1.55, margin: 0 }}>
              {popup.subheading}
            </p>
          )}

          {hasButton && (
            popup.cta_url ? (
              <a
                href={popup.cta_url}
                onClick={dismiss}
                style={{
                  display: 'inline-block',
                  background: '#111',
                  color: '#fff',
                  padding: '11px 26px',
                  borderRadius: 4,
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: 'none',
                  letterSpacing: '0.04em',
                  marginTop: 4,
                }}
              >
                {popup.cta_text}
              </a>
            ) : (
              <button
                onClick={dismiss}
                style={{
                  display: 'inline-block',
                  background: '#111',
                  color: '#fff',
                  padding: '11px 26px',
                  borderRadius: 4,
                  fontSize: 13,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                  marginTop: 4,
                  fontFamily: 'inherit',
                }}
              >
                {popup.cta_text}
              </button>
            )
          )}
        </div>

        <button
          onClick={dismiss}
          aria-label="Fermer"
          style={{
            position: 'absolute',
            top: 14,
            right: 16,
            background: 'none',
            border: 'none',
            fontSize: 24,
            color: '#aaa',
            cursor: 'pointer',
            lineHeight: 1,
            padding: '2px 6px',
          }}
        >
          ×
        </button>
      </div>
    </div>
  )
}
