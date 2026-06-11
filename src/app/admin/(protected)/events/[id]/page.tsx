import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EventEditor from '@/components/EventEditor'
import { Event } from '@/lib/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditEventPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (!event) notFound()

  return <EventEditor event={event as Event} />
}
