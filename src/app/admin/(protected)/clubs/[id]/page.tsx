import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ClubEditor from '@/components/ClubEditor'
import { Club } from '@/lib/types'

export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ id: string }> }

export default async function EditClubPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: club } = await supabase.from('clubs').select('*').eq('id', id).single()
  if (!club) notFound()
  return <ClubEditor club={club as Club} />
}
