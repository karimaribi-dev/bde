import { createClient } from '@/lib/supabase/server'
import { MaintenanceSettings } from '@/lib/types'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default async function MaintenancePage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'maintenance')
    .single()

  const settings: MaintenanceSettings = data?.value ?? {
    enabled: true,
    title: 'Site en maintenance',
    message: 'Nous revenons bientôt.',
    image_url: '',
    image_alt: '',
  }

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"altesse-std-24pt", serif',
      padding: '40px 20px',
      textAlign: 'center',
      background: '#111',
    }}>
      {settings.image_url && (
        <Image
          src={settings.image_url}
          alt={settings.image_alt || 'Maintenance'}
          fill
          sizes="100vw"
          style={{ objectFit: 'cover', opacity: 0.5 }}
          priority
        />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h1 style={{
          fontSize: 32,
          fontWeight: 700,
          color: settings.image_url ? '#fff' : '#111',
          marginBottom: 16,
          maxWidth: 560,
          lineHeight: 1.3,
        }}>
          {settings.title}
        </h1>
        <p style={{
          fontSize: 16,
          color: settings.image_url ? 'rgba(255,255,255,0.8)' : '#555',
          maxWidth: 400,
          lineHeight: 1.7,
          margin: '0 auto',
        }}>
          {settings.message}
        </p>
      </div>
    </div>
  )
}
