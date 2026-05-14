'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Category } from '@/lib/types'
import slugify from 'slugify'

export default function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const supabase = createClient()
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError('')

    const slug = slugify(name, { lower: true, strict: true, locale: 'fr' })
    const { data, error } = await supabase
      .from('categories')
      .insert({ name: name.trim(), slug, description: description.trim() || null })
      .select()
      .single()

    if (error) {
      setError(error.message)
    } else if (data) {
      setCategories([...categories, data])
      setName('')
      setDescription('')
    }
    setSaving(false)
  }

  async function handleDelete(id: string, catName: string) {
    if (!confirm(`Supprimer la catégorie "${catName}" ?`)) return
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (!error) setCategories(categories.filter((c) => c.id !== id))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Nouvelle catégorie</h2>
        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Intelligence Artificielle"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {name && (
              <p className="text-xs text-gray-400 mt-1">
                Slug : {slugify(name, { lower: true, strict: true, locale: 'fr' })}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded-lg">{error}</p>}
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Création…' : 'Créer la catégorie'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Catégories existantes ({categories.length})</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {categories.map((cat) => (
            <div key={cat.id} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                <p className="text-xs text-gray-400">/{cat.slug}</p>
              </div>
              <button
                onClick={() => handleDelete(cat.id, cat.name)}
                className="text-red-500 hover:text-red-700 text-xs font-medium"
              >
                Supprimer
              </button>
            </div>
          ))}
          {!categories.length && (
            <p className="px-5 py-8 text-sm text-gray-400 text-center">Aucune catégorie.</p>
          )}
        </div>
      </div>
    </div>
  )
}
