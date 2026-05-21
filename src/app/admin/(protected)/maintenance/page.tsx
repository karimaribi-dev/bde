import { createClient } from '@/lib/supabase/server'
import { MaintenanceSettings } from '@/lib/types'
import MaintenanceEditor from '@/components/MaintenanceEditor'

export const dynamic = 'force-dynamic'

export default async function AdminMaintenancePage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'maintenance')
    .single()

  const settings: MaintenanceSettings = data?.value ?? {
    enabled: false,
    title: 'Site en maintenance',
    message: 'Nous revenons bientôt.',
    image_url: '',
    image_alt: '',
  }

  return (
    <>
      <header className="admin-header">
        <h1>Maintenance</h1>
      </header>
      <MaintenanceEditor settings={settings} />
    </>
  )
}
