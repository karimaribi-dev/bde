import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminLogout from '@/components/AdminLogout'
import AdminNavItem from '@/components/AdminNavItem'
import '../admin.css'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  return (
    <div className="admin-bg">
      <div className="admin-app">
        <aside className="admin-sidebar">
          <a href="/admin" className="admin-logo">
            <i className="fa-solid fa-layer-group"></i>
            AI Trends News
          </a>

          <nav className="admin-nav-section">
            <div className="admin-nav-title">Contenu</div>
            <AdminNavItem href="/admin" icon="fa-solid fa-border-all" label="Tableau de bord" exact />
            <AdminNavItem href="/admin/articles" icon="fa-solid fa-newspaper" label="Articles" />
            <AdminNavItem href="/admin/articles/new" icon="fa-solid fa-plus-circle" label="Nouvel article" exact />
            <AdminNavItem href="/admin/categories" icon="fa-solid fa-tags" label="Catégories" exact />
            <AdminNavItem href="/admin/pages" icon="fa-solid fa-file-lines" label="Pages" />
            <AdminNavItem href="/admin/events" icon="fa-solid fa-calendar-days" label="Événements" />
            <AdminNavItem href="/admin/clubs" icon="fa-solid fa-people-group" label="Clubs" />
            <AdminNavItem href="/admin/products" icon="fa-solid fa-bag-shopping" label="Shop" />
          </nav>

          <nav className="admin-nav-section">
            <div className="admin-nav-title">Site</div>
            <AdminNavItem href="/admin/newsletter" icon="fa-solid fa-envelope" label="Newsletter" />
            <AdminNavItem href="/admin/subscribers" icon="fa-solid fa-users" label="Abonnés" exact />
            <AdminNavItem href="/admin/ads" icon="fa-solid fa-rectangle-ad" label="Publicités" />
            <AdminNavItem href="/admin/popups" icon="fa-solid fa-window-restore" label="Popups" />
            <AdminNavItem href="/admin/social" icon="fa-solid fa-share-nodes" label="Réseaux sociaux" exact />
            <AdminNavItem href="/admin/analytics" icon="fa-brands fa-google" label="Analytics" exact />
            <AdminNavItem href="/admin/maintenance" icon="fa-solid fa-screwdriver-wrench" label="Maintenance" exact />
          </nav>

          <nav className="admin-nav-section">
            <div className="admin-nav-title">Liens rapides</div>
            <AdminNavItem href="/" icon="fa-solid fa-globe" label="Voir le site" exact target="_blank" />
          </nav>

          <div className="admin-spacer"></div>

          <div className="admin-user-info">
            <p className="admin-user-email">{user.email}</p>
            <AdminLogout />
          </div>
        </aside>

        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  )
}
