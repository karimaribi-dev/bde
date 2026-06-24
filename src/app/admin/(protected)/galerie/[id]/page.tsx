'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { PAGE_POSITIONS } from '@/lib/gallery-positions'

const PAGE_OPTIONS = [
  { value: 'home',     label: 'Accueil' },
  { value: 'a-propos', label: 'À propos' },
  { value: 'agenda',   label: 'Agenda' },
  { value: 'clubs',    label: 'Clubs' },
  { value: 'shop',     label: 'Shop' },
]

export default function GalerieEditPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const isNew = id === 'new'

  const [title, setTitle]         = useState('')
  const [pages, setPages]         = useState<string[]>(['home'])
  const [position, setPosition]   = useState('bottom')
  const [isVisible, setIsVisible] = useState(false)
  const [folderUrl, setFolderUrl] = useState('')
  const [sortOrder, setSortOrder] = useState(0)
  const [loading, setLoading]     = useState(!isNew)
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [deleting, setDeleting]   = useState(false)
  const [photoCount, setPhotoCount] = useState<number | null>(null)
  const [folderError, setFolderError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    if (isNew) return
    async function load() {
      const { data } = await supabase
        .from('gallery_sections')
        .select('*')
        .eq('id', id)
        .single()
      if (data) {
        setTitle(data.title ?? '')
        // page can be text[] or legacy text
        const p = data.page
        setPages(Array.isArray(p) ? p : (p ? [p] : ['home']))
        setPosition(data.position ?? 'bottom')
        setIsVisible(data.is_visible ?? false)
        setFolderUrl(data.drive_folder_id
          ? `https://drive.google.com/drive/folders/${data.drive_folder_id}`
          : '')
        setSortOrder(data.sort_order ?? 0)
      }
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  function togglePage(value: string) {
    setPages(prev =>
      prev.includes(value)
        ? prev.filter(p => p !== value)
        : [...prev, value]
    )
  }

  function extractFolderId(urlOrId: string): string {
    const trimmed = urlOrId.trim()
    const match = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/)
    if (match) return match[1]
    if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed)) return trimmed
    return trimmed
  }

  async function checkFolder() {
    const folderId = folderUrl.trim() ? extractFolderId(folderUrl) : null
    if (!folderId) return
    setFolderError('')
    setPhotoCount(null)
    const res = await fetch(`/api/gallery/photos?folderId=${folderId}`)
    const data = await res.json()
    if (data.error) { setFolderError(data.error); return }
    setPhotoCount(data.photos?.length ?? 0)
  }

  async function save() {
    if (pages.length === 0) { alert('Sélectionne au moins une page.'); return }
    setSaving(true)
    const folderId = folderUrl.trim() ? extractFolderId(folderUrl) : null
    const payload = {
      title: title || 'Galerie photos',
      page: pages,
      position,
      is_visible: isVisible,
      drive_folder_id: folderId,
      sort_order: sortOrder,
      updated_at: new Date().toISOString(),
    }
    let err
    if (isNew) {
      ;({ error: err } = await supabase.from('gallery_sections').insert(payload))
    } else {
      ;({ error: err } = await supabase.from('gallery_sections').update(payload).eq('id', id))
    }
    setSaving(false)
    if (!err) {
      setSaved(true)
      setTimeout(() => { router.push('/admin/galerie') }, 1000)
    }
  }

  async function deleteSection() {
    if (!confirm('Supprimer cette galerie ?')) return
    setDeleting(true)
    await supabase.from('gallery_sections').delete().eq('id', id)
    router.push('/admin/galerie')
  }

  if (loading) return <div className="admin-page-wrap"><p>Chargement…</p></div>

  const folderId = folderUrl.trim() ? extractFolderId(folderUrl) : null

  return (
    <div className="admin-page-wrap">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <Link href="/admin/galerie" style={{ color: '#aaa', textDecoration: 'none', fontSize: 14 }}>
          ← Galeries
        </Link>
        <h1 className="admin-page-title" style={{ margin: 0 }}>
          {isNew ? 'Nouvelle galerie' : 'Modifier la galerie'}
        </h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640 }}>

        {/* Visibility */}
        <div style={{ background: '#fff', borderRadius: 10, padding: '18px 22px', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>Afficher sur le site</div>
            <div style={{ fontSize: 13, color: '#888' }}>La galerie est visible par les visiteurs</div>
          </div>
          <div
            onClick={() => setIsVisible(v => !v)}
            style={{
              width: 48, height: 26, borderRadius: 13,
              background: isVisible ? '#FF5500' : '#ccc',
              position: 'relative', cursor: 'pointer',
              transition: 'background 0.2s', flexShrink: 0,
            }}
          >
            <div style={{
              position: 'absolute', top: 3, left: isVisible ? 25 : 3,
              width: 20, height: 20, borderRadius: '50%',
              background: '#fff', transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </div>
        </div>

        {/* Pages — multi-select */}
        <div style={{ background: '#fff', borderRadius: 10, padding: '18px 22px', border: '1px solid #eee' }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
            Pages d&apos;affichage
          </label>
          <p style={{ fontSize: 13, color: '#888', margin: '0 0 12px' }}>
            Sélectionne une ou plusieurs pages — la galerie apparaîtra sur chacune.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {PAGE_OPTIONS.map(opt => {
              const active = pages.includes(opt.value)
              return (
                <button
                  key={opt.value}
                  onClick={() => togglePage(opt.value)}
                  style={{
                    padding: '8px 18px', borderRadius: 20,
                    border: `2px solid ${active ? '#FF5500' : '#e0e0e0'}`,
                    background: active ? '#FF5500' : '#fff',
                    color: active ? '#fff' : '#262626',
                    fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  {active && <span style={{ fontSize: 11 }}>✓</span>}
                  {opt.label}
                </button>
              )
            })}
          </div>
          {pages.length === 0 && (
            <p style={{ marginTop: 10, fontSize: 12, color: '#e74c3c' }}>
              Sélectionne au moins une page.
            </p>
          )}
        </div>

        {/* Position dans la page */}
        {pages.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 10, padding: '18px 22px', border: '1px solid #eee' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
              Position dans la page
            </label>
            <p style={{ fontSize: 13, color: '#888', margin: '0 0 14px' }}>
              À quel endroit la galerie apparaît dans la page.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {pages.map(pg => {
                const pageLabel = PAGE_OPTIONS.find(o => o.value === pg)?.label ?? pg
                const opts = PAGE_POSITIONS[pg] ?? []
                if (opts.length === 0) return null
                return (
                  <div key={pg}>
                    {pages.length > 1 && (
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#aaa', marginBottom: 8 }}>
                        {pageLabel}
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {opts.map(opt => (
                        <label
                          key={opt.value}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                            border: `2px solid ${position === opt.value ? '#FF5500' : '#e0e0e0'}`,
                            background: position === opt.value ? '#fff8f6' : '#fff',
                            transition: 'all 0.15s',
                          }}
                        >
                          <input
                            type="radio"
                            name="position"
                            value={opt.value}
                            checked={position === opt.value}
                            onChange={() => setPosition(opt.value)}
                            style={{ accentColor: '#FF5500', width: 16, height: 16 }}
                          />
                          <span style={{ fontWeight: position === opt.value ? 700 : 400, fontSize: 14 }}>
                            {opt.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Title + sort */}
        <div style={{ background: '#fff', borderRadius: 10, padding: '18px 22px', border: '1px solid #eee', display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Titre</label>
            <input
              type="text" value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Galerie photos"
              style={{ width: '100%', padding: '9px 12px', borderRadius: 7, border: '1.5px solid #e0e0e0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ width: 90 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Ordre</label>
            <input
              type="number" value={sortOrder}
              onChange={e => setSortOrder(Number(e.target.value))}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 7, border: '1.5px solid #e0e0e0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Drive folder */}
        <div style={{ background: '#fff', borderRadius: 10, padding: '18px 22px', border: '1px solid #eee' }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Dossier Google Drive</label>
          <p style={{ fontSize: 13, color: '#888', margin: '0 0 10px' }}>
            URL du dossier ou son ID — doit être partagé <strong>« Tout le monde avec le lien »</strong>
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="text" value={folderUrl}
              onChange={e => { setFolderUrl(e.target.value); setPhotoCount(null); setFolderError('') }}
              placeholder="https://drive.google.com/drive/folders/..."
              style={{
                flex: 1, padding: '9px 12px', borderRadius: 7,
                border: `1.5px solid ${folderError ? '#e74c3c' : '#e0e0e0'}`,
                fontSize: 13, outline: 'none',
              }}
            />
            <button
              onClick={checkFolder}
              disabled={!folderId}
              style={{
                padding: '9px 16px', borderRadius: 7,
                background: folderId ? '#262626' : '#eee',
                color: folderId ? '#fff' : '#aaa',
                border: 'none', cursor: folderId ? 'pointer' : 'default',
                fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
              }}
            >Tester</button>
          </div>
          {folderError && <p style={{ margin: '6px 0 0', fontSize: 12, color: '#e74c3c' }}>Erreur : {folderError}</p>}
          {photoCount !== null && !folderError && (
            <p style={{ margin: '8px 0 0', fontSize: 13, color: '#16a34a', fontWeight: 600 }}>
              ✓ {photoCount} photo{photoCount !== 1 ? 's' : ''} trouvée{photoCount !== 1 ? 's' : ''}
            </p>
          )}
          {folderId && <p style={{ margin: '6px 0 0', fontSize: 11, color: '#bbb', fontFamily: 'monospace' }}>ID : {folderId}</p>}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {!isNew && (
            <button
              onClick={deleteSection}
              disabled={deleting}
              style={{ padding: '10px 20px', borderRadius: 8, background: '#fff', color: '#e74c3c', border: '1.5px solid #e74c3c', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
            >
              {deleting ? 'Suppression…' : 'Supprimer'}
            </button>
          )}
          <div style={{ marginLeft: 'auto' }}>
            <button
              onClick={save}
              disabled={saving || pages.length === 0}
              style={{
                padding: '11px 32px', borderRadius: 8,
                background: saved ? '#16a34a' : '#FF5500',
                color: '#fff', border: 'none', cursor: 'pointer',
                fontSize: 15, fontWeight: 700, transition: 'background 0.2s',
                opacity: pages.length === 0 ? 0.5 : 1,
              }}
            >
              {saving ? 'Enregistrement…' : saved ? '✓ Enregistré' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
