import { NextResponse } from 'next/server'

// Cron endpoint — appelé toutes les 15 minutes
// Sur Vercel : vercel.json cron
// Sur VPS : */15 * * * * curl -X GET https://aitrendsnews.com/api/newsletter/cron

export async function GET() {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()

  // Trouve les newsletters programmées dont la date est passée
  const { data: due } = await supabase
    .from('newsletters')
    .select('id')
    .eq('status', 'scheduled')
    .lte('scheduled_at', new Date().toISOString())

  if (!due?.length) return NextResponse.json({ sent: 0 })

  let sent = 0
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aitrendsnews.com'

  for (const nl of due) {
    const res = await fetch(`${siteUrl}/api/newsletter/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: nl.id }),
    })
    if (res.ok) sent++
  }

  return NextResponse.json({ sent })
}
