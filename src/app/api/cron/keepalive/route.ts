import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Keep-alive Supabase — empêche la mise en pause du projet (plan gratuit).
// Supabase pause un projet dont l'activité est insuffisante sur 7 jours glissants ;
// quelques requêtes par jour suffisent à l'éviter.
// Déclenché par le cron Vercel déclaré dans vercel.json (1×/jour, plan Hobby).

export const dynamic = 'force-dynamic'

// Tables interrogées — lecture seule, en head+count : aucune ligne transférée.
const TABLES = ['site_settings', 'events', 'gallery_sections'] as const

export async function GET(req: NextRequest) {
  // Vercel envoie `Authorization: Bearer <CRON_SECRET>` si la variable est définie.
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    return NextResponse.json({ error: 'supabase env vars missing' }, { status: 500 })
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } })

  const results = await Promise.all(
    TABLES.map(async (table) => {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      return { table, count: count ?? null, error: error?.message ?? null }
    })
  )

  const failed = results.filter((r) => r.error)

  return NextResponse.json(
    {
      ok: failed.length === 0,
      checkedAt: new Date().toISOString(),
      results,
    },
    { status: failed.length === results.length ? 503 : 200 }
  )
}
