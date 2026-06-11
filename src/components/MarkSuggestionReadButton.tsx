'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props { id: string; isRead: boolean }

export default function MarkSuggestionReadButton({ id, isRead }: Props) {
  const router  = useRouter()
  const [busy, setBusy] = useState(false)

  async function toggle() {
    setBusy(true)
    const supabase = createClient()
    await supabase.from('suggestions').update({ is_read: !isRead }).eq('id', id)
    setBusy(false)
    router.refresh()
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      title={isRead ? 'Marquer comme non lu' : 'Marquer comme lu'}
      style={{
        border: '1px solid',
        borderColor: isRead ? '#e5e7eb' : '#FF4D1F',
        background: isRead ? '#f9fafb' : '#fff7f5',
        color:  isRead ? '#6b7280' : '#FF4D1F',
        borderRadius: 6,
        padding: '6px 13px',
        fontSize: 12,
        fontWeight: 600,
        cursor: busy ? 'wait' : 'pointer',
        flexShrink: 0,
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {busy ? '…' : isRead ? 'Lu ✓' : 'Marquer lu'}
    </button>
  )
}
