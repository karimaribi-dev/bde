'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageExtension from '@tiptap/extension-image'
import LinkExtension from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { createClient } from '@/lib/supabase/client'
import { Category, Article } from '@/lib/types'
import slugify from 'slugify'
import Image from 'next/image'

interface Props {
  article?: Article
  categories: Category[]
}

export default function ArticleEditor({ article, categories }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState(article?.title ?? '')
  const [slug, setSlug] = useState(article?.slug ?? '')
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? '')
  const [categoryId, setCategoryId] = useState(article?.category_id ?? '')
  const [status, setStatus] = useState<'draft' | 'published'>(article?.status ?? 'draft')
  const [coverImageUrl, setCoverImageUrl] = useState(article?.cover_image_url ?? '')
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [message, setMessage] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!article?.slug)

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension,
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Commencez à écrire votre article…' }),
    ],
    content: article?.content ?? '',
    editorProps: {
      attributes: { class: 'tiptap-editor' },
    },
  })

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!slugManuallyEdited) {
      setSlug(slugify(value, { lower: true, strict: true, locale: 'fr' }))
    }
  }

  async function uploadCoverImage(file: File) {
    setUploadingImage(true)
    const ext = file.name.split('.').pop()
    const path = `covers/${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from('article-images').upload(path, file)
    if (!error && data) {
      const { data: { publicUrl } } = supabase.storage.from('article-images').getPublicUrl(data.path)
      setCoverImageUrl(publicUrl)
    }
    setUploadingImage(false)
  }

  async function insertImage() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file || !editor) return
      const ext = file.name.split('.').pop()
      const path = `content/${Date.now()}.${ext}`
      const { data, error } = await supabase.storage.from('article-images').upload(path, file)
      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage.from('article-images').getPublicUrl(data.path)
        editor.chain().focus().setImage({ src: publicUrl }).run()
      }
    }
    input.click()
  }

  const save = useCallback(async (saveStatus: 'draft' | 'published') => {
    if (!title.trim()) { setMessage('Le titre est requis.'); return }
    if (!slug.trim()) { setMessage('Le slug est requis.'); return }
    setSaving(true)
    setMessage('')

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim() || null,
      content: editor?.getHTML() ?? '',
      cover_image_url: coverImageUrl || null,
      category_id: categoryId || null,
      status: saveStatus,
      published_at: saveStatus === 'published' ? (article?.published_at ?? new Date().toISOString()) : null,
    }

    let error
    if (article?.id) {
      ({ error } = await supabase.from('articles').update(payload).eq('id', article.id))
    } else {
      ({ error } = await supabase.from('articles').insert(payload))
    }

    setSaving(false)
    if (error) {
      setMessage(`Erreur : ${error.message}`)
    } else {
      setMessage(saveStatus === 'published' ? 'Article publié !' : 'Brouillon sauvegardé.')
      setStatus(saveStatus)
      if (!article?.id) router.push('/admin/articles')
      else router.refresh()
    }
  }, [title, slug, excerpt, editor, coverImageUrl, categoryId, article, router, supabase])

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {article ? 'Modifier l\'article' : 'Nouvel article'}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => save('draft')}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {saving ? 'Sauvegarde…' : 'Brouillon'}
          </button>
          <button
            onClick={() => save('published')}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Sauvegarde…' : 'Publier'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-4 text-sm px-4 py-3 rounded-lg ${
          message.startsWith('Erreur') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Titre de l'article"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">/articles/</span>
                <input
                  value={slug}
                  onChange={(e) => { setSlug(e.target.value); setSlugManuallyEdited(true) }}
                  placeholder="mon-article"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Extrait</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Résumé affiché dans les listes d'articles…"
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-100 px-4 py-2 flex items-center gap-1 flex-wrap">
              <ToolbarButton onClick={() => editor?.chain().focus().toggleBold().run()} title="Gras">
                <strong>B</strong>
              </ToolbarButton>
              <ToolbarButton onClick={() => editor?.chain().focus().toggleItalic().run()} title="Italique">
                <em>I</em>
              </ToolbarButton>
              <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} title="H1">
                H1
              </ToolbarButton>
              <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} title="H2">
                H2
              </ToolbarButton>
              <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} title="H3">
                H3
              </ToolbarButton>
              <div className="w-px h-5 bg-gray-200 mx-1" />
              <ToolbarButton onClick={() => editor?.chain().focus().toggleBulletList().run()} title="Liste à puces">
                • —
              </ToolbarButton>
              <ToolbarButton onClick={() => editor?.chain().focus().toggleOrderedList().run()} title="Liste numérotée">
                1.
              </ToolbarButton>
              <ToolbarButton onClick={() => editor?.chain().focus().toggleBlockquote().run()} title="Citation">
                &ldquo;
              </ToolbarButton>
              <ToolbarButton onClick={() => editor?.chain().focus().toggleCode().run()} title="Code inline">
                {'<>'}
              </ToolbarButton>
              <ToolbarButton onClick={() => editor?.chain().focus().toggleCodeBlock().run()} title="Bloc de code">
                {'{ }'}
              </ToolbarButton>
              <div className="w-px h-5 bg-gray-200 mx-1" />
              <ToolbarButton onClick={insertImage} title="Insérer une image">
                🖼
              </ToolbarButton>
            </div>
            <div className="tiptap-editor min-h-[400px]">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <div className={`text-sm font-medium px-3 py-2 rounded-lg ${
                status === 'published' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
              }`}>
                {status === 'published' ? '✓ Publié' : '○ Brouillon'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sans catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-3">Image de couverture</label>
            {coverImageUrl && (
              <div className="relative mb-3 rounded-lg overflow-hidden h-40">
                <Image src={coverImageUrl} alt="Couverture" fill className="object-cover" />
                <button
                  onClick={() => setCoverImageUrl('')}
                  className="absolute top-2 right-2 bg-white text-gray-600 hover:text-red-500 rounded-full w-6 h-6 flex items-center justify-center text-xs shadow"
                >
                  ×
                </button>
              </div>
            )}
            <label className="cursor-pointer block w-full text-center border-2 border-dashed border-gray-200 rounded-lg py-4 text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors">
              {uploadingImage ? 'Chargement…' : '+ Télécharger une image'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCoverImage(f) }}
              />
            </label>
            <div className="mt-2">
              <input
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="Ou coller une URL…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ToolbarButton({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors font-mono"
    >
      {children}
    </button>
  )
}
