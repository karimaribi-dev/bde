'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DeletePageButton({ id, title }: { id: string; title: string }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    if (!confirm(`Supprimer la page "${title}" ?`)) return
    await supabase.from('pages').delete().eq('id', id)
    router.refresh()
  }

  return (
    <button onClick={handleDelete} className="admin-action-delete">
      Supprimer
    </button>
  )
}
