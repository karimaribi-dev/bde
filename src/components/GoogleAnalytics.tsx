import { createClient } from '@/lib/supabase/server'
import Script from 'next/script'

export default async function GoogleAnalytics() {
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
      {/* Google Tag Manager */}
      {gtmId && gtmId.startsWith('GTM-') && (
        <>
          <Script id="gtm-head" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
          {/* GTM noscript injected via dangerouslySetInnerHTML in layout body */}
        </>
      )}

      {/* Google Analytics (gtag) */}
      {measurementId && measurementId.startsWith('G-') && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${measurementId}');`}
          </Script>
        </>
      )}
    </>
  )
}
