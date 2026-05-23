'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  initial: string
  initialGtm: string
}

export default function AnalyticsEditor({ initial, initialGtm }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [measurementId, setMeasurementId] = useState(initial)
  const [gtmId, setGtmId] = useState(initialGtm)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    setSaving(true)
    setError('')
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'analytics', value: { measurement_id: measurementId.trim(), gtm_id: gtmId.trim() } })
    setSaving(false)
    if (error) {
      setError(`Erreur : ${error.message}`)
    } else {
      setSaved(true)
      router.refresh()
    }
  }

  const isValidGa = !measurementId.trim() || measurementId.trim().startsWith('G-')
  const isValidGtm = !gtmId.trim() || gtmId.trim().startsWith('GTM-')

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <button
          onClick={handleSave}
          disabled={saving || saved || !isValidGa || !isValidGtm}
          className="px-4 py-2 text-sm font-medium text-white rounded transition-colors disabled:opacity-60"
          style={{ background: saved ? '#16a34a' : '#111' }}
        >
          {saving ? 'Sauvegarde…' : saved ? '✓ Sauvegardé' : 'Sauvegarder'}
        </button>
      </div>

      {error && (
        <div className="mb-4 text-sm px-4 py-3 rounded-lg bg-red-50 text-red-600">{error}</div>
      )}

      <div className="space-y-4">
        {/* Google Tag Manager */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Google Tag Manager</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Container ID
              <span className="ml-1 text-gray-400 font-normal text-xs">— format GTM-XXXXXXXX</span>
            </label>
            <input
              value={gtmId}
              onChange={(e) => { setGtmId(e.target.value); setSaved(false) }}
              placeholder="GTM-XXXXXXXX"
              className={`w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                !isValidGtm ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {!isValidGtm && (
              <p className="text-xs text-red-500 mt-1">L'ID doit commencer par "GTM-"</p>
            )}
          </div>
          <div className={`rounded-lg px-4 py-3 text-sm flex items-center gap-2 ${
            gtmId.trim() && isValidGtm ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
          }`}>
            <span>{gtmId.trim() && isValidGtm ? '✓ Google Tag Manager actif' : '○ Google Tag Manager inactif'}</span>
          </div>
        </div>

        {/* Google Analytics */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Google Analytics (GA4)</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Measurement ID
              <span className="ml-1 text-gray-400 font-normal text-xs">— format G-XXXXXXXXXX</span>
            </label>
            <input
              value={measurementId}
              onChange={(e) => { setMeasurementId(e.target.value); setSaved(false) }}
              placeholder="G-XXXXXXXXXX"
              className={`w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                !isValidGa ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {!isValidGa && (
              <p className="text-xs text-red-500 mt-1">L'ID doit commencer par "G-"</p>
            )}
          </div>
          <div className={`rounded-lg px-4 py-3 text-sm flex items-center gap-2 ${
            measurementId.trim() && isValidGa ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
          }`}>
            <span>{measurementId.trim() && isValidGa ? '✓ Google Analytics actif' : '○ Google Analytics inactif'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
