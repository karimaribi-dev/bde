'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { createClient } from '@/lib/supabase/client'
import type { Newsletter, Article, Category } from '@/lib/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

type ArticleWithCat = Article & { category: Category | null }

interface Props {
  newsletter?: Newsletter
}

export default function NewsletterEditor({ newsletter }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const isNew = !newsletter

  const [subject, setSubject] = useState(newsletter?.subject ?? '')
  const [articleIds, setArticleIds] = useState<string[]>(newsletter?.article_ids ?? [])
  const [scheduledAt, setScheduledAt] = useState(
    newsletter?.scheduled_at ? newsletter.scheduled_at.slice(0, 16) : ''
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<{ count?: number; error?: string } | null>(null)
  const [error, setError] = useState('')
  const [articles, setArticles] = useState<ArticleWithCat[]>([])
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null)
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')

  const editor = useEditor({
    extensions: [StarterKit],
    content: newsletter?.editorial ?? '',
    editorProps: { attributes: { class: 'tiptap-editor' } },
    onUpdate: () => setSaved(false),
  })

  useEffect(() => {
    supabase.from('articles')
      .select('*, category:categories!category_id(id, name, slug)')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(30)
      .then(({ data }) => setArticles((data ?? []) as ArticleWithCat[]))

    supabase.from('subscribers')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .then(({ count }) => setSubscriberCount(count ?? 0))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function markChanged() { setSaved(false) }

  function toggleArticle(id: string) {
    setArticleIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
    markChanged()
  }

  function moveArticle(id: string, dir: -1 | 1) {
    setArticleIds(prev => {
      const idx = prev.indexOf(id)
      if (idx < 0) return prev
      const next = [...prev]
      const swap = idx + dir
      if (swap < 0 || swap >= next.length) return prev
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      return next
    })
    markChanged()
  }

  async function handleSave(newStatus?: string) {
    setSaving(true)
    setError('')
    const editorial = editor?.getHTML() ?? ''
    const payload = {
      subject: subject.trim(),
      editorial,
      article_ids: articleIds,
      scheduled_at: scheduledAt || null,
      status: newStatus ?? newsletter?.status ?? 'draft',
      updated_at: new Date().toISOString(),
    }

    let err
    if (isNew) {
      const res = await supabase.from('newsletters').insert(payload).select('id').single()
      err = res.error
      if (!err && res.data) router.replace(`/admin/newsletter/${res.data.id}`)
    } else {
      const res = await supabase.from('newsletters').update(payload).eq('id', newsletter.id)
      err = res.error
    }

    setSaving(false)
    if (err) { setError(`Erreur : ${err.message}`) }
    else { setSaved(true); router.refresh() }
  }

  async function handleSchedule() {
    if (!scheduledAt) { setError('Choisissez une date de programmation.'); return }
    await handleSave('scheduled')
  }

  async function handleSend() {
    if (!newsletter?.id) { await handleSave(); return }
    setSending(true)
    setSendResult(null)
    setError('')
    try {
      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: newsletter.id }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error ?? 'Erreur envoi')
      else setSendResult({ count: data.recipients })
      router.refresh()
    } finally {
      setSending(false)
    }
  }

  const isSent = newsletter?.status === 'sent'
  const selectedArticles = articleIds
    .map(id => articles.find(a => a.id === id))
    .filter(Boolean) as ArticleWithCat[]

  return (
    <div className="max-w-3xl space-y-6">
      {error && <div className="px-4 py-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
      {sendResult && (
        <div className="px-4 py-3 rounded-lg bg-green-50 text-green-700 text-sm">
          ✓ Newsletter envoyée à {sendResult.count} abonné{(sendResult.count ?? 0) > 1 ? 's' : ''}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isNew ? 'Nouvelle newsletter' : 'Éditer la newsletter'}</h1>
          {subscriberCount !== null && (
            <p className="text-sm text-gray-400 mt-0.5">{subscriberCount} abonné{subscriberCount > 1 ? 's' : ''} actif{subscriberCount > 1 ? 's' : ''}</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!isSent && (
            <>
              <button onClick={() => handleSave()} disabled={saving || saved}
                className="px-4 py-2 text-sm font-medium border border-gray-200 rounded transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                {saving ? 'Sauvegarde…' : saved ? '✓ Sauvegardé' : 'Sauvegarder brouillon'}
              </button>
              <button onClick={handleSchedule} disabled={saving || !scheduledAt}
                className="px-4 py-2 text-sm font-medium border border-gray-800 text-gray-800 rounded transition-colors hover:bg-gray-100 disabled:opacity-40"
              >
                Programmer
              </button>
              <button onClick={handleSend} disabled={sending || isNew}
                className="px-4 py-2 text-sm font-medium text-white rounded transition-colors disabled:opacity-50"
                style={{ background: '#111' }}
              >
                {sending ? 'Envoi…' : 'Envoyer maintenant'}
              </button>
            </>
          )}
          {isSent && (
            <span className="px-3 py-1.5 text-sm rounded bg-green-100 text-green-700 font-medium">
              ✓ Envoyée · {newsletter.recipients_count} destinataire{(newsletter.recipients_count ?? 0) > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Status */}
      {newsletter && (
        <div className={`rounded-lg px-4 py-2.5 text-sm flex items-center gap-2 ${
          isSent ? 'bg-green-50 text-green-700'
          : newsletter.status === 'scheduled' ? 'bg-blue-50 text-blue-700'
          : 'bg-gray-50 text-gray-500'
        }`}>
          {isSent && `✓ Envoyée le ${format(new Date(newsletter.sent_at!), 'dd MMMM yyyy à HH:mm', { locale: fr })}`}
          {newsletter.status === 'scheduled' && `⏱ Programmée pour le ${format(new Date(newsletter.scheduled_at!), 'dd MMMM yyyy à HH:mm', { locale: fr })}`}
          {newsletter.status === 'draft' && '○ Brouillon'}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {(['edit', 'preview'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {t === 'edit' ? 'Édition' : 'Aperçu email'}
          </button>
        ))}
      </div>

      {tab === 'edit' && (
        <>
          {/* Subject */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Objet de l&apos;email</label>
            <input
              value={subject}
              onChange={e => { setSubject(e.target.value); markChanged() }}
              placeholder="Ex : Les 5 actus IA de la semaine"
              disabled={isSent}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-50"
            />
          </div>

          {/* Editorial */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Éditorial
              <span className="ml-2 text-xs font-normal text-gray-400">— introduction libre</span>
            </label>
            <div className={`border border-gray-200 rounded-lg overflow-hidden ${isSent ? 'pointer-events-none opacity-60' : ''}`}>
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* Article picker */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-900">
                Articles sélectionnés
                <span className="ml-2 text-xs font-normal text-gray-400">{articleIds.length} article{articleIds.length > 1 ? 's' : ''}</span>
              </label>
            </div>

            {/* Selected articles with order */}
            {selectedArticles.length > 0 && (
              <div className="space-y-2 pb-4 border-b border-gray-100">
                {selectedArticles.map((a, i) => (
                  <div key={a.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                    <span className="font-mono text-xs text-gray-400 w-5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{a.title}</p>
                      <p className="text-xs text-gray-400">{a.category?.name}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => moveArticle(a.id, -1)} disabled={i === 0 || isSent}
                        className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-30 text-xs">↑</button>
                      <button onClick={() => moveArticle(a.id, 1)} disabled={i === selectedArticles.length - 1 || isSent}
                        className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-30 text-xs">↓</button>
                      {!isSent && (
                        <button onClick={() => toggleArticle(a.id)}
                          className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-400 text-xs">×</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Article list to pick from */}
            {!isSent && (
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {articles.filter(a => !articleIds.includes(a.id)).map(a => (
                  <button key={a.id} onClick={() => toggleArticle(a.id)}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <span className="w-4 h-4 border border-gray-300 rounded flex-shrink-0 group-hover:border-gray-500" />
                    <div className="min-w-0">
                      <p className="text-sm text-gray-700 truncate">{a.title}</p>
                      <p className="text-xs text-gray-400">{a.category?.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Scheduling */}
          {!isSent && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Programmer l&apos;envoi
                <span className="ml-2 text-xs font-normal text-gray-400">(optionnel)</span>
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={e => { setScheduledAt(e.target.value); markChanged() }}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
              {scheduledAt && (
                <p className="text-xs text-gray-400 mt-2">
                  Envoi prévu le {format(new Date(scheduledAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                </p>
              )}
            </div>
          )}
        </>
      )}

      {tab === 'preview' && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
            <span className="text-xs font-mono text-gray-400">OBJET :</span>
            <span className="text-sm text-gray-700">{subject || '(aucun objet)'}</span>
          </div>
          <div className="p-4" style={{ background: '#f3efe6' }}>
            <iframe
              srcDoc={selectedArticles.length || editor?.getText() ? buildPreviewHtml(editor?.getHTML() ?? '', selectedArticles, subject) : '<p style="padding:24px;color:#999;font-family:monospace;font-size:12px;">Ajoutez un éditorial ou des articles pour voir l\'aperçu.</p>'}
              className="w-full rounded border-0"
              style={{ height: 600 }}
              title="Aperçu newsletter"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function buildPreviewHtml(editorial: string, articles: (Article & { category: { name: string; slug: string } | null })[], subject: string): string {
  const { buildNewsletterHtml } = require('@/lib/newsletter-template')
  return buildNewsletterHtml({
    subject,
    editorial,
    articles,
    unsubscribeUrl: '#',
    siteUrl: typeof window !== 'undefined' ? window.location.origin : 'https://aitrendsnews.com',
  })
}
