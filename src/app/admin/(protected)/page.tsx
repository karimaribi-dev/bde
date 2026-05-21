import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { count: totalArticles },
    { count: published },
    { count: drafts },
    { count: categories },
    { data: recent },
  ] = await Promise.all([
    supabase.from('articles').select('*', { count: 'exact', head: true }),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('articles').select('id, title, status, updated_at').order('updated_at', { ascending: false }).limit(5),
  ])

  const stats = [
    { label: 'Total articles', value: totalArticles ?? 0, icon: 'fa-solid fa-newspaper' },
    { label: 'Publiés', value: published ?? 0, icon: 'fa-solid fa-check' },
    { label: 'Brouillons', value: drafts ?? 0, icon: 'fa-regular fa-file-lines' },
    { label: 'Catégories', value: categories ?? 0, icon: 'fa-solid fa-tag' },
  ]

  const username = user?.email?.split('@')[0] ?? 'Admin'

  return (
    <>
      <header className="admin-header">
        <h1>Hi, {username} !</h1>
        <Link href="/admin/articles/new" className="admin-btn-primary">
          <i className="fa-solid fa-plus"></i> Nouvel article
        </Link>
      </header>

      <div className="admin-stats-grid">
        {stats.map((s) => (
          <div key={s.label} className="admin-stat-card">
            <div className="admin-stat-top">
              <span className="admin-stat-label">{s.label}</span>
              <i className={`${s.icon} admin-stat-icon`}></i>
            </div>
            <div className="admin-stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        <div className="admin-card-header" style={{ padding: '20px 25px 0 25px' }}>
          <h3>Articles récents</h3>
          <Link href="/admin/articles" className="admin-card-link">Voir tous</Link>
        </div>
        <div style={{ padding: '0 25px 10px 25px' }}>
          {recent?.map((article) => (
            <div key={article.id} className="admin-article-row">
              <Link href={`/admin/articles/${article.id}`} className="admin-article-title">
                {article.title}
              </Link>
              <span className={`admin-badge${article.status !== 'published' ? ' admin-badge-draft' : ''}`}>
                {article.status === 'published' ? 'Publié' : 'Brouillon'}
              </span>
            </div>
          ))}
          {!recent?.length && (
            <p className="admin-empty">Aucun article pour le moment.</p>
          )}
        </div>
      </div>
    </>
  )
}
