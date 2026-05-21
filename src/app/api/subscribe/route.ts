import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('subscribers')
    .upsert({ email: email.toLowerCase().trim(), status: 'active' }, { onConflict: 'email' })

  if (error) {
    return NextResponse.json({ error: 'Erreur lors de l\'inscription.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
