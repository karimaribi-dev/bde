'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import imageCompression from 'browser-image-compression'
import type { AdSlot } from '@/lib/types'

export default function AdSlotEditor({ slot }: { slot: AdSlot }) {
  const router = useRouter()
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [snippet, setSnippet] = useState(slot.snippet ?? '')
  const [imageUrl, setImageUrl] = useState(slot.fallback_image_url ?? '')
  const [imageAlt, setImageAlt] = useState(slot.fallback_image_alt ?? '')
  const [imageLink, setImageLink] = useState(slot.fallback_link ?? '')
  const [isActive, setIsActive] = useState(slot.is_active)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  function markChanged() { setSaved(false) }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.4,
        maxWidthOrHeight: 600,
        fileType: 'image/webp',
        useWebWorker: true,
      })
      const name = `ad-${slot.id}-${Date.now()}.webp`
      const { error: upErr } = await supabase.storage
        .from('article-images')
        .upload(name, compressed, { upsert: true, contentType: 'image/webp' })
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage.from('article-images').getPublicUrl(name)
      setImageUrl(publicUrl)
      markChanged()
    } catch (err: unknown) {
      setError(`Erreur upload : ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    const { error: err } = await supabase
      .from('ad_slots')
      .update({
        snippet: snippet.trim() || null,
        fallback_image_url: imageUrl.trim() || null,
        fallback_image_alt: imageAlt.trim() || null,
        fallback_link: imageLink.trim() || null,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', slot.id)
    setSaving(false)
    if (err) {
      setError(`Erreur : ${err.message}`)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      router.refresh()
    }
  }

  const hasSnippet = snippet.trim().length > 0

  return (
    <div className="max-w-2xl space-y-6">
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{slot.name}</h1>
          <p className="text-xs font-mono text-gray-400 mt-0.5">id: {slot.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div onClick={() => { setIsActive(!isActive); markChanged() }} style={{ width: 40, height: 22, position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: 11, transition: 'background .2s', background: isActive ? '#111' : '#d1d5db' }} />
              <div style={{ position: 'absolute', top: 3, left: isActive ? 21 : 3, width: 16, height: 16, background: '#fff', borderRadius: '50%', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.25)' }} />
            </div>
            <span className="text-sm text-gray-700">{isActive ? 'Actif' : 'Inactif'}</span>
          </label>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white rounded transition-colors disabled:opacity-60"
            style={{ background: saved ? '#16a34a' : '#111' }}
          >
            {saving ? 'Sauvegarde…' : saved ? '✓ Sauvegardé' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      <div className={`rounded-lg px-4 py-3 text-sm flex items-center gap-2 ${
        !isActive ? 'bg-gray-50 text-gray-500'
        : hasSnippet ? 'bg-green-50 text-green-700'
        : imageUrl ? 'bg-blue-50 text-blue-700'
        : 'bg-yellow-50 text-yellow-700'
      }`}>
        {!isActive && '○ Slot désactivé'}
        {isActive && hasSnippet && '✓ Snippet publicitaire actif — la publicité est diffusée'}
        {isActive && !hasSnippet && imageUrl && '◎ Image de substitution active — en attente du snippet'}
        {isActive && !hasSnippet && !imageUrl && '⚠ Aucun contenu configuré — le slot affiche un placeholder'}
      </div>

      {/* Snippet */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
        <label className="block text-sm font-semibold text-gray-900 mb-1">
          Snippet publicitaire
          <span className="ml-2 text-xs font-normal text-gray-400">(prioritaire sur l&apos;image)</span>
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Collez ici le code fourni par votre régie (Google Ads, Teads…). Les balises script sont exécutées automatiquement.
        </p>
        <textarea
          value={snippet}
          onChange={(e) => { setSnippet(e.target.value); markChanged() }}
          rows={8}
          placeholder={'<script async src="..."></script>\n<ins class="..."></ins>'}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-400 resize-y"
        />
        {hasSnippet && (
          <button onClick={() => { setSnippet(''); markChanged() }} className="text-xs text-red-500 hover:text-red-700 underline underline-offset-2">
            Supprimer le snippet
          </button>
        )}
      </div>

      {/* Fallback image */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900">
          Image de substitution
          <span className="ml-2 text-xs font-normal text-gray-400">(affichée tant qu&apos;aucun snippet n&apos;est configuré)</span>
        </h2>

        {imageUrl ? (
          <div className="space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={imageAlt || 'Aperçu'} style={{ maxWidth: 300, width: '100%', height: 'auto', display: 'block', border: '1px solid #f0f0f0', borderRadius: 8 }} />
            <div className="flex gap-3">
              <button onClick={() => fileRef.current?.click()} disabled={uploading} className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                {uploading ? 'Envoi…' : "Changer l'image"}
              </button>
              <button onClick={() => { setImageUrl(''); setImageAlt(''); setImageLink(''); markChanged() }} className="text-sm text-red-500 hover:text-red-700 underline underline-offset-2">
                Supprimer
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed border-gray-200 rounded-xl py-8 flex flex-col items-center gap-2 hover:border-gray-400 hover:text-gray-600 transition-colors text-gray-400"
          >
            <i className="fa-solid fa-image text-2xl" />
            <span className="text-sm">{uploading ? 'Envoi en cours…' : 'Cliquer pour téléverser une image'}</span>
            <span className="text-xs">PNG, JPG, WebP · converti en WebP</span>
          </button>
        )}

        <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

        {imageUrl && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Texte alternatif</label>
              <input
                value={imageAlt}
                onChange={(e) => { setImageAlt(e.target.value); markChanged() }}
                placeholder="Description de l'image"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lien au clic
                <span className="ml-1 text-xs text-gray-400 font-normal">(optionnel)</span>
              </label>
              <input
                value={imageLink}
                onChange={(e) => { setImageLink(e.target.value); markChanged() }}
                placeholder="https://..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
