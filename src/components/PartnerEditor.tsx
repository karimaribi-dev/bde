'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import imageCompression from 'browser-image-compression'

interface Partner {
  id: string
  name: string
  logo_url: string | null
  website_url: string | null
  is_visible: boolean
  sort_order: number
}

interface Props { partner: Partner }

export default function PartnerEditor({ partner }: Props) {
  const router = useRouter()

  const DEFAULT_NAME = 'Nouveau partenaire'
  const [name,       setName]       = useState(partner.name)
  const [websiteUrl, setWebsiteUrl] = useState(partner.website_url ?? '')
  const [logoUrl,    setLogoUrl]    = useState(partner.logo_url ?? '')
  const [isVisible,  setIsVisible]  = useState(partner.is_visible)

  const [uploading, setUploading] = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [dirty,     setDirty]     = useState(false)
  const [error,     setError]     = useState('')
  const [deleting,  setDeleting]  = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)

  function mark() { setDirty(true); setSaved(false) }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 400,
        fileType: 'image/webp',
        useWebWorker: true,
      })
      const path = `partners/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`
      const supabase = createClient()
      const { error: upErr } = await supabase.storage
        .from('article-images')
        .upload(path, compressed, { contentType: 'image/webp', upsert: false })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('article-images').getPublicUrl(path)
      setLogoUrl(data.publicUrl)
      mark()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur upload')
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    if (!name.trim()) { setError('Le nom est requis'); return }
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { error: dbErr } = await supabase
      .from('partners')
      .update({
        name:        name.trim(),
        website_url: websiteUrl.trim() || null,
        logo_url:    logoUrl || null,
        is_visible:  isVisible,
      })
      .eq('id', partner.id)
    setSaving(false)
    if (dbErr) { setError(dbErr.message); return }
    setDirty(false)
    setSaved(true)
    setTimeout(() => { setSaved(false); router.refresh() }, 2500)
  }

  async function handleDelete() {
    if (!confirm(`Supprimer "${partner.name}" ?`)) return
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('partners').delete().eq('id', partner.id)
    router.refresh()
  }

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 10,
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      opacity: isVisible ? 1 : 0.55,
      transition: 'opacity 0.2s',
    }}>

      {/* Logo cliquable */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            width: 90, height: 90,
            borderRadius: 12,
            background: '#f0f0f0',
            border: '2px dashed #d1d5db',
            cursor: 'pointer',
            position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}
          title="Cliquer pour changer le logo"
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }} />
          ) : (
            <span style={{ fontSize: 28, opacity: 0.25 }}>🏢</span>
          )}
          <div
            style={{
              position: 'absolute', inset: 0, borderRadius: 12,
              background: 'rgba(0,0,0,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0, transition: 'opacity 0.15s',
            }}
            onMouseOver={e => (e.currentTarget.style.opacity = '1')}
            onMouseOut={e => (e.currentTarget.style.opacity = '0')}
          >
            <i className="fa-solid fa-camera" style={{ color: '#fff', fontSize: 18 }} />
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
        {uploading && <span style={{ fontSize: 11, color: '#6b7280', fontStyle: 'italic' }}>Upload…</span>}
      </div>

      {/* Nom */}
      <div>
        <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af', marginBottom: 5 }}>
          Nom *
        </label>
        <input
          type="text"
          value={name}
          onChange={e => { setName(e.target.value); mark() }}
          onFocus={e => { if (e.target.value === DEFAULT_NAME) { setName(''); mark() } }}
          onBlur={e => { if (!e.target.value.trim()) { setName(DEFAULT_NAME); setDirty(false) } }}
          style={{
            width: '100%', boxSizing: 'border-box',
            border: '1px solid #e5e7eb', borderRadius: 6,
            padding: '8px 12px', fontSize: 14,
            outline: 'none', background: '#fafafa',
            color: name === DEFAULT_NAME ? '#9ca3af' : '#262626',
          }}
        />
      </div>

      {/* Site web */}
      <div>
        <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af', marginBottom: 5 }}>
          Site web
        </label>
        <input
          type="url"
          value={websiteUrl}
          onChange={e => { setWebsiteUrl(e.target.value); mark() }}
          placeholder="https://..."
          style={{
            width: '100%', boxSizing: 'border-box',
            border: '1px solid #e5e7eb', borderRadius: 6,
            padding: '8px 12px', fontSize: 14,
            outline: 'none', background: '#fafafa',
          }}
        />
      </div>

      {/* Visibilité */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
        <div
          onClick={() => { setIsVisible(v => !v); mark() }}
          style={{
            width: 40, height: 22, borderRadius: 11,
            background: isVisible ? '#262626' : '#d1d5db',
            position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0,
          }}
        >
          <div style={{
            position: 'absolute', top: 3,
            left: isVisible ? 21 : 3,
            width: 16, height: 16, borderRadius: '50%',
            background: '#fff', transition: 'left 0.2s',
          }} />
        </div>
        <span style={{ color: isVisible ? '#262626' : '#9ca3af' }}>
          {isVisible ? 'Visible sur le site' : 'Masqué'}
        </span>
      </label>

      {error && (
        <p style={{ fontSize: 12, color: '#dc2626', margin: 0, background: '#fef2f2', padding: '8px 12px', borderRadius: 4 }}>
          {error}
        </p>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || uploading || (!dirty && !saved)}
          style={{
            flex: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            background: saved ? '#16a34a' : dirty ? '#262626' : '#d1d5db',
            color: dirty || saved ? '#fff' : '#9ca3af',
            fontFamily: 'var(--font-display, "Archivo Black", sans-serif)',
            fontStyle: 'italic', fontWeight: 700, fontSize: 13,
            textTransform: 'uppercase', letterSpacing: '0.04em',
            padding: '10px', border: 'none', borderRadius: 6,
            cursor: (!dirty && !saved) ? 'default' : saving ? 'wait' : 'pointer',
            transition: 'background 0.25s, color 0.25s',
          }}
        >
          {saving ? 'Enregistrement…' : saved ? '✓ Sauvegardé' : 'Sauvegarder'}
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          title="Supprimer"
          style={{
            width: 38, height: 38, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: 6, cursor: deleting ? 'wait' : 'pointer',
            color: '#dc2626', fontSize: 14,
          }}
        >
          <i className="fa-solid fa-trash" />
        </button>
      </div>
    </div>
  )
}
