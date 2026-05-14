import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export const revalidate = 60

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: article } = await supabase
    .from('articles')
    .select('*, category:categories(id, name, slug)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!article) notFound()

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link href="/" className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors">
            ← AI Trends News
          </Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-4 py-10">
        {article.category && (
          <Link
            href={`/categorie/${article.category.slug}`}
            className="text-xs font-semibold text-blue-600 uppercase tracking-wider hover:text-blue-800"
          >
            {article.category.name}
          </Link>
        )}

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4 leading-tight">
          {article.title}
        </h1>

        {article.excerpt && (
          <p className="text-xl text-gray-500 mb-6 leading-relaxed">{article.excerpt}</p>
        )}

        <p className="text-sm text-gray-400 mb-8">
          {article.published_at
            ? format(new Date(article.published_at), "d MMMM yyyy 'à' HH'h'mm", { locale: fr })
            : ''}
        </p>

        {article.cover_image_url && (
          <div className="relative w-full h-72 sm:h-96 mb-10 rounded-2xl overflow-hidden">
            <Image
              src={article.cover_image_url}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: article.content ?? '' }}
        />
      </article>
    </div>
  )
}
