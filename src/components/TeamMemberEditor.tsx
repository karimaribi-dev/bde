'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import imageCompression from 'browser-image-compression'

interface Member {
  id: string
  name: string
  role: string | null
  badge_color: string
  photo_url: string | null
  sort_order: number
}

interface Props { member: Member }

const PRESET_COLORS = [
  { label: 'Bleu',   value: '#4FA3FF' },
  { label: 'Rose',   value: '#FFB3F0' },
  { label: 'Jaune',  value: '#FFE74A' },
  { label: 'Orange', value: '#FF4D1F' },
  { label: 'Vert',   value: '#4ADE80' },
]

export default function TeamMemberEditor({ member }: Props) {
  const router = useRouter()

  const [name,       setName]       = useState(member.name)
  const [role,       setRole]       = useState(member.role ?? '')
  const [badgeColor, setBadgeColor] = useState(member.badge_color)
  const [photoUrl,   setPhotoUrl]   = useState(member.photo_url ?? '')

  const [uploading, setUploading] = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [error,     setError]     = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 800,
        fileType: 'image/webp',
        useWebWorker: true,
      })
      const name = `team/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`
      const supabase = createClient()
      const { error: upErr } = await supabase.storage
        .from('article-images')
        .upload(name, compressed, { contentType: 'image/webp', upsert: false })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('article-images').getPublicUrl(name)
      setPhotoUrl(data.publicUrl)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur upload')
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    if (!name.trim()) { setError('Le nom est requis'); return }
    setSaving(true)
    setSaved(false)
    setError('')
    const supabase = createClient()
    const { error: dbErr } = await supabase
      .from('team_members')
      .update({
        name:        name.trim().toUpperCase(),
        role:        role.trim() || null,
        badge_color: badgeColor,
        photo_url:   photoUrl || null,
      })
      .eq('id', member.id)
    setSaving(false)
    if (dbErr) { setError(dbErr.message); return }
    setSaved(true)
    router.refresh()
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 10,
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
    }}>
      {/* ── Aperçu — identique à la page À propos ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, paddingBottom: 8 }}>

        {/* Photo circulaire cliquable */}
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            width: 150, height: 170,
            borderRadius: '50%',
            overflow: 'hidden',
            background: '#f0f0f0',
            cursor: 'pointer',
            position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          title="Cliquer pour changer la photo"
        >
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt={name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
            />
          ) : (
            <span style={{ fontSize: 48, opacity: 0.2 }}>👤</span>
          )}
          {/* Overlay 📷 au hover */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'rgba(0,0,0,0.38)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0, transition: 'opacity 0.15s',
          }}
          onMouseOver={e => (e.currentTarget.style.opacity = '1')}
          onMouseOut={e => (e.currentTarget.style.opacity = '0')}
          >
            <i className="fa-solid fa-camera" style={{ color: '#fff', fontSize: 22 }} />
          </div>
        </div>

        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />

        {/* Badge nom — même style que la page publique */}
        <div style={{
          background: badgeColor,
          color: 'var(--ink, #262626)',
          fontFamily: 'var(--font-display, "Archivo Black", sans-serif)',
          fontStyle: 'italic',
          fontWeight: 900,
          fontSize: 15,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          padding: '5px 16px 6px',
          marginTop: -4,
          position: 'relative',
          zIndex: 1,
        }}>
          {name || '—'}
        </div>

        {uploading && (
          <span style={{ fontSize: 11, color: '#6b7280', fontStyle: 'italic', marginTop: 6 }}>Upload en cours…</span>
        )}
      </div>

      {/* Nom */}
      <div>
        <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af', marginBottom: 5 }}>
          Nom *
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{
            width: '100%', boxSizing: 'border-box',
            border: '1px solid #e5e7eb', borderRadius: 6,
            padding: '9px 12px', fontSize: 14,
            fontWeight: 700, textTransform: 'uppercase',
            outline: 'none', background: '#fafafa',
          }}
        />
      </div>

      {/* Rôle */}
      <div>
        <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af', marginBottom: 5 }}>
          Rôle / Poste
        </label>
        <input
          type="text"
          value={role}
          onChange={e => setRole(e.target.value)}
          placeholder="ex : Président, Trésorier…"
          style={{
            width: '100%', boxSizing: 'border-box',
            border: '1px solid #e5e7eb', borderRadius: 6,
            padding: '9px 12px', fontSize: 14,
            outline: 'none', background: '#fafafa',
          }}
        />
      </div>

      {/* Couleur du badge */}
      <div>
        <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af', marginBottom: 8 }}>
          Couleur du badge
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {PRESET_COLORS.map(c => (
            <button
              key={c.value}
              type="button"
              onClick={() => setBadgeColor(c.value)}
              title={c.label}
              style={{
                width: 28, height: 28, borderRadius: '50%',
                background: c.value, border: 'none', cursor: 'pointer',
                outline: badgeColor === c.value ? `3px solid #262626` : '3px solid transparent',
                outlineOffset: 2,
                transition: 'outline 0.1s',
              }}
            />
          ))}
          {/* Couleur personnalisée */}
          <input
            type="color"
            value={badgeColor}
            onChange={e => setBadgeColor(e.target.value)}
            style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0, background: 'transparent' }}
            title="Couleur personnalisée"
          />
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <p style={{ fontSize: 12, color: '#dc2626', margin: 0, background: '#fef2f2', padding: '8px 12px', borderRadius: 4 }}>
          {error}
        </p>
      )}

      {/* Bouton sauvegarder */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || uploading}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          background: saved ? '#16a34a' : 'var(--ink, #262626)',
          color: '#fff',
          fontFamily: 'var(--font-display, "Archivo Black", sans-serif)',
          fontStyle: 'italic',
          fontWeight: 700, fontSize: 14,
          textTransform: 'uppercase', letterSpacing: '0.04em',
          padding: '12px', border: 'none', borderRadius: 6,
          cursor: saving || uploading ? 'wait' : 'pointer',
          opacity: saving || uploading ? 0.7 : 1,
          transition: 'background 0.2s',
          width: '100%',
        }}
      >
        {saving ? 'Enregistrement…' : saved ? '✓ Sauvegardé' : 'Sauvegarder'}
      </button>
    </div>
  )
}
