import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import SitePopupModal from './SitePopupModal'

async function PopupLoader() {
  const supabase = await createClient()

  const { data: popups } = await supabase
    .from('popups')
    .select('*')
    .eq('is_active', true)
    .order('updated_at', { ascending: false })

  const now = new Date()
  const popup = (popups ?? []).find(p => {
    const afterStart = !p.starts_at || new Date(p.starts_at) <= now
    const beforeEnd = !p.ends_at || new Date(p.ends_at) >= now
    return afterStart && beforeEnd
  }) ?? null

  if (!popup) return null
  return <SitePopupModal popup={popup} />
}

export default function SitePopup() {
  return (
    <Suspense fallback={null}>
      <PopupLoader />
    </Suspense>
  )
}
