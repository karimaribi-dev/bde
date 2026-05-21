import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Page } from '@/lib/types'
import DeletePageButton from '@/components/DeletePageButton'

export const dynamic = 'force-dynamic'

export default async function AdminPagesPage() {
  const supabase = await createClient()
  const { data: pages } = await supabase
    .from('pages')
    .select('*')
    .order('title', { ascending: true })

  return (
    <>
      <header className="admin-header">
        <h1>Pages</h1>
        <Link href="/admin/pages/new" className="admin-btn-primary">
          <i className="fa-solid fa-plus"></i> Nouvelle page
        </Link>
      </header>

      <div className="admin-table-card">
        {pages?.length ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>URL</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(pages as Page[]).map((page) => (
                <tr key={page.id}>
                  <td>
                    <Link href={`/admin/pages/${page.id}`} className="admin-table-link">
                      {page.title}
                    </Link>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>/p/{page.slug}</td>
                  <td>
                    <span className={`admin-badge${!page.is_published ? ' admin-badge-draft' : ''}`}>
                      {page.is_published ? 'Publiée' : 'Non publiée'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Link href={`/admin/pages/${page.id}`} className="admin-action-edit">
                        Modifier
                      </Link>
                      <a
                        href={`/p/${page.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="admin-action-edit"
                        style={{ marginRight: 12 }}
                      >
                        Voir
                      </a>
                      <DeletePageButton id={page.id} title={page.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="admin-empty">
            Aucune page.{' '}
            <Link href="/admin/pages/new">Créer la première</Link>
          </p>
        )}
      </div>
    </>
  )
}
