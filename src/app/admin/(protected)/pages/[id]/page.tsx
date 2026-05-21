import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PageEditor from '@/components/PageEditor'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPagePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: page } = await supabase.from('pages').select('*').eq('id', id).single()
  if (!page) notFound()
  return <PageEditor page={page} />
}
