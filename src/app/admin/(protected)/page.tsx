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
    { count: unreadRequests },
    { count: totalClubs },
    { count: totalProducts },
    { count: unreadSuggestions },
  ] = await Promise.all([
    supabase.from('articles').select('*', { count: 'exact', head: true }),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('articles').select('id, title, status, updated_at').order('updated_at', { ascending: false }).limit(5),
    supabase.from('club_join_requests').select('*', { count: 'exact', head: true }).eq('is_read', false),
    supabase.from('clubs').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('suggestions').select('*', { count: 'exact', head: true }).eq('is_read', false),
  ])

  const stats = [
    { label: 'Total articles', value: totalArticles ?? 0, icon: 'fa-solid fa-newspaper' },
    { label: 'Publiés',        value: published ?? 0,     icon: 'fa-solid fa-check' },
    { label: 'Brouillons',     value: drafts ?? 0,        icon: 'fa-regular fa-file-lines' },
    { label: 'Catégories',     value: categories ?? 0,    icon: 'fa-solid fa-tag' },
  ]

  const username    = user?.email?.split('@')[0] ?? 'Admin'
  const unread      = unreadRequests ?? 0
  const unreadSugg  = unreadSuggestions ?? 0

  return (
    <>
      <header className="admin-header">
        <h1>Hi, {username} !</h1>
        <Link href="/admin/articles/new" className="admin-btn-primary">
          <i className="fa-solid fa-plus"></i> Nouvel article
        </Link>
      </header>

      {/* ── Notification demandes d'adhésion ── */}
      {unread > 0 && (
        <Link href="/admin/club-requests" style={{ textDecoration: 'none', display: 'block', marginBottom: 20 }}>
          <div style={{
            background: '#fffbeb',
            border: '1.5px solid #fde68a',
            borderRadius: 10,
            padding: '16px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            transition: 'background 0.15s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 42, height: 42, borderRadius: '50%',
                background: '#FF4D1F', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, flexShrink: 0,
              }}>
                <i className="fa-solid fa-bell" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#262626' }}>
                  {unread} nouvelle{unread > 1 ? 's' : ''} demande{unread > 1 ? 's' : ''} d&apos;adhésion
                </div>
                <div style={{ fontSize: 13, color: '#92400e', marginTop: 2 }}>
                  Des étudiants souhaitent rejoindre un club — cliquez pour voir
                </div>
              </div>
            </div>
            <span style={{
              background: '#FF4D1F', color: '#fff',
              fontWeight: 700, fontSize: 13,
              padding: '4px 12px', borderRadius: 99, flexShrink: 0,
            }}>
              {unread} non lu{unread > 1 ? 's' : ''}
            </span>
          </div>
        </Link>
      )}

      {/* ── Notification suggestions ── */}
      {unreadSugg > 0 && (
        <Link href="/admin/suggestions" style={{ textDecoration: 'none', display: 'block', marginBottom: 20 }}>
          <div style={{
            background: '#eff6ff',
            border: '1.5px solid #bfdbfe',
            borderRadius: 10,
            padding: '16px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 42, height: 42, borderRadius: '50%',
                background: '#4FA3FF', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, flexShrink: 0,
              }}>
                <i className="fa-solid fa-lightbulb" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#262626' }}>
                  {unreadSugg} nouvelle{unreadSugg > 1 ? 's' : ''} suggestion{unreadSugg > 1 ? 's' : ''}
                </div>
                <div style={{ fontSize: 13, color: '#1d4ed8', marginTop: 2 }}>
                  Des idées ont été proposées — cliquez pour voir
                </div>
              </div>
            </div>
            <span style={{
              background: '#4FA3FF', color: '#fff',
              fontWeight: 700, fontSize: 13,
              padding: '4px 12px', borderRadius: 99, flexShrink: 0,
            }}>
              {unreadSugg} non lu{unreadSugg > 1 ? 'es' : 'e'}
            </span>
          </div>
        </Link>
      )}

      {/* ── Stats articles ── */}
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

      {/* ── Raccourcis BDE ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <Link href="/admin/clubs" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 38, height: 38, background: '#FFB3F0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
              <i className="fa-solid fa-people-group" style={{ color: '#262626' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#262626' }}>{totalClubs ?? 0} club{(totalClubs ?? 0) > 1 ? 's' : ''}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Gérer les clubs</div>
            </div>
          </div>
        </Link>

        <Link href="/admin/products" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 38, height: 38, background: '#FFE74A', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
              <i className="fa-solid fa-bag-shopping" style={{ color: '#262626' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#262626' }}>{totalProducts ?? 0} produit{(totalProducts ?? 0) > 1 ? 's' : ''}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Gérer le shop</div>
            </div>
          </div>
        </Link>

        <Link href="/admin/club-requests" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#fff', border: `1px solid ${unread > 0 ? '#fde68a' : '#e5e7eb'}`, borderRadius: 8, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: -6, right: -6,
                background: '#FF4D1F', color: '#fff',
                fontSize: 11, fontWeight: 700,
                width: 22, height: 22, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {unread}
              </span>
            )}
            <div style={{ width: 38, height: 38, background: '#FF4D1F', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
              <i className="fa-solid fa-envelope" style={{ color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#262626' }}>Adhésions clubs</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{unread > 0 ? `${unread} non lu${unread > 1 ? 's' : ''}` : 'Voir les demandes'}</div>
            </div>
          </div>
        </Link>

        <Link href="/admin/suggestions" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#fff', border: `1px solid ${unreadSugg > 0 ? '#bfdbfe' : '#e5e7eb'}`, borderRadius: 8, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
            {unreadSugg > 0 && (
              <span style={{
                position: 'absolute', top: -6, right: -6,
                background: '#4FA3FF', color: '#fff',
                fontSize: 11, fontWeight: 700,
                width: 22, height: 22, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {unreadSugg}
              </span>
            )}
            <div style={{ width: 38, height: 38, background: '#4FA3FF', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
              <i className="fa-solid fa-lightbulb" style={{ color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#262626' }}>Suggestions</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{unreadSugg > 0 ? `${unreadSugg} non lu${unreadSugg > 1 ? 'es' : 'e'}` : 'Voir les idées'}</div>
            </div>
          </div>
        </Link>
      </div>

      {/* ── Articles récents ── */}
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
