import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: totalArticles },
    { count: published },
    { count: drafts },
    { count: categories },
    { data: recent },
  ] = await Promise.all([
    supabase.from('articles').select('*', { count: 'exact', head: true }),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('articles').select('id, title, status, updated_at').order('updated_at', { ascending: false }).limit(5),
  ])

  const stats = [
    { label: 'Total articles', value: totalArticles ?? 0, color: 'bg-blue-50 text-blue-600' },
    { label: 'Publiés', value: published ?? 0, color: 'bg-green-50 text-green-600' },
    { label: 'Brouillons', value: drafts ?? 0, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Catégories', value: categories ?? 0, color: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <Link
          href="/admin/articles/new"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nouvel article
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color.split(' ')[1]}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Articles récents</h2>
          <Link href="/admin/articles" className="text-sm text-blue-600 hover:text-blue-800">
            Voir tous →
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recent?.map((article) => (
            <div key={article.id} className="flex items-center justify-between px-5 py-3">
              <Link
                href={`/admin/articles/${article.id}`}
                className="text-sm text-gray-900 hover:text-blue-600 font-medium truncate flex-1"
              >
                {article.title}
              </Link>
              <span className={`ml-4 text-xs font-medium px-2 py-0.5 rounded-full ${
                article.status === 'published'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {article.status === 'published' ? 'Publié' : 'Brouillon'}
              </span>
            </div>
          ))}
          {!recent?.length && (
            <p className="px-5 py-8 text-sm text-gray-400 text-center">Aucun article.</p>
          )}
        </div>
      </div>
    </div>
  )
}
