'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DeletePopupButton({ id, title }: { id: string; title: string }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    if (!confirm(`Supprimer le popup "${title}" ?`)) return
    await supabase.from('popups').delete().eq('id', id)
    router.refresh()
  }

  return (
    <button onClick={handleDelete} className="admin-action-delete">
      Supprimer
    </button>
  )
}
