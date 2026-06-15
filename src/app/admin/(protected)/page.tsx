import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { count: unreadRequests },
    { count: totalClubs },
    { count: totalProducts },
    { count: unreadSuggestions },
    { count: pendingOrders },
  ] = await Promise.all([
    supabase.from('club_join_requests').select('*', { count: 'exact', head: true }).eq('is_read', false),
    supabase.from('clubs').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('suggestions').select('*', { count: 'exact', head: true }).eq('is_read', false),
    supabase.from('shop_orders').select('*', { count: 'exact', head: true }).eq('is_processed', false),
  ])

  const username   = user?.email?.split('@')[0] ?? 'Admin'
  const unread     = unreadRequests ?? 0
  const unreadSugg = unreadSuggestions ?? 0
  const pending    = pendingOrders ?? 0

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


      {/* ── Notification commandes ── */}
      {pending > 0 && (
        <Link href="/admin/orders" style={{ textDecoration: 'none', display: 'block', marginBottom: 20 }}>
          <div style={{
            background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 10,
            padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                <i className="fa-solid fa-receipt" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#262626' }}>
                  {pending} commande{pending > 1 ? 's' : ''} en attente
                </div>
                <div style={{ fontSize: 13, color: '#166534', marginTop: 2 }}>
                  Des élèves ont passé commande — cliquez pour voir
                </div>
              </div>
            </div>
            <span style={{ background: '#16a34a', color: '#fff', fontWeight: 700, fontSize: 13, padding: '4px 12px', borderRadius: 99, flexShrink: 0 }}>
              {pending} à traiter
            </span>
          </div>
        </Link>
      )}

      {/* ── Raccourcis BDE ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 24 }}>
        <Link href="/admin/clubs" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, background: '#FFB3F0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
              <i className="fa-solid fa-people-group" style={{ color: '#262626' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#262626' }}>{totalClubs ?? 0} club{(totalClubs ?? 0) > 1 ? 's' : ''}</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>Gérer les clubs</div>
            </div>
          </div>
        </Link>

        <Link href="/admin/products" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, background: '#FFE74A', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
              <i className="fa-solid fa-bag-shopping" style={{ color: '#262626' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#262626' }}>{totalProducts ?? 0} produit{(totalProducts ?? 0) > 1 ? 's' : ''}</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>Gérer le shop</div>
            </div>
          </div>
        </Link>

        <Link href="/admin/club-requests" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#fff', border: `1px solid ${unread > 0 ? '#fde68a' : '#e5e7eb'}`, borderRadius: 8, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
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
            <div style={{ width: 36, height: 36, background: '#FF4D1F', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
              <i className="fa-solid fa-envelope" style={{ color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#262626' }}>Adhésions clubs</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>{unread > 0 ? `${unread} non lu${unread > 1 ? 's' : ''}` : 'Voir les demandes'}</div>
            </div>
          </div>
        </Link>

        <Link href="/admin/suggestions" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#fff', border: `1px solid ${unreadSugg > 0 ? '#bfdbfe' : '#e5e7eb'}`, borderRadius: 8, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
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
            <div style={{ width: 36, height: 36, background: '#4FA3FF', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
              <i className="fa-solid fa-lightbulb" style={{ color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#262626' }}>Suggestions</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>{unreadSugg > 0 ? `${unreadSugg} non lu${unreadSugg > 1 ? 'es' : 'e'}` : 'Voir les idées'}</div>
            </div>
          </div>
        </Link>

        <Link href="/admin/orders" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#fff', border: `1px solid ${pending > 0 ? '#bbf7d0' : '#e5e7eb'}`, borderRadius: 8, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
            {pending > 0 && (
              <span style={{ position: 'absolute', top: -6, right: -6, background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700, width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {pending}
              </span>
            )}
            <div style={{ width: 36, height: 36, background: '#16a34a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
              <i className="fa-solid fa-receipt" style={{ color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#262626' }}>Commandes</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>{pending > 0 ? `${pending} à traiter` : 'Voir les ordres'}</div>
            </div>
          </div>
        </Link>
      </div>

      {/* ── Contact développeur ── */}
      <div style={{
        marginTop: 8,
        padding: '14px 20px',
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontSize: 13,
        color: '#6b7280',
      }}>
        <i className="fa-solid fa-circle-info" style={{ color: '#9ca3af', fontSize: 15, flexShrink: 0 }} />
        <span>
          Vous rencontrez un problème ou un bug ?{' '}
          <a href="mailto:karimaribi@gmail.com?subject=Ticket%20Site%20BDE" style={{ color: '#4FA3FF', fontWeight: 600, textDecoration: 'none' }}>
            Contactez le développeur
          </a>
        </span>
      </div>

    </>
  )
}
