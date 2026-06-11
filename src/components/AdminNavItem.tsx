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
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          width: 18,
          height: 18,
        }}>
          <i className="fa-solid fa-bell" style={{ fontSize: 13, color: '#FF4D1F' }} />
          <span style={{
            position: 'absolute',
            top: -5, right: -6,
            background: '#FF4D1F',
            color: '#fff',
            fontSize: 9,
            fontWeight: 800,
            minWidth: 14, height: 14,
            borderRadius: 99,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            lineHeight: 1,
            padding: '0 3px',
            border: '1.5px solid #fff',
          }}>
            {badge}
          </span>
        </span>
      )}
    </Link>
  )
}
