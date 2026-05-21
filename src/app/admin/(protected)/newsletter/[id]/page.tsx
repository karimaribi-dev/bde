import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import NewsletterEditor from '@/components/NewsletterEditor'

export const dynamic = 'force-dynamic'

export default async function EditNewsletterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: newsletter } = await supabase
    .from('newsletters').select('*').eq('id', id).single()

  if (!newsletter) notFound()

  return (
    <>
      <header className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/admin/newsletter" style={{ color: 'var(--mute)', textDecoration: 'none', fontSize: 13 }}>
            ← Newsletter
          </Link>
        </div>
      </header>
      <NewsletterEditor newsletter={newsletter} />
    </>
  )
}
