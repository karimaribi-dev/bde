import { createClient } from '@/lib/supabase/server'
import AnalyticsEditor from '@/components/AnalyticsEditor'

export const dynamic = 'force-dynamic'

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'analytics')
    .single()

  const measurementId: string = data?.value?.measurement_id ?? ''
  const gtmId: string = data?.value?.gtm_id ?? ''

  return (
    <>
      <header className="admin-header">
        <h1>Analytics</h1>
      </header>
      <AnalyticsEditor initial={measurementId} initialGtm={gtmId} />
    </>
  )
}
