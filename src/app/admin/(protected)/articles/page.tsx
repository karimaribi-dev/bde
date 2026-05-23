import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Article, Category } from '@/lib/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import DeleteArticleButton from '@/components/DeleteArticleButton'

function fmtTime(dateStr: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

const LOCALE_FLAG: Record<string, string> = {
  fr: '🇫🇷', en: '🇬🇧', es: '🇪🇸', de: '🇩🇪',
}

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
                <th>Langue</th>
                <th>Statut</th>
                <th>Date</th>
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
                  <td style={{ fontSize: '18px' }} title={(article as Article & { locale?: string }).locale ?? 'fr'}>
                    {LOCALE_FLAG[(article as Article & { locale?: string }).locale ?? 'fr'] ?? '🇫🇷'}
                  </td>
                  <td>
                    <span className={`admin-badge${article.status !== 'published' ? ' admin-badge-draft' : ''}`}>
                      {article.status === 'published' ? 'Publié' : 'Brouillon'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    {article.status === 'draft'
                      ? <span title="Intégré le">
                          {format(new Date(article.created_at), 'd MMM yyyy', { locale: fr })}
                          <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '11px', opacity: 0.7 }}>
                            {fmtTime(article.created_at)}
                          </span>
                        </span>
                      : <span>
                          {format(new Date(article.updated_at), 'd MMM yyyy', { locale: fr })}
                          <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '11px', opacity: 0.7 }}>
                            {fmtTime(article.updated_at)}
                          </span>
                        </span>
                    }
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
