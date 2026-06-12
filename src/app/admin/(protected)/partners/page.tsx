import { createClient } from '@/lib/supabase/server'
import PartnerEditor from '@/components/PartnerEditor'
import PartnerAdder from '@/components/PartnerAdder'

export const dynamic = 'force-dynamic'

interface Partner {
  id: string
  name: string
  logo_url: string | null
  website_url: string | null
  is_visible: boolean
  sort_order: number
}

export default async function PartnersPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('partners')
    .select('*')
    .order('sort_order', { ascending: true })

  const partners = (data ?? []) as Partner[]

  return (
    <div className="admin-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Partenaires</h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#6b7280' }}>
            Les logos affichés dans la section partenaires de la page À propos.
            La section est masquée automatiquement si aucun partenaire n&apos;est visible.
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 20,
        marginBottom: 24,
      }}>
        {partners.map(p => (
          <PartnerEditor key={p.id} partner={p} />
        ))}
        <PartnerAdder />
      </div>

      {partners.length === 0 && (
        <div style={{ padding: '40px 0', textAlign: 'center', color: '#999' }}>
          <i className="fa-solid fa-handshake" style={{ fontSize: 36, marginBottom: 12, display: 'block' }} />
          <p style={{ margin: 0 }}>Aucun partenaire. Clique sur &quot;Ajouter&quot; pour commencer.</p>
        </div>
      )}
    </div>
  )
}
