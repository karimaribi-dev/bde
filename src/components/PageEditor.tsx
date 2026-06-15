'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import LinkExtension from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { createClient } from '@/lib/supabase/client'
import { Page } from '@/lib/types'

interface Props {
  page?: Page
}

export default function PageEditor({ page }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState(page?.title ?? '')
  const [slug, setSlug] = useState(page?.slug ?? '')
  const [slugManual, setSlugManual] = useState(!!page?.slug)
  const [metaDescription, setMetaDescription] = useState(page?.meta_description ?? '')
  const [isPublished, setIsPublished] = useState(page?.is_published ?? true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [message, setMessage] = useState('')

  function slugify(str: string) {
    return str.toLowerCase().normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  function handleTitleChange(val: string) {
    setTitle(val)
    setSaved(false)
    if (!slugManual) setSlug(slugify(val))
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Commencez à écrire le contenu de la page…' }),
    ],
    content: page?.content ?? '',
    editorProps: {
      attributes: { class: 'tiptap-editor' },
    },
    onUpdate: () => setSaved(false),
  })

  const save = useCallback(async () => {
    if (!title.trim()) { setMessage('Le titre est requis.'); return }
    if (!slug.trim()) { setMessage('Le slug est requis.'); return }
    setSaving(true)
    setMessage('')

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      content: editor?.getHTML() ?? '',
      meta_description: metaDescription.trim() || null,
      is_published: isPublished,
      updated_at: new Date().toISOString(),
    }

    let error
    if (page?.id) {
      const res = await supabase.from('pages').update(payload).eq('id', page.id)
      error = res.error
    } else {
      const res = await supabase.from('pages').insert(payload)
      error = res.error
    }

    setSaving(false)
    if (error) {
      setMessage(`Erreur : ${error.message}`)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      setMessage('Page sauvegardée !')
      if (!page?.id) router.push('/admin/pages')
      else router.refresh()
    }
  }, [title, slug, editor, metaDescription, isPublished, page, router, supabase])

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {page ? `Modifier : ${page.title}` : 'Nouvelle page'}
        </h1>
        <div className="flex items-center gap-3">
          {page?.slug && (
            <a
              href={`/p/${page.slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-gray-400 hover:text-gray-700 underline underline-offset-2"
            >
              Voir la page ↗
            </a>
          )}
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white rounded transition-colors disabled:opacity-60"
            style={{ background: saved ? '#16a34a' : '#111' }}
          >
            {saving ? 'Sauvegarde…' : saved ? '✓ Sauvegardé' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-4 text-sm px-4 py-3 rounded-lg ${message.startsWith('Erreur') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Titre */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Titre de la page"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">/p/</span>
                <input
                  value={slug}
                  onChange={(e) => { setSlug(e.target.value); setSlugManual(true); setSaved(false) }}
                  placeholder="ma-page"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Éditeur */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-100 px-4 py-2 flex items-center gap-1 flex-wrap">
              {[
                { label: <strong>B</strong>, action: () => editor?.chain().focus().toggleBold().run(), title: 'Gras' },
                { label: <em>I</em>, action: () => editor?.chain().focus().toggleItalic().run(), title: 'Italique' },
                { label: 'H1', action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(), title: 'H1' },
                { label: 'H2', action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), title: 'H2' },
                { label: 'H3', action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(), title: 'H3' },
              ].map((btn, i) => (
                <button key={i} type="button" onClick={btn.action} title={btn.title}
                  className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors font-mono">
                  {btn.label}
                </button>
              ))}
              <div className="w-px h-5 bg-gray-200 mx-1" />
              {[
                { label: '• —', action: () => editor?.chain().focus().toggleBulletList().run(), title: 'Liste' },
                { label: '1.', action: () => editor?.chain().focus().toggleOrderedList().run(), title: 'Liste numérotée' },
                { label: '"', action: () => editor?.chain().focus().toggleBlockquote().run(), title: 'Citation' },
              ].map((btn, i) => (
                <button key={i} type="button" onClick={btn.action} title={btn.title}
                  className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors font-mono">
                  {btn.label}
                </button>
              ))}
            </div>
            <div className="tiptap-editor min-h-[400px]">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Visibilité</label>
              <div className="space-y-2">
                {([
                  { value: true, label: 'Publiée' },
                  { value: false, label: 'Non publiée' },
                ] as const).map(({ value, label }) => (
                  <label key={String(value)} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                    <input type="radio" name="isPublished" checked={isPublished === value}
                      onChange={() => { setIsPublished(value); setSaved(false) }} />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta description
              <span className="ml-1 text-gray-400 font-normal text-xs">— SEO</span>
            </label>
            <textarea
              value={metaDescription}
              onChange={(e) => { setMetaDescription(e.target.value); setSaved(false) }}
              placeholder="Description affichée dans les résultats Google…"
              rows={4}
              maxLength={160}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            <p className="text-xs text-gray-400 mt-1">{metaDescription.length}/160</p>
          </div>
        </div>
      </div>
    </div>
  )
}
