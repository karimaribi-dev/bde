import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import NavbarClient from '@/components/NavbarClient'
import SiteFooter from '@/components/SiteFooter'
import { Category } from '@/lib/types'

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
  const { locale, slug } = await params
  const supabase = await createClient()

  const [{ data: page }, { data: categories }] = await Promise.all([
    supabase.from('pages').select('*').eq('slug', slug).eq('is_published', true).single(),
    supabase.from('categories').select('*').order('name'),
  ])

  if (!page) notFound()

  const cats = (categories ?? []) as Category[]

  return (
    <>
      <NavbarClient categories={cats} locale={locale} />
      <main style={{ minHeight: '60vh', padding: '50px 40px 96px', background: 'var(--paper)' }}>
        <section style={{ textAlign: 'center', paddingBottom: 60 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 224,
            lineHeight: 0.9,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            fontStyle: 'italic',
            color: 'var(--ink)',
            margin: 0,
          }}>
            {page.title}
          </h1>
        </section>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {page.content ? (
            <div
              className="tiptap-content"
              dangerouslySetInnerHTML={{ __html: page.content }}
              style={{ color: 'var(--ink)', fontSize: 17 }}
            />
          ) : (
            <p style={{ fontFamily: '"new-atten", sans-serif', color: '#999', fontStyle: 'italic' }}>Contenu à venir.</p>
          )}
        </div>
      </main>
      <SiteFooter categories={cats} />
    </>
  )
}
