import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Popup } from '@/lib/types'
import DeletePopupButton from '@/components/DeletePopupButton'

export const dynamic = 'force-dynamic'

function getPopupStatus(popup: Popup): { label: string; style: React.CSSProperties } {
  if (!popup.is_active) {
    return { label: 'Inactif', style: { background: '#f3f4f6', color: '#6b7280', borderColor: '#e5e7eb' } }
  }
  const now = new Date()
  if (popup.starts_at && new Date(popup.starts_at) > now) {
    return { label: 'Programmé', style: { background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' } }
  }
  if (popup.ends_at && new Date(popup.ends_at) < now) {
    return { label: 'Expiré', style: { background: '#fef9c3', color: '#854d0e', borderColor: '#fde68a' } }
  }
  return { label: 'Actif', style: { background: '#dcfce7', color: '#166534', borderColor: '#bbf7d0' } }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default async function AdminPopupsPage() {
  const supabase = await createClient()
  const { data: popups } = await supabase
    .from('popups')
    .select('*')
    .order('updated_at', { ascending: false })

  return (
    <>
      <header className="admin-header">
        <h1>Popups</h1>
        <Link href="/admin/popups/new" className="admin-btn-primary">
          <i className="fa-solid fa-plus"></i> Nouveau popup
        </Link>
      </header>

      <div className="admin-table-card">
        {popups?.length ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Titre interne</th>
                <th>Titre affiché</th>
                <th>Programmation</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(popups as Popup[]).map((popup) => {
                const status = getPopupStatus(popup)
                return (
                  <tr key={popup.id}>
                    <td>
                      <Link href={`/admin/popups/${popup.id}`} className="admin-table-link">
                        {popup.title}
                      </Link>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{popup.heading}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      {popup.starts_at || popup.ends_at ? (
                        <span>
                          {popup.starts_at ? formatDate(popup.starts_at) : '—'}{' → '}
                          {popup.ends_at ? formatDate(popup.ends_at) : '∞'}
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      <span className="admin-badge" style={status.style}>{status.label}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Link href={`/admin/popups/${popup.id}`} className="admin-action-edit">
                          Modifier
                        </Link>
                        <a
                          href={`/?preview_popup=${popup.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-action-edit"
                        >
                          Prévisualiser
                        </a>
                        <DeletePopupButton id={popup.id} title={popup.title} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <p className="admin-empty">
            Aucun popup.{' '}
            <Link href="/admin/popups/new">Créer le premier</Link>
          </p>
        )}
      </div>
    </>
  )
}
