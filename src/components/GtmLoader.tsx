import { createClient } from '@/lib/supabase/server'

// GTM charge toujours (standard Google) — les tags internes sont contrôlés
// par le Consent Mode configuré dans le dashboard GTM.
export default async function GtmLoader() {
  let gtmId: string = process.env.NEXT_PUBLIC_GTM_ID ?? ''

  if (!gtmId) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'analytics')
      .single()
    gtmId = data?.value?.gtm_id ?? ''
  }

  if (!gtmId || !gtmId.startsWith('GTM-')) return null

  return (
    <>
      {/* GTM head snippet — dans le HTML initial pour détection par Tag Assistant */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`
        }}
      />

      {/* GTM noscript body snippet */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0" width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  )
}
