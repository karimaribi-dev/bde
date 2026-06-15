'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Event } from '@/lib/types'
import Image from 'next/image'
import imageCompression from 'browser-image-compression'

/* ── Couleurs BDE ── */
const BADGE_PRESETS = [
  { color: '#FFB3F0', label: 'Rose' },
  { color: '#FFE74A', label: 'Jaune' },
  { color: '#FF4D1F', label: 'Orange' },
  { color: '#4FA3FF', label: 'Bleu' },
  { color: '#262626', label: 'Noir' },
  { color: '#ffffff', label: 'Blanc' },
]

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function compressImage(file: File): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: 'image/webp',
  })
}

/* ── Toggle switch ── */
function Toggle({ on, onToggle, label, sub }: { on: boolean; onToggle: () => void; label: string; sub?: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer" onClick={onToggle}>
      <div style={{ width: 44, height: 24, borderRadius: 12, background: on ? '#111' : '#d1d5db', position: 'relative', flexShrink: 0, transition: 'background .2s' }}>
        <div style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </label>
  )
}

/* ── Onglets FR / EN ── */
function LangTabs({ lang, setLang }: { lang: 'fr' | 'en'; setLang: (l: 'fr' | 'en') => void }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
      {(['fr', 'en'] as const).map(l => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          style={{
            padding: '4px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700,
            letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', border: 'none',
            background: lang === l ? '#262626' : '#f3f4f6',
            color: lang === l ? '#fff' : '#6b7280',
            transition: 'background 0.15s',
          }}
        >
          {l === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
        </button>
      ))}
    </div>
  )
}

interface Props { event?: Event }

