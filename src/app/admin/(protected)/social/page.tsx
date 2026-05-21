import { createClient } from '@/lib/supabase/server'
import { SocialLinks } from '@/lib/types'
import SocialLinksEditor from '@/components/SocialLinksEditor'

export const dynamic = 'force-dynamic'

export default async function AdminSocialPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'social_links')
    .single()

  const initial: SocialLinks = data?.value ?? {}

  return (
    <>
      <header className="admin-header">
        <h1>Réseaux sociaux</h1>
      </header>
      <SocialLinksEditor initial={initial} />
    </>
  )
}
