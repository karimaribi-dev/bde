import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PopupEditor from '@/components/PopupEditor'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPopupPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: popup } = await supabase.from('popups').select('*').eq('id', id).single()
  if (!popup) notFound()
  return <PopupEditor popup={popup} />
}
