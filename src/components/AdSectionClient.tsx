'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdSnippet from './AdSnippet'
import type { AdSlot } from '@/lib/types'

interface Props {
  slotId: string
  variant: 'display' | 'sponsored' | 'promo'
}

export default function AdSectionClient({ slotId, variant }: Props) {
  const [slot, setSlot] = useState<AdSlot | null | undefined>(undefined)

  useEffect(() => {
    createClient()
      .from('ad_slots')
      .select('*')
      .eq('id', slotId)
      .single()
      .then(({ data }) => setSlot(data ?? null))
  }, [slotId])

  // Slot inactif ou introuvable → ne rien afficher du tout
  if (slot === null || (slot && slot.is_active === false)) return null

  const hasContent = slot && (slot.snippet || slot.fallback_image_url)

  // ── Contenu réel (image ou snippet) : pas de labels ──
  if (hasContent) {
    if (slot.snippet) {
      return (
        <div style={wrapperStyle(variant)}>
          <AdSnippet html={slot.snippet} />
        </div>
      )
    }
    if (slot.fallback_image_url) {
      const inner = (
        <div style={{ position: 'relative', width: '100%', flex: 1, minHeight: 120 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slot.fallback_image_url}
            alt={slot.fallback_image_alt ?? ''}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      )
      return (
        <div style={{ ...wrapperStyle(variant), display: 'flex', flexDirection: 'column' }}>
          {slot.fallback_link
            ? <a href={slot.fallback_link} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', flex: 1 }}>{inner}</a>
            : inner}
        </div>
      )
    }
  }

  // ── Placeholder (loading ou vide) : avec labels ──
  if (variant === 'display') {
    return (
      <div style={{ borderBottom: 'var(--hair-mute)', padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.22em', color: 'var(--mute)', textTransform: 'uppercase' }}>
          <span>Publicité</span>
          <span style={{ display: 'inline-flex', gap: 4 }}>
            <i style={{ width: 5, height: 5, background: 'var(--ink)', display: 'inline-block' }} />
            <i style={{ width: 5, height: 5, background: 'var(--ink)', display: 'inline-block' }} />
            <i style={{ width: 5, height: 5, background: 'var(--ink)', display: 'inline-block' }} />
          </span>
        </div>
        <Placeholder size="300 × 250 · IAB" />
      </div>
    )
  }

  if (variant === 'sponsored') {
    return (
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10, borderTop: 'var(--hair)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--mute)' }}>— Contenu sponsorisé</span>
        <Placeholder />
      </div>
    )
  }

  if (variant === 'promo') {
    return (
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10, borderTop: 'var(--hair)', background: 'var(--ink)', color: 'var(--paper)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(243,239,230,.55)' }}>— Annonce</span>
        <Placeholder dark />
      </div>
    )
  }

  return null
}

function wrapperStyle(variant: Props['variant']): React.CSSProperties {
  if (variant === 'display') return { borderBottom: 'var(--hair-mute)', padding: '22px 20px', flex: 1 }
  if (variant === 'sponsored') return { padding: '16px 20px', borderTop: 'var(--hair)' }
  if (variant === 'promo') return { padding: '16px 20px', borderTop: 'var(--hair)', background: 'var(--ink)' }
  return {}
}

function Placeholder({ size, dark }: { size?: string; dark?: boolean }) {
  return (
    <div style={{
      border: `1px dashed ${dark ? 'rgba(243,239,230,.25)' : 'rgba(12,12,12,.45)'}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 8, textAlign: 'center', minHeight: 100, position: 'relative',
    }}>
      <div style={{ position: 'absolute', inset: 8, background: 'linear-gradient(45deg,transparent calc(50% - .5px),rgba(12,12,12,.08) calc(50% - .5px),rgba(12,12,12,.08) calc(50% + .5px),transparent calc(50% + .5px)),linear-gradient(-45deg,transparent calc(50% - .5px),rgba(12,12,12,.08) calc(50% - .5px),rgba(12,12,12,.08) calc(50% + .5px),transparent calc(50% + .5px))', pointerEvents: 'none' }} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: dark ? 'rgba(243,239,230,.4)' : 'var(--mute)', position: 'relative' }}>
        {size ?? 'Emplacement publicitaire'}
      </span>
    </div>
  )
}
