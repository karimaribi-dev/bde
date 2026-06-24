import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY
  if (!apiKey) return new NextResponse('Not configured', { status: 500 })

  const size = req.nextUrl.searchParams.get('size') ?? 'w800'

  // Download the file content via Drive API
  const url = `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${apiKey}`

  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return new NextResponse('Not found', { status: 404 })

    const contentType = res.headers.get('content-type') ?? 'image/jpeg'
    const buffer = await res.arrayBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch {
    return new NextResponse('Error', { status: 500 })
  }
}
