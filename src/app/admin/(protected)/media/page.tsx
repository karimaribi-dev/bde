import { createClient } from '@/lib/supabase/server'
import MediaLibraryClient from '@/components/MediaLibraryClient'

export const dynamic = 'force-dynamic'

export default async function MediaPage() {
  const supabase = await createClient()

  // Récupérer tous les fichiers du bucket
  const FOLDERS = ['covers', 'content', 'events', 'clubs', 'team', 'products']
  const filesPerFolder = await Promise.all(
    FOLDERS.map(folder =>
      supabase.storage.from('article-images').list(folder, { limit: 500, sortBy: { column: 'created_at', order: 'desc' } })
        .then(({ data }) => (data ?? []).map(f => ({ ...f, folder })))
    )
  )
  const allFiles = filesPerFolder.flat().filter(f => f.name && !f.name.startsWith('.'))

  // Récupérer les URLs utilisées dans la DB pour croiser
  const [
    { data: articles },
    { data: events },
    { data: clubs },
    { data: team },
    { data: products },
  ] = await Promise.all([
    supabase.from('articles').select('title, cover_image_url'),
    supabase.from('events').select('title, image_url'),
    supabase.from('clubs').select('title, image_url'),
    supabase.from('team_members').select('name, photo_url'),
    supabase.from('products').select('title, image_url'),
  ])

  // Index : url → { label, type }
  const urlIndex: Record<string, { label: string; type: string }> = {}
  for (const a of articles ?? []) if (a.cover_image_url) urlIndex[a.cover_image_url] = { label: a.title, type: 'Article' }
  for (const e of events ?? [])   if (e.image_url)      urlIndex[e.image_url]       = { label: e.title, type: 'Événement' }
  for (const c of clubs ?? [])    if (c.image_url)      urlIndex[c.image_url]       = { label: c.title, type: 'Club' }
  for (const t of team ?? [])     if (t.photo_url)      urlIndex[t.photo_url]       = { label: t.name,  type: 'Équipe' }
  for (const p of products ?? []) if (p.image_url)      urlIndex[p.image_url]       = { label: p.title, type: 'Shop' }

  // Enrichir chaque fichier avec son URL publique et l'usage
  const { data: { publicUrl: base } } = supabase.storage.from('article-images').getPublicUrl('_')
  const bucketBase = base.replace('/_', '')

  const enriched = allFiles.map(f => {
    const url = `${bucketBase}/${f.folder}/${f.name}`
    const usage = urlIndex[url] ?? null
    return { name: f.name, folder: f.folder, url, size: f.metadata?.size ?? 0, usage }
  })

  return <MediaLibraryClient files={enriched} />
}
