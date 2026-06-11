'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DeleteEventButton({ id, title }: { id: string; title: string }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    if (!confirm(`Supprimer l'événement "${title}" ?`)) return
    await supabase.from('events').delete().eq('id', id)
    router.refresh()
  }

  return (
    <button onClick={handleDelete} className="admin-action-delete">
      Supprimer
    </button>
  )
}
