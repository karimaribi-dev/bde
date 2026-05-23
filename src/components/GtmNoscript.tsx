import { createClient } from '@/lib/supabase/server'

export default async function GtmNoscript() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'analytics')
    .single()

  const gtmId: string = data?.value?.gtm_id ?? ''
  if (!gtmId || !gtmId.startsWith('GTM-')) return null

  return (
    <noscript>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  )
}
