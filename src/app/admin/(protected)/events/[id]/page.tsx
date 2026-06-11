import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { use } from 'react'
import EventEditor from '@/components/EventEditor'
import { Event } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supabase = await createClient()
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (!event) notFound()

  return (
    <div className="admin-content">
      <EventEditor event={event as Event} />
    </div>
  )
}
