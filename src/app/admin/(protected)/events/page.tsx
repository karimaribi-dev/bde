import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Event } from '@/lib/types'
import DeleteEventButton from '@/components/DeleteEventButton'

export const dynamic = 'force-dynamic'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function AdminEventsPage() {
  const supabase = await createClient()
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true })

  const today = new Date().toISOString().slice(0, 10)

  return (
    <>
      <header className="admin-header">
        <h1>Événements</h1>
        <Link href="/admin/events/new" className="admin-btn-primary">
          <i className="fa-solid fa-plus"></i> Nouvel événement
        </Link>
      </header>

      <div className="admin-table-card">
        {events?.length ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Badge</th>
                <th>Titre</th>
                <th>Date</th>
                <th>Heure</th>
                <th>Prix</th>
                <th>Lieu</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(events as Event[]).map(ev => {
                const isPast = ev.event_date < today
                return (
                  <tr key={ev.id}>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        background: ev.badge_color,
                        color: ev.badge_text_color,
                        padding: '3px 8px',
                        borderRadius: 3,
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                      }}>
                        {ev.badge}
                      </span>
                    </td>
                    <td>
                      <Link href={`/admin/events/${ev.id}`} className="admin-table-link">
                        {ev.title}
                      </Link>
                    </td>
                    <td style={{ color: isPast ? 'var(--text-muted)' : 'inherit', fontSize: 13 }}>
                      {fmtDate(ev.event_date)}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{ev.event_time || '—'}</td>
                    <td style={{ fontSize: 13 }}>{ev.price}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{ev.location_name || '—'}</td>
                    <td>
                      {ev.is_published
                        ? <span className="admin-badge" style={{ background: '#dcfce7', color: '#166534', borderColor: '#bbf7d0' }}>Publié</span>
                        : <span className="admin-badge" style={{ background: '#f3f4f6', color: '#6b7280', borderColor: '#e5e7eb' }}>Brouillon</span>
                      }
                      {isPast && <span className="admin-badge" style={{ background: '#fef9c3', color: '#854d0e', borderColor: '#fde68a', marginLeft: 4 }}>Passé</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Link href={`/admin/events/${ev.id}`} className="admin-action-edit">Modifier</Link>
                        <Link href={`/fr/agenda/${ev.slug}`} className="admin-action-edit" target="_blank" rel="noreferrer">Voir</Link>
                        <DeleteEventButton id={ev.id} title={ev.title} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <p className="admin-empty">
            Aucun événement.{' '}
            <Link href="/admin/events/new">Créer le premier</Link>
          </p>
        )}
      </div>
    </>
  )
}
