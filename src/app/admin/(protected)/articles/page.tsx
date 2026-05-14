import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Article, Category } from '@/lib/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import DeleteArticleButton from '@/components/DeleteArticleButton'

export default async function AdminArticlesPage() {
  const supabase = await createClient()

  const { data: articles } = await supabase
    .from('articles')
    .select('*, category:categories(id, name, slug)')
    .order('updated_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
        <Link
          href="/admin/articles/new"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nouvel article
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="px-5 py-3 font-medium text-gray-500">Titre</th>
              <th className="px-5 py-3 font-medium text-gray-500 hidden sm:table-cell">Catégorie</th>
              <th className="px-5 py-3 font-medium text-gray-500 hidden md:table-cell">Statut</th>
              <th className="px-5 py-3 font-medium text-gray-500 hidden lg:table-cell">Modifié</th>
              <th className="px-5 py-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(articles as (Article & { category?: Category })[] ?? []).map((article) => (
              <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  <Link href={`/admin/articles/${article.id}`} className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1">
                    {article.title}
                  </Link>
                </td>
                <td className="px-5 py-3 text-gray-500 hidden sm:table-cell">
                  {article.category?.name ?? '—'}
                </td>
                <td className="px-5 py-3 hidden md:table-cell">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    article.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {article.status === 'published' ? 'Publié' : 'Brouillon'}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-400 hidden lg:table-cell">
                  {format(new Date(article.updated_at), 'd MMM yyyy', { locale: fr })}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/articles/${article.id}`}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      Modifier
                    </Link>
                    <DeleteArticleButton id={article.id} title={article.title} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!articles?.length && (
          <p className="text-center text-gray-400 py-12">Aucun article. <Link href="/admin/articles/new" className="text-blue-600 hover:underline">Créer le premier</Link></p>
        )}
      </div>
    </div>
  )
}
