'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function MarkRequestReadButton({ id, isRead }: { id: string; isRead: boolean }) {
  const router = useRouter()

  async function toggle() {
    const supabase = createClient()
    await supabase.from('club_join_requests').update({ is_read: !isRead }).eq('id', id)
    router.refresh()
  }

  return (
    <button
      onClick={toggle}
      style={{
        padding: '4px 10px',
        background: isRead ? '#f3f4f6' : '#fef9c3',
        color: isRead ? '#6b7280' : '#854d0e',
        border: `1px solid ${isRead ? '#e5e7eb' : '#fde68a'}`,
        borderRadius: 4, fontSize: 12, cursor: 'pointer', fontWeight: 600,
      }}
    >
      {isRead ? 'Lu' : 'Marquer lu'}
    </button>
  )
}
