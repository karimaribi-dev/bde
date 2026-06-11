import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Club } from '@/lib/types'
import DeleteClubButton from '@/components/DeleteClubButton'

export const dynamic = 'force-dynamic'

export default async function AdminClubsPage() {
  const supabase = await createClient()
  const { data: clubs } = await supabase
    .from('clubs')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  return (
    <>
      <header className="admin-header">
        <h1>Clubs</h1>
        <Link href="/admin/clubs/new" className="admin-btn-primary">
          <i className="fa-solid fa-plus"></i> Nouveau club
        </Link>
      </header>

      <div className="admin-table-card">
        {clubs?.length ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ordre</th>
                <th>Couleur</th>
                <th>Titre</th>
                <th>Tagline</th>
                <th>Lieu</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(clubs as Club[]).map(club => (
                <tr key={club.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>
                    {club.sort_order}
                  </td>
                  <td>
                    <div style={{
                      width: 24, height: 24, borderRadius: 4,
                      background: club.accent_color,
                      border: '1px solid rgba(0,0,0,0.1)',
                    }} />
                  </td>
                  <td>
                    <Link href={`/admin/clubs/${club.id}`} className="admin-table-link">
                      {club.title}
                    </Link>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {club.tagline}
                    {club.tagline_sub ? ` / ${club.tagline_sub}` : ''}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    {club.location || '—'}
                  </td>
                  <td>
                    {club.is_published
                      ? <span className="admin-badge" style={{ background: '#dcfce7', color: '#166534', borderColor: '#bbf7d0' }}>Publié</span>
                      : <span className="admin-badge" style={{ background: '#f3f4f6', color: '#6b7280', borderColor: '#e5e7eb' }}>Brouillon</span>
                    }
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Link href={`/admin/clubs/${club.id}`} className="admin-action-edit">Modifier</Link>
                      <Link href={`/fr/clubs/${club.slug}`} className="admin-action-edit" target="_blank" rel="noreferrer">Voir</Link>
                      <DeleteClubButton id={club.id} title={club.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="admin-empty">
            Aucun club.{' '}
            <Link href="/admin/clubs/new">Créer le premier</Link>
          </p>
        )}
      </div>
    </>
  )
}
