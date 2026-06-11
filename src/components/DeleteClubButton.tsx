'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DeleteClubButton({ id, title }: { id: string; title: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`Supprimer le club « ${title} » ? Cette action est irréversible.`)) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from('clubs').delete().eq('id', id)
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="admin-action-delete"
    >
      {loading ? '…' : 'Supprimer'}
    </button>
  )
}
