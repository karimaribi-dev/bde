import { createClient } from '@/lib/supabase/server'
import MarkSuggestionReadButton from '@/components/MarkSuggestionReadButton'

export const dynamic = 'force-dynamic'

interface Suggestion {
  id: string
  source: string
  message: string
  mail: string | null
  is_read: boolean
  created_at: string
}

const SOURCE_LABELS: Record<string, string> = {
  'agenda':   'Agenda',
  'a-propos': 'À propos',
  'clubs':    'Clubs',
}

const SOURCE_COLORS: Record<string, string> = {
  'agenda':   '#4FA3FF',
  'a-propos': '#FFB3F0',
  'clubs':    '#FFE74A',
}

export default async function SuggestionsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('suggestions')
    .select('*')
    .order('created_at', { ascending: false })

  const suggestions = (data ?? []) as Suggestion[]
  const unread      = suggestions.filter(s => !s.is_read).length

  return (
    <div className="admin-content">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Suggestions &amp; propositions</h1>
        {unread > 0 && (
          <span style={{
            background: '#4FA3FF', color: '#fff',
            fontWeight: 700, fontSize: 13,
            padding: '3px 10px', borderRadius: 99,
          }}>
            {unread} non lu{unread > 1 ? 'es' : 'e'}
          </span>
        )}
      </div>

      {suggestions.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: '#999' }}>
          <i className="fa-solid fa-inbox" style={{ fontSize: 40, marginBottom: 12, display: 'block' }} />
          <p style={{ margin: 0 }}>Aucune suggestion pour le moment.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {suggestions.map(sg => (
            <div
              key={sg.id}
              style={{
                background: sg.is_read ? '#fff' : '#f0f7ff',
                border: `1px solid ${sg.is_read ? '#e5e7eb' : '#bfdbfe'}`,
                borderRadius: 8,
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {/* En-tête */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  {!sg.is_read && (
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4FA3FF', flexShrink: 0, display: 'inline-block' }} />
                  )}
                  {/* Badge source */}
                  <span style={{
                    background: SOURCE_COLORS[sg.source] ?? '#e5e7eb',
                    color: '#262626',
                    fontSize: 11, fontWeight: 700,
                    padding: '2px 8px', borderRadius: 99,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}>
                    {SOURCE_LABELS[sg.source] ?? sg.source}
                  </span>
                  {sg.mail && (
                    <a href={`mailto:${sg.mail}`} style={{ fontSize: 12, color: '#0369a1', textDecoration: 'none' }}>
                      {sg.mail}
                    </a>
                  )}
                  <span style={{ fontSize: 12, color: '#6b7280' }}>
                    {new Date(sg.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <MarkSuggestionReadButton id={sg.id} isRead={sg.is_read} />
              </div>

              {/* Message */}
              <div style={{
                fontSize: 14,
                lineHeight: 1.65,
                color: '#1f2937',
                background: '#f9fafb',
                borderRadius: 4,
                padding: '12px 16px',
                borderLeft: '3px solid #e5e7eb',
                whiteSpace: 'pre-wrap',
              }}>
                {sg.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
