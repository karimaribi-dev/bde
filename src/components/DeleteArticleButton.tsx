'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DeleteArticleButton({ id, title }: { id: string; title: string }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    if (!confirm(`Supprimer "${title}" ?`)) return
    await supabase.from('articles').delete().eq('id', id)
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      className="admin-action-delete"
    >
      Supprimer
    </button>
  )
}
