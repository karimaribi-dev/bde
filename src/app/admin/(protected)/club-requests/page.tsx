import { createClient } from '@/lib/supabase/server'
import MarkRequestReadButton from '@/components/MarkRequestReadButton'

export const dynamic = 'force-dynamic'

interface ClubRequest {
  id: string
  club_slug: string
  club_title: string
  prenom: string
  nom: string
  classe: string | null
  mail: string
  presentation: string | null
  is_read: boolean
  created_at: string
}

export default async function ClubRequestsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('club_join_requests')
    .select('*')
    .order('created_at', { ascending: false })

  const requests = (data ?? []) as ClubRequest[]
  const unread   = requests.filter(r => !r.is_read).length

  return (
    <div className="admin-content">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Demandes d&apos;adhésion clubs</h1>
        {unread > 0 && (
          <span style={{
            background: '#FF4D1F', color: '#fff',
            fontWeight: 700, fontSize: 13,
            padding: '3px 10px', borderRadius: 99,
          }}>
            {unread} non lu{unread > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {requests.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: '#999' }}>
          <i className="fa-solid fa-inbox" style={{ fontSize: 40, marginBottom: 12, display: 'block' }} />
          <p style={{ margin: 0 }}>Aucune demande pour le moment.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {requests.map(req => (
            <div
              key={req.id}
              style={{
                background: req.is_read ? '#fff' : '#fffbeb',
                border: `1px solid ${req.is_read ? '#e5e7eb' : '#fde68a'}`,
                borderRadius: 8,
                padding: '18px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {/* En-tête */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {!req.is_read && (
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF4D1F', flexShrink: 0, display: 'inline-block' }} />
                    )}
                    <span style={{ fontWeight: 700, fontSize: 16 }}>
                      {req.prenom} {req.nom}
                    </span>
                    {req.classe && (
                      <span style={{ fontSize: 13, color: '#6b7280' }}>· {req.classe}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2, paddingLeft: req.is_read ? 0 : 18 }}>
                    <a href={`mailto:${req.mail}`} style={{ color: '#0369a1', textDecoration: 'none' }}>{req.mail}</a>
                    {' · '}
                    <span style={{
                      display: 'inline-block',
                      background: '#f3f4f6', color: '#374151',
                      fontSize: 11, fontWeight: 600, padding: '1px 7px', borderRadius: 99,
                    }}>
                      {req.club_title}
                    </span>
                    {' · '}
                    {new Date(req.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <MarkRequestReadButton id={req.id} isRead={req.is_read} />
              </div>

              {/* Mini présentation */}
              {req.presentation && (
                <div style={{
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: '#374151',
                  background: '#f9fafb',
                  borderRadius: 4,
                  padding: '10px 14px',
                  borderLeft: '3px solid #e5e7eb',
                }}>
                  {req.presentation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
