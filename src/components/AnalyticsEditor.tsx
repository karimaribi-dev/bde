'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AnalyticsEditor({ initial }: { initial: string }) {
  const router = useRouter()
  const supabase = createClient()

  const [measurementId, setMeasurementId] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    setSaving(true)
    setError('')
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'analytics', value: { measurement_id: measurementId.trim() } })
    setSaving(false)
    if (error) {
      setError(`Erreur : ${error.message}`)
    } else {
      setSaved(true)
      router.refresh()
    }
  }

  const isValid = !measurementId.trim() || measurementId.trim().startsWith('G-')

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Google Analytics</h1>
        <button
          onClick={handleSave}
          disabled={saving || saved || !isValid}
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
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
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
                !isValid ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {!isValid && (
              <p className="text-xs text-red-500 mt-1">L'ID doit commencer par "G-"</p>
            )}
          </div>

          <div className={`rounded-lg px-4 py-3 text-sm flex items-center gap-2 ${
            measurementId.trim() && isValid
              ? 'bg-green-50 text-green-700'
              : 'bg-gray-50 text-gray-500'
          }`}>
            <span>{measurementId.trim() && isValid ? '✓ Google Analytics actif' : '○ Google Analytics inactif'}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Comment obtenir votre Measurement ID</h2>
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex gap-2"><span className="text-gray-400 font-mono">1.</span> Rendez-vous sur <a href="https://analytics.google.com" target="_blank" rel="noreferrer" className="underline text-gray-900 underline-offset-2">analytics.google.com</a></li>
            <li className="flex gap-2"><span className="text-gray-400 font-mono">2.</span> Créez une propriété pour votre site</li>
            <li className="flex gap-2"><span className="text-gray-400 font-mono">3.</span> Dans <strong>Admin → Flux de données</strong>, ajoutez un flux Web avec votre URL</li>
            <li className="flex gap-2"><span className="text-gray-400 font-mono">4.</span> Copiez l'ID de mesure (G-XXXXXXXXXX) et collez-le ci-dessus</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
