'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface AdminNavItemProps {
  href: string
  icon: string
  label: string
  exact?: boolean
  target?: string
}

export default function AdminNavItem({ href, icon, label, exact = false, target }: AdminNavItemProps) {
  const pathname = usePathname()
  const isActive = exact
    ? pathname === href
    : pathname === href || (pathname.startsWith(href + '/') && pathname !== href + '/new')

  return (
    <Link
      href={href}
      target={target}
      className={`admin-nav-item${isActive ? ' active' : ''}`}
    >
      <i className={icon}></i>
      {label}
    </Link>
  )
}
