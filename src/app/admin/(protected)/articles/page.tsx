import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Article, Category } from '@/lib/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import DeleteArticleButton from '@/components/DeleteArticleButton'

export const dynamic = 'force-dynamic'

export default async function AdminArticlesPage() {
  const supabase = await createClient()

  const { data: articles } = await supabase
    .from('articles')
    .select('*, category:categories!category_id(id, name, slug)')
    .order('updated_at', { ascending: false })

  return (
    <>
      <header className="admin-header">
        <h1>Articles</h1>
        <Link href="/admin/articles/new" className="admin-btn-primary">
          <i className="fa-solid fa-plus"></i> Nouvel article
        </Link>
      </header>

      <div className="admin-table-card">
        {articles?.length ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Catégorie</th>
                <th>Statut</th>
                <th>Modifié</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(articles as (Article & { category?: Category })[]).map((article) => (
                <tr key={article.id}>
                  <td>
                    <Link href={`/admin/articles/${article.id}`} className="admin-table-link">
                      {article.title}
                    </Link>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {article.category?.name ?? '—'}
                  </td>
                  <td>
                    <span className={`admin-badge${article.status !== 'published' ? ' admin-badge-draft' : ''}`}>
                      {article.status === 'published' ? 'Publié' : 'Brouillon'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    {format(new Date(article.updated_at), 'd MMM yyyy', { locale: fr })}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Link href={`/admin/articles/${article.id}`} className="admin-action-edit">
                        Modifier
                      </Link>
                      <DeleteArticleButton id={article.id} title={article.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="admin-empty">
            Aucun article.{' '}
            <Link href="/admin/articles/new">Créer le premier</Link>
          </p>
        )}
      </div>
    </>
  )
}
