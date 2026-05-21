'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SocialLinks } from '@/lib/types'

const PLATFORMS: { key: keyof SocialLinks; label: string; placeholder: string; icon: React.ReactNode }[] = [
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/…', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
  { key: 'twitter', label: 'X / Twitter', placeholder: 'https://x.com/…', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  { key: 'bluesky', label: 'Bluesky', placeholder: 'https://bsky.app/profile/…', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 6.5h-1.875c-.414 0-.625.207-.625.625V10.5h2.5l-.375 2.5H14V19h-2.5v-6H10v-2.5h1.5V9.125C11.5 7.399 12.5 6.5 14.1 6.5c.766 0 1.4.065 1.9.097V8.5z"/></svg> },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/…', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> },
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/…', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@…', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@…', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.73a8.16 8.16 0 0 0 4.78 1.52V6.8a4.85 4.85 0 0 1-1.01-.11z"/></svg> },
  { key: 'newsletter', label: 'Newsletter', placeholder: "https://… (lien d'inscription)", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
]

export default function SocialLinksEditor({ initial }: { initial: SocialLinks }) {
  const router = useRouter()
  const supabase = createClient()

  const [links, setLinks] = useState<SocialLinks>(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function setLink(key: keyof SocialLinks, value: string) {
    setLinks(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'social_links', value: links })
    setSaving(false)
    if (error) {
      setError(`Erreur : ${error.message}`)
    } else {
      setSaved(true)
      router.refresh()
    }
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Réseaux sociaux</h1>
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className="px-4 py-2 text-sm font-medium text-white rounded transition-colors disabled:opacity-60"
          style={{ background: saved ? '#16a34a' : '#111' }}
        >
          {saving ? 'Sauvegarde…' : saved ? '✓ Sauvegardé' : 'Sauvegarder'}
        </button>
      </div>

      {error && (
        <div className="mb-4 text-sm px-4 py-3 rounded-lg bg-red-50 text-red-600">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
        {PLATFORMS.map(({ key, label, placeholder, icon }) => (
          <div key={key} className="flex items-center gap-4 px-5 py-4">
            <div className="text-gray-400 flex-shrink-0">{icon}</div>
            <label className="w-28 text-sm font-medium text-gray-700 flex-shrink-0">{label}</label>
            <input
              value={links[key] ?? ''}
              onChange={(e) => setLink(key, e.target.value)}
              placeholder={placeholder}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-gray-400">
        Laissez vide les réseaux que vous n'utilisez pas — ils n'apparaîtront pas sur le site.
      </p>
    </div>
  )
}
