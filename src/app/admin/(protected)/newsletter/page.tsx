import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Newsletter } from '@/lib/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

function StatusBadge({ status }: { status: Newsletter['status'] }) {
  if (status === 'sent')
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">Envoyée</span>
  if (status === 'scheduled')
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">Programmée</span>
  return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">Brouillon</span>
}

export default async function AdminNewsletterPage() {
  const supabase = await createClient()
  const [{ data: newsletters }, { count: subscriberCount }] = await Promise.all([
    supabase.from('newsletters').select('*').order('created_at', { ascending: false }),
    supabase.from('subscribers').select('id', { count: 'exact', head: true }).eq('status', 'active'),
  ])

  return (
    <>
      <header className="admin-header">
        <h1>Newsletter</h1>
        <Link href="/admin/newsletter/new" className="px-4 py-2 text-sm font-medium text-white rounded" style={{ background: '#111' }}>
          + Nouvelle newsletter
        </Link>
      </header>

      <div className="max-w-3xl space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Abonnés actifs', value: subscriberCount ?? 0 },
            { label: 'Newsletters envoyées', value: (newsletters ?? []).filter(n => n.status === 'sent').length },
            { label: 'Programmées', value: (newsletters ?? []).filter(n => n.status === 'scheduled').length },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-400 mt-1 font-mono uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>

        {/* List */}
        <div className="space-y-2">
          {(newsletters ?? []).length === 0 && (
            <div className="bg-gray-50 rounded-xl px-5 py-8 text-center text-sm text-gray-400">
              Aucune newsletter pour l&apos;instant. Créez la première !
            </div>
          )}
          {(newsletters ?? []).map((nl: Newsletter) => (
            <Link key={nl.id} href={`/admin/newsletter/${nl.id}`}
              className="block bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-300 transition-colors group"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 group-hover:text-black truncate">
                    {nl.subject || <span className="text-gray-400 italic">Sans objet</span>}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 font-mono">
                    {nl.status === 'sent' && nl.sent_at
                      ? `Envoyée le ${format(new Date(nl.sent_at), 'dd MMM yyyy à HH:mm', { locale: fr })} · ${nl.recipients_count} destinataires`
                      : nl.status === 'scheduled' && nl.scheduled_at
                      ? `Programmée le ${format(new Date(nl.scheduled_at), 'dd MMM yyyy à HH:mm', { locale: fr })}`
                      : `Créée le ${format(new Date(nl.created_at), 'dd MMM yyyy', { locale: fr })}`}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <StatusBadge status={nl.status} />
                  <i className="fa-solid fa-chevron-right text-xs text-gray-400" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="pt-2">
          <Link href="/admin/subscribers" className="text-sm text-gray-400 hover:text-gray-700 underline underline-offset-2">
            Gérer les abonnés →
          </Link>
        </div>
      </div>
    </>
  )
}
