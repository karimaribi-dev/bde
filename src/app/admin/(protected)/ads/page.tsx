import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { AdSlot } from '@/lib/types'

export const dynamic = 'force-dynamic'

function StatusBadge({ slot }: { slot: AdSlot }) {
  if (!slot.is_active)
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">Inactif</span>
  if (slot.snippet)
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">Snippet actif</span>
  if (slot.fallback_image_url)
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">Image de substitution</span>
  return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">Vide</span>
}

export default async function AdminAdsPage() {
  const supabase = await createClient()
  const { data: slots } = await supabase
    .from('ad_slots')
    .select('*')
    .order('updated_at', { ascending: true })

  return (
    <>
      <header className="admin-header">
        <h1>Publicités</h1>
      </header>

      <div className="max-w-3xl space-y-3">
        <p className="text-sm text-gray-500 mb-6">
          Gérez les emplacements publicitaires du site. Pour chaque emplacement, configurez un snippet de code fourni par votre régie ou une image de substitution affichée en attendant.
        </p>

        {(slots ?? []).length === 0 && (
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl px-5 py-4 text-sm text-yellow-700">
            Aucun emplacement trouvé. Exécutez le SQL d&apos;initialisation dans Supabase pour créer les slots.
          </div>
        )}

        {(slots ?? []).map((slot: AdSlot) => (
          <Link
            key={slot.id}
            href={`/admin/ads/${slot.id}`}
            className="block bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-300 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                  <i className="fa-solid fa-rectangle-ad text-sm" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 group-hover:text-black">{slot.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge slot={slot} />
                <i className="fa-solid fa-chevron-right text-xs text-gray-400" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
