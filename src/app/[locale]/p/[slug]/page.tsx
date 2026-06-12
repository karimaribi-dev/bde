import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('pages')
    .select('title, meta_description')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!data) return {}
  return {
    title: data.title,
    description: data.meta_description ?? undefined,
  }
}

export default async function PublicPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!page) notFound()

  return (
    <div style={{
      maxWidth: 720,
      margin: '0 auto',
      padding: '60px 24px',
      fontFamily: '"altesse-std-24pt", serif',
    }}>
      <h1 style={{
        fontSize: 32,
        fontWeight: 700,
        color: '#111',
        marginBottom: 32,
        lineHeight: 1.3,
      }}>
        {page.title}
      </h1>
      {page.content ? (
        <div
          className="tiptap-content"
          dangerouslySetInnerHTML={{ __html: page.content }}
          style={{ color: '#333', lineHeight: 1.8, fontSize: 16 }}
        />
      ) : (
        <p style={{ color: '#999', fontStyle: 'italic' }}>Contenu à venir.</p>
      )}
    </div>
  )
}
