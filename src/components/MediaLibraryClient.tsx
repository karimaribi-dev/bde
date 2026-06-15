'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

interface FileEntry {
  name: string
  folder: string
  url: string
  size: number
  usage: { label: string; type: string } | null
}

const FOLDER_LABELS: Record<string, string> = {
  covers:   'Articles',
  content:  'Contenu articles',
  events:   'Événements',
  clubs:    'Clubs',
  team:     'Équipe',
  products: 'Shop',
}

const TYPE_COLORS: Record<string, string> = {
  'Article':    '#4FA3FF',
  'Événement':  '#FFB3F0',
  'Club':       '#FF4D1F',
  'Équipe':     '#FFE74A',
  'Shop':       '#A8F0A0',
}

function formatSize(bytes: number) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`
}

export default function MediaLibraryClient({ files: initial }: { files: FileEntry[] }) {
  const [files, setFiles]       = useState(initial)
  const [filter, setFilter]     = useState<string>('all')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirm, setConfirm]   = useState<FileEntry | null>(null)

  const totalSize = files.reduce((s, f) => s + f.size, 0)

  const folders = useMemo(() => ['all', ...Array.from(new Set(files.map(f => f.folder)))], [files])

  const visible = filter === 'all' ? files : files.filter(f => f.folder === filter)
  const unused  = visible.filter(f => !f.usage)

  async function deleteFile(file: FileEntry) {
    setDeleting(file.url)
    setConfirm(null)
    const supabase = createClient()
    const path = `${file.folder}/${file.name}`
    const { error } = await supabase.storage.from('article-images').remove([path])
    if (!error) {
      setFiles(prev => prev.filter(f => f.url !== file.url))
    }
    setDeleting(null)
  }

  return (
    <div style={{ padding: '0 0 80px' }}>

      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: 0 }}>Médiathèque</h1>
          <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>
            {files.length} fichiers · {formatSize(totalSize)} utilisés · {files.filter(f => !f.usage).length} non référencées
          </p>
        </div>
      </div>

      {/* Filtres par dossier */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {folders.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '5px 14px', fontSize: 12, borderRadius: 999, border: '1.5px solid',
              borderColor: filter === f ? '#111' : '#ddd',
              background: filter === f ? '#111' : '#fff',
              color: filter === f ? '#fff' : '#555',
              cursor: 'pointer', fontWeight: 600,
            }}
          >
            {f === 'all' ? `Tout (${files.length})` : `${FOLDER_LABELS[f] ?? f} (${files.filter(file => file.folder === f).length})`}
          </button>
        ))}
        {filter !== 'all' && unused.length > 0 && (
          <span style={{ padding: '5px 14px', fontSize: 12, borderRadius: 999, background: '#FFF3CD', color: '#856404', fontWeight: 600 }}>
            ⚠ {unused.length} non référencée{unused.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Grille */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {visible.map(file => (
          <div
            key={file.url}
            style={{
              background: '#fff',
              border: '1px solid #e8e8e8',
              borderRadius: 10,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              opacity: deleting === file.url ? 0.4 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {/* Miniature */}
            <div style={{ position: 'relative', aspectRatio: '4/3', background: '#f5f5f5' }}>
              <Image src={file.url} alt={file.name} fill sizes="220px" style={{ objectFit: 'cover' }} unoptimized />
            </div>

            {/* Infos */}
            <div style={{ padding: '10px 12px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <p style={{ fontSize: 11, color: '#888', margin: 0, wordBreak: 'break-all', lineHeight: 1.4 }}>
                {file.name}
              </p>
              <p style={{ fontSize: 11, color: '#bbb', margin: 0 }}>{formatSize(file.size)}</p>

              {/* Tag usage */}
              {file.usage ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
                    background: TYPE_COLORS[file.usage.type] ?? '#eee',
                    color: '#111',
                    whiteSpace: 'nowrap',
                  }}>
                    {file.usage.type}
                  </span>
                  <span style={{ fontSize: 11, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {file.usage.label}
                  </span>
                </div>
              ) : (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
                  background: '#FFF3CD', color: '#856404', alignSelf: 'flex-start', marginTop: 2,
                }}>
                  Non référencée
                </span>
              )}

              {/* Bouton supprimer */}
              <button
                onClick={() => setConfirm(file)}
                disabled={deleting === file.url}
                style={{
                  marginTop: 'auto', paddingTop: 8,
                  fontSize: 12, color: '#dc2626', background: 'none', border: 'none',
                  cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                <i className="fa-solid fa-trash" style={{ fontSize: 11 }} />
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {visible.length === 0 && (
        <p style={{ color: '#bbb', textAlign: 'center', padding: '60px 0' }}>Aucune image dans ce dossier.</p>
      )}

      {/* Modal de confirmation */}
      {confirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '28px 32px', maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 12px', color: '#111' }}>Supprimer l&apos;image ?</h2>
            {confirm.usage ? (
              <p style={{ fontSize: 14, color: '#dc2626', margin: '0 0 20px', lineHeight: 1.5 }}>
                ⚠️ Cette image est utilisée par <strong>{confirm.usage.type} &ldquo;{confirm.usage.label}&rdquo;</strong>. La supprimer cassera l&apos;affichage.
              </p>
            ) : (
              <p style={{ fontSize: 14, color: '#555', margin: '0 0 20px', lineHeight: 1.5 }}>
                Cette image n&apos;est référencée nulle part. Elle sera définitivement supprimée du stockage.
              </p>
            )}
            <p style={{ fontSize: 12, color: '#999', margin: '0 0 24px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {confirm.folder}/{confirm.name}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirm(null)}
                style={{ padding: '8px 18px', border: '1.5px solid #ddd', borderRadius: 8, background: '#fff', fontSize: 13, cursor: 'pointer' }}
              >
                Annuler
              </button>
              <button
                onClick={() => deleteFile(confirm)}
                style={{ padding: '8px 18px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
