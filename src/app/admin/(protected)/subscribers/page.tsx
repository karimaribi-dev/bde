import { createClient } from '@/lib/supabase/server'
import type { Subscriber } from '@/lib/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

export default async function SubscribersPage() {
  const supabase = await createClient()
  const { data: subscribers } = await supabase
    .from('subscribers')
    .select('*')
    .order('created_at', { ascending: false })

  const active = (subscribers ?? []).filter(s => s.status === 'active').length
  const unsub = (subscribers ?? []).filter(s => s.status === 'unsubscribed').length

  // CSV export data (inline as data URI via link)
  const csvRows = [
    ['email', 'statut', 'date_inscription'],
    ...(subscribers ?? []).map((s: Subscriber) => [
      s.email,
      s.status,
      format(new Date(s.created_at), 'dd/MM/yyyy HH:mm'),
    ]),
  ]
  const csvContent = csvRows.map(r => r.join(',')).join('\n')
  const csvHref = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`

  return (
    <>
      <header className="admin-header">
        <h1>Abonnés</h1>
        <a
          href={csvHref}
          download="abonnes.csv"
          className="px-4 py-2 text-sm font-medium border border-gray-200 rounded hover:bg-gray-50 transition-colors"
        >
          ↓ Exporter CSV
        </a>
      </header>

      <div className="max-w-3xl space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total', value: (subscribers ?? []).length },
            { label: 'Actifs', value: active },
            { label: 'Désabonnés', value: unsub },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-400 mt-1 font-mono uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {(subscribers ?? []).length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400">
              Aucun abonné pour l&apos;instant.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Email</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Statut</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody>
                {(subscribers ?? []).map((s: Subscriber) => (
                  <tr key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono text-xs text-gray-700">{s.email}</td>
                    <td className="px-5 py-3">
                      {s.status === 'active' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">Actif</span>
                      )}
                      {s.status === 'unsubscribed' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">Désabonné</span>
                      )}
                      {s.status === 'pending' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">En attente</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400 font-mono">
                      {format(new Date(s.created_at), 'dd MMM yyyy', { locale: fr })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
