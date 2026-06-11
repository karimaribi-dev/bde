'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props { id: string; isProcessed: boolean }

export default function MarkOrderProcessedButton({ id, isProcessed }: Props) {
  const router  = useRouter()
  const [busy, setBusy] = useState(false)

  async function toggle() {
    setBusy(true)
    const supabase = createClient()
    await supabase.from('shop_orders').update({ is_processed: !isProcessed }).eq('id', id)
    setBusy(false)
    router.refresh()
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      style={{
        border: '1px solid',
        borderColor: isProcessed ? '#e5e7eb' : '#16a34a',
        background: isProcessed ? '#f9fafb' : '#f0fdf4',
        color:  isProcessed ? '#6b7280' : '#16a34a',
        borderRadius: 6,
        padding: '6px 13px',
        fontSize: 12,
        fontWeight: 600,
        cursor: busy ? 'wait' : 'pointer',
        flexShrink: 0,
        whiteSpace: 'nowrap',
        transition: 'all 0.15s',
      }}
    >
      {busy ? '…' : isProcessed ? 'Traité ✓' : 'Marquer traité'}
    </button>
  )
}
