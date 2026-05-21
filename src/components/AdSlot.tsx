import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import AdSnippet from './AdSnippet'

interface Props {
  slotName: string
  style?: React.CSSProperties
  className?: string
  placeholderLabel?: string
  placeholderSize?: string
}

export default async function AdSlot({
  slotName,
  style,
  className,
  placeholderLabel = 'Publicité',
  placeholderSize,
}: Props) {
  const supabase = await createClient()
  const { data: slot } = await supabase
    .from('ad_slots')
    .select('*')
    .eq('id', slotName)
    .single()

  if (!slot || slot.is_active === false) return null

  if (slot.snippet) {
    return (
      <div style={style} className={className}>
        <AdSnippet html={slot.snippet} />
      </div>
    )
  }

  if (slot.fallback_image_url) {
    const img = (
      <Image
        src={slot.fallback_image_url}
        alt={slot.fallback_image_alt ?? slot.name}
        width={300}
        height={250}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
    )
    return (
      <div style={{ position: 'relative', width: '100%', ...style }} className={className}>
        {slot.fallback_link ? (
          <a href={slot.fallback_link} target="_blank" rel="noopener noreferrer">{img}</a>
        ) : img}
      </div>
    )
  }

  return (
    <div
      style={{
        border: '1px dashed rgba(12,12,12,.45)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        textAlign: 'center',
        minHeight: 180,
        position: 'relative',
        ...style,
      }}
      className={className}
    >
      <div style={{ position: 'absolute', inset: 8, background: 'linear-gradient(45deg,transparent calc(50% - .5px),rgba(12,12,12,.12) calc(50% - .5px),rgba(12,12,12,.12) calc(50% + .5px),transparent calc(50% + .5px)),linear-gradient(-45deg,transparent calc(50% - .5px),rgba(12,12,12,.12) calc(50% - .5px),rgba(12,12,12,.12) calc(50% + .5px),transparent calc(50% + .5px))', pointerEvents: 'none' }} />
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--mute)', position: 'relative' }}>
        <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>{placeholderLabel.toUpperCase()}</strong>
      </div>
      {placeholderSize && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--mute)', position: 'relative' }}>
          {placeholderSize}
        </div>
      )}
    </div>
  )
}
