import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface DriveFile {
  id: string
  name: string
  mimeType: string
  thumbnailLink?: string
}

export async function GET(req: NextRequest) {
  const folderId = req.nextUrl.searchParams.get('folderId')
  if (!folderId) {
    return NextResponse.json({ error: 'folderId required' }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_DRIVE_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'GOOGLE_DRIVE_API_KEY not configured' }, { status: 500 })
  }

  const query = `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`
  const fields = 'files(id,name,mimeType,thumbnailLink)'
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&orderBy=name&pageSize=200&key=${apiKey}`

  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) {
      const err = await res.json()
      return NextResponse.json({ error: err.error?.message ?? 'Drive API error' }, { status: res.status })
    }
    const data = await res.json()
    const files: DriveFile[] = data.files ?? []

    return NextResponse.json({ photos: files.map(f => ({
      id: f.id,
      name: f.name,
      // URLs CDN Google directes (pas de proxy) — fonctionne si le dossier est partagé publiquement
      thumbUrl: `https://drive.google.com/thumbnail?id=${f.id}&sz=w600`,
      fullUrl:  `https://drive.google.com/thumbnail?id=${f.id}&sz=w2000`,
    })) })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch from Google Drive' }, { status: 500 })
  }
}
