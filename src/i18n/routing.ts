import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['fr', 'en', 'es', 'de'],
  defaultLocale: 'fr',
  localePrefix: 'as-needed', // /fr → /, /en → /en, /es → /es, /de → /de
})
