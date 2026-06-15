'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Popup } from '@/lib/types'
import Image from 'next/image'
import imageCompression from 'browser-image-compression'

async function compressImage(file: File): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: 0.4,
    maxWidthOrHeight: 1400,
    useWebWorker: true,
    fileType: 'image/webp',
  })
}

interface Props {
  popup?: Popup
}

export default function PopupEditor({ popup }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState(popup?.title ?? '')
  const [heading, setHeading] = useState(popup?.heading ?? '')
  const [subheading, setSubheading] = useState(popup?.subheading ?? '')
  const [imageUrl, setImageUrl] = useState(popup?.image_url ?? '')
  const [imageAlt, setImageAlt] = useState(popup?.image_alt ?? '')
  const [ctaText, setCtaText] = useState(popup?.cta_text ?? '')
  const [ctaUrl, setCtaUrl] = useState(popup?.cta_url ?? '')
  const [isActive, setIsActive] = useState(popup?.is_active ?? false)

  // Scheduling
  const hasSchedule = !!(popup?.starts_at || popup?.ends_at)
  const [scheduled, setScheduled] = useState(hasSchedule)
  const [startsAt, setStartsAt] = useState(popup?.starts_at ? popup.starts_at.slice(0, 16) : '')
  const [endsAt, setEndsAt] = useState(popup?.ends_at ? popup.ends_at.slice(0, 16) : '')

  const [uploading, setUploading] = useState(false)
  const [uploadInfo, setUploadInfo] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [message, setMessage] = useState('')

  async function uploadImage(file: File) {
    setUploading(true)
    setUploadInfo('')
    try {
      const originalKb = Math.round(file.size / 1024)
      const compressed = await compressImage(file)
      const compressedKb = Math.round(compressed.size / 1024)
      const path = `popups/${Date.now()}.webp`
      const { data, error } = await supabase.storage
        .from('article-images')
        .upload(path, compressed, { contentType: 'image/webp' })
      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage.from('article-images').getPublicUrl(data.path)
        setImageUrl(publicUrl)
        setUploadInfo(`${originalKb} Ko → ${compressedKb} Ko`)
      }
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    if (!title.trim()) { setMessage('Le titre interne est requis.'); return }
    if (!heading.trim()) { setMessage('Le titre affiché est requis.'); return }
    setSaving(true)
    setMessage('')

    // Si on active ce popup, désactiver les autres
    if (isActive) {
      await supabase
        .from('popups')
        .update({ is_active: false })
        .neq('id', popup?.id ?? '00000000-0000-0000-0000-000000000000')
    }

    const payload = {
      title: title.trim(),
      heading: heading.trim(),
      subheading: subheading.trim() || null,
      image_url: imageUrl || null,
      image_alt: imageAlt.trim() || null,
      cta_text: ctaText.trim() || null,
      cta_url: ctaUrl.trim() || null,
      is_active: isActive,
      starts_at: (scheduled && startsAt) ? new Date(startsAt).toISOString() : null,
      ends_at: (scheduled && endsAt) ? new Date(endsAt).toISOString() : null,
      updated_at: new Date().toISOString(),
    }

    let error
    if (popup?.id) {
      const res = await supabase.from('popups').update(payload).eq('id', popup.id)
      error = res.error
    } else {
      const res = await supabase.from('popups').insert(payload)
      error = res.error
    }

    setSaving(false)
    if (error) {
      setMessage(`Erreur : ${error.message}`)
    } else {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      setMessage('Popup sauvegardé !')
      if (!popup?.id) router.push('/admin/popups')
      else router.refresh()
      return
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {popup ? 'Modifier le popup' : 'Nouveau popup'}
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium text-white rounded transition-colors disabled:opacity-60"
          style={{ background: saved ? '#16a34a' : '#111' }}
        >
          {saving ? 'Sauvegarde…' : saved ? '✓ Sauvegardé' : 'Sauvegarder'}
        </button>
      </div>

      {message && (
        <div className={`mb-4 text-sm px-4 py-3 rounded-lg ${message.startsWith('Erreur') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="space-y-4">

        {/* Activation */}
        <div className={`rounded-xl border p-5 ${isActive ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
          <label className="flex items-center gap-3 cursor-pointer" onClick={() => setIsActive(!isActive)}>
            <div style={{
              width: 44, height: 24, borderRadius: 12,
              background: isActive ? '#111' : '#d1d5db',
              position: 'relative', cursor: 'pointer',
              transition: 'background 0.2s', flexShrink: 0,
            }}>
              <div style={{
                position: 'absolute', top: 3,
                left: isActive ? 23 : 3,
                width: 18, height: 18, borderRadius: '50%',
                background: '#fff', transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {isActive ? 'Popup actif' : 'Popup inactif'}
              </p>
              <p className="text-xs text-gray-400">Un seul popup peut être actif à la fois</p>
            </div>
          </label>
        </div>

        {/* Programmation */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer" onClick={() => setScheduled(!scheduled)}>
            <div style={{
              width: 44, height: 24, borderRadius: 12,
              background: scheduled ? '#111' : '#d1d5db',
              position: 'relative', cursor: 'pointer',
              transition: 'background 0.2s', flexShrink: 0,
            }}>
              <div style={{
                position: 'absolute', top: 3,
                left: scheduled ? 23 : 3,
                width: 18, height: 18, borderRadius: '50%',
                background: '#fff', transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Programmer l'affichage</p>
              <p className="text-xs text-gray-400">Définir une plage de dates d'affichage</p>
            </div>
          </label>

          {scheduled && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Début (optionnel)</label>
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Fin (optionnel)</label>
                <input
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* Textes */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre interne <span className="text-gray-400 font-normal">(non affiché)</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex : Popup newsletter mai 2026"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre affiché *</label>
            <input
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="Ex : Restez informé des dernières tendances IA"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sous-titre</label>
            <textarea
              value={subheading}
              onChange={(e) => setSubheading(e.target.value)}
              placeholder="Ex : Rejoignez notre newsletter et recevez chaque semaine nos analyses."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">
            Bouton d'action
            <span className="ml-1 text-xs text-gray-400 font-normal">— optionnel. Sans URL, le bouton ferme le popup.</span>
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Texte du bouton</label>
            <input
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              placeholder="Ex : Découvrir"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL du bouton</label>
            <input
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
              placeholder="Ex : /articles ou https://…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
        </div>

        {/* Image */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Image <span className="text-xs text-gray-400 font-normal">— optionnelle, s'affiche à gauche</span></h2>
          {imageUrl && (
            <div className="relative rounded-lg overflow-hidden h-48 bg-gray-100">
              <Image src={imageUrl} alt={imageAlt || ''} fill sizes="600px" style={{ objectFit: 'cover' }} />
              <button
                onClick={() => { setImageUrl(''); setImageAlt('') }}
                className="absolute top-2 right-2 bg-white text-gray-600 hover:text-red-500 rounded-full w-6 h-6 flex items-center justify-center text-xs shadow"
              >
                ×
              </button>
            </div>
          )}
          <label className="cursor-pointer block w-full text-center border-2 border-dashed border-gray-200 rounded-lg py-4 text-sm text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors">
            {uploading ? 'Compression…' : '+ Télécharger une image'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f) }}
            />
          </label>
          {uploadInfo && <p className="text-xs text-green-600 text-center">{uploadInfo} · WebP ✓</p>}
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Ou coller une URL d'image…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          {imageUrl && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Texte alternatif (alt)</label>
              <input
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Description de l'image pour l'accessibilité…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
