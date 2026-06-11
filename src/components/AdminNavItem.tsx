'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface AdminNavItemProps {
  href: string
  icon: string
  label: string
  exact?: boolean
  target?: string
  badge?: number
}

export default function AdminNavItem({ href, icon, label, exact = false, target, badge }: AdminNavItemProps) {
  const pathname = usePathname()
  const isActive = exact
    ? pathname === href
    : pathname === href || (pathname.startsWith(href + '/') && pathname !== href + '/new')

  return (
    <Link
      href={href}
      target={target}
      className={`admin-nav-item${isActive ? ' active' : ''}`}
      style={{ position: 'relative' }}
    >
      <i className={icon}></i>
      {label}
      {badge != null && badge > 0 && (
        <span style={{
          marginLeft: 'auto',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          background: '#FF4D1F',
          color: '#fff',
          fontSize: 10,
          fontWeight: 700,
          padding: '2px 6px',
          borderRadius: 99,
          lineHeight: 1.4,
          flexShrink: 0,
        }}>
          <i className="fa-solid fa-bell" style={{ fontSize: 9 }} />
          {badge}
        </span>
      )}
    </Link>
  )
}
