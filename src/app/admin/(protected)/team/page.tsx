import { createClient } from '@/lib/supabase/server'
import TeamMemberEditor from '@/components/TeamMemberEditor'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface Member {
  id: string
  name: string
  role: string | null
  badge_color: string
  photo_url: string | null
  sort_order: number
}

export default async function TeamPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('team_members')
    .select('*')
    .order('sort_order', { ascending: true })

  const members = (data ?? []) as Member[]

  return (
    <div className="admin-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Équipe BDE</h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#6b7280' }}>
            Modifie les photos, noms et couleurs de badge affichés sur la page À propos.
          </p>
        </div>
        <Link href="/a-propos" target="_blank" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#f9fafb', border: '1px solid #e5e7eb',
          borderRadius: 8, padding: '9px 16px',
          fontSize: 13, color: '#374151', textDecoration: 'none',
          fontWeight: 600,
        }}>
          <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: 11 }} />
          Voir la page
        </Link>
      </div>

      {members.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: '#999' }}>
          <i className="fa-solid fa-users" style={{ fontSize: 40, marginBottom: 12, display: 'block' }} />
          <p style={{ margin: 0 }}>Aucun membre. Lance le SQL d&apos;initialisation.</p>
        </div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 20,
          }}>
            {members.map(m => (
              <TeamMemberEditor key={m.id} member={m} />
            ))}
          </div>

          <div style={{
            marginTop: 28,
            padding: '16px 20px',
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 8,
            fontSize: 13,
            color: '#92400e',
            lineHeight: 1.6,
          }}>
            <strong>💡 Astuce :</strong> Clique sur la photo circulaire pour uploader une nouvelle image.
            La photo sera automatiquement convertie en WebP et redimensionnée.
          </div>
        </>
      )}
    </div>
  )
}
