import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const PAGE_LABELS: Record<string, string> = {
  home:     'Accueil',
  'a-propos': 'À propos',
  agenda:   'Agenda',
  clubs:    'Clubs',
  shop:     'Shop',
}

const PAGE_COLORS: Record<string, string> = {
  home:     '#FF5500',
  'a-propos': '#5FA0FB',
  agenda:   '#FF88E8',
  clubs:    '#FFE74A',
  shop:     '#262626',
}

export default async function GaleriePage() {
  const supabase = await createClient()
  const { data: sections } = await supabase
    .from('gallery_sections')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div className="admin-page-wrap">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>Galeries photos</h1>
        <Link
          href="/admin/galerie/new"
          style={{
            padding: '10px 22px', borderRadius: 8,
            background: '#FF5500', color: '#fff',
            fontWeight: 700, fontSize: 14, textDecoration: 'none',
          }}
        >
          + Nouvelle galerie
        </Link>
      </div>

      {(!sections || sections.length === 0) ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
          <p style={{ fontSize: 16, margin: 0 }}>Aucune galerie créée</p>
          <p style={{ fontSize: 13, color: '#ccc', marginTop: 6 }}>Crée ta première galerie pour l&apos;afficher sur le site.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sections.map((s) => (
            <div
              key={s.id}
              style={{
                background: '#fff', borderRadius: 10,
                border: '1px solid #eee', padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: 16,
              }}
            >
              {/* Visible dot */}
              <div style={{
                width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                background: s.is_visible ? '#22c55e' : '#d1d5db',
              }} />

              {/* Page badges — array */}
              <div style={{ display: 'flex', gap: 4, flexShrink: 0, flexWrap: 'wrap' }}>
                {(Array.isArray(s.page) ? s.page : [s.page]).map((p: string) => (
                  <span key={p} style={{
                    padding: '2px 8px', borderRadius: 20, fontSize: 11,
                    fontWeight: 700,
                    background: PAGE_COLORS[p] ?? '#888',
                    color: p === 'clubs' || p === 'agenda' ? '#262626' : '#fff',
                  }}>
                    {PAGE_LABELS[p] ?? p}
                  </span>
                ))}
              </div>

              {/* Title */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: '#262626' }}>
                  {s.title || 'Sans titre'}
                </div>
                {s.drive_folder_id && (
                  <div style={{ fontSize: 11, color: '#aaa', fontFamily: 'monospace', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    ID : {s.drive_folder_id}
                  </div>
                )}
              </div>

              {/* Status */}
              <span style={{
                fontSize: 12, fontWeight: 600, flexShrink: 0,
                color: s.is_visible ? '#16a34a' : '#9ca3af',
              }}>
                {s.is_visible ? 'Visible' : 'Masquée'}
              </span>

              {/* Edit */}
              <Link
                href={`/admin/galerie/${s.id}`}
                style={{
                  padding: '7px 16px', borderRadius: 7,
                  background: '#f5f5f5', color: '#262626',
                  fontWeight: 600, fontSize: 13, textDecoration: 'none', flexShrink: 0,
                }}
              >
                Modifier
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
