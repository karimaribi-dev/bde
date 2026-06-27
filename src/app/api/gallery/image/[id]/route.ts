import { NextRequest, NextResponse } from 'next/server'

// Pas de force-dynamic : permet au CDN Vercel de mettre en cache la réponse
export const dynamic = 'force-static'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY
  if (!apiKey) return new NextResponse('Not configured', { status: 500 })

  const url = `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${apiKey}`

  try {
    const res = await fetch(url, {
      // Cache côté serveur Next.js 24h — évite de rappeler Drive pour les mêmes images
      next: { revalidate: 86400 },
    })
    if (!res.ok) return new NextResponse('Not found', { status: 404 })

    const contentType = res.headers.get('content-type') ?? 'image/jpeg'
    const buffer = await res.arrayBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        // s-maxage : CDN Vercel garde l'image 24h ; navigateur garde 1h
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch {
    return new NextResponse('Error', { status: 500 })
  }
}
