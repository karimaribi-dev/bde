import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.redirect(new URL('/', req.url))

  const supabase = await createClient()
  await supabase
    .from('subscribers')
    .update({ status: 'unsubscribed' })
    .eq('unsubscribe_token', token)

  return NextResponse.redirect(new URL('/unsubscribe?done=1', req.url))
}
