'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MaintenanceSettings } from '@/lib/types'
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
  settings: MaintenanceSettings
}

export default function MaintenanceEditor({ settings: initial }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [enabled, setEnabled] = useState(initial.enabled)
  const [title, setTitle] = useState(initial.title)
  const [message, setMessage] = useState(initial.message)
  const [imageUrl, setImageUrl] = useState(initial.image_url)
  const [imageAlt, setImageAlt] = useState(initial.image_alt)
  const [uploading, setUploading] = useState(false)
  const [uploadInfo, setUploadInfo] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [feedback, setFeedback] = useState('')

  async function uploadImage(file: File) {
    setUploading(true)
    setUploadInfo('')
    try {
      const originalKb = Math.round(file.size / 1024)
      const compressed = await compressImage(file)
      const compressedKb = Math.round(compressed.size / 1024)
      const path = `maintenance/${Date.now()}.webp`
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
    setSaving(true)
    setFeedback('')
    const value: MaintenanceSettings = {
      enabled,
      title: title.trim(),
      message: message.trim(),
      image_url: imageUrl,
      image_alt: imageAlt.trim(),
    }
    const { error } = await supabase
      .from('site_settings')
      .update({ value })
      .eq('key', 'maintenance')
    setSaving(false)
    if (error) {
      setFeedback(`Erreur : ${error.message}`)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      setFeedback(enabled ? 'Maintenance activée — le site est inaccessible aux visiteurs.' : 'Paramètres sauvegardés.')
      router.refresh()
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mode maintenance</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium text-white rounded transition-colors disabled:opacity-60"
          style={{ background: saved ? '#16a34a' : '#111' }}
        >
          {saving ? 'Sauvegarde…' : saved ? '✓ Sauvegardé' : 'Sauvegarder'}
        </button>
      </div>

      {feedback && (
        <div className={`mb-4 text-sm px-4 py-3 rounded-lg ${feedback.startsWith('Erreur') ? 'bg-red-50 text-red-600' : enabled ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>
          {feedback}
        </div>
      )}

      <div className="space-y-4">
        {/* Toggle maintenance */}
        <div className={`rounded-xl border p-5 ${enabled ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => { setEnabled(!enabled); setSaved(false) }}
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                background: enabled ? '#111' : '#d1d5db',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.2s',
                flexShrink: 0,
              }}
            >
              <div style={{
                position: 'absolute',
                top: 3,
                left: enabled ? 23 : 3,
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </div>
            <div>
              <p className={`text-sm font-semibold ${enabled ? 'text-amber-800' : 'text-gray-900'}`}>
                {enabled ? '⚠ Maintenance activée' : 'Maintenance désactivée'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {enabled
                  ? 'Les visiteurs voient la page de maintenance. Les admins ont toujours accès.'
                  : 'Le site est accessible normalement.'}
              </p>
            </div>
          </label>
        </div>

        {/* Contenu de la page de maintenance */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Contenu de la page de maintenance</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
            <input
              value={title}
              onChange={(e) => { setTitle(e.target.value); setSaved(false) }}
              placeholder="Ex : Site en maintenance"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => { setMessage(e.target.value); setSaved(false) }}
              placeholder="Ex : Nous effectuons des mises à jour. Revenez bientôt."
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
        </div>

        {/* Image */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Image (optionnelle)</h2>
          {imageUrl && (
            <div className="relative rounded-lg overflow-hidden h-40 bg-gray-100">
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
                placeholder="Description de l'image…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
