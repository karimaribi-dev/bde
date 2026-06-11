'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DeleteProductButton({ id, title }: { id: string; title: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`Supprimer « ${title} » ?`)) return
    const supabase = createClient()
    await supabase.from('products').delete().eq('id', id)
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      style={{
        padding: '4px 10px', background: '#fee2e2', color: '#dc2626',
        border: '1px solid #fca5a5', borderRadius: 4, fontSize: 12,
        cursor: 'pointer', fontWeight: 600,
      }}
    >
      Supprimer
    </button>
  )
}
