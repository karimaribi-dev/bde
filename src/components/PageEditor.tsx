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

const TOOLBAR = [
  { label: <strong>B</strong>, cmd: 'toggleBold', title: 'Gras' },
  { label: <em>I</em>,        cmd: 'toggleItalic', title: 'Italique' },
  { label: 'H1', cmd: 'toggleHeading1', title: 'H1' },
  { label: 'H2', cmd: 'toggleHeading2', title: 'H2' },
  { label: 'H3', cmd: 'toggleHeading3', title: 'H3' },
]

function ToolbarBtn({ label, title, onClick }: { label: React.ReactNode; title: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} title={title}
      className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors font-mono">
      {label}
    </button>
  )
}

function EditorToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null
  return (
    <div className="border-b border-gray-100 px-4 py-2 flex items-center gap-1 flex-wrap">
      <ToolbarBtn label={<strong>B</strong>}  title="Gras"             onClick={() => editor.chain().focus().toggleBold().run()} />
      <ToolbarBtn label={<em>I</em>}           title="Italique"         onClick={() => editor.chain().focus().toggleItalic().run()} />
      <ToolbarBtn label="H1"                   title="H1"               onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
      <ToolbarBtn label="H2"                   title="H2"               onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
      <ToolbarBtn label="H3"                   title="H3"               onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
      <div className="w-px h-5 bg-gray-200 mx-1" />
      <ToolbarBtn label="• —" title="Liste"            onClick={() => editor.chain().focus().toggleBulletList().run()} />
      <ToolbarBtn label="1."  title="Liste numérotée"  onClick={() => editor.chain().focus().toggleOrderedList().run()} />
      <ToolbarBtn label={'"'} title="Citation"         onClick={() => editor.chain().focus().toggleBlockquote().run()} />
    </div>
  )
}

export default function PageEditor({ page }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [title,           setTitle]           = useState(page?.title           ?? '')
  const [titleEn,         setTitleEn]         = useState(page?.title_en        ?? '')
  const [slug,            setSlug]            = useState(page?.slug            ?? '')
  const [slugManual,      setSlugManual]      = useState(!!page?.slug)
  const [metaDescription, setMetaDescription] = useState(page?.meta_description ?? '')
  const [isPublished,     setIsPublished]     = useState(page?.is_published    ?? true)
  const [saving,          setSaving]          = useState(false)
  const [saved,           setSaved]           = useState(false)
  const [message,         setMessage]         = useState('')
  const [tab,             setTab]             = useState<'fr' | 'en'>('fr')

  function slugify(str: string) {
    return str.toLowerCase().normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
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
      Placeholder.configure({ placeholder: 'Contenu FR…' }),
    ],
    content: page?.content ?? '',
    editorProps: { attributes: { class: 'tiptap-editor' } },
    onUpdate: () => setSaved(false),
  })

  const editorEn = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'EN content…' }),
    ],
    content: page?.content_en ?? '',
    editorProps: { attributes: { class: 'tiptap-editor' } },
    onUpdate: () => setSaved(false),
  })

  const save = useCallback(async () => {
    if (!title.trim()) { setMessage('Le titre est requis.'); return }
    if (!slug.trim())  { setMessage('Le slug est requis.'); return }
    setSaving(true)
    setMessage('')

    const payload = {
      title:           title.trim(),
      title_en:        titleEn.trim() || null,
      slug:            slug.trim(),
      content:         editor?.getHTML()   ?? '',
      content_en:      editorEn?.getHTML() ?? '',
      meta_description: metaDescription.trim() || null,
      is_published:    isPublished,
      updated_at:      new Date().toISOString(),
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
  }, [title, titleEn, slug, editor, editorEn, metaDescription, isPublished, page, router, supabase])

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 18px',
    fontSize: 13,
    fontWeight: active ? 700 : 400,
    borderBottom: active ? '2px solid #111' : '2px solid transparent',
    background: 'transparent',
    border: 'none',
    borderBottom: active ? '2px solid #111' : '2px solid transparent',
    cursor: 'pointer',
    color: active ? '#111' : '#9ca3af',
  })

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {page ? `Modifier : ${page.title}` : 'Nouvelle page'}
        </h1>
        <div className="flex items-center gap-3">
          {page?.slug && (
            <a href={`/p/${page.slug}`} target="_blank" rel="noreferrer"
              className="text-sm text-gray-400 hover:text-gray-700 underline underline-offset-2">
              Voir la page ↗
            </a>
          )}
          <button onClick={save} disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white rounded transition-colors disabled:opacity-60"
            style={{ background: saved ? '#16a34a' : '#111' }}>
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

          {/* Tabs FR / EN */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', gap: 0 }}>
            <button style={tabStyle(tab === 'fr')} onClick={() => setTab('fr')}>🇫🇷 Français</button>
            <button style={tabStyle(tab === 'en')} onClick={() => setTab('en')}>🇬🇧 English</button>
          </div>

          {/* Titre + slug */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
            {tab === 'fr' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre FR *</label>
                  <input value={title} onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Titre de la page"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-gray-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">/p/</span>
                    <input value={slug}
                      onChange={(e) => { setSlug(e.target.value); setSlugManual(true); setSaved(false) }}
                      placeholder="ma-page"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title EN</label>
                <input value={titleEn} onChange={(e) => { setTitleEn(e.target.value); setSaved(false) }}
                  placeholder="Page title in English"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-gray-400" />
                <p className="text-xs text-gray-400 mt-1">Si vide, le titre FR sera utilisé.</p>
              </div>
            )}
          </div>

          {/* Éditeur FR */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ display: tab === 'fr' ? 'block' : 'none' }}>
            <EditorToolbar editor={editor} />
            <div className="tiptap-editor min-h-[400px]">
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* Éditeur EN */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ display: tab === 'en' ? 'block' : 'none' }}>
            <EditorToolbar editor={editorEn} />
            <div className="tiptap-editor min-h-[400px]">
              <EditorContent editor={editorEn} />
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
            <textarea value={metaDescription}
              onChange={(e) => { setMetaDescription(e.target.value); setSaved(false) }}
              placeholder="Description affichée dans les résultats Google…"
              rows={4} maxLength={160}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-400" />
            <p className="text-xs text-gray-400 mt-1">{metaDescription.length}/160</p>
          </div>

          <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
            <p className="text-xs text-blue-700 font-medium mb-2">Migration SQL requise</p>
            <code className="text-xs text-blue-600 break-all">
              ALTER TABLE pages ADD COLUMN IF NOT EXISTS title_en TEXT, ADD COLUMN IF NOT EXISTS content_en TEXT;
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}
