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
import imageCompression from 'browser-image-compression'
import ImageCropModal from './ImageCropModal'

async function compressImage(file: File, maxWidthOrHeight: number, maxSizeMB: number): Promise<File> {
  return imageCompression(file, {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
    fileType: 'image/webp',
  })
}

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
  const [locale, setLocale] = useState<string>((article as unknown as Record<string, string>)?.locale ?? 'fr')

  const isCurrentlyScheduled = article?.status === 'published' &&
    article?.published_at &&
    new Date(article.published_at) > new Date()

  const [publishMode, setPublishMode] = useState<'draft' | 'now' | 'schedule'>(
    !article || article.status === 'draft' ? 'draft' :
    isCurrentlyScheduled ? 'schedule' : 'now'
  )
  const [scheduledAt, setScheduledAt] = useState(
    isCurrentlyScheduled && article?.published_at
      ? article.published_at.slice(0, 16)
      : ''
  )
  const [coverImageUrl, setCoverImageUrl] = useState(article?.cover_image_url ?? '')
  const [coverImageAlt, setCoverImageAlt] = useState(article?.cover_image_alt ?? '')
  const [sources, setSources] = useState(article?.sources ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadInfo, setUploadInfo] = useState('')
  const [pendingImage, setPendingImage] = useState<{ url: string } | null>(null)
  const [pendingAlt, setPendingAlt] = useState('')
  const [message, setMessage] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!article?.slug)
  const [cropState, setCropState] = useState<{ src: string; mode: 'cover' | 'content' } | null>(null)

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
    onUpdate: () => setSaved(false),
  })

