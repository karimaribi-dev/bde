import { createClient } from '@/lib/supabase/server'
import CookieBanner from './CookieBanner'

export default async function CookieConsent() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'analytics')
    .single()

  const gtmId: string = data?.value?.gtm_id ?? ''
  const gaId: string  = data?.value?.measurement_id ?? ''

  return <CookieBanner gtmId={gtmId} gaId={gaId} />
}
