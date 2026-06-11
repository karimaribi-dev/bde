'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Club } from '@/lib/types'
import Image from 'next/image'
import imageCompression from 'browser-image-compression'

/* ── Palettes de couleurs BDE ── */
const ACCENT_PRESETS = [
  { color: '#FFB3F0', text: '#111111', label: 'Rose' },
  { color: '#FF4D1F', text: '#ffffff', label: 'Orange' },
  { color: '#4FA3FF', text: '#111111', label: 'Bleu' },
  { color: '#FFE74A', text: '#111111', label: 'Jaune' },
  { color: '#262626', text: '#ffffff', label: 'Noir' },
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

interface Props { club?: Club }

export default function ClubEditor({ club }: Props) {
  const router = useRouter()
  const supabase = createClient()

  /* ── État formulaire ── */
  const [title, setTitle]           = useState(club?.title ?? '')
  const [slug, setSlug]             = useState(club?.slug ?? '')
  const [slugManual, setSlugManual] = useState(!!club?.slug)
  const [tagline, setTagline]       = useState(club?.tagline ?? '')
  const [taglineSub, setTaglineSub] = useState(club?.tagline_sub ?? '')
  const [accentColor, setAccentColor] = useState(club?.accent_color ?? '#FFB3F0')
  const [accentText, setAccentText]   = useState(club?.accent_text_color ?? '#111111')
  const [whoWeAre, setWhoWeAre]     = useState(club?.who_we_are ?? '')
  const [objective, setObjective]   = useState(club?.objective ?? '')
  const [schedule, setSchedule]     = useState(club?.schedule ?? '')
  const [frequency, setFrequency]   = useState(club?.frequency ?? '')
  const [location, setLocation]     = useState(club?.location ?? '')
  const [memberCount, setMemberCount] = useState(club?.member_count ?? '')
  const [imageUrl, setImageUrl]     = useState(club?.image_url ?? '')
  const [sortOrder, setSortOrder]   = useState(club?.sort_order ?? 0)
  const [isPublished, setIsPublished] = useState(club?.is_published ?? false)

  const [uploading, setUploading]   = useState(false)
  const [uploadInfo, setUploadInfo] = useState('')
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)
  const [message, setMessage]       = useState('')

  /* ── Helpers ── */
  function handleTitleChange(val: string) {
    setTitle(val)
    if (!slugManual) setSlug(slugify(val))
  }

  async function uploadImage(file: File) {
    setUploading(true)
    setUploadInfo('')
    try {
      const origKb = Math.round(file.size / 1024)
      const compressed = await compressImage(file)
      const compKb = Math.round(compressed.size / 1024)
      const path = `clubs/${Date.now()}.webp`
      const { data, error } = await supabase.storage
        .from('article-images')
        .upload(path, compressed, { contentType: 'image/webp' })
      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage.from('article-images').getPublicUrl(data.path)
        setImageUrl(publicUrl)
        setUploadInfo(`${origKb} Ko → ${compKb} Ko`)
      }
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    if (!title.trim()) { setMessage('Le titre est requis.'); return }
    if (!slug.trim())  { setMessage('Le slug est requis.'); return }
    setSaving(true)
    setMessage('')

    const payload = {
      title:             title.trim().toUpperCase(),
      slug:              slug.trim(),
      tagline:           tagline.trim().toUpperCase(),
      tagline_sub:       taglineSub.trim().toUpperCase() || null,
      accent_color:      accentColor,
      accent_text_color: accentText,
      who_we_are:        whoWeAre.trim() || null,
      objective:         objective.trim() || null,
      schedule:          schedule.trim() || null,
      frequency:         frequency.trim() || null,
      location:          location.trim() || null,
      member_count:      memberCount.trim() || null,
      image_url:         imageUrl || null,
      sort_order:        sortOrder,
      is_published:      isPublished,
      updated_at:        new Date().toISOString(),
    }

    let error
    if (club?.id) {
      const res = await supabase.from('clubs').update(payload).eq('id', club.id)
      error = res.error
    } else {
      const res = await supabase.from('clubs').insert(payload)
      error = res.error
    }

    setSaving(false)
    if (error) {
      setMessage(`Erreur : ${error.message}`)
    } else {
      setSaved(true)
      setMessage(club?.id ? 'Club mis à jour !' : 'Club créé !')
      if (!club?.id) router.push('/admin/clubs')
      else router.refresh()
    }
  }

  /* ── Render ── */
  return (
    <div className="max-w-2xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {club ? 'Modifier le club' : 'Nouveau club'}
        </h1>
        <button
          onClick={handleSave}
          disabled={saving || saved}
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

        {/* Publication */}
        <div className={`rounded-xl border p-5 ${isPublished ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
          <Toggle
            on={isPublished}
            onToggle={() => setIsPublished(!isPublished)}
            label={isPublished ? 'Publié' : 'Brouillon'}
            sub={isPublished ? 'Visible sur le site dans NOS CLUBS' : 'Non visible par les visiteurs'}
          />
        </div>

        {/* Couleur d'accent */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Couleur d&apos;accent</h2>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Couleur principale du club <span className="font-normal text-gray-400">(tagline, bordures)</span>
            </label>
            <div className="flex gap-2 flex-wrap mb-2">
              {ACCENT_PRESETS.map(p => (
                <button
                  key={p.color}
                  title={p.label}
                  onClick={() => { setAccentColor(p.color); setAccentText(p.text) }}
                  style={{
                    width: 30, height: 30, borderRadius: 6,
                    background: p.color,
                    border: accentColor === p.color ? '3px solid #111' : '2px solid #e5e7eb',
                    cursor: 'pointer',
                  }}
                />
              ))}
              <input
                type="color"
                value={accentColor}
                onChange={e => setAccentColor(e.target.value)}
                title="Couleur personnalisée"
                style={{ width: 30, height: 30, borderRadius: 6, border: '2px solid #e5e7eb', cursor: 'pointer', padding: 2 }}
              />
            </div>
            <div className="flex gap-2 mt-2">
              {[{ v: '#111111', l: 'Texte sombre' }, { v: '#ffffff', l: 'Texte clair' }].map(opt => (
                <button
                  key={opt.v}
                  onClick={() => setAccentText(opt.v)}
                  style={{
                    padding: '4px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                    background: opt.v, color: opt.v === '#111111' ? '#fff' : '#111',
                    border: accentText === opt.v ? '2px solid #111' : '2px solid #e5e7eb',
                  }}
                >
                  {opt.l}
                </button>
              ))}
            </div>
            {/* Aperçu */}
            <div className="mt-3">
              <span style={{
                display: 'inline-block',
                background: accentColor, color: accentText,
                padding: '4px 10px',
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
              }}>
                Aperçu tagline
              </span>
            </div>
          </div>
        </div>

        {/* Titre & Slug */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre du club *</label>
            <input
              value={title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="Ex : CLUB TYPO, CLUB PHOTO, LA RAMETTE…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Slug URL * <span className="text-gray-400 font-normal">(/clubs/<strong>slug</strong>)</span>
            </label>
            <input
              value={slug}
              onChange={e => { setSlug(e.target.value); setSlugManual(true) }}
              placeholder="ex : club-typo"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Ordre d&apos;affichage <span className="text-gray-400 font-normal">(plus petit = affiché en premier)</span>
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={e => setSortOrder(parseInt(e.target.value) || 0)}
              className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
        </div>

        {/* Tagline */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Tagline</h2>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Première ligne <span className="text-gray-400 font-normal">ex : INTÉRESSÉ PAR LA TYPOGRAPHIE ?</span>
            </label>
            <input
              value={tagline}
              onChange={e => setTagline(e.target.value)}
              placeholder="Ex : INTÉRESSÉ PAR LA TYPOGRAPHIE ?"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Deuxième ligne <span className="text-gray-400 font-normal">ex : C&apos;EST POUR VOUS ! (optionnel)</span>
            </label>
            <input
              value={taglineSub}
              onChange={e => setTaglineSub(e.target.value)}
              placeholder="Ex : C'EST POUR VOUS !"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          {/* Aperçu tagline */}
          {(tagline || taglineSub) && (
            <div style={{ padding: '10px 0 4px', display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-start' }}>
              {tagline && <span style={{ background: accentColor, color: accentText, padding: '3px 8px', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 12, textTransform: 'uppercase' }}>{tagline}</span>}
              {taglineSub && <span style={{ background: accentColor, color: accentText, padding: '3px 8px', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 12, textTransform: 'uppercase', marginLeft: 48 }}>{taglineSub}</span>}
            </div>
          )}
        </div>

        {/* Qui sommes-nous */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            QUI SOMMES NOUS ?
          </label>
          <textarea
            value={whoWeAre}
            onChange={e => setWhoWeAre(e.target.value)}
            placeholder="Décris le club, son ambiance, qui peut y participer…"
            rows={5}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

        {/* Objectif */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            NOTRE OBJECTIF :
          </label>
          <textarea
            value={objective}
            onChange={e => setObjective(e.target.value)}
            placeholder="Les buts du club, les projets, les activités…"
            rows={4}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

        {/* Infos importantes */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">LES INFOS IMPORTANTES</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Horaires</label>
              <input
                value={schedule}
                onChange={e => setSchedule(e.target.value)}
                placeholder="Ex : 10h - 12h"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date / Fréquence</label>
              <input
                value={frequency}
                onChange={e => setFrequency(e.target.value)}
                placeholder="Ex : Chaque vendredi"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Lieu</label>
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Ex : FAB LAB, Salle 3…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nombre de membres</label>
              <input
                value={memberCount}
                onChange={e => setMemberCount(e.target.value)}
                placeholder="Ex : 12"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
          </div>

          {/* Aperçu info-rows */}
          {(schedule || frequency || location || memberCount) && (
            <div className="mt-2">
              <p className="text-xs font-medium text-gray-400 mb-2">Aperçu :</p>
              <div style={{ border: `1.5px solid ${accentColor}` }}>
                {schedule && <div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 12, textTransform: 'uppercase', borderBottom: frequency || location || memberCount ? `1px solid ${accentColor}` : 'none' }}><span style={{ fontWeight: 900 }}>HORAIRES</span><span>{schedule}</span></div>}
                {frequency && <div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 12, textTransform: 'uppercase', borderBottom: location || memberCount ? `1px solid ${accentColor}` : 'none' }}><span style={{ fontWeight: 900 }}>DATE / FRÉQUENCE</span><span>{frequency}</span></div>}
                {location && <div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 12, textTransform: 'uppercase', borderBottom: memberCount ? `1px solid ${accentColor}` : 'none' }}><span style={{ fontWeight: 900 }}>LIEU</span><span>{location}</span></div>}
                {memberCount && <div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 12, textTransform: 'uppercase' }}><span style={{ fontWeight: 900 }}>MEMBRES</span><span>{memberCount}</span></div>}
              </div>
            </div>
          )}
        </div>

        {/* Image */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Photo du club</h2>
          {imageUrl && (
            <div className="relative rounded-lg overflow-hidden bg-gray-100" style={{ aspectRatio: '4/3' }}>
              <Image src={imageUrl} alt={title || 'Club'} fill sizes="600px" style={{ objectFit: 'cover' }} />
              <button
                onClick={() => setImageUrl('')}
                className="absolute top-2 right-2 bg-white text-gray-600 hover:text-red-500 rounded-full w-6 h-6 flex items-center justify-center text-xs shadow"
              >×</button>
            </div>
          )}
          <label className="cursor-pointer block w-full text-center border-2 border-dashed border-gray-200 rounded-lg py-4 text-sm text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors">
            {uploading ? 'Compression…' : '+ Télécharger une photo'}
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

      </div>
    </div>
  )
}
