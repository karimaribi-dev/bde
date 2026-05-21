import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { buildNewsletterHtml } from '@/lib/newsletter-template'

export async function POST(req: NextRequest) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 })

  const supabase = await createClient()

  // Load newsletter
  const { data: newsletter, error: nlErr } = await supabase
    .from('newsletters')
    .select('*')
    .eq('id', id)
    .single()
  if (nlErr || !newsletter) return NextResponse.json({ error: 'Newsletter introuvable' }, { status: 404 })
  if (newsletter.status === 'sent') return NextResponse.json({ error: 'Déjà envoyée' }, { status: 400 })

  // Load articles
  const { data: articles } = newsletter.article_ids?.length
    ? await supabase.from('articles').select('*, category:categories!category_id(id, name, slug)').in('id', newsletter.article_ids)
    : { data: [] }

  // Sort articles in selected order
  const orderedArticles = (newsletter.article_ids ?? [])
    .map((aid: string) => (articles ?? []).find((a: { id: string }) => a.id === aid))
    .filter(Boolean)

  // Load active subscribers
  const { data: subscribers } = await supabase
    .from('subscribers')
    .select('email, unsubscribe_token')
    .eq('status', 'active')

  if (!subscribers?.length) {
    return NextResponse.json({ error: 'Aucun abonné actif' }, { status: 400 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aitrendsnews.com'
  const resendKey = process.env.RESEND_API_KEY

  if (!resendKey) {
    // Mode simulation — on marque quand même comme envoyé pour les tests
    await supabase.from('newsletters').update({
      status: 'sent',
      sent_at: new Date().toISOString(),
      recipients_count: subscribers.length,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    return NextResponse.json({ success: true, simulated: true, recipients: subscribers.length })
  }

  const { Resend } = await import('resend')
  const resend = new Resend(resendKey)

  let sent = 0
  const fromAddress = `newsletter@${siteUrl.replace('https://', '').replace('http://', '')}`

  for (const sub of subscribers) {
    const unsubscribeUrl = `${siteUrl}/api/unsubscribe?token=${sub.unsubscribe_token}`
    const html = buildNewsletterHtml({
      subject: newsletter.subject,
      editorial: newsletter.editorial,
      articles: orderedArticles,
      unsubscribeUrl,
      siteUrl,
    })
    try {
      await resend.emails.send({
        from: `AI Trends News <${fromAddress}>`,
        to: sub.email,
        subject: newsletter.subject,
        html,
      })
      sent++
    } catch { /* continue */ }
  }

  await supabase.from('newsletters').update({
    status: 'sent',
    sent_at: new Date().toISOString(),
    recipients_count: sent,
    updated_at: new Date().toISOString(),
  }).eq('id', id)

  return NextResponse.json({ success: true, recipients: sent })
}
