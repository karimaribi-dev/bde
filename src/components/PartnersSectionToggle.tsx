'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  initialValue: boolean
}

export default function PartnersSectionToggle({ initialValue }: Props) {
  const [enabled, setEnabled]   = useState(initialValue)
  const [saving,  setSaving]    = useState(false)
  const [feedback, setFeedback] = useState('')

  async function handleToggle() {
    const next = !enabled
    setEnabled(next)
    setSaving(true)
    setFeedback('')
    const supabase = createClient()
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'partners_section_visible', value: next ? 'true' : 'false' })
    setSaving(false)
    if (error) {
      setEnabled(!next) // rollback
      setFeedback('Erreur lors de la sauvegarde')
    } else {
      setFeedback(next ? 'Section affichée sur le site' : 'Section masquée sur le site')
      setTimeout(() => setFeedback(''), 2500)
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      background: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: 10,
      padding: '14px 18px',
      marginBottom: 28,
    }}>
      {/* iOS-style toggle */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={saving}
        aria-label={enabled ? 'Masquer la section partenaires' : 'Afficher la section partenaires'}
        style={{
          width: 48, height: 26, borderRadius: 13, border: 'none',
          background: enabled ? '#262626' : '#d1d5db',
          position: 'relative', cursor: saving ? 'wait' : 'pointer',
          flexShrink: 0, transition: 'background 0.2s',
          padding: 0,
        }}
      >
        <span style={{
          position: 'absolute',
          top: 3,
          left: enabled ? 25 : 3,
          width: 20, height: 20, borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.2s',
          display: 'block',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </button>

      <div>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>
          Afficher la section &quot;NOS PARTENAIRES&quot; sur À propos
        </p>
        <p style={{
          margin: '2px 0 0',
          fontSize: 12,
          color: feedback ? (feedback.startsWith('Erreur') ? '#dc2626' : '#16a34a') : '#6b7280',
          transition: 'color 0.2s',
        }}>
          {feedback || (enabled
            ? 'La section est visible sur le site (si des partenaires sont actifs).'
            : 'La section est masquée sur le site, même si des partenaires sont actifs.'
          )}
        </p>
      </div>
    </div>
  )
}
