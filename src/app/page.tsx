import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Article, Category } from '@/lib/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export const revalidate = 60

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: articles }, { data: categories }] = await Promise.all([
    supabase
      .from('articles')
      .select('*, category:categories(id, name, slug)')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(12),
    supabase.from('categories').select('*').order('name'),
  ])

  const featured = articles?.[0] as (Article & { category: Category }) | undefined
  const rest = (articles?.slice(1) ?? []) as (Article & { category: Category })[]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900 tracking-tight">
            AI Trends News
          </Link>
          <nav className="flex gap-1 flex-wrap">
            {(categories ?? []).map((cat: Category) => (
              <Link
                key={cat.id}
                href={`/categorie/${cat.slug}`}
                className="text-sm text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-50 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {featured && (
          <Link href={`/articles/${featured.slug}`} className="group block mb-10">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {featured.cover_image_url && (
                <div className="relative h-72 sm:h-96 w-full">
                  <Image
                    src={featured.cover_image_url}
                    alt={featured.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}
              <div className="p-6 sm:p-8">
                {featured.category && (
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                    {featured.category.name}
                  </span>
                )}
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                  {featured.title}
                </h1>
                {featured.excerpt && (
                  <p className="text-gray-600 text-lg leading-relaxed line-clamp-2">{featured.excerpt}</p>
                )}
                <p className="text-sm text-gray-400 mt-4">
                  {featured.published_at
                    ? format(new Date(featured.published_at), 'd MMMM yyyy', { locale: fr })
                    : ''}
                </p>
              </div>
            </div>
          </Link>
        )}

        {rest.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {!articles?.length && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-xl">Aucun article publié pour le moment.</p>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-200 mt-16 py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} AI Trends News
      </footer>
    </div>
  )
}

function ArticleCard({ article }: { article: Article & { category?: Category } }) {
  return (
    <Link href={`/articles/${article.slug}`} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      {article.cover_image_url && (
        <div className="relative h-48 w-full">
          <Image
            src={article.cover_image_url}
            alt={article.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        {article.category && (
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            {article.category.name}
          </span>
        )}
        <h2 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2 flex-1">
          {article.title}
        </h2>
        {article.excerpt && (
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">{article.excerpt}</p>
        )}
        <p className="text-xs text-gray-400 mt-3">
          {article.published_at
            ? format(new Date(article.published_at), 'd MMM yyyy', { locale: fr })
            : ''}
        </p>
      </div>
    </Link>
  )
}