export default function EventEditor({ event }: Props) {
  const router = useRouter()
  const supabase = createClient()

  /* ── État du formulaire ── */
  const [lang, setLang]                     = useState<'fr' | 'en'>('fr')
  const [badge, setBadge]                   = useState(event?.badge ?? '')
  const [badgeEn, setBadgeEn]               = useState(event?.badge_en ?? '')
  const [badgeColor, setBadgeColor]         = useState(event?.badge_color ?? '#FFB3F0')
  const [badgeTextColor, setBadgeTextColor] = useState(event?.badge_text_color ?? '#111111')
  const [title, setTitle]                   = useState(event?.title ?? '')
  const [titleEn, setTitleEn]               = useState(event?.title_en ?? '')
  const [slug, setSlug]                     = useState(event?.slug ?? '')
  const [slugManual, setSlugManual]         = useState(!!event?.slug)
  const [description, setDescription]       = useState(event?.description ?? '')
  const [descriptionEn, setDescriptionEn]   = useState(event?.description_en ?? '')
  const [eventDate, setEventDate]           = useState(event?.event_date ?? '')
  const [eventTime, setEventTime]           = useState(event?.event_time ?? '')
  const [price, setPrice]                   = useState(event?.price ?? 'gratuit')
  const [imageUrl, setImageUrl]             = useState(event?.image_url ?? '')
  const [locationName, setLocationName]     = useState(event?.location_name ?? '')
  const [locationAddress, setLocationAddress] = useState(event?.location_address ?? '')
  const [locationLat, setLocationLat]       = useState<number | null>(event?.location_lat ?? null)
  const [locationLng, setLocationLng]       = useState<number | null>(event?.location_lng ?? null)
  const [isPublished, setIsPublished]       = useState(event?.is_published ?? false)

  const [uploading, setUploading]   = useState(false)
  const [uploadInfo, setUploadInfo] = useState('')
  const [geocoding, setGeocoding]   = useState(false)
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)
  const [message, setMessage]       = useState('')

  /* ── Helpers ── */
  function handleTitleChange(val: string) {
    setTitle(val)
    if (!slugManual) setSlug(slugify(val))
  }

  async function geocodeAddress() {
    if (!locationAddress.trim()) return
    setGeocoding(true)
    setMessage('')
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationAddress)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'fr' } }
      )
      const data = await res.json()
      if (data[0]) {
        setLocationLat(parseFloat(data[0].lat))
        setLocationLng(parseFloat(data[0].lon))
        if (!locationName) setLocationName(data[0].display_name.split(',')[0])
        setMessage('✓ Coordonnées trouvées !')
      } else {
        setMessage('Adresse introuvable — essayez plus de détails.')
      }
    } catch {
      setMessage('Erreur lors de la géolocalisation.')
    } finally {
      setGeocoding(false)
    }
  }

  async function uploadImage(file: File) {
    setUploading(true)
    setUploadInfo('')
    try {
      const originalKb = Math.round(file.size / 1024)
      const compressed = await compressImage(file)
      const compressedKb = Math.round(compressed.size / 1024)
      const path = `events/${Date.now()}.webp`
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
    if (!badge.trim())      { setMessage('Le tag/badge est requis.'); return }
    if (!title.trim())      { setMessage('Le titre est requis.'); return }
    if (!slug.trim())       { setMessage('Le slug est requis.'); return }
    if (!eventDate)         { setMessage('La date est requise.'); return }
    setSaving(true)
    setMessage('')

    const payload = {
      badge:            badge.trim().toUpperCase(),
      badge_en:         badgeEn.trim().toUpperCase() || null,
      badge_color:      badgeColor,
      badge_text_color: badgeTextColor,
      title:            title.trim(),
      slug:             slug.trim(),
      description:      description.trim() || null,
      description_en:   descriptionEn.trim() || null,
      title_en:         titleEn.trim() || null,
      event_date:       eventDate,
      event_time:       eventTime.trim(),
      price:            price.trim() || 'gratuit',
      image_url:        imageUrl || null,
      location_name:    locationName.trim() || null,
      location_address: locationAddress.trim() || null,
      location_lat:     locationLat,
      location_lng:     locationLng,
      is_published:     isPublished,
      updated_at:       new Date().toISOString(),
    }

    let error
    if (event?.id) {
      const res = await supabase.from('events').update(payload).eq('id', event.id)
      error = res.error
    } else {
      const res = await supabase.from('events').insert(payload)
      error = res.error
    }

    setSaving(false)
    if (error) {
      setMessage(`Erreur : ${error.message}`)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      setMessage(event?.id ? 'Événement mis à jour !' : 'Événement créé !')
      if (!event?.id) router.push('/admin/events')
      else router.refresh()
    }
  }

  /* ── Render ── */
  return (
    <div className="max-w-2xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {event ? "Modifier l'événement" : 'Nouvel événement'}
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
        <div className={`mb-4 text-sm px-4 py-3 rounded-lg ${message.startsWith('Erreur') || message.startsWith('Adresse') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="space-y-4">

        {/* Publication */}
        <div className={`rounded-xl border p-5 ${isPublished ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
          <Toggle
            on={isPublished}
            onToggle={() => setIsPublished(!isPublished)}
            label={isPublished ? 'Publié' : 'Brouillon'}
            sub={isPublished ? "Visible sur le site et dans l'agenda" : "Non visible par les visiteurs"}
          />
        </div>

        {/* Badge */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Tag / Badge</h2>
            <LangTabs lang={lang} setLang={setLang} />
          </div>

          <div>
            {lang === 'fr' ? (
              <>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nom du tag * <span className="text-gray-400 font-normal">(français)</span></label>
                <input
                  value={badge}
                  onChange={e => setBadge(e.target.value)}
                  placeholder="Ex : AFTERWORK, OLYMPIADES, SOIRÉE…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                  style={{ textTransform: 'uppercase' }}
                />
              </>
            ) : (
              <>
                <label className="block text-xs font-medium text-gray-500 mb-1">Tag name <span className="text-gray-400 font-normal">(English — optional)</span></label>
                <input
                  value={badgeEn}
                  onChange={e => setBadgeEn(e.target.value)}
                  placeholder="Ex: AFTERWORK, GAMES, EVENING…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                  style={{ textTransform: 'uppercase' }}
                />
              </>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Couleur du badge</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {BADGE_PRESETS.map(p => (
                <button
                  key={p.color}
                  title={p.label}
                  onClick={() => setBadgeColor(p.color)}
                  style={{
                    width: 30, height: 30, borderRadius: 6,
                    background: p.color,
                    border: badgeColor === p.color ? '3px solid #111' : '2px solid #e5e7eb',
                    cursor: 'pointer',
                  }}
                />
              ))}
              <input
                type="color"
                value={badgeColor}
                onChange={e => setBadgeColor(e.target.value)}
                title="Couleur personnalisée"
                style={{ width: 30, height: 30, borderRadius: 6, border: '2px solid #e5e7eb', cursor: 'pointer', padding: 2 }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Couleur du texte</label>
            <div className="flex gap-2">
              {[{ v: '#111111', l: 'Sombre' }, { v: '#ffffff', l: 'Clair' }].map(opt => (
                <button
                  key={opt.v}
                  onClick={() => setBadgeTextColor(opt.v)}
                  style={{
                    padding: '4px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                    background: opt.v, color: opt.v === '#111111' ? '#fff' : '#111',
                    border: badgeTextColor === opt.v ? '2px solid #111' : '2px solid #e5e7eb',
                  }}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          </div>

          {/* Aperçu */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Aperçu</label>
            <span style={{
              display: 'inline-block',
              background: badgeColor,
              color: badgeTextColor,
              padding: '5px 12px',
              borderRadius: 3,
              fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              {(lang === 'en' ? badgeEn : badge) || 'TAG'}
            </span>
          </div>
        </div>

        {/* Titre & Slug */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <LangTabs lang={lang} setLang={setLang} />
          {lang === 'fr' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre * <span className="text-xs text-gray-400 font-normal">(français)</span></label>
              <input
                value={title}
                onChange={e => handleTitleChange(e.target.value)}
                placeholder="Ex : LA FÉLICITA, JARDIN DES PLANTES…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-xs text-gray-400 font-normal">(English — optional)</span></label>
              <input
                value={titleEn}
                onChange={e => setTitleEn(e.target.value)}
                placeholder="Ex: THE PARTY, GARDENS OF PARIS…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Slug URL * <span className="text-gray-400 font-normal">(/agenda/<strong>slug</strong>)</span>
            </label>
            <input
              value={slug}
              onChange={e => { setSlug(e.target.value); setSlugManual(true) }}
              placeholder="ex : la-felicita"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
        </div>

        {/* Date, heure, prix */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Date & Infos pratiques</h2>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date *</label>
              <input
                type="date"
                value={eventDate}
                onChange={e => setEventDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Heure</label>
              <input
                value={eventTime}
                onChange={e => setEventTime(e.target.value)}
                placeholder="Ex : 19h, 19h30"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Prix</label>
              <input
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="gratuit, 5€, 10€…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <LangTabs lang={lang} setLang={setLang} />
          {lang === 'fr' ? (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-xs text-gray-400 font-normal">(français)</span></label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Décris l'événement, le programme, les infos pratiques…"
                rows={6}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </>
          ) : (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-xs text-gray-400 font-normal">(English — optional)</span></label>
              <textarea
                value={descriptionEn}
                onChange={e => setDescriptionEn(e.target.value)}
                placeholder="Describe the event, the program, practical information…"
                rows={6}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </>
          )}
        </div>

        {/* Image */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Image de couverture</h2>
          {imageUrl && (
            <div className="relative rounded-lg overflow-hidden bg-gray-100" style={{ aspectRatio: '7/6' }}>
              <Image src={imageUrl} alt={title || ''} fill sizes="600px" style={{ objectFit: 'cover' }} />
              <button
                onClick={() => setImageUrl('')}
                className="absolute top-2 right-2 bg-white text-gray-600 hover:text-red-500 rounded-full w-6 h-6 flex items-center justify-center text-xs shadow"
              >×</button>
            </div>
          )}
          <label className="cursor-pointer block w-full text-center border-2 border-dashed border-gray-200 rounded-lg py-4 text-sm text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors">
            {uploading ? 'Compression…' : '+ Télécharger une image'}
            <input type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f) }} />
          </label>
          {uploadInfo && <p className="text-xs text-green-600 text-center">{uploadInfo} · WebP ✓</p>}
          <input
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            placeholder="Ou coller une URL d'image…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

        {/* Lieu & Carte */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">
            Lieu & Carte{' '}
            <span className="text-xs text-gray-400 font-normal">— une carte OpenStreetMap s'affichera sur la page publique</span>
          </h2>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Nom du lieu</label>
            <input
              value={locationName}
              onChange={e => setLocationName(e.target.value)}
              placeholder="Ex : La Félicita, Jardin des Plantes, Campus LISAA…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Adresse complète</label>
            <div className="flex gap-2">
              <input
                value={locationAddress}
                onChange={e => setLocationAddress(e.target.value)}
                placeholder="Ex : 10 Esplanade Nathalie Sarraute, 75018 Paris"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                onKeyDown={e => { if (e.key === 'Enter') geocodeAddress() }}
              />
              <button
                onClick={geocodeAddress}
                disabled={geocoding || !locationAddress.trim()}
                className="px-3 py-2 text-xs font-semibold text-white rounded-lg disabled:opacity-40 transition-colors whitespace-nowrap"
                style={{ background: '#111' }}
              >
                {geocoding ? '…' : '📍 Localiser'}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Cliquez sur « Localiser » pour obtenir les coordonnées automatiquement.</p>
          </div>

          {locationLat !== null && locationLng !== null && (
            <p className="text-xs text-green-600 font-medium">
              ✓ {locationLat.toFixed(5)}, {locationLng.toFixed(5)}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Latitude (manuel)</label>
              <input
                type="number" step="0.000001"
                value={locationLat ?? ''}
                onChange={e => setLocationLat(e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="48.87654"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Longitude (manuel)</label>
              <input
                type="number" step="0.000001"
                value={locationLng ?? ''}
                onChange={e => setLocationLng(e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="2.34567"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
