import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import AdSlotEditor from '@/components/AdSlotEditor'

export const dynamic = 'force-dynamic'

export default async function AdminAdSlotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: slot } = await supabase
    .from('ad_slots')
    .select('*')
    .eq('id', id)
    .single()

  if (!slot) notFound()

  return (
    <>
      <header className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            href="/admin/ads"
            style={{ color: 'var(--mute)', textDecoration: 'none', fontSize: 13 }}
          >
            ← Publicités
          </Link>
        </div>
      </header>

      <AdSlotEditor slot={slot} />
    </>
  )
}
