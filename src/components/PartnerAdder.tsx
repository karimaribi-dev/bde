'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function PartnerAdder() {
  const router = useRouter()
  const [adding, setAdding] = useState(false)

  async function handleAdd() {
    setAdding(true)
    const supabase = createClient()
    await supabase.from('partners').insert({ name: 'Nouveau partenaire', is_visible: false })
    setAdding(false)
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={adding}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
        border: '2px dashed #d1d5db', borderRadius: 10,
        background: 'transparent', cursor: adding ? 'wait' : 'pointer',
        padding: 20, minHeight: 160,
        color: '#9ca3af', fontSize: 13,
        transition: 'border-color 0.15s, color 0.15s',
      }}
      onMouseOver={e => { e.currentTarget.style.borderColor = '#262626'; e.currentTarget.style.color = '#262626' }}
      onMouseOut={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#9ca3af' }}
    >
      <i className="fa-solid fa-plus" style={{ fontSize: 22 }} />
      {adding ? 'Ajout…' : 'Ajouter un partenaire'}
    </button>
  )
}