function handleTitleChange(value: string) {
    setTitle(value)
    setSaved(false)
    if (!slugManuallyEdited) {
      setSlug(slugify(value, { lower: true, strict: true, locale: 'fr' }))
    }
  }

  function selectCoverImage(file: File) {
    const src = URL.createObjectURL(file)
    setCropState({ src, mode: 'cover' })
  }

  async function uploadCroppedCover(blob: Blob) {
    setCropState(null)
    setUploadingImage(true)
    setUploadInfo('')
    try {
      const originalKb = Math.round(blob.size / 1024)
      const file = new File([blob], 'cover.webp', { type: 'image/webp' })
      const compressed = await compressImage(file, 1400, 0.4)
      const compressedKb = Math.round(compressed.size / 1024)
      const path = `covers/${Date.now()}.webp`
      const { data, error } = await supabase.storage.from('article-images').upload(path, compressed, { contentType: 'image/webp' })
      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage.from('article-images').getPublicUrl(data.path)
        setCoverImageUrl(publicUrl)
        setSaved(false)
        setUploadInfo(`${originalKb} Ko → ${compressedKb} Ko`)
      }
    } finally {
      setUploadingImage(false)
    }
  }

  async function uploadCroppedContent(blob: Blob) {
    setCropState(null)
    try {
      const file = new File([blob], 'content.webp', { type: 'image/webp' })
      const compressed = await compressImage(file, 1600, 0.6)
      const path = `content/${Date.now()}.webp`
      const { data, error } = await supabase.storage.from('article-images').upload(path, compressed, { contentType: 'image/webp' })
      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage.from('article-images').getPublicUrl(data.path)
        setPendingAlt('')
        setPendingImage({ url: publicUrl })
      }
    } catch { /* silent */ }
  }

  async function insertImage() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file || !editor) return
      const src = URL.createObjectURL(file)
      setCropState({ src, mode: 'content' })
    }
    input.click()
  }

  function confirmInsertImage() {
    if (!pendingImage || !editor) return
    editor.chain().focus().setImage({ src: pendingImage.url, alt: pendingAlt.trim() }).run()
    setPendingImage(null)
    setPendingAlt('')
  }

  const save = useCallback(async () => {
    if (!title.trim()) { setMessage('Le titre est requis.'); return }
    if (!slug.trim()) { setMessage('Le slug est requis.'); return }
    if (publishMode === 'schedule' && !scheduledAt) { setMessage('Choisissez une date de programmation.'); return }
    setSaving(true); setMessage('')

    const saveStatus: 'draft' | 'published' = publishMode === 'draft' ? 'draft' : 'published'
    const savePublishedAt =
      publishMode === 'now' ? (article?.published_at ?? new Date().toISOString()) :
      publishMode === 'schedule' ? new Date(scheduledAt).toISOString() :
      null

    const payload = {
      title: title.trim(), slug: slug.trim(),
      excerpt: excerpt.trim() || null,
      content: editor?.getHTML() ?? '',
      cover_image_url: coverImageUrl || null,
      cover_image_alt: coverImageAlt.trim() || null,
      sources: sources.trim() || null,
      category_id: categoryId || null,
      status: saveStatus,
      published_at: savePublishedAt,
      locale: locale || 'fr',
    }

    let articleId = article?.id
    let error: { message: string } | null = null

    if (article?.id) {
      const res = await supabase.from('articles').update(payload).eq('id', article.id)
      error = res.error
    } else {
      const res = await supabase.from('articles').insert(payload).select('id').single()
      error = res.error
      if (res.data) articleId = res.data.id
    }

    setSaving(false)
    if (error) {
      setMessage(`Erreur : ${error.message}`)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      const labels = { draft: 'Brouillon sauvegardé.', now: 'Article publié !', schedule: `Programmé pour le ${new Date(scheduledAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}.` }
      let msg = labels[publishMode]

      // Propagate cover image to all articles in the same cluster
      const clusterId = article?.cluster_id
      if (clusterId && coverImageUrl && article?.id) {
        const { error: propError } = await supabase
          .from('articles')
          .update({ cover_image_url: coverImageUrl || null, cover_image_alt: coverImageAlt.trim() || null })
          .eq('cluster_id', clusterId)
          .neq('id', article.id)
        if (!propError) {
          msg += ' Image propagée aux autres langues.'
        } else {
          msg += ` (Propagation échouée : ${propError.message})`
        }
      }

      setMessage(msg)
      if (!article?.id) router.push('/admin/articles')
      else router.refresh()
    }
  }, [title, slug, excerpt, editor, coverImageUrl, coverImageAlt, sources, categoryId, locale, publishMode, scheduledAt, article, router, supabase])

  return (
    <>
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {article ? 'Modifier l\'article' : 'Nouvel article'}
        </h1>
        <div className="flex gap-2">
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
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">/articles/</span>
                <input
                  value={slug}
                  onChange={(e) => { setSlug(e.target.value); setSlugManuallyEdited(true); setSaved(false) }}
                  placeholder="mon-article"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Extrait</label>
              <textarea
                value={excerpt}
                onChange={(e) => { setExcerpt(e.target.value); setSaved(false) }}
                placeholder="Résumé affiché dans les listes d'articles…"
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-400"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Publication</label>
              <div className="space-y-2">
                {(['draft', 'now', 'schedule'] as const).map((mode) => (
                  <label key={mode} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                    <input type="radio" name="publishMode" value={mode}
                      checked={publishMode === mode}
                      onChange={() => { setPublishMode(mode); setSaved(false) }} />
                    {{ draft: 'Brouillon', now: 'Publier maintenant', schedule: 'Programmer' }[mode]}
                  </label>
                ))}
              </div>
              {publishMode === 'schedule' && (
                <input type="datetime-local" value={scheduledAt}
                  onChange={(e) => { setScheduledAt(e.target.value); setSaved(false) }}
                  min={new Date().toISOString().slice(0, 16)}
                  className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
              )}
              <div className={`mt-3 text-xs font-medium px-3 py-2 rounded-lg ${
                publishMode === 'now' ? 'bg-green-50 text-green-700' :
                publishMode === 'schedule' ? 'bg-gray-100 text-gray-700' :
                'bg-yellow-50 text-yellow-700'
              }`}>
                {publishMode === 'now' ? '✓ Publié' : publishMode === 'schedule' ? '⏱ Programmé' : '○ Brouillon'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie principale</label>
              <select
                value={categoryId}
                onChange={(e) => { setCategoryId(e.target.value); setSaved(false) }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                <option value="">Sans catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Langue</label>
              <select
                value={locale}
                onChange={(e) => { setLocale(e.target.value); setSaved(false) }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                <option value="fr">🇫🇷 Français</option>
                <option value="en">🇬🇧 English</option>
                <option value="es">🇪🇸 Español</option>
                <option value="de">🇩🇪 Deutsch</option>
              </select>
            </div>

          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-3">Image de couverture</label>
            {coverImageUrl && (
              <div className="relative mb-3 rounded-lg overflow-hidden h-40">
                <Image src={coverImageUrl} alt={coverImageAlt || 'Couverture'} fill sizes="(max-width: 1024px) 100vw, 400px" className="object-cover" />
                <div className="absolute top-2 right-2 flex gap-1">
                  <label className="bg-white text-gray-600 hover:text-gray-900 rounded-full w-7 h-7 flex items-center justify-center text-xs shadow cursor-pointer" title="Recadrer">
                    <i className="fa-solid fa-crop-simple" />
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) selectCoverImage(f) }} />
                  </label>
                  <button onClick={() => { setCoverImageUrl(''); setCoverImageAlt('') }} className="bg-white text-gray-600 hover:text-red-500 rounded-full w-7 h-7 flex items-center justify-center text-xs shadow">×</button>
                </div>
              </div>
            )}
            <label className="cursor-pointer block w-full text-center border-2 border-dashed border-gray-200 rounded-lg py-4 text-sm text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors">
              {uploadingImage ? 'Compression…' : '+ Télécharger une image'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) selectCoverImage(f) }}
              />
            </label>
            {uploadInfo && (
              <p className="text-xs text-green-600 mt-1 text-center">{uploadInfo} · WebP ✓</p>
            )}
            <div className="mt-2 space-y-2">
              <input
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="Ou coller une URL…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
              {coverImageUrl && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Texte alternatif (alt)
                    <span className="ml-1 text-gray-400 font-normal">— pour l&apos;accessibilité</span>
                  </label>
                  <input
                    value={coverImageAlt}
                    onChange={(e) => setCoverImageAlt(e.target.value)}
                    placeholder="Ex : Conférence IA à Paris, mars 2026…"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                  {!coverImageAlt && (
                    <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      Alt manquant — requis pour l&apos;accessibilité
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sources</label>
            <textarea
              value={sources}
              onChange={(e) => { setSources(e.target.value); setSaved(false) }}
              placeholder={"Une source par ligne :\nhttps://example.com/article\nhttps://autre-source.com"}
              rows={8}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-gray-400 font-mono"
            />
            <p className="text-xs text-gray-400 mt-1">Une URL ou référence par ligne</p>
          </div>

        </div>
      </div>
    </div>

    {/* Modal alt text pour images dans l'éditeur */}

    {pendingImage && (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setPendingImage(null) }}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
          <h3 className="font-semibold text-gray-900 mb-1">Texte alternatif</h3>
          <p className="text-xs text-gray-400 mb-4">Décrivez le contenu de l&apos;image pour les lecteurs d&apos;écran et le référencement.</p>

          {/* Aperçu image */}
          <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden mb-4">
            <Image src={pendingImage.url} alt="Aperçu" fill sizes="440px" className="object-contain" />
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alt <span className="text-gray-400 font-normal">(recommandé)</span>
              </label>
              <input
                autoFocus
                value={pendingAlt}
                onChange={(e) => setPendingAlt(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') confirmInsertImage() }}
                placeholder="Ex : Graphique montrant la progression de l'IA générative en 2025…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
              {!pendingAlt && (
                <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Sans alt, l&apos;image sera invisible pour les lecteurs d&apos;écran
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-5">
            <button
              onClick={() => { setPendingImage(null); setPendingAlt('') }}
              className="flex-1 border border-gray-200 text-gray-500 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={confirmInsertImage}
              className="flex-1 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium py-2 rounded transition-colors"
            >
              Insérer l&apos;image
            </button>
          </div>
        </div>
      </div>
    )}
    {cropState && (
      <ImageCropModal
        src={cropState.src}
        onConfirm={(blob) => {
          URL.revokeObjectURL(cropState.src)
          if (cropState.mode === 'cover') uploadCroppedCover(blob)
          else uploadCroppedContent(blob)
        }}
        onCancel={() => { URL.revokeObjectURL(cropState.src); setCropState(null) }}
      />
    )}
    </>
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
