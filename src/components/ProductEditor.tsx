'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import imageCompression from 'browser-image-compression'
import { Product } from '@/lib/types'

interface Props { product?: Product }

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function ProductEditor({ product }: Props) {
  const router  = useRouter()
  const isNew   = !product

  const [title,       setTitle]       = useState(product?.title       ?? '')
  const [slug,        setSlug]        = useState(product?.slug        ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [price,       setPrice]       = useState(product?.price       ?? 0)
  const [stockCount,  setStockCount]  = useState(product?.stock_count ?? 0)
  const [edition,     setEdition]     = useState(product?.edition     ?? '')
  const [sortOrder,   setSortOrder]   = useState(product?.sort_order  ?? 0)
  const [isPublished, setIsPublished] = useState(product?.is_published ?? false)
  const [imageUrl,    setImageUrl]    = useState(product?.image_url   ?? '')

  const [uploading, setUploading] = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function handleTitleChange(v: string) {
    setTitle(v)
    if (isNew) setSlug(slugify(v))
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 0.8, maxWidthOrHeight: 1200, fileType: 'image/webp', useWebWorker: true })
      const ext  = 'webp'
      const name = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const supabase = createClient()
      const { error: upErr } = await supabase.storage.from('article-images').upload(name, compressed, { contentType: 'image/webp', upsert: false })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('article-images').getPublicUrl(name)
      setImageUrl(data.publicUrl)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur upload')
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    setError('')
    if (!title.trim()) { setError('Le titre est obligatoire'); return }
    if (!slug.trim())  { setError('Le slug est obligatoire'); return }
    setSaving(true)
    const supabase = createClient()
    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      price: Number(price),
      stock_count: Number(stockCount),
      edition: edition.trim() || null,
      image_url: imageUrl || null,
      is_published: isPublished,
      sort_order: Number(sortOrder),
    }
    const { error: dbErr } = isNew
      ? await supabase.from('products').insert(payload)
      : await supabase.from('products').update(payload).eq('id', product!.id)
    setSaving(false)
    if (dbErr) { setError(dbErr.message); return }
    router.push('/admin/products')
    router.refresh()
  }

  const labelStyle: React.CSSProperties = { fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: 4 }
  const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, outline: 'none', background: '#fff' }

  return (
    <div style={{ maxWidth: 700, padding: '30px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 28 }}>
        <button onClick={() => router.push('/admin/products')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: 20, padding: 0 }}>←</button>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{isNew ? 'Nouveau produit' : `Modifier — ${product.title}`}</h1>
      </div>

      {error && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6, padding: '10px 14px', marginBottom: 18, color: '#dc2626', fontSize: 14 }}>{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Titre */}
        <div>
          <label style={labelStyle}>Titre *</label>
          <input style={inputStyle} value={title} onChange={e => handleTitleChange(e.target.value)} placeholder="Ex: Le T-shirt BDE LISAA" />
        </div>

        {/* Slug */}
        <div>
          <label style={labelStyle}>Slug (URL)</label>
          <input style={inputStyle} value={slug} onChange={e => setSlug(e.target.value)} placeholder="le-t-shirt-bde-lisaa" />
        </div>

        {/* Prix + Stock */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          <div>
            <label style={labelStyle}>Prix (€) *</label>
            <input style={inputStyle} type="number" min={0} step={0.5} value={price} onChange={e => setPrice(Number(e.target.value))} />
          </div>
          <div>
            <label style={labelStyle}>Stock restant</label>
            <input style={inputStyle} type="number" min={0} value={stockCount} onChange={e => setStockCount(Number(e.target.value))} />
          </div>
          <div>
            <label style={labelStyle}>Ordre d&apos;affichage</label>
            <input style={inputStyle} type="number" value={sortOrder} onChange={e => setSortOrder(Number(e.target.value))} />
          </div>
        </div>

        {/* Édition */}
        <div>
          <label style={labelStyle}>Édition (ex: Édition 2026)</label>
          <input style={inputStyle} value={edition} onChange={e => setEdition(e.target.value)} placeholder="Édition 2026" />
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            rows={4}
            style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Décris le produit…"
          />
        </div>

        {/* Image */}
        <div>
          <label style={labelStyle}>Photo du produit</label>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            {imageUrl && (
              <div style={{ width: 120, height: 120, background: '#f5f5f0', borderRadius: 4, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
              </div>
            )}
            <div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                style={{ padding: '9px 16px', border: '1px solid #ddd', borderRadius: 4, background: '#f9f9f9', cursor: 'pointer', fontSize: 14 }}
              >
                {uploading ? 'Upload…' : imageUrl ? 'Changer la photo' : 'Choisir une photo'}
              </button>
              <p style={{ fontSize: 12, color: '#999', marginTop: 6 }}>JPG, PNG ou WebP — compressé automatiquement</p>
              {imageUrl && (
                <button type="button" onClick={() => setImageUrl('')} style={{ fontSize: 12, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', marginTop: 4 }}>
                  Supprimer la photo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Publié */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
          <div
            onClick={() => setIsPublished(p => !p)}
            style={{
              width: 40, height: 22, borderRadius: 11, position: 'relative', cursor: 'pointer',
              background: isPublished ? '#16a34a' : '#d1d5db',
              transition: 'background 0.2s',
            }}
          >
            <div style={{
              position: 'absolute', top: 3, left: isPublished ? 21 : 3,
              width: 16, height: 16, borderRadius: '50%', background: '#fff',
              transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: isPublished ? '#16a34a' : '#6b7280' }}>
            {isPublished ? 'Publié' : 'Brouillon'}
          </span>
        </label>

        {/* Save */}
        <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '11px 28px', background: '#262626', color: '#fff',
              border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 600,
              cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Enregistrement…' : isNew ? 'Créer le produit' : 'Enregistrer'}
          </button>
          <button onClick={() => router.push('/admin/products')} style={{ padding: '11px 20px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, cursor: 'pointer' }}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}
