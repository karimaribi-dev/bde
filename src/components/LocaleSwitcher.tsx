'use client'

import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

const LOCALES = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'de', label: 'DE' },
]

const LOCALE_CODES = LOCALES.map(l => l.code)

// Strip non-default locale prefix (/en /es /de) from pathname
function stripLocalePrefix(pathname: string): string {
  for (const { code } of LOCALES) {
    if (code === 'fr') continue
    if (pathname === `/${code}`) return '/'
    if (pathname.startsWith(`/${code}/`)) return pathname.slice(code.length + 1)
  }
  return pathname
}

export function buildLocalePath(pathname: string, toLocale: string): string {
  const base = stripLocalePrefix(pathname)

  // For article pages: swap locale prefix in slug (fr-slug, en-slug, es-slug, de-slug)
  const articleMatch = base.match(/^(\/articles\/)([a-z]{2}-)(.+)$/)
  if (articleMatch) {
    const [, prefix, currentPrefix, rest] = articleMatch
    const isKnownLocale = LOCALE_CODES.includes(currentPrefix.slice(0, -1))
    if (isKnownLocale) {
      const newBase = `${prefix}${toLocale}-${rest}`
      return toLocale === 'fr' ? newBase : `/${toLocale}${newBase}`
    }
  }

  if (toLocale === 'fr') return base
  return `/${toLocale}${base === '/' ? '' : base}`
}

interface Props {
  currentLocale: string
}

export default function LocaleSwitcher({ currentLocale }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function switchLocale(next: string) {
    setOpen(false)
    // Remember manual choice for 1 year so auto-redirect won't override it
    document.cookie = `locale_choice=${next};path=/;max-age=31536000;samesite=lax`
    const target = buildLocalePath(pathname, next)
    window.location.href = target
  }

  const others = LOCALES.filter(l => l.code !== currentLocale)

  return (
    <div ref={ref} className="locale-switcher">
      <button
        className="locale-switcher__current"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {currentLocale.toUpperCase()}
        <svg
          width="8" height="8" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {open && (
        <div className="locale-switcher__dropdown" role="listbox">
          {others.map(l => (
            <button
              key={l.code}
              role="option"
              className="locale-switcher__option"
              onClick={() => switchLocale(l.code)}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
