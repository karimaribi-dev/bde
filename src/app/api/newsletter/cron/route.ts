import { NextRequest, NextResponse } from 'next/server'

// Cron endpoint — envoie les newsletters programmées dont la date est passée.
// Protégé par CRON_SECRET : sans secret configuré, la route refuse tout appel
// (elle déclenche des envois, on ne la laisse jamais ouverte par défaut).

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()

  // Trouve les newsletters programmées dont la date est passée
  const { data: due } = await supabase
    .from('newsletters')
    .select('id')
    .eq('status', 'scheduled')
    .lte('scheduled_at', new Date().toISOString())

  if (!due?.length) return NextResponse.json({ sent: 0 })

  // URL dérivée de la requête entrante : le secret ne quitte jamais cet hôte.
  const sendUrl = new URL('/api/newsletter/send', req.url).toString()

  let sent = 0
  for (const nl of due) {
    const res = await fetch(sendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ id: nl.id }),
    })
    if (res.ok) sent++
  }

  return NextResponse.json({ sent })
}
