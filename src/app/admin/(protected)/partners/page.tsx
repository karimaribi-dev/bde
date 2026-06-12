import { createClient } from '@/lib/supabase/server'
import PartnerEditor from '@/components/PartnerEditor'
import PartnerAdder from '@/components/PartnerAdder'
import PartnersSectionToggle from '@/components/PartnersSectionToggle'

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
  const [{ data }, { data: settingData }] = await Promise.all([
    supabase.from('partners').select('*').order('sort_order', { ascending: true }),
    supabase.from('site_settings').select('value').eq('key', 'partners_section_visible').single(),
  ])

  const partners = (data ?? []) as Partner[]
  const sectionVisible = settingData?.value !== 'false'

  return (
    <div className="admin-content">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 700 }}>Partenaires</h1>
        <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
          Les logos affichés dans la section partenaires de la page À propos.
        </p>
      </div>

      <PartnersSectionToggle initialValue={sectionVisible} />

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
