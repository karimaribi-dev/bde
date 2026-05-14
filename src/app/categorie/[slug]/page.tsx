import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Article, Category } from '@/lib/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export const revalidate = 60

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!category) notFound()

  const { data: articles } = await supabase
    .from('articles')
    .select('*, category:categories(id, name, slug)')
    .eq('status', 'published')
    .eq('category_id', category.id)
    .order('published_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
            ← AI Trends News
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
          {category.description && (
            <p className="text-gray-500 mt-2">{category.description}</p>
          )}
        </div>

        {articles?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(articles as (Article & { category: Category })[]).map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {article.cover_image_url && (
                  <div className="relative h-48 w-full">
                    <Image src={article.cover_image_url} alt={article.title} fill className="object-cover" />
                  </div>
                )}
                <div className="p-5">
                  <h2 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
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
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-20 text-xl">Aucun article dans cette catégorie.</p>
        )}
      </main>
    </div>
  )
}
