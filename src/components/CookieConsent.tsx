import CookieBanner from './CookieBanner'

// GTM est chargé inconditionnellement par GtmLoader.
// Ce composant affiche juste la bannière de consentement RGPD.
export default function CookieConsent() {
  return <CookieBanner />
}
